# Adds the QuranWidget extension target to the Capacitor iOS project (no Xcode clicking needed),
# turns on the App Group for both targets, and (optionally) sets signing team + build number.
#   gem install xcodeproj
#   ruby scripts/ios-widget-target.rb            # env: APPLE_TEAM_ID, BUILD_NUMBER (both optional)
require 'xcodeproj'
require 'fileutils'

root   = File.expand_path('..', __dir__)
ios    = File.join(root, 'ios', 'App')
proj_p = File.join(ios, 'App.xcodeproj')
abort('No ios/ project — run `npx cap add ios` first') unless File.exist?(proj_p)

BUNDLE = 'com.cryptopanda94.quranduas'
WNAME  = 'QuranWidgetExtension'
nat    = File.join(root, 'native', 'ios')

# files on disk
wdir = File.join(ios, 'QuranWidget')
FileUtils.mkdir_p(wdir)
%w[QuranWidgetBundle.swift Info.plist QuranWidget.entitlements].each { |f| FileUtils.cp(File.join(nat, 'QuranWidget', f), File.join(wdir, f)) }
FileUtils.cp(File.join(nat, 'App', 'App.entitlements'), File.join(ios, 'App', 'App.entitlements'))

proj = Xcodeproj::Project.open(proj_p)
app  = proj.targets.find { |t| t.name == 'App' } or abort('App target not found')

# App entitlements file reference
app_group = proj.main_group.find_subpath('App', false)
unless app_group.files.any? { |f| f.path == 'App.entitlements' }
  app_group.new_reference('App.entitlements')
end

widget = proj.targets.find { |t| t.name == WNAME }
unless widget
  widget = proj.new_target(:app_extension, WNAME, :ios, '17.0', nil, :swift)
  grp = proj.main_group.find_subpath('QuranWidget', false) || proj.main_group.new_group('QuranWidget', 'QuranWidget')
  src = grp.new_reference('QuranWidgetBundle.swift')
  grp.new_reference('Info.plist')
  grp.new_reference('QuranWidget.entitlements')
  widget.add_file_references([src])
  %w[WidgetKit SwiftUI].each do |fw|
    ref = proj.frameworks_group.new_file("System/Library/Frameworks/#{fw}.framework", :sdk_root)
    widget.frameworks_build_phase.add_file_reference(ref, true)
  end

  # embed into the app
  embed = app.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' } ||
          app.new_copy_files_build_phase('Embed Foundation Extensions')
  embed.symbol_dst_subfolder_spec = :plug_ins
  bf = embed.add_file_reference(widget.product_reference, true)
  bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
  app.add_dependency(widget)
  puts '  ✓ added QuranWidgetExtension target'
else
  puts '  ✓ QuranWidgetExtension target already present'
end

# App Store version shown to users. Bump for each App Store release.
app_ver = ENV['APP_VERSION'] || '1.4'
app.build_configurations.each { |c| c.build_settings['MARKETING_VERSION'] = app_ver }
widget.build_configurations.each do |c|
  s = c.build_settings
  s['PRODUCT_BUNDLE_IDENTIFIER'] = "#{BUNDLE}.QuranWidget"
  s['PRODUCT_NAME']              = '$(TARGET_NAME)'
  s['INFOPLIST_FILE']            = 'QuranWidget/Info.plist'
  s['GENERATE_INFOPLIST_FILE']   = 'NO'
  s['CODE_SIGN_ENTITLEMENTS']    = 'QuranWidget/QuranWidget.entitlements'
  s['SWIFT_VERSION']             = '5.0'
  s['TARGETED_DEVICE_FAMILY']    = '1,2'
  s['IPHONEOS_DEPLOYMENT_TARGET']= '17.0'
  s['SKIP_INSTALL']              = 'YES'
  s['MARKETING_VERSION']         = app_ver
  s['LD_RUNPATH_SEARCH_PATHS']   = ['$(inherited)', '@executable_path/Frameworks', '@executable_path/../../Frameworks']
end
app.build_configurations.each { |c| c.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements' }
# Theme icons: alternate app icon sets in Assets.xcassets (made by scripts/ios-alt-icons.mjs)
alt = Dir[File.join(ios, 'App', 'Assets.xcassets', 'AppIcon-*.appiconset')].map { |d| File.basename(d, '.appiconset') }.sort
app.build_configurations.each do |c|
  c.build_settings['ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS'] = 'YES'
  c.build_settings['ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES'] = alt.join(' ') unless alt.empty?
end
puts "alternate icons: #{alt.join(', ')}"

team  = ENV['APPLE_TEAM_ID'].to_s.strip
build = ENV['BUILD_NUMBER'].to_s.strip
[app, widget].each do |t|
  t.build_configurations.each do |c|
    s = c.build_settings
    s['TARGETED_DEVICE_FAMILY'] = '1,2'   # iPhone and iPad
    unless team.empty?
      s['DEVELOPMENT_TEAM'] = team
      s['CODE_SIGN_STYLE']  = 'Automatic'
      s['CODE_SIGN_IDENTITY'] = 'Apple Development'
    end
    s['CURRENT_PROJECT_VERSION'] = build unless build.empty?
  end
end
proj.save
puts "  ✓ App Group on, team #{team.empty? ? '(not set)' : 'set'}, build #{build.empty? ? '(unchanged)' : build}"
