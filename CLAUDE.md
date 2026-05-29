# CLAUDE.md — Daily Motivation Firefox Port

## Project Overview

This repository is a **Firefox port** of [AtaGowani/daily-motivation](https://github.com/AtaGowani/daily-motivation), a browser extension that displays a motivational quote every time a new tab is opened, with an interactive animated background.

The original is a Chrome extension (Manifest V3). This fork adapts it to run as a Firefox WebExtension (also MV3), published to [addons.mozilla.org (AMO)](https://addons.mozilla.org).

**License:** Apache 2.0 — forking and redistribution are permitted with attribution.  
**Original author:** Ata Gowani  
**Fork maintainer:** [Your Name / GitHub handle]

---

## Goal

Port the extension to Firefox with minimal changes:
- Preserve all original functionality (new-tab motivational quotes, interactive background)
- Fix any Chrome-specific API calls to be Firefox-compatible
- Add the required Firefox-specific manifest fields
- Keep the codebase clean and mergeable if the upstream ever adds Firefox support

---

## ⚠️ Working with Claude Code — Rules of Engagement

These rules are non-negotiable. Follow them on every task, no exceptions.

### Always plan first, act second

Before touching any file or running any command, present a numbered plan listing:
- every file you intend to create, modify, or delete
- every command you intend to run
- a one-line reason for each step

Then **stop and wait for explicit approval** ("yes", "go ahead", "do it", etc.) before proceeding. Do not interpret silence or partial answers as approval.

### Never run these without asking first

- `npm install` / `npm ci` / `npm run *` — any npm script or package install
- `npx *` — any npx command, including `web-ext`
- `git commit`, `git push`, `git merge`, `git rebase` — any command that writes to git history or the remote
- Installing any new package or dev dependency

If one of these is part of a plan, include it in the plan and wait for approval. Ask once per plan, not per command.

### When in doubt, ask

If the right approach is unclear, present the options and ask which to take. Never make assumptions and proceed silently.

---

## Repository Structure

```
.
├── CLAUDE.md                  ← You are here
├── FIREFOX_PORTING.md         ← Detailed porting reference & notes
├── manifest.json              ← MODIFIED for Firefox (see below)
├── background.js              ← Possibly modified (see porting notes)
├── index.html                 ← New tab page (no changes expected)
├── src/
│   ├── js/                    ← ES6 source files (compiled to vendor/js)
│   └── data/
│       └── quotes.json        ← Quote data (no changes needed)
├── vendor/
│   └── js/                    ← Compiled/transpiled JS
├── package.json               ← npm scripts for build
└── .github/
    └── workflows/
        └── ci.yml             ← Optional: GitHub Actions for lint + web-ext build
```

---

## Key Changes Required (vs. upstream)

### 1. `manifest.json` — Add Firefox gecko ID

Firefox requires a unique extension ID. Add `browser_specific_settings`:

```json
{
  "manifest_version": 3,
  "name": "Daily Motivation - Motivational Quotes",
  "version": "2.4.15",
  "description": "Start every search with motivation. This extension presents you with a motivational quote every time you open a new tab.",
  "browser_specific_settings": {
    "gecko": {
      "id": "daily-motivation@firefox",
      "strict_min_version": "109.0"
    }
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "chrome_url_overrides": {
    "newtab": "index.html"
  }
}
```

> **Note:** Replace `"daily-motivation@firefox"` with a real email-style ID (e.g. `daily-motivation@yourdomain.com`) before publishing to AMO.

### 2. `background.js` — API compatibility

Audit all `chrome.*` calls and either:
- Replace with `browser.*` (Firefox's native promise-based API), OR
- Use the compatibility shim approach (see `FIREFOX_PORTING.md`)

Common patterns to check and fix:
| Chrome API | Firefox equivalent |
|---|---|
| `chrome.storage.local.get(key, callback)` | `browser.storage.local.get(key)` returns Promise |
| `chrome.tabs.query(...)` | `browser.tabs.query(...)` returns Promise |
| `chrome.runtime.onInstalled` | `browser.runtime.onInstalled` |
| `chrome.runtime.getURL(...)` | `browser.runtime.getURL(...)` |

> Firefox also accepts `chrome.*` via a thin compatibility shim, so if the background script is simple and callback-based, it may work as-is. Test first before changing.

### 3. Build output

After making changes, run:
```bash
npm install
npm run build
```

This transpiles `src/js/` → `vendor/js/`. The extension loads from the compiled output.

### 4. Testing in Firefox

Install `web-ext` and run:
```bash
npx web-ext run --source-dir .
```

This opens a temporary Firefox profile with the extension loaded. Open a new tab to verify the quote appears.

To lint the extension before publishing:
```bash
npx web-ext lint --source-dir .
```

---

## What NOT to Change

- `index.html` — plain HTML, works in any browser
- `src/data/quotes.json` — just data, no browser APIs
- `src/js/*.js` (UI logic) — DOM/CSS manipulation, no browser extension APIs
- CSS files — no changes needed
- The interactive background animation — no changes needed

---

## Publishing to AMO (addons.mozilla.org)

1. Run `npx web-ext build --source-dir .` to create a `.zip`
2. Sign in to [addons.mozilla.org/developers](https://addons.mozilla.org/developers/)
3. Submit the `.zip` under "New Add-on"
4. The extension needs the `chrome_url_overrides` newtab permission — AMO reviewers will check this; be ready to explain its purpose

---

## GitHub Actions (CI)

A workflow file at `.github/workflows/ci.yml` should:
1. Run `npm install && npm run build` on every push/PR
2. Run `npx web-ext lint --source-dir .`
3. On tagged releases, run `npx web-ext build` and attach the `.zip` as a release artifact

See `FIREFOX_PORTING.md` for the full workflow YAML.

---

## Attribution

This project is a derivative work of [AtaGowani/daily-motivation](https://github.com/AtaGowani/daily-motivation), licensed under the Apache License 2.0. Modified files carry notices as required by the license.
