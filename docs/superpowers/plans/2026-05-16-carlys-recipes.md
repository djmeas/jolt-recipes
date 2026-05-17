# Carly's Recipes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Nuxt starter template into Carly's personal recipe book — add, browse, search, and edit recipes with a warm cookbook aesthetic.

**Architecture:** Lean REST API + server-driven pages on existing Nuxt 4 stack. New `recipes`, `tags`, and `recipe_tags` tables in SQLite via Drizzle ORM. Public browsing; admin-only editing. SQLite `LIKE` for search.

**Tech Stack:** Nuxt 4, SQLite + Drizzle ORM, Tailwind CSS, nuxt-auth-utils, Zod

---

### File Structure

**Schema & DB:**
- Modify: `server/db/schema.ts` — add recipes, tags, recipe_tags tables + Drizzle relations
- Modify: `server/utils/db.ts` — no changes needed (already imports full schema)
- Generate: migration via `npm run db:generate`

**API routes:**
- Create: `server/api/recipes/index.get.ts` — list/search recipes
- Create: `server/api/recipes/[id].get.ts` — get single recipe
- Create: `server/api/recipes/index.post.ts` — create recipe
- Create: `server/api/recipes/[id].put.ts` — update recipe
- Create: `server/api/recipes/[id].delete.ts` — delete recipe
- Create: `server/api/tags/index.get.ts` — list all tags

**Middleware:**
- Create: `app/middleware/admin.ts` — require admin for recipe management
- Modify: `app/middleware/auth.ts` — no changes needed (already works)
- Modify: `app/middleware/guest.ts` — redirect to `/recipes` instead of `/dashboard`

**Pages:**
- Modify: `app/pages/index.vue` — redesign as Carly's Recipes landing
- Create: `app/pages/recipes/index.vue` — browse recipes with search/filter
- Create: `app/pages/recipes/[id].vue` — view single recipe
- Create: `app/pages/recipes/new.vue` — add recipe form
- Create: `app/pages/recipes/[id]/edit.vue` — edit recipe form
- Modify: `app/pages/login.vue` — restyle to match warm theme
- Delete: `app/pages/register.vue` — remove registration
- Delete: `app/pages/dashboard.vue` — replaced by recipe pages

**Server cleanup:**
- Delete: `server/api/auth/register.post.ts` — remove registration endpoint

**App shell:**
- Modify: `app/app.vue` — warm theme, shared layout/header

---

### Task 1: Add Recipe Schema, Relations & Run Migration

**Files:**
- Modify: `server/db/schema.ts`

- [ ] **Step 1: Replace schema with full content (tables + Drizzle relations)**

Replace `server/db/schema.ts` entirely with:

```typescript
import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  ingredients: text('ingredients').notNull(),
  instructions: text('instructions').notNull(),
  imageUrl: text('image_url'),
  prepTime: integer('prep_time'),
  cookTime: integer('cook_time'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique()
})

export const recipeTags = sqliteTable('recipe_tags', {
  recipeId: integer('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' })
})

export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeTags: many(recipeTags)
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  recipeTags: many(recipeTags)
}))

export const recipeTagsRelations = relations(recipeTags, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeTags.recipeId],
    references: [recipes.id]
  }),
  tag: one(tags, {
    fields: [recipeTags.tagId],
    references: [tags.id]
  })
}))
```

- [ ] **Step 2: Generate and apply migration**

Run: `npm run db:generate`
Then: `npm run db:migrate`
Expected: New migration SQL file created in `server/db/migrations/` containing CREATE TABLE statements for recipes, tags, and recipe_tags.

- [ ] **Step 3: Commit**

```bash
git add server/db/schema.ts server/db/migrations/
git commit -m "feat: add recipe/tag schema with Drizzle relations"
```

---

### Task 2: Add Admin Middleware & Clean Up Auth

**Files:**
- Create: `app/middleware/admin.ts`
- Modify: `app/middleware/guest.ts`
- Delete: `server/api/auth/register.post.ts`
- Delete: `app/pages/register.vue`

- [ ] **Step 1: Create admin middleware**

