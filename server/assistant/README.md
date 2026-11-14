# Quran & Duas assistant server

A small Node program that sits between the app and Google's Gemini API. Your Gemini key stays here, never in the app.

## 1. Get a Gemini key
Google AI Studio → **Get API key** → create a key. Keep it private.

## 2. Install on the Oracle server (Ubuntu / Oracle Linux)
```bash
# Node 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -   # Ubuntu
sudo apt-get install -y nodejs                                       # (Oracle Linux: sudo dnf module install nodejs:20)

sudo mkdir -p /opt/qd-assistant && sudo chown $USER /opt/qd-assistant
# copy everything in this folder (server.mjs, upload.mjs, catalog.json, titles.json, corpus.tar.gz) into /opt/qd-assistant
```

## 2b. Load the books into Gemini (one time, ~$5–10 of indexing)
```bash
cd /opt/qd-assistant
mkdir -p corpus && tar -xzf corpus.tar.gz -C corpus      # 26 text files, 52,526 hadith (Arabic + machine English)
GEMINI_API_KEY=PASTE_YOUR_KEY node upload.mjs           # takes a while; safe to re-run (skips files already uploaded)
```
It ends with a line like `FILE_SEARCH_STORE=fileSearchStores/quran-duas-books-abc123` — copy that into the service file below.

The books come from the ThaqalaynData project (CC0, public domain): al-Kafi, Man La Yahduruhu al-Faqih, Tahdhib al-Ahkam,
al-Istibsar, Nahj al-Balagha, the Amali of Saduq and Mufid, al-Khisal, al-Tawhid, Kamal al-Din, Uyun Akhbar al-Rida, Ma'ani al-Akhbar,
Thawab al-A'mal, Kamil al-Ziyarat, Kitab al-Ghayba (Nu'mani, Tusi) and more. The English is the project's machine translation;
human translations are left out because they belong to their translators. `build_corpus.py` rebuilds the files from a fresh copy
of https://github.com/narmafraz/ThaqalaynData.

## 3. Run it as a service
Create `/etc/systemd/system/qd-assistant.service`:
```ini
[Unit]
Description=Quran & Duas assistant
After=network.target

[Service]
WorkingDirectory=/opt/qd-assistant
ExecStart=/usr/bin/node /opt/qd-assistant/server.mjs
Environment=GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
Environment=GEMINI_MODEL=gemini-3.1-flash-lite
Environment=FILE_SEARCH_STORE=fileSearchStores/PASTE_FROM_UPLOAD
Environment=PORT=8787
Restart=always
User=nobody

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload && sudo systemctl enable --now qd-assistant
curl http://127.0.0.1:8787/health      # → {"ok":true,"model":"gemini-3.1-flash-lite"}
```

## 4. HTTPS (required: the iPhone app only talks to https://)
You need a domain or sub-domain pointing at the server, e.g. `ask.yourdomain.com`.
Easiest is Caddy, which gets the certificate automatically:
```bash
sudo apt-get install -y caddy
```
`/etc/caddy/Caddyfile`:
```
ask.yourdomain.com {
    encode gzip
    reverse_proxy 127.0.0.1:8787
}
```
```bash
sudo systemctl reload caddy
```
Open ports **80** and **443** in the Oracle Cloud console (VCN → Security List → Ingress rules) **and** on the machine:
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT && sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save   # Ubuntu
```
Test from anywhere: `curl https://ask.yourdomain.com/health`

## Limits (change in the service file)
`PER_MINUTE` (6), `PER_DAY` (60) per user, `DAILY_CAP` (3000) for everyone — keeps the Gemini bill under control.

## Updating the list of app pages
`catalog.json` lists the app's Library pages so answers can link to them. Re-copy it when new duas are added.


## Endpoints

- `GET /health` - is it up
- `POST /ask` - the HYDER AI chat
- `GET /chapter?ref=` - the chapter around one hadith ("View in book")
- `GET /toc?ref=` - one level of a book (volumes, chapters, or the hadith of a chapter) for the Books section of the app
