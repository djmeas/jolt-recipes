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