Create `app/middleware/admin.ts`:

```typescript
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, user } = useUserSession()
  if (!loggedIn.value || !user.value?.isAdmin) {
    return navigateTo('/login')
  }
})
```

- [ ] **Step 2: Update guest middleware redirect target**

Modify `app/middleware/guest.ts` — change `/dashboard` to `/recipes`:

```typescript
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, fetch: fetchSession } = useUserSession()
  await fetchSession()
  if (loggedIn.value) {
    return navigateTo('/recipes')
  }
})
```

- [ ] **Step 3: Delete registration page and API route**

```bash
rm app/pages/register.vue
rm server/api/auth/register.post.ts
```

- [ ] **Step 4: Commit**

```bash
git add app/middleware/admin.ts app/middleware/guest.ts
git rm app/pages/register.vue server/api/auth/register.post.ts
git commit -m "feat: add admin middleware, remove registration, update guest redirect"
```

---

### Task 3: Create Recipe API Endpoints

**Files:**
- Create: `server/api/recipes/index.get.ts`
- Create: `server/api/recipes/[id].get.ts`
- Create: `server/api/recipes/index.post.ts`
- Create: `server/api/recipes/[id].put.ts`
- Create: `server/api/recipes/[id].delete.ts`
- Create: `server/api/tags/index.get.ts`

- [ ] **Step 1: Create GET /api/recipes (list/search/filter)**

Create `server/api/recipes/index.get.ts`:

```typescript
import { like, or, eq, sql } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const search = typeof query.q === 'string' ? query.q.trim() : ''
  const tagFilter = typeof query.tag === 'string' ? query.tag.trim() : ''

  let matchingRecipeIds: number[] | null = null

  if (tagFilter) {
    const tagRow = await db.query.tags.findFirst({
      where: eq(tags.name, tagFilter)
    })
    if (!tagRow) {
      return []
    }
    const rows = await db
      .select({ recipeId: recipeTags.recipeId })
      .from(recipeTags)
      .where(eq(recipeTags.tagId, tagRow.id))
    matchingRecipeIds = rows.map((r) => r.recipeId)
    if (matchingRecipeIds.length === 0) {
      return []
    }
  }

  const conditions = []
  if (search) {
    const pattern = `%${search}%`
    conditions.push(
      or(
        like(recipes.title, pattern),
        like(recipes.ingredients, pattern),
        like(recipes.instructions, pattern)
      )
    )
  }
  if (matchingRecipeIds !== null) {
    matchingRecipeIds.forEach((id) => {
      conditions.push(eq(recipes.id, id))
    })
  }

  const recipeRows = await db.query.recipes.findMany({
    where: conditions.length > 0
      ? (() => {
          if (search && matchingRecipeIds !== null) {
            const pattern = `%${search}%`
            const idConditions = matchingRecipeIds.map((id) => eq(recipes.id, id))
            return sql`(${like(recipes.title, pattern)} OR ${like(recipes.ingredients, pattern)} OR ${like(recipes.instructions, pattern)}) AND (${idConditions.join(' OR ')})`
          }
          if (search) {
            const pattern = `%${search}%`
            return or(
              like(recipes.title, pattern),
              like(recipes.ingredients, pattern),
              like(recipes.instructions, pattern)
            )
          }
          const idConditions = matchingRecipeIds.map((id) => eq(recipes.id, id))
          return idConditions.length > 1
            ? or(...idConditions)
            : idConditions[0] || eq(recipes.id, -1)
        })()
      : undefined,
    orderBy: (recipes, { desc }) => [desc(recipes.updatedAt)],
    with: {
      recipeTags: {
        with: {
          tag: true
        }
      }
    }
  })

  return recipeRows.map((r) => ({
    id: r.id,
    title: r.title,
    imageUrl: r.imageUrl,
    prepTime: r.prepTime,
    cookTime: r.cookTime,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    tags: r.recipeTags.map((rt) => rt.tag.name)
  }))
})
```

- [ ] **Step 2: Create GET /api/recipes/[id] (single recipe)**

