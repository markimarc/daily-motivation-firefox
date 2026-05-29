# Firefox Porting Reference

## Background: Chrome vs Firefox WebExtensions

Both Chrome and Firefox now use the **Manifest V3 WebExtensions API**. They are largely compatible, with a few differences:

| Area | Chrome | Firefox |
|---|---|---|
| Extension ID | Auto-generated, optional | **Required** (`gecko.id` in manifest) |
| API namespace | `chrome.*` | `browser.*` (also accepts `chrome.*`) |
| API style | Callbacks | **Promises** (Firefox native); callbacks via compat layer |
| Service workers | Full MV3 support | Supported since Firefox 109+ |
| `newtab` override | `chrome_url_overrides.newtab` | Same key, works identically |
| Background scripts | `service_worker` field | Same field, same behavior |

**Bottom line:** Firefox can run most Chrome MV3 extensions with only the `browser_specific_settings` block added to `manifest.json`.

---

## Step-by-Step Port Instructions

### Step 1 — Fork & Clone

```bash
# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/daily-motivation.git
cd daily-motivation
git remote add upstream https://github.com/AtaGowani/daily-motivation.git
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Patch `manifest.json`

Add the `browser_specific_settings` block (see CLAUDE.md for the full diff).

The only required field is `gecko.id`. Use a format like:
- `daily-motivation-firefox@yourgithubname.com`
- or any valid email-like string that won't conflict with other extensions

### Step 4 — Audit `background.js` for Chrome-only APIs

Open `background.js` and search for `chrome.` usage. For each call, check the table in CLAUDE.md.

**If the file only uses `chrome.storage` or `chrome.runtime.getURL`:** Firefox's built-in Chrome compatibility layer handles these transparently — no code change needed.

**If the file uses callbacks with `chrome.storage.local.get`:** Firefox supports this via the compat layer, but you can optionally modernize to promise syntax:

```js
// Chrome callback style (works in Firefox via compat layer)
chrome.storage.local.get('key', (result) => {
  console.log(result.key);
});

// Firefox native promise style (cleaner, preferred)
const result = await browser.storage.local.get('key');
console.log(result.key);
```

### Step 5 — Build

```bash
npm run build
```

This compiles `src/js/*.js` (ES6) → `vendor/js/` (browser-compatible JS).

### Step 6 — Test with web-ext

```bash
# Install web-ext globally (or use npx)
npm install -g web-ext

# Run extension in a temporary Firefox profile
web-ext run --source-dir .
```

A new Firefox window will open. Press Ctrl+T / Cmd+T — you should see the motivational quote new tab page.

### Step 7 — Lint

```bash
web-ext lint --source-dir .
```

Fix any warnings before submitting to AMO. Common issues:
- Missing `gecko.id` → fixed by Step 3
- Deprecated APIs → update per table in CLAUDE.md
- Overly broad permissions → remove any unused permissions

### Step 8 — Build the distributable zip

```bash
web-ext build --source-dir . --artifacts-dir ./dist
```

This creates `dist/daily_motivation-*.zip` ready for AMO submission.

---

## GitHub Actions CI Workflow

Create `.github/workflows/ci.yml` with this content:

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  release:
    types: [created]

jobs:
  build-and-lint:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build (transpile ES6)
        run: npm run build

      - name: Lint with web-ext
        run: npx web-ext lint --source-dir .

  release:
    runs-on: ubuntu-latest
    needs: build-and-lint
    if: github.event_name == 'release'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Package with web-ext
        run: npx web-ext build --source-dir . --artifacts-dir ./dist

      - name: Upload release artifact
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./dist/daily_motivation-${{ github.event.release.tag_name }}.zip
          asset_name: daily-motivation-firefox-${{ github.event.release.tag_name }}.zip
          asset_content_type: application/zip
```

---

## Known Firefox MV3 Caveats (as of Firefox 109+)

1. **Service workers in MV3** are fully supported but have a shorter lifecycle than Chrome's. If `background.js` registers listeners at the top level, they will persist. If it defers registration (e.g. inside an async function), the worker may be killed before they fire. Keep listener registration synchronous at the top level.

2. **`chrome_url_overrides`** for `newtab` works identically in Firefox — no change needed.

3. **`type: "module"` in background** — Firefox supports ES module service workers in MV3. The original already uses this, so no change needed.

4. **No `chrome.action` vs `browser.action`** difference for this extension — there's no popup action, so this is irrelevant.

5. **CSP (Content Security Policy)** — Firefox enforces strict CSP for extensions. If `index.html` uses inline `<script>` tags with arbitrary eval, those will be blocked. The original appears to use external scripts, so this should be fine. If issues arise, move inline scripts to external files.

---

## Attribution Requirements (Apache 2.0)

When distributing this fork, you must:
- Include the original `LICENSE` file (already present)
- Note which files were modified (add a comment at the top of changed files, e.g. `// Modified for Firefox compatibility — original by AtaGowani`)
- You do **not** need to use the same name — feel free to rename to e.g. "Daily Motivation for Firefox"
- You do **not** need to publish changes back (Apache 2.0 is permissive, not copyleft)

---

## Useful Links

- [Firefox WebExtensions documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Chrome → Firefox porting guide (MDN)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Porting_a_Google_Chrome_extension)
- [web-ext tool docs](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/)
- [AMO submission portal](https://addons.mozilla.org/developers/)
- [Firefox MV3 status](https://blog.mozilla.org/addons/2022/11/17/unified-extensions-button-and-manifest-v3-in-firefox-109/)
- [Upstream repo](https://github.com/AtaGowani/daily-motivation)
