# Jimmi's Design Shop

This is the desktop and phone design app, with an 80s mall theme.

- **Served:** `/desk/`. It's an installable PWA with scope `/desk/`, and it works offline after the first load.
- **Offline zip:** unzip it, then double-click `index.html`. No server is needed, because every asset is in `assets.js` and `inbox/inbox.js`.
- **Inbox:** `inbox/index.json` lists `inbox/*.jimmi.json`, and `inbox/inbox.js` is a copy for file:// use. Run `tools/build_inbox.py` after adding designs.
- **Render tool:** `node tools/render_design.js design.jimmi.json -o out/`
- **Schema:** see `SCHEMA.md`.
