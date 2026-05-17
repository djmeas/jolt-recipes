# Carly's Recipes — Design Spec

A simple, personal recipe book website for Carly. Add, find, and update recipes. No sharing, no public registration.

## Approach

Lean REST API + server-driven pages on the existing Nuxt 4 stack. SQLite `LIKE` for search. Simple, follows existing codebase patterns.

## Data Model

### `recipes` table

| Column | Type | Notes |
|--------|------|-------|
| id | integer PK auto-inc | |
| title | text not null | Recipe name |
| ingredients | text not null | Structured as amount + item per line (e.g., "2 cups flour\n1 tsp salt") |
| instructions | text not null | Step-by-step, stored as numbered text |
| imageUrl | text nullable | External image URL |
| prepTime | integer nullable | In minutes |
| cookTime | integer nullable | In minutes |
| createdAt | integer timestamp | unixepoch default |
| updatedAt | integer timestamp | unixepoch, auto-updated on every recipe change |

### `tags` table

| Column | Type | Notes |
|--------|------|-------|
| id | integer PK auto-inc | |
| name | text not null unique | e.g., "Dinner", "Dessert" |

### `recipe_tags` table (join)

| Column | Type | Notes |
|--------|------|-------|
| recipeId | integer FK → recipes.id | |
| tagId | integer FK → tags.id | |
| PK | (recipeId, tagId) composite | Prevents duplicates |

## Auth & Access Control

- Single-user: only Carly logs in to manage recipes
- Remove `/register` page and `/api/auth/register` endpoint
- Keep `/login` page and `/api/auth/login`
- `isAdmin` flag on users table determines who can manage recipes
- **Public** (no login): `/`, `/recipes`, `/recipes/[id]`
- **Protected** (admin auth): `/recipes/new`, `/recipes/[id]/edit`, delete actions, and corresponding API endpoints
- New `admin.ts` middleware: checks `user.isAdmin`, applied to recipe create/edit/delete routes
- Keep `guest.ts` middleware (redirects logged-in users away from login)
- Remove `/dashboard` page — recipe pages replace it

## API Endpoints

### Public (no auth)

| Method | Endpoint | Returns |
|--------|----------|---------|
| GET | `/api/recipes` | All recipes with tags. Supports `?q=` search and `?tag=` filter |
| GET | `/api/recipes/[id]` | Single recipe with tags |
| GET | `/api/tags` | All tags (for filter dropdown) |

### Protected (admin auth required)

| Method | Endpoint | Action |
|--------|----------|--------|
| POST | `/api/recipes` | Create recipe with tag names (creates tags if they don't exist) |
| PUT | `/api/recipes/[id]` | Update recipe (tags replaced entirely on each save) |
| DELETE | `/api/recipes/[id]` | Delete recipe and its tag associations |

### Search logic

`?q=` uses SQLite `LIKE` across `title`, `ingredients`, and `instructions`. `?tag=` filters by tag name. Both can be combined.

## Pages & UI Flow

### `/` (Home)
Redesigned landing page for Carly's Recipes. Warm, inviting hero. Links to browse recipes. Small login link for Carly in header/footer.

### `/recipes` (Browse)
Card grid: image (or placeholder), title, cook time, tags. Top bar with search input and tag filter dropdown. Click card → recipe detail.

### `/recipes/[id]` (View)
Full recipe: image, title, prep/cook time, ingredients list, instructions, tags. Admin sees Edit and Delete buttons.

### `/recipes/new` (Add)
Form: title, image URL, prep/cook time, ingredients (textarea), instructions (textarea), tags (freetype chip/token input). Admin-only.

### `/recipes/[id]/edit` (Edit)
Same form as Add, pre-filled. Admin-only.

### `/login`
Stays, restyled to match recipe theme.

### Removed pages
- `/register` — removed entirely
- `/dashboard` — removed, recipe pages replace it

## Visual Style

- **Palette**: Warm, cozy — cream/off-white background, soft amber or terracotta accents, dark brown text
- **Cards**: Rounded, subtle shadow, warm border — recipe cards that feel like recipe cards
- **Typography**: Clean and readable — cookbook readability first
- **Animations**: No flashy animations — drop the JOLT animation
- **Image placeholders**: Emoji or simple SVG (pot/pan icon) when no image URL provided