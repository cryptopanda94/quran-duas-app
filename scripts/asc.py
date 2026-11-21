#!/usr/bin/env python3
"""App Store Connect helper, run from the "App Store" workflow.
   status : show the app's versions, newest builds and review submissions (changes nothing)
   submit : attach a build to the editable version (creating / renaming it), set What's New, and submit for review
Env: ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH, APP_ID, MODE, VERSION, BUILD, WHATS_NEW"""
import json, os, sys, time, urllib.request, urllib.error
import jwt

API = 'https://api.appstoreconnect.apple.com'
APP = os.environ.get('APP_ID', '6831749622')

def token():
    now = int(time.time())
    return jwt.encode({'iss': os.environ['ASC_ISSUER_ID'].strip(), 'iat': now, 'exp': now + 900, 'aud': 'appstoreconnect-v1'},
                      open(os.environ['ASC_KEY_PATH']).read(), algorithm='ES256',
                      headers={'kid': os.environ['ASC_KEY_ID'].strip(), 'typ': 'JWT'})

def call(method, path, body=None, ok=(200, 201, 204)):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + token(), 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read().decode('utf8', 'replace')
        try: j = json.loads(raw)
        except Exception: j = {'raw': raw[:500]}
        if e.code in ok: return e.code, j
        print(f'  ! {method} {path} -> HTTP {e.code}')
        for er in j.get('errors', []): print('    -', er.get('code'), '|', er.get('title'), '|', er.get('detail'))
        if 'raw' in j: print('    ', j['raw'])
        return e.code, j

def state(a): return a.get('appVersionState') or a.get('appStoreState')

def versions():
    _, j = call('GET', f'/v1/apps/{APP}/appStoreVersions?filter[platform]=IOS&limit=10')
    return j.get('data', [])

def builds():
    _, j = call('GET', f'/v1/builds?filter[app]={APP}&sort=-uploadedDate&limit=8&include=preReleaseVersion')
    pre = {x['id']: x['attributes'].get('version') for x in j.get('included', []) if x['type'] == 'preReleaseVersions'}
    out = []
    for b in j.get('data', []):
        pid = ((b.get('relationships', {}).get('preReleaseVersion', {}) or {}).get('data') or {}).get('id')
        out.append((b, pre.get(pid)))
    return out

def submissions():
    _, j = call('GET', f'/v1/reviewSubmissions?filter[app]={APP}&filter[platform]=IOS&limit=10')
    return j.get('data', [])

def status():
    print('Versions:')
    for v in versions(): print('  ', v['attributes']['versionString'], '|', state(v['attributes']), '|', v['attributes'].get('createdDate', '')[:10])
    print('Builds (newest first):')
    for b, mv in builds():
        a = b['attributes']; print('  ', f"{mv} ({a['version']})", '|', a['processingState'], '| expired' if a.get('expired') else '', '|', a['uploadedDate'][:16], '| encryption set:', a.get('usesNonExemptEncryption'))
    print('Review submissions:')
    for s in submissions(): print('  ', s['attributes'].get('state'), '|', (s['attributes'].get('submittedDate') or '')[:16])

EDITABLE = {'PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'}

def submit():
    ver, bn, notes = os.environ['VERSION'].strip(), os.environ['BUILD'].strip(), os.environ.get('WHATS_NEW', '').strip()
    vs = versions()
    busy = [v for v in vs if state(v['attributes']) in ('WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'PROCESSING_FOR_DISTRIBUTION', 'PROCESSING_FOR_APP_STORE', 'PENDING_APPLE_RELEASE')]
    if busy:
        print('STOP: version', busy[0]['attributes']['versionString'], 'is', state(busy[0]['attributes']), '- nothing was changed.'); return 2
    edit = [v for v in vs if state(v['attributes']) in EDITABLE]
    if edit:
        v = edit[0]
        if v['attributes']['versionString'] != ver:
            c, _ = call('PATCH', f"/v1/appStoreVersions/{v['id']}", {'data': {'type': 'appStoreVersions', 'id': v['id'], 'attributes': {'versionString': ver}}})
            if c >= 300: return 1
            print('Renamed version', v['attributes']['versionString'], '->', ver)
    else:
        c, j = call('POST', '/v1/appStoreVersions', {'data': {'type': 'appStoreVersions', 'attributes': {'platform': 'IOS', 'versionString': ver},
                    'relationships': {'app': {'data': {'type': 'apps', 'id': APP}}}}})
        if c >= 300: return 1
        v = j['data']; print('Created version', ver)
    vid = v['id']

    match = [(b, mv) for b, mv in builds() if b['attributes']['version'] == bn]
    if not match: print('STOP: build', bn, 'was not found in App Store Connect.'); return 1
    b, mv = match[0]
    if b['attributes']['processingState'] != 'VALID' or b['attributes'].get('expired'):
        print('STOP: build', bn, 'is', b['attributes']['processingState'], '(expired)' if b['attributes'].get('expired') else ''); return 1
    if mv != ver: print('STOP: build', bn, 'is version', mv, 'but the App Store version is', ver); return 1
    if b['attributes'].get('usesNonExemptEncryption') is None:
        call('PATCH', f"/v1/builds/{b['id']}", {'data': {'type': 'builds', 'id': b['id'], 'attributes': {'usesNonExemptEncryption': False}}})
    c, _ = call('PATCH', f'/v1/appStoreVersions/{vid}/relationships/build', {'data': {'type': 'builds', 'id': b['id']}})
    if c >= 300: return 1
    print('Build', bn, 'attached to version', ver)

    if notes:
        _, j = call('GET', f'/v1/appStoreVersions/{vid}/appStoreVersionLocalizations?limit=50')
        for loc in j.get('data', []):
            c, _ = call('PATCH', f"/v1/appStoreVersionLocalizations/{loc['id']}", {'data': {'type': 'appStoreVersionLocalizations', 'id': loc['id'], 'attributes': {'whatsNew': notes}}})
            print("What's New set for", loc['attributes']['locale'], '' if c < 300 else '(failed)')

    sub = next((s for s in submissions() if s['attributes'].get('state') in ('READY_FOR_REVIEW', 'UNRESOLVED_ISSUES')), None)
    if not sub:
        c, j = call('POST', '/v1/reviewSubmissions', {'data': {'type': 'reviewSubmissions', 'attributes': {'platform': 'IOS'},
                    'relationships': {'app': {'data': {'type': 'apps', 'id': APP}}}}})
        if c >= 300: return 1
        sub = j['data']
    sid = sub['id']
    _, j = call('GET', f'/v1/reviewSubmissions/{sid}/items?limit=20')
    if not j.get('data'):
        c, _ = call('POST', '/v1/reviewSubmissionItems', {'data': {'type': 'reviewSubmissionItems',
                    'relationships': {'reviewSubmission': {'data': {'type': 'reviewSubmissions', 'id': sid}}, 'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': vid}}}}})
        if c >= 300: return 1
    c, j = call('PATCH', f'/v1/reviewSubmissions/{sid}', {'data': {'type': 'reviewSubmissions', 'id': sid, 'attributes': {'submitted': True}}})
    if c >= 300: return 1
    print('SUBMITTED FOR REVIEW:', ver, 'build', bn, '| state', j.get('data', {}).get('attributes', {}).get('state'))
    return 0

if __name__ == '__main__':
    mode = os.environ.get('MODE', 'status')
    rc = 0
    if mode == 'submit': rc = submit() or 0; print('--- now:')
    status()
    sys.exit(rc if rc == 1 else 0)
