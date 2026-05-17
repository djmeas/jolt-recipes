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

const { data: recipes } = await useFetch('/api/recipes', {
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