Create `server/api/recipes/[id].get.ts`:

```typescript
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid recipe ID' })
  }

  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeTags: {
        with: {
          tag: true
        }
      }
    }
  })

  if (!recipe) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  return {
    id: recipe.id,
    title: recipe.title,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    tags: recipe.recipeTags.map((rt) => rt.tag.name)
  }
})
```

- [ ] **Step 3: Create POST /api/recipes (create recipe)**

Create `server/api/recipes/index.post.ts`:

```typescript
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  imageUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  tagNames: z.array(z.string().min(1)).optional()
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const user = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors.map((e) => e.message).join(', ')
    })
  }

  const { title, ingredients, instructions, imageUrl, prepTime, cookTime, tagNames } = parseResult.data

  const [recipe] = await db
    .insert(recipes)
    .values({
      title,
      ingredients,
      instructions,
      imageUrl: imageUrl || null,
      prepTime: prepTime ?? null,
      cookTime: cookTime ?? null
    })
    .returning({ id: recipes.id })

  if (!recipe) {
    throw createError({ statusCode: 500, message: 'Failed to create recipe' })
  }

  if (tagNames && tagNames.length > 0) {
    for (const name of tagNames) {
      const [tag] = await db
        .insert(tags)
        .values({ name })
        .onConflictDoNothing()
        .returning({ id: tags.id })

      const existingTag = tag || await db.query.tags.findFirst({ where: eq(tags.name, name) })
      if (existingTag) {
        await db.insert(recipeTags).values({
          recipeId: recipe.id,
          tagId: existingTag.id
        })
      }
    }
  }

  return { success: true, id: recipe.id }
})
```

- [ ] **Step 4: Create PUT /api/recipes/[id] (update recipe)**

Create `server/api/recipes/[id].put.ts`:

```typescript
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, tags, recipeTags } from '../../db/schema'

const bodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  ingredients: z.string().min(1, 'Ingredients are required'),
  instructions: z.string().min(1, 'Instructions are required'),
  imageUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  tagNames: z.array(z.string().min(1)).optional()
})

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const user = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const id = Number(event.context.params?.id)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid recipe ID' })
  }

  const body = await readBody(event)
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors.map((e) => e.message).join(', ')
    })
  }

  const { title, ingredients, instructions, imageUrl, prepTime, cookTime, tagNames } = parseResult.data

  const [updated] = await db
    .update(recipes)
    .set({
      title,
      ingredients,
      instructions,
      imageUrl: imageUrl || null,
      prepTime: prepTime ?? null,
      cookTime: cookTime ?? null,
      updatedAt: new Date()
    })
    .where(eq(recipes.id, id))
    .returning({ id: recipes.id })

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  await db.delete(recipeTags).where(eq(recipeTags.recipeId, id))

  if (tagNames && tagNames.length > 0) {
    for (const name of tagNames) {
      const [tag] = await db
        .insert(tags)
        .values({ name })
        .onConflictDoNothing()
        .returning({ id: tags.id })

      const existingTag = tag || await db.query.tags.findFirst({ where: eq(tags.name, name) })
      if (existingTag) {
        await db.insert(recipeTags).values({
          recipeId: id,
          tagId: existingTag.id
        })
      }
    }
  }

  return { success: true }
})
```

- [ ] **Step 5: Create DELETE /api/recipes/[id] (delete recipe)**

Create `server/api/recipes/[id].delete.ts`:

```typescript
import { eq } from 'drizzle-orm'
import { db } from '../../utils/db'
import { recipes, recipeTags } from '../../db/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const user = await getUserSession(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 403, message: 'Admin access required' })
  }

  const id = Number(event.context.params?.id)
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Invalid recipe ID' })
  }

  await db.delete(recipeTags).where(eq(recipeTags.recipeId, id))
  const [deleted] = await db
    .delete(recipes)
    .where(eq(recipes.id, id))
    .returning({ id: recipes.id })

  if (!deleted) {
    throw createError({ statusCode: 404, message: 'Recipe not found' })
  }

  return { success: true }
})
```

