Timeslip statics
=================

Development
-----------

Prerequisites: Node 18+.

Install deps:

```bash
npm install
```

Environment variables
---------------------

Copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
```

Available vars:
- `API_BASE_URL` (default `https://security.ecopunch.vn/api/v1/public`)

Build
-----

The build now cleans `dist/`, compiles the template and copies static assets.

```bash
npm run build
# or override API at build-time
API_BASE_URL=https://staging.example.com/api/v1/public npm run build
```

Result:
- `dist/prime_timeslip.html`
- `dist/partner_timeslip.html`
- `dist/assets/...` (copied from `assets/`)

Dev (hot reload)
----------------

Start file watcher + static server with live reload:

```bash
npm run dev
# open http://127.0.0.1:5174
```

Notes:
- Editing `template.hbs` triggers `npm run build` and reloads.
- Outputs are in `dist/`; the server serves project root, so open built files from `dist/`.

Serve production build
----------------------

Simple static serve from `dist/` after building:

```bash
npm run build && npm start
# open dist/prime_timeslip.html or dist/partner_timeslip.html
```

Structure
---------

- `template.hbs`: single source template with variant switches (`isMain`, `isPartner`), injected `apiBaseUrl`.
- `assets/`: static files (e.g., `assets/bg.png`, `assets/timeslip.js`) copied into `dist/assets/` on build.
- `build.js`: cleans `dist/`, compiles Handlebars into `dist/*.html`, and copies `assets/`.
- `dist/prime_timeslip.html`, `dist/partner_timeslip.html`: generated outputs; do not edit manually.


