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