- [ ] **Step 6: Create GET /api/tags (list all tags)**

Create `server/api/tags/index.get.ts`:

```typescript
import { db } from '../../utils/db'
import { tags } from '../../db/schema'

export default defineEventHandler(async () => {
  const allTags = await db.query.tags.findMany({
    orderBy: (tags, { asc }) => [asc(tags.name)]
  })
  return allTags.map((t) => t.name)
})
```

- [ ] **Step 7: Commit**

```bash
git add server/api/recipes/ server/api/tags/
git commit -m "feat: add recipe and tag API endpoints (CRUD + search)"
```

---

### Task 4: Redesign App Shell

**Files:**
- Modify: `app/app.vue`

- [ ] **Step 1: Update app.vue with warm theme and shared layout**

Replace `app/app.vue` content with:

```vue
<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/recipes')
}
</script>

<template>
  <div class="min-h-screen bg-amber-50 text-stone-800">
    <header class="border-b border-amber-200 bg-amber-50/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-serif font-bold text-amber-800">
          Carly's Recipes
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/recipes" class="text-stone-600 hover:text-amber-800 transition-colors text-sm">
            Browse
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn && user?.isAdmin"
            to="/recipes/new"
            class="text-sm px-3 py-1.5 rounded-lg bg-amber-700 text-amber-50 font-medium hover:bg-amber-600 transition-colors"
          >
            Add Recipe
          </NuxtLink>
          <button
            v-if="loggedIn"
            @click="logout"
            class="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Sign out
          </button>
          <NuxtLink
            v-if="!loggedIn"
            to="/login"
            class="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Sign in
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="border-t border-amber-200 mt-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-stone-400 text-sm">
          Made with love for Carly
        </p>
      </div>
    </footer>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/app.vue
git commit -m "feat: warm cookbook theme with shared header/footer"
```

---

### Task 5: Redesign Landing Page

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Replace landing page with Carly's Recipes home**

Replace `app/pages/index.vue` entirely with:

