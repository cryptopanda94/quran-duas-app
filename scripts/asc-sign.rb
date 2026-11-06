# CI only: creates an Apple Distribution certificate + App Store profiles through the
# App Store Connect API, installs them, and switches the Xcode project to manual signing.
# env: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH, APPLE_TEAM_ID, KEYCHAIN, KEYCHAIN_PW, OUT_PLIST
require 'openssl'; require 'json'; require 'base64'; require 'net/http'; require 'fileutils'; require 'xcodeproj'

BUNDLES = { 'App' => 'com.cryptopanda94.quranduas', 'QuranWidgetExtension' => 'com.cryptopanda94.quranduas.QuranWidget' }
b64 = ->(s) { Base64.urlsafe_encode64(s).delete('=') }
asc = OpenSSL::PKey::EC.new(File.read(ENV['ASC_KEY_PATH']))
jwt = lambda do
  h = b64.(JSON.dump(alg: 'ES256', kid: ENV['ASC_KEY_ID'].strip, typ: 'JWT'))
  now = Time.now.to_i
  p = b64.(JSON.dump(iss: ENV['ASC_ISSUER_ID'].strip, iat: now, exp: now + 900, aud: 'appstoreconnect-v1'))
  der = asc.sign(OpenSSL::Digest::SHA256.new, "#{h}.#{p}")
  sig = OpenSSL::ASN1.decode(der).value.map { |i| i.value.to_s(2).rjust(32, "\x00")[-32, 32] }.join
  "#{h}.#{p}.#{b64.(sig)}"
end
def api(jwt, method, path, body = nil)
  uri = URI("https://api.appstoreconnect.apple.com#{path}")
  req = { get: Net::HTTP::Get, post: Net::HTTP::Post, delete: Net::HTTP::Delete }[method].new(uri)
  req['Authorization'] = "Bearer #{jwt.()}"; req['Content-Type'] = 'application/json'
  req.body = JSON.dump(body) if body
  res = Net::HTTP.start(uri.host, 443, use_ssl: true) { |h| h.request(req) }
  abort("#{method.upcase} #{path} -> #{res.code} #{res.body}") unless res.code.start_with?('2')
  res.body.to_s.empty? ? {} : JSON.parse(res.body)
end

# 1. certificate: revoke old distribution certs (avoids Apple's limit), create a fresh one
api(jwt, :get, '/v1/certificates?filter[certificateType]=DISTRIBUTION&limit=50')['data'].each do |c|
  puts "  revoking old distribution cert #{c['id']}"; api(jwt, :delete, "/v1/certificates/#{c['id']}")
end
key = OpenSSL::PKey::RSA.new(2048)
csr = OpenSSL::X509::Request.new
csr.version = 0; csr.subject = OpenSSL::X509::Name.parse('/CN=Quran Duas CI/C=US'); csr.public_key = key.public_key
csr.sign(key, OpenSSL::Digest::SHA256.new)
cert = api(jwt, :post, '/v1/certificates', data: { type: 'certificates',
  attributes: { certificateType: 'DISTRIBUTION', csrContent: csr.to_pem } })['data']
x509 = OpenSSL::X509::Certificate.new(Base64.decode64(cert['attributes']['certificateContent']))
# package with macOS's own (LibreSSL) openssl so `security` can read the legacy-format .p12
File.write('/tmp/dist.key', key.to_pem); File.write('/tmp/dist.crt', x509.to_pem)
system('/usr/bin/openssl pkcs12 -export -inkey /tmp/dist.key -in /tmp/dist.crt -name dist -passout pass:ci -out /tmp/dist.p12') or abort('p12 failed')
File.delete('/tmp/dist.key', '/tmp/dist.crt')
kc, pw = ENV['KEYCHAIN'], ENV['KEYCHAIN_PW']
system("security import /tmp/dist.p12 -k #{kc} -P ci -T /usr/bin/codesign -T /usr/bin/security") or abort('import failed')
system("security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k #{pw} #{kc} >/dev/null") or abort('partition list failed')
File.delete('/tmp/dist.p12')
puts "  ✓ distribution certificate #{cert['id']} installed"

# 2. App Store profiles for app + widget
dirs = ["#{Dir.home}/Library/MobileDevice/Provisioning Profiles", "#{Dir.home}/Library/Developer/Xcode/UserData/Provisioning Profiles"]
dirs.each { |d| FileUtils.mkdir_p(d) }
bundle_ids = api(jwt, :get, '/v1/bundleIds?limit=200')['data']
names = {}
BUNDLES.each do |target, bid|
  b = bundle_ids.find { |x| x['attributes']['identifier'] == bid } or abort("Bundle ID #{bid} not registered")
  name = "CI AppStore #{bid}"
  api(jwt, :get, "/v1/profiles?filter[name]=#{URI.encode_www_form_component(name)}")['data'].each { |p| api(jwt, :delete, "/v1/profiles/#{p['id']}") }
  prof = api(jwt, :post, '/v1/profiles', data: { type: 'profiles', attributes: { name: name, profileType: 'IOS_APP_STORE' },
    relationships: { bundleId: { data: { type: 'bundleIds', id: b['id'] } }, certificates: { data: [{ type: 'certificates', id: cert['id'] }] } } })['data']
  content = Base64.decode64(prof['attributes']['profileContent'])
  dirs.each { |d| File.binwrite(File.join(d, "#{prof['attributes']['uuid']}.mobileprovision"), content) }
  names[bid] = name
  puts "  ✓ profile '#{name}'"
end

# 3. manual signing in the project (Release)
proj = Xcodeproj::Project.open(File.expand_path('../ios/App/App.xcodeproj', __dir__))
BUNDLES.each do |target, bid|
  t = proj.targets.find { |x| x.name == target } or abort("target #{target} missing")
  t.build_configurations.each do |c|
    next unless c.name == 'Release'
    s = c.build_settings
    s['CODE_SIGN_STYLE'] = 'Manual'; s['DEVELOPMENT_TEAM'] = ENV['APPLE_TEAM_ID'].strip
    s['CODE_SIGN_IDENTITY'] = 'Apple Distribution'; s['CODE_SIGN_IDENTITY[sdk=iphoneos*]'] = 'Apple Distribution'
    s['PROVISIONING_PROFILE_SPECIFIER'] = names[bid]
  end
end
proj.save

# 4. export options
plist = { 'method' => 'app-store-connect', 'destination' => 'upload', 'signingStyle' => 'manual',
  'teamID' => ENV['APPLE_TEAM_ID'].strip, 'signingCertificate' => 'Apple Distribution',
  'provisioningProfiles' => names, 'manageAppVersionAndBuildNumber' => false, 'uploadSymbols' => true }
File.write(ENV['OUT_PLIST'] + '.json', JSON.dump(plist))
system("plutil -convert xml1 -o '#{ENV['OUT_PLIST']}' '#{ENV['OUT_PLIST']}.json'") or abort('plist failed')
puts '  ✓ export options written'
