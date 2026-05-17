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