```vue
<script setup lang="ts">
const { loggedIn } = useUserSession()
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl sm:text-6xl font-serif font-bold text-amber-900 tracking-tight">
        Carly's Recipes
      </h1>
      <p class="mt-6 text-lg text-stone-500 leading-relaxed">
        A personal collection of favorite recipes, always within reach.
      </p>
      <div class="mt-10">
        <NuxtLink
          to="/recipes"
          class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 transition-colors text-lg"
        >
          Browse Recipes
        </NuxtLink>
      </div>
    </div>

    <div class="mt-20 grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#127859;</div>
        <h3 class="font-serif font-semibold text-amber-900">Add Recipes</h3>
        <p class="mt-2 text-sm text-stone-500">Save your favorites with ingredients, steps, and times.</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#128269;</div>
        <h3 class="font-serif font-semibold text-amber-900">Find Recipes</h3>
        <p class="mt-2 text-sm text-stone-500">Search by name, ingredient, or tag. What's for dinner?</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#9999;&#65039;</div>
        <h3 class="font-serif font-semibold text-amber-900">Update Anytime</h3>
        <p class="mt-2 text-sm text-stone-500">Tweak a recipe as you go. It's your cookbook.</p>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Remove dashboard page**

```bash
rm app/pages/dashboard.vue
```

- [ ] **Step 3: Commit**

```bash
git add app/pages/index.vue
git rm app/pages/dashboard.vue
git commit -m "feat: redesign landing page for Carly's Recipes, remove dashboard"
```

---

### Task 6: Create Recipe Browse Page

**Files:**
- Create: `app/pages/recipes/index.vue`

- [ ] **Step 1: Create the browse recipes page**

Create `app/pages/recipes/index.vue`:

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedTag = ref(typeof route.query.tag === 'string' ? route.query.tag : '')
const searchInput = ref(searchQuery.value)

const { data: allTags } = await useFetch<string[]>('/api/tags')

const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (searchQuery.value) params.q = searchQuery.value
  if (selectedTag.value) params.tag = selectedTag.value
  return params
})

const { data: recipes, refresh } = await useFetch('/api/recipes', {
  query: queryParams
})

function submitSearch() {
  searchQuery.value = searchInput.value
  updateUrl()
}

function updateUrl() {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.q = searchQuery.value
  if (selectedTag.value) query.tag = selectedTag.value
  router.push({ path: '/recipes', query })
}

watch(selectedTag, () => {
  updateUrl()
})

function clearFilters() {
  searchQuery.value = ''
  searchInput.value = ''
  selectedTag.value = ''
  router.push({ path: '/recipes' })
}

function formatTime(minutes: number | null | undefined) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col sm:flex-row gap-3 mb-8">
      <form @submit.prevent="submitSearch" class="flex-1 flex gap-2">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search recipes..."
          class="flex-1 px-4 py-2.5 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
        >
        <button
          type="submit"
          class="px-4 py-2.5 rounded-lg bg-amber-700 text-amber-50 font-medium hover:bg-amber-600 transition-colors text-sm"
        >
          Search
        </button>
      </form>
      <div class="flex gap-2">
        <select
          v-model="selectedTag"
          class="px-3 py-2.5 rounded-lg border border-amber-200 bg-white text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">All categories</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
        <button
          v-if="searchQuery || selectedTag"
          @click="clearFilters"
          class="px-3 py-2.5 rounded-lg border border-amber-200 text-stone-500 hover:text-stone-700 hover:border-amber-300 transition-colors text-sm"
        >
          Clear
        </button>
      </div>
    </div>

    <div
      v-if="recipes && recipes.length === 0"
      class="text-center py-16"
    >
      <p class="text-5xl mb-4">&#127858;</p>
      <p class="text-stone-500">No recipes found{{ searchQuery || selectedTag ? ' for those filters' : ' yet' }}.</p>
    </div>

    <div
      v-else
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <NuxtLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="`/recipes/${recipe.id}`"
        class="group p-4 rounded-2xl bg-white border border-amber-200/50 hover:border-amber-300 hover:shadow-md transition-all"
      >
        <div
          v-if="recipe.imageUrl"
          class="h-40 rounded-xl bg-cover bg-center mb-3"
          :style="{ backgroundImage: `url(${recipe.imageUrl})` }"
        />
        <div
          v-else
          class="h-40 rounded-xl bg-amber-100 flex items-center justify-center mb-3 text-5xl"
        >
          &#127859;
        </div>
        <h2 class="font-serif font-semibold text-amber-900 group-hover:text-amber-700 transition-colors">
          {{ recipe.title }}
        </h2>
        <div class="mt-2 flex items-center gap-3 text-xs text-stone-500">
          <span v-if="recipe.prepTime">Prep: {{ formatTime(recipe.prepTime) }}</span>
          <span v-if="recipe.cookTime">Cook: {{ formatTime(recipe.cookTime) }}</span>
        </div>
        <div v-if="recipe.tags?.length" class="mt-2 flex flex-wrap gap-1.5">
          <span
            v-for="tag in recipe.tags"
            :key="tag"
            class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs"
          >
            {{ tag }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/recipes/index.vue
git commit -m "feat: recipe browse page with search and tag filter"
```

---

### Task 7: Create Recipe View Page

**Files:**
- Create: `app/pages/recipes/[id].vue`

- [ ] **Step 1: Create the single recipe view page**

Create `app/pages/recipes/[id].vue`:

