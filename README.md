# Jolt Recipes

A personal, full-stack recipe cookbook built with Nuxt 4, SQLite, and Tailwind CSS. Add, browse, search, and manage your favorite recipes in a clean, responsive interface.

## What's included

- **Nuxt 4** – Vue 3, file-based routing, server API routes, SSR
- **SQLite + Drizzle ORM** – Type-safe schema, migrations, zero config
- **Tailwind CSS** – Utility-first styling
- **Auth** – Admin-only recipe management, encrypted sessions, site-wide password gate
- **Search & Tags** – Search by title, ingredient, or description; filter by tags
- **Docker** – Production-ready Docker Compose setup

## Features

- **Site Password Gate** – Visitors must enter a site password (set via env) to access any page
- **Recipe CRUD** – Add, edit, and delete recipes (admin only)
- **Recipe Fields** – Title, description, image URL, prep/cook time, ingredients, instructions, tags
- **Search** – Full-text search across titles, descriptions, ingredients, and instructions
- **Tag Filtering** – Click tags to filter the recipe list
- **Responsive** – Works on mobile, tablet, and desktop
- **Configurable Branding** – Change the site name via a single env variable

## Quick start (local)

```bash
npm install
cp .env.example .env
# Edit .env and set your values
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `NUXT_SESSION_PASSWORD` | Session encryption secret (32+ characters) |
| `NUXT_SITE_PASSWORD` | Site-wide gate password (all visitors must enter this) |
| `NUXT_PUBLIC_SITE_NAME` | Display name throughout the app (default: "Jolt Recipes") |

## Database commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Drizzle migrations from schema changes |
| `npm run db:migrate` | Apply pending migrations to the SQLite database |

## Docker deployment

```bash
docker compose up --build -d
```

The app will be available at `http://<your-host>:8385`. The SQLite database is persisted in `./.data/` via a volume mount.

### Docker env mapping

Docker Compose maps your `.env` values into Nuxt runtime config automatically:
- `NUXT_SITE_PASSWORD` → site gate password
- `NUXT_PUBLIC_SITE_NAME` → displayed site name

## First-time setup

1. Visit `/` (you'll hit the site password gate first)
2. Enter the site password from your `.env`
3. You'll be redirected to `/setup` to create the admin account
4. Once logged in as admin, you can browse recipes and add new ones

## Project structure

```
├── app/
│   ├── app.vue              # App shell (header, footer, nav)
│   ├── pages/               # File-based routes
│   │   ├── index.vue        # Landing page
│   │   ├── recipes/
│   │   │   ├── index.vue    # Browse/search recipes
│   │   │   ├── new.vue      # Create recipe
│   │   │   └── [id]/
│   │   │       ├── index.vue   # View recipe
│   │   │       └── edit.vue    # Edit recipe
│   │   ├── gate.vue         # Site password gate
│   │   ├── setup.vue        # First-time admin setup
│   │   ├── login.vue        # Admin login
│   │   └── index.vue        # Landing page
│   ├── components/          # Shared components (RecipeForm, etc.)
│   └── middleware/          # Route guards (auth, guest, site-auth)
├── server/
│   ├── api/                 # API routes (auth, recipes, tags)
│   ├── db/                  # Drizzle schema & migrations
│   └── utils/               # Server utilities
├── Dockerfile               # Production Docker image
├── docker-compose.yml       # Docker Compose stack
├── .env.example             # Env template
└── nuxt.config.ts           # Nuxt config
```

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 |
| Frontend | Vue 3 (Composition API) |
| Styling | Tailwind CSS |
| Database | SQLite |
| ORM | Drizzle ORM |
| Auth | nuxt-auth-utils (encrypted sessions) |
| Validation | Zod v4 |

## License

MIT