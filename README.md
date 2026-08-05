# The Astrolabe — deployment guide

Static site + PWA for the Temple of the Obsidian Moon. No build step, no
dependencies, no backend. `index.html` is the whole application.

---

## 1. Host it

Create a GitHub repo, push these files to the root, and enable Pages
(Settings → Pages → Deploy from branch → `main` / root).

**The `.nojekyll` file matters.** GitHub Pages runs Jekyll by default and Jekyll
skips folders beginning with a dot — without `.nojekyll`, `.well-known/` silently
vanishes from the published site and domain verification fails with no error
message.

## 2. Point a subdomain at it

Add a custom domain in the Pages settings, e.g. `sky.obsidianmoontemple.com`, and
add the matching CNAME record at your DNS provider. Wait for the certificate,
then tick **Enforce HTTPS**.

This step isn't cosmetic. Asset link verification is per-origin — scheme, host,
and port — so `username.github.io/astrolabe/` would verify *all* of
`username.github.io`, tangling this app with every other repo you publish there.
A subdomain you control keeps it clean.

## 3. Verify it before going further

- `https://your-subdomain/` loads the astrolabe
- `https://your-subdomain/manifest.json` returns JSON
- `https://your-subdomain/.well-known/assetlinks.json` returns JSON, **HTTP 200**,
  content type `application/json`

That last one is the usual failure point. Anything other than a 200 is treated as
an empty statement list, and the app silently shows a browser address bar instead
of running full screen.

## 4. Fill in assetlinks.json

Two placeholders:

- `package_name` — whatever you choose, e.g. `com.obsidianmoontemple.astrolabe`.
  This is permanent; it can never be changed after publishing.
- `sha256_cert_fingerprints` — from Play Console under
  **Test and release → Setup → App signing**, the SHA-256 of the *app signing
  certificate* (not the upload certificate).

You'll need to create the app listing in Play Console first to get the
fingerprint, then come back and commit the real values.

## 5. Build the Android package

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-subdomain/manifest.json
bubblewrap build
```

When prompted:

- **Target API level 36** — required for all new apps and updates from
  31 August 2026.
- Output must be **.aab**, not .apk. Play no longer accepts APKs for new apps.

PWABuilder (pwabuilder.com) does the same thing through a web UI if you'd rather
not install the toolchain.

## 6. Play Console checklist

- [ ] Privacy policy URL — required in the listing **and** reachable from inside
      the app
- [ ] Data safety form — this app collects nothing; location stays on device and
      city searches go to Open-Meteo
- [ ] Screenshots — lead with the star chart
- [ ] Content rating questionnaire
- [ ] Price set before first publish (a free app can never be changed to paid
      later; paid → free is always available)

---

## Updating

Edit `index.html`, bump `CACHE` in `sw.js` (`astrolabe-v1` → `astrolabe-v2`),
push. The old cache is cleared on activation and users get the new build on
their next launch.

Content changes need no new Play release — the TWA loads from the live site.
Only manifest, icon, or package changes require rebuilding the .aab.

## Attribution

City search uses the [Open-Meteo geocoding API](https://open-meteo.com/), data
from GeoNames, licensed CC BY 4.0. Attribution appears under the search box.
Open-Meteo's free tier is for non-commercial use up to 10,000 calls/day — review
this before charging for the app.