```vue
<script setup lang="ts">
const route = useRoute()
const { loggedIn, user } = useUserSession()
const router = useRouter()

const id = route.params.id as string
const { data: recipe } = await useFetch(`/api/recipes/${id}`)

async function deleteRecipe() {
  if (!confirm('Delete this recipe?')) return
  await $fetch(`/api/recipes/${id}`, { method: 'DELETE' })
  router.push('/recipes')
}

function formatTime(minutes: number | null | undefined) {
  if (!minutes) return ''
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}
</script>

<template>
  <div v-if="recipe" class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <NuxtLink to="/recipes" class="text-sm text-stone-500 hover:text-amber-700 transition-colors">
      &larr; Back to recipes
    </NuxtLink>

    <div class="mt-6">
      <div
        v-if="recipe.imageUrl"
        class="h-64 rounded-2xl bg-cover bg-center mb-6"
        :style="{ backgroundImage: `url(${recipe.imageUrl})` }"
      />

      <h1 class="text-3xl font-serif font-bold text-amber-900">{{ recipe.title }}</h1>

      <div class="mt-3 flex items-center gap-4 text-sm text-stone-500">
        <span v-if="recipe.prepTime">Prep: {{ formatTime(recipe.prepTime) }}</span>
        <span v-if="recipe.cookTime">Cook: {{ formatTime(recipe.cookTime) }}</span>
      </div>

      <div v-if="recipe.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="tag in recipe.tags"
          :key="tag"
          class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs"
        >
          {{ tag }}
        </span>
      </div>

      <div class="mt-8">
        <h2 class="text-lg font-serif font-semibold text-amber-900 mb-3">Ingredients</h2>
        <ul class="space-y-1.5">
          <li
            v-for="(line, i) in recipe.ingredients.split('\n').filter((l: string) => l.trim())"
            :key="i"
            class="text-stone-700 pl-4 border-l-2 border-amber-200"
          >
            {{ line }}
          </li>
        </ul>
      </div>

      <div class="mt-8">
        <h2 class="text-lg font-serif font-semibold text-amber-900 mb-3">Instructions</h2>
        <ol class="space-y-3">
          <li
            v-for="(line, i) in recipe.instructions.split('\n').filter((l: string) => l.trim())"
            :key="i"
            class="flex gap-3 text-stone-700"
          >
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-center">{{ i + 1 }}</span>
            <span class="pt-0.5">{{ line }}</span>
          </li>
        </ol>
      </div>

      <div v-if="loggedIn && user?.isAdmin" class="mt-10 flex gap-3">
        <NuxtLink
          :to="`/recipes/${id}/edit`"
          class="px-4 py-2 rounded-lg bg-amber-700 text-amber-50 font-medium hover:bg-amber-600 transition-colors text-sm"
        >
          Edit Recipe
        </NuxtLink>
        <button
          @click="deleteRecipe"
          class="px-4 py-2 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors text-sm"
        >
          Delete Recipe
        </button>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-16">
    <p class="text-5xl mb-4">&#127858;</p>
    <p class="text-stone-500">Recipe not found.</p>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/recipes/[id].vue
git commit -m "feat: recipe detail/view page"
```

---

### Task 8: Create Recipe Form & Pages (Add + Edit)

**Files:**
- Create: `app/components/RecipeForm.vue`
- Create: `app/pages/recipes/new.vue`
- Create: `app/pages/recipes/[id]/edit.vue`

- [ ] **Step 1: Create shared RecipeForm component**

Create `app/components/RecipeForm.vue`:

