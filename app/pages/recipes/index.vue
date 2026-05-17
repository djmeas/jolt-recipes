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
  <div class="browse-page">
    <div class="browse-header anim-fade-up">
      <h1 class="browse-title">Recipes</h1>
      <div class="browse-toolbar">
        <form @submit.prevent="submitSearch" class="search-bar">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search recipes..."
            class="ios-input search-input"
          >
          <button type="submit" class="search-btn">Search</button>
        </form>
        <div class="filter-group">
          <div class="select-wrap">
            <select v-model="selectedTag" class="ios-input filter-select">
              <option value="">All categories</option>
              <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
            </select>
            <svg class="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <button
            v-if="searchQuery || selectedTag"
            @click="clearFilters"
            class="ios-btn ios-btn-ghost clear-btn"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div v-if="recipes && recipes.length === 0" class="empty-state anim-fade-up">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16c.5-1.5.17-2.5 0-3-.5-1.5-1-2-1.5-3-.17-.83-.17-1.5 0-2-.5 0-1.5.5-2 2-.5 1.5-.5 2.5-.5 3.5-.17.83-.5 1.5-1 2"/><path d="M2 12c1-3 4-7 10-7s9 4 10 7c-1 3-4 7-10 7s-9-4-10-7z"/></svg>
      </div>
      <p class="empty-text">No recipes found{{ searchQuery || selectedTag ? ' for those filters' : ' yet' }}.</p>
    </div>

    <div v-else class="recipe-grid">
      <NuxtLink
        v-for="(recipe, index) in recipes"
        :key="recipe.id"
        :to="`/recipes/${recipe.id}`"
        class="recipe-card glass-card anim-fade-up"
        :style="{ animationDelay: `${Math.min(index * 60, 400)}ms` }"
      >
        <div class="card-image-wrap">
          <div
            v-if="recipe.imageUrl"
            class="card-image"
            :style="{ backgroundImage: `url(${recipe.imageUrl})` }"
          />
          <div v-else class="card-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <!-- Fork -->
              <path d="M7 2v7a1.5 1.5 0 0 0 1.5 1.5v10.5" />
              <path d="M9 2v5" />
              <path d="M5 2v5" />
              <path d="M5 7h4" />
              <!-- Spoon -->
              <path d="M18 2c-1.5 0-2 2.5-2 5 0 2.5 1 3 2 3.5v9.5" />
              <path d="M18 2c1.5 0 2 2.5 2 5 0 2.5-1 3-2 3.5" />
            </svg>
          </div>
        </div>
        <div class="card-body">
          <h2 class="card-title">{{ recipe.title }}</h2>
          <div class="card-meta">
            <span v-if="recipe.prepTime" class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ formatTime(recipe.prepTime) }}
            </span>
            <span v-if="recipe.cookTime" class="meta-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/></svg>
              {{ formatTime(recipe.cookTime) }}
            </span>
          </div>
          <div v-if="recipe.tags?.length" class="card-tags">
            <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag-pill">{{ tag }}</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.browse-page {
  padding: 2rem 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .browse-page { padding: 2.5rem 2rem; }
}
@media (min-width: 1024px) {
  .browse-page { padding: 3rem 2.5rem; }
}

.browse-header {
  margin-bottom: 2.5rem;
}

.browse-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.browse-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .browse-toolbar {
    flex-direction: row;
    align-items: stretch;
  }
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--text-tertiary);
  pointer-events: none;
  z-index: 2;
}

.search-input {
  padding-left: 2.5rem;
  flex: 1;
}

.search-btn {
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  background: var(--accent);
  color: white;
  font-size: 0.8125rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.search-btn:hover {
  background: var(--accent-hover);
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.select-wrap {
  position: relative;
  flex-shrink: 0;
}

.filter-select {
  appearance: none;
  padding-right: 2.25rem;
  min-width: 10rem;
  cursor: pointer;
}

.select-chevron {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

.clear-btn {
  white-space: nowrap;
  padding: 0.625rem 1rem;
  font-size: 0.8125rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  color: var(--text-tertiary);
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 300;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .recipe-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .recipe-grid { grid-template-columns: repeat(3, 1fr); }
}

.recipe-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
}

.card-image-wrap {
  position: relative;
  height: 12rem;
  overflow: hidden;
  border-radius: calc(var(--radius-lg) - 1px) calc(var(--radius-lg) - 1px) 0 0;
  margin: -1px -1px 0 -1px;
}

.card-image {
  width: calc(100% + 2px);
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform var(--transition-smooth);
}

.recipe-card:hover .card-image {
  transform: scale(1.04);
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-soft), var(--rose-soft));
  color: var(--text-tertiary);
}

.card-body {
  padding: 1rem 1.25rem 1.25rem;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--text-secondary);
  font-weight: 400;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
</style>