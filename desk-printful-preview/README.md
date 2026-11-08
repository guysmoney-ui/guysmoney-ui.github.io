# Jimmi's Design Shop

This is the desktop and phone design app, with an 80s mall theme.

- **Served:** `/desk/`. It's an installable PWA with scope `/desk/`, and it works offline after the first load.
- **Offline zip:** unzip it, then double-click `index.html`. No server is needed, because every asset is in `assets.js` and `inbox/inbox.js`.
- **Inbox:** `inbox/index.json` lists `inbox/*.jimmi.json`, and `inbox/inbox.js` is a copy for file:// use. Run `tools/build_inbox.py` after adding designs.
- **Render tool:** `node tools/render_design.js design.jimmi.json -o out/`
- **Schema:** see `SCHEMA.md`.
- **Tee Editor (v2):** this opens by default on a black tee. It has front, back, and both sleeve zones, a Sticker page of Jimmi elements only, and per-sticker move, resize, and rotate, all covered by undo. Rendering is in `tee-render.js`.
- **Profile and review:** first run asks "Who's designing?" (Owner or Designer). Designers use Submit to Guy, and the owner uses the Submissions tray to approve or reject. There are no real logins.
- **Render tool** handles v1 and v2 files. For a tee, it writes the mockup and four zone print PNGs.