```vue
<script setup lang="ts">
const props = defineProps<{
  initialData?: {
    title: string
    ingredients: string
    instructions: string
    imageUrl: string
    prepTime: number | null
    cookTime: number | null
    tagNames: string[]
  }
}>()

const emit = defineEmits<{
  submit: [data: {
    title: string
    ingredients: string
    instructions: string
    imageUrl: string
    prepTime: number | null
    cookTime: number | null
    tagNames: string[]
  }]
}>()

const title = ref(props.initialData?.title ?? '')
const ingredients = ref(props.initialData?.ingredients ?? '')
const instructions = ref(props.initialData?.instructions ?? '')
const imageUrl = ref(props.initialData?.imageUrl ?? '')
const prepTime = ref(props.initialData?.prepTime ?? null)
const cookTime = ref(props.initialData?.cookTime ?? null)
const tagNames = ref<string[]>(props.initialData?.tagNames ?? [])
const newTag = ref('')
const error = ref('')

const { data: allTags } = await useFetch<string[]>('/api/tags')

const suggestions = computed(() => {
  if (!newTag.value.trim()) return []
  return (allTags.value ?? []).filter(
    (t) => t.toLowerCase().includes(newTag.value.toLowerCase()) && !tagNames.value.includes(t)
  )
})

function addTag(name?: string) {
  const tag = (name ?? newTag.value).trim()
  if (tag && !tagNames.value.includes(tag)) {
    tagNames.value.push(tag)
  }
  newTag.value = ''
}

function removeTag(index: number) {
  tagNames.value.splice(index, 1)
}

function onSubmit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'Title is required'
    return
  }
  if (!ingredients.value.trim()) {
    error.value = 'Ingredients are required'
    return
  }
  if (!instructions.value.trim()) {
    error.value = 'Instructions are required'
    return
  }
  emit('submit', {
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    imageUrl: imageUrl.value,
    prepTime: prepTime.value,
    cookTime: cookTime.value,
    tagNames: tagNames.value
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
      {{ error }}
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-stone-700 mb-1.5">Title</label>
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="Grandma's Apple Pie"
        required
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
    </div>

    <div>
      <label for="imageUrl" class="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
      <input
        id="imageUrl"
        v-model="imageUrl"
        type="url"
        placeholder="https://example.com/photo.jpg"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="prepTime" class="block text-sm font-medium text-stone-700 mb-1.5">Prep time (minutes)</label>
        <input
          id="prepTime"
          v-model.number="prepTime"
          type="number"
          min="0"
          placeholder="15"
          class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
      </div>
      <div>
        <label for="cookTime" class="block text-sm font-medium text-stone-700 mb-1.5">Cook time (minutes)</label>
        <input
          id="cookTime"
          v-model.number="cookTime"
          type="number"
          min="0"
          placeholder="45"
          class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
      </div>
    </div>

    <div>
      <label for="ingredients" class="block text-sm font-medium text-stone-700 mb-1.5">Ingredients</label>
      <p class="text-xs text-stone-500 mb-1.5">One per line, e.g., "2 cups flour"</p>
      <textarea
        id="ingredients"
        v-model="ingredients"
        rows="8"
        required
        placeholder="2 cups flour&#10;1 tsp salt&#10;1/2 cup butter"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
      />
    </div>

    <div>
      <label for="instructions" class="block text-sm font-medium text-stone-700 mb-1.5">Instructions</label>
      <p class="text-xs text-stone-500 mb-1.5">One step per line</p>
      <textarea
        id="instructions"
        v-model="instructions"
        rows="8"
        required
        placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Cut in butter"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1.5">Tags</label>
      <div class="flex gap-2">
        <input
          v-model="newTag"
          type="text"
          placeholder="Type a tag and press Enter"
          class="flex-1 px-4 py-2.5 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          @keydown.enter.prevent="addTag()"
        >
        <button
          type="button"
          @click="addTag()"
          class="px-3 py-2.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors text-sm"
        >
          Add
        </button>
      </div>
      <div v-if="suggestions.length" class="mt-2 flex flex-wrap gap-1.5">
        <button
          v-for="s in suggestions"
          :key="s"
          type="button"
          @click="addTag(s)"
          class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 transition-colors"
        >
          + {{ s }}
        </button>
      </div>
      <div v-if="tagNames.length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="(tag, i) in tagNames"
          :key="tag"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-sm"
        >
          {{ tag }}
          <button type="button" @click="removeTag(i)" class="hover:text-red-600">&times;</button>
        </span>
      </div>
    </div>

    <button
      type="submit"
      class="w-full py-3 px-4 rounded-lg bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
    >
      <slot name="submitLabel">Save Recipe</slot>
    </button>
  </form>
</template>
```

- [ ] **Step 2: Create Add Recipe page**

Create `app/pages/recipes/new.vue`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const router = useRouter()
const error = ref('')

