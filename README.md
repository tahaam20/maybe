# مدارس هوشمند گویا

## Setup

```bash
npm install
```

## Run

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs at `http://localhost:3000`

## Registration database

Student registrations are stored in SQLite at `data/registrations.db`.

- **Registration form:** `http://localhost:3000/project/register.html`
- **Admin panel:** `http://localhost:3000/admin`

Set the admin password in `.env` (copy from `.env.example`):

```bash
cp .env.example .env
# Edit ADMIN_PASSWORD in .env
```

Default password (if `.env` is missing): `goya-admin`

### Excel export

From the admin panel, click **خروجی Excel** to download all registrations.

Or export from the command line (writes `data/registrations.xlsx` by default):

```bash
npm run export:excel
# custom path:
npm run export:excel -- ./exports/my-file.xlsx
```

## Structure

```
tamom-main/
├── server/
│   ├── index.js      # Entry point
│   └── routes/       # API routes
├── project/          # Frontend assets
└── index.html
```
