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
  <div v-if="recipe" class="recipe-page">
    <div class="recipe-nav anim-fade-up">
      <NuxtLink to="/recipes" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Recipes
      </NuxtLink>
    </div>

    <div class="recipe-hero anim-fade-up anim-delay-1">
      <div
        v-if="recipe.imageUrl"
        class="recipe-image glass-card-static"
        :style="{ backgroundImage: `url(${recipe.imageUrl})` }"
      />

      <div class="recipe-info">
        <h1 class="recipe-title">{{ recipe.title }}</h1>
        <p v-if="recipe.description" class="recipe-description">{{ recipe.description }}</p>
        <div class="recipe-meta-row">
          <span v-if="recipe.prepTime" class="meta-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Prep {{ formatTime(recipe.prepTime) }}
          </span>
          <span v-if="recipe.cookTime" class="meta-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/></svg>
            Cook {{ formatTime(recipe.cookTime) }}
          </span>
        </div>
        <div v-if="recipe.tags?.length" class="recipe-tags">
          <span v-for="tag in recipe.tags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="recipe-sections">
      <section class="recipe-section glass-card-static anim-fade-up anim-delay-2">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
          Ingredients
        </h2>
        <ul class="ingredients-list">
          <li
            v-for="(line, i) in recipe.ingredients.split('\n').filter((l: string) => l.trim())"
            :key="i"
            class="ingredient-item"
          >
            <span class="ingredient-bullet" />
            {{ line }}
          </li>
        </ul>
      </section>

      <section class="recipe-section glass-card-static anim-fade-up anim-delay-3">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Instructions
        </h2>
        <ol class="instructions-list">
          <li
            v-for="(line, i) in recipe.instructions.split('\n').filter((l: string) => l.trim())"
            :key="i"
            class="instruction-item"
          >
            <span class="step-number">{{ i + 1 }}</span>
            <span class="step-text">{{ line }}</span>
          </li>
        </ol>
      </section>
    </div>

    <div v-if="loggedIn" class="recipe-actions anim-fade-up anim-delay-4">
      <NuxtLink :to="`/recipes/${id}/edit`" class="ios-btn ios-btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Recipe
      </NuxtLink>
      <button @click="deleteRecipe" class="ios-btn ios-btn-danger">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        Delete
      </button>
    </div>
  </div>

  <div v-else class="empty-state">
    <div class="empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div>
    <p class="empty-text">Recipe not found.</p>
  </div>
</template>

<style scoped>
.recipe-page {
  padding: 1.5rem;
  max-width: 48rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .recipe-page { padding: 2rem; }
}

.recipe-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  margin-left: -0.75rem;
}

.back-link:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.recipe-hero {
  margin-bottom: 2rem;
}

.recipe-image {
  height: 14rem;
  border-radius: var(--radius-lg);
  background-size: cover;
  background-position: center;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .recipe-image { height: 18rem; }
}

.recipe-image-placeholder {
  height: 14rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-soft), var(--rose-soft));
  color: var(--text-tertiary);
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .recipe-image-placeholder { height: 18rem; }
}

.recipe-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 0.75rem;
}

.recipe-description {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

@media (min-width: 640px) {
  .recipe-title { font-size: 2.25rem; }
  .recipe-description { font-size: 1rem; }
}

.recipe-meta-row {
  display: flex;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.recipe-sections {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.recipe-section {
  padding: 1.75rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}

.section-title svg {
  color: var(--accent);
  flex-shrink: 0;
}

.ingredients-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.ingredient-item {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.5;
}

.ingredient-bullet {
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 0.5rem;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  counter-reset: step;
}

.instruction-item {
  display: flex;
  gap: 0.875rem;
  align-items: flex-start;
}

.step-number {
  flex-shrink: 0;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(255, 107, 53, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  margin-top: 0.0625rem;
}

.step-text {
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 300;
  line-height: 1.6;
}

.recipe-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-glass);
}

.empty-state {
  text-align: center;
  padding: 4rem 1.5rem;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-text {
  color: var(--text-secondary);
}
</style>