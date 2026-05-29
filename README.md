![Daily Motivation Logo](https://raw.githubusercontent.com/AtaGowani/DailyMotivation/master/.github/logo.png)

# Daily Motivation for Firefox

A Firefox port of [AtaGowani/daily-motivation](https://github.com/AtaGowani/daily-motivation), a browser extension that greets you with a fresh motivational quote every time you open a new tab, with a fun interactive animated background.

---

## The story behind this

Last year I switched from Chrome to Firefox. Best decision in a while, but I really missed this little extension. Every new tab, a quote. Simple, lightweight, no nonsense. It kept me going.

Since there was no Firefox version, I figured: why not port it myself? I'm not a professional developer, I'm just someone who enjoys tinkering. So I did this for fun, on my own time, because I wanted this back in my browser.

---

## Built with Claude Code (and I'm being upfront about that)

This port was built with the help of [Claude Code](https://claude.ai/code). I know a lot of people are skeptical of AI-generated code. Honestly, fair enough. So here's my approach to keeping it trustworthy:

**Everything is visible.** Every file, every change, every commit is in this repo. Nothing is hidden. You can read exactly what changed from the original and why.

**I stayed in control.** Claude Code proposed plans, I reviewed and approved every step before anything was touched. No auto-commits, no surprise changes.

**It's a focused port, with some cleanup on top.** The core is untouched: quotes, animations, themes, all original. On top of the Firefox compatibility changes I also modernized a few things that were either buggy or outdated. Nothing dramatic, but it's cleaner than what we started with. See [what changed](#what-changed) below.

If you spot something off, please tell me. I'd rather know.

---

## Features

- 🌟 New motivational quote on every new tab
- 🎨 Interactive animated background
- ⚡ Lightweight, no external API calls, all quotes are bundled locally
- 🌙 Automatically uses a dark theme if your system is in dark mode (you can always override it)
- 🦊 Firefox-native (Manifest V3 WebExtension, Firefox 140+)

---

## Installation

### From Firefox Add-ons (AMO)

*(Coming soon, link will be added if I decide to publish)*

### Manual install (try it right now)

1. Clone the repo:
   ```bash
   git clone https://github.com/markimarc/daily-motivation.git
   cd daily-motivation
   ```

2. Install and build:
   ```bash
   npm install
   npm run build
   ```

3. Load in Firefox:
   - Go to `about:debugging`
   - Click **This Firefox** > **Load Temporary Add-on**
   - Select `manifest.json` from this folder

4. Open a new tab and enjoy 🎉

---

## What changed

Compared to the [original Chrome extension](https://github.com/AtaGowani/daily-motivation), here's what was modified:

**Firefox compatibility**
- **`manifest.json`**: added `browser_specific_settings.gecko`, switched from `service_worker` to `background.scripts` (required for Firefox), set `strict_min_version: 140.0`, and added `data_collection_permissions` (AMO requirement)
- **`background.js`**: added attribution comment as required by Apache 2.0. The existing `chrome.*` calls work as-is via Firefox's built-in compatibility layer, so no API changes were needed
- **`.github/workflows/ci.yml`**: added GitHub Actions to build, lint, and package the extension on every push and release

**Modernization and bug fixes**
- **`src/js/app.js`**: replaced `XMLHttpRequest` with `fetch`, fixed a bug where `window.onload` was assigned twice (so `applyTheme` was never called), switched to `DOMContentLoaded` for faster rendering, replaced `innerHTML` with `textContent` for the quote display (security), added error handling with a fallback quote, fixed theme switching so the canvas resets properly in one call instead of two, removed stale tooltip code, and added automatic dark mode detection for first-time visitors
- **`src/css/style.css`**: removed dead CSS for the footer and tooltip that were no longer used
- **`index.html`**: removed the stale "New themes added!" tooltip, moved the open-source attribution into the settings panel

**Documentation**
- **`README.md`**: you're reading it
- **`CLAUDE.md`** + **`FIREFOX_PORTING.md`**: added as documentation for the porting process

The quote data, animations, themes, and all the fun stuff? Completely untouched. Full credit to [Ata Gowani](https://github.com/AtaGowani).

---

## Got ideas or improvements?

This is a fun side project, not a serious product, so I'm definitely not claiming it's perfect. If you know a better way to do something, or spot a Firefox-specific bug:

- **Open an issue**, even just "hey this could be done better" is welcome
- **Send a PR**, go for it, I'll review it happily

---

## License

Apache License 2.0, same as the original.

This is a derivative work of [AtaGowani/daily-motivation](https://github.com/AtaGowani/daily-motivation). Original work copyright © Ata Gowani. Modified files carry notices as required by the Apache 2.0 license.
