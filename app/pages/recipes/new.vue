<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const router = useRouter()
const error = ref('')

async function createRecipe(data: {
  title: string
  description: string
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
  <div class="form-page">
    <div class="form-nav anim-fade-up">
      <NuxtLink to="/recipes" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Recipes
      </NuxtLink>
    </div>
    <h1 class="form-title anim-fade-up anim-delay-1">Add New Recipe</h1>
    <div v-if="error" class="error-toast anim-fade-up anim-delay-1">
      {{ error }}
    </div>
    <div class="form-card glass-card-static anim-fade-up anim-delay-2">
      <RecipeForm @submit="createRecipe">
        <template #submitLabel>Add Recipe</template>
      </RecipeForm>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  padding: 1.5rem;
  max-width: 40rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .form-page { padding: 2rem; }
}

.form-nav {
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

.form-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.form-card {
  padding: 1.75rem;
}

@media (min-width: 640px) {
  .form-card { padding: 2rem; }
}
</style>