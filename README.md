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

Generate both HTML files from Handlebars template:

```bash
npm run build
# or override API at build-time
API_BASE_URL=https://staging.example.com/api/v1/public npm run build
```

Dev (hot reload)
----------------

Start file watcher + static server with live reload:

```bash
npm run dev
# open http://127.0.0.1:5174
```

Editing `template.hbs` triggers rebuild and live reload of `timeslip_01.html` and `timeslip_02.html`.

Structure
---------

- `template.hbs`: single source template with variant switches (`isMain`, `isPartner`), injected `apiBaseUrl`.
- `build.js`: compiles Handlebars to `timeslip_01.html` and `timeslip_02.html`.
- `timeslip_01.html`, `timeslip_02.html`: generated outputs; do not edit manually.


