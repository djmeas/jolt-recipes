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
        description: recipe.value.description ?? '',
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
  <div class="form-page">
    <div class="form-nav anim-fade-up">
      <NuxtLink :to="`/recipes/${id}`" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to recipe
      </NuxtLink>
    </div>
    <h1 class="form-title anim-fade-up anim-delay-1">Edit Recipe</h1>
    <div v-if="error" class="error-toast anim-fade-up anim-delay-1">
      {{ error }}
    </div>
    <div v-if="initialData" class="form-card glass-card-static anim-fade-up anim-delay-2">
      <RecipeForm :initial-data="initialData" @submit="updateRecipe">
        <template #submitLabel>Update Recipe</template>
      </RecipeForm>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p class="empty-text">Recipe not found.</p>
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