async function createRecipe(data: {
  title: string
  ingredients: string
  instructions: string
  imageUrl: string
  prepTime: number | null
  cookTime: number | null
  tagNames: string[]
}) {
  error.value = ''
  try {
    const result = await $fetch<{ success: boolean; id: number }>('/api/recipes', {
      method: 'POST',
      body: data
    })
    if (result.id) {
      router.push(`/recipes/${result.id}`)
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Failed to create recipe'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <NuxtLink to="/recipes" class="text-sm text-stone-500 hover:text-amber-700 transition-colors">
      &larr; Back to recipes
    </NuxtLink>
    <h1 class="mt-4 text-2xl font-serif font-bold text-amber-900">Add New Recipe</h1>
    <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
      {{ error }}
    </div>
    <div class="mt-6">
      <RecipeForm @submit="createRecipe">
        <template #submitLabel>Add Recipe</template>
      </RecipeForm>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create Edit Recipe page**

Create `app/pages/recipes/[id]/edit.vue`:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const error = ref('')

const { data: recipe } = await useFetch(`/api/recipes/${id}`)

const initialData = computed(() =>
  recipe.value
    ? {
        title: recipe.value.title,
        ingredients: recipe.value.ingredients,
        instructions: recipe.value.instructions,
        imageUrl: recipe.value.imageUrl ?? '',
        prepTime: recipe.value.prepTime,
        cookTime: recipe.value.cookTime,
        tagNames: recipe.value.tags ?? []
      }
    : undefined
)

async function updateRecipe(data: {
  title: string
  ingredients: string
  instructions: string
  imageUrl: string
  prepTime: number | null
  cookTime: number | null
  tagNames: string[]
}) {
  error.value = ''
  try {
    await $fetch(`/api/recipes/${id}`, {
      method: 'PUT',
      body: data
    })
    router.push(`/recipes/${id}`)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Failed to update recipe'
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <NuxtLink :to="`/recipes/${id}`" class="text-sm text-stone-500 hover:text-amber-700 transition-colors">
      &larr; Back to recipe
    </NuxtLink>
    <h1 class="mt-4 text-2xl font-serif font-bold text-amber-900">Edit Recipe</h1>
    <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
      {{ error }}
    </div>
    <div v-if="initialData" class="mt-6">
      <RecipeForm :initial-data="initialData" @submit="updateRecipe">
        <template #submitLabel>Update Recipe</template>
      </RecipeForm>
    </div>
    <div v-else class="text-center py-16">
      <p class="text-5xl mb-4">&#127858;</p>
      <p class="text-stone-500">Recipe not found.</p>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Commit**

```bash
git add app/components/RecipeForm.vue app/pages/recipes/new.vue "app/pages/recipes/[id]/edit.vue"
git commit -m "feat: add recipe form component, add/edit pages"
```

---

### Task 9: Restyle Login Page

**Files:**
- Modify: `app/pages/login.vue`

- [ ] **Step 1: Update login page with warm cookbook theme**

Replace `app/pages/login.vue` entirely with:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const { fetch: refreshSession } = useUserSession()
const credentials = reactive({
  email: '',
  password: ''
})
const error = ref('')

async function login() {
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    await refreshSession()
    await navigateTo('/recipes')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-lg border border-amber-200/50 p-8">
        <h1 class="text-2xl font-serif font-bold text-amber-900 mb-6">
          Sign in
        </h1>
        <form @submit.prevent="login" class="space-y-5">
          <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {{ error }}
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
              class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="Your password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <button
            type="submit"
            class="w-full py-3 px-4 rounded-lg bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Commit**

```bash
git add app/pages/login.vue
git commit -m "feat: restyle login page with warm cookbook theme"
```

---

### Task 10: Verify Everything Works

- [ ] **Step 1: Run dev server and smoke test**

Run: `npm run dev`
- Visit `/` — should see Carly's Recipes landing page
- Visit `/recipes` — should show empty state
- Visit `/login` — should see warm-styled login form
- Visit `/recipes/new` without auth — should redirect to `/login`

- [ ] **Step 2: Test full recipe CRUD flow**

1. Log in as admin user
2. Visit `/recipes/new` — add a recipe with title, ingredients, instructions, and a tag
3. After save, should redirect to recipe detail page
4. Click Edit — update the recipe, save
5. Go to `/recipes` — recipe should appear in the grid
6. Use search bar to find it
7. Filter by tag
8. Delete the recipe — should return to `/recipes` with empty state