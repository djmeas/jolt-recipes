<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

const config = useRuntimeConfig()
const siteName = config.public.siteName || 'Jolt Recipes'

const error = ref('')
const importLoading = ref(false)
const importSummary = ref<{ imported: number; total: number; errors: { index: number; message: string }[] } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerDownload(data: string, filename: string) {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportJson() {
  error.value = ''
  try {
    const data = await $fetch('/api/recipes/export', {
      responseType: 'blob'
    })
    const text = await (data as Blob).text()
    triggerDownload(text, 'recipes-export.json')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Export failed'
  }
}

async function importJson() {
  error.value = ''
  importSummary.value = null
  const input = fileInput.value
  if (!input || !input.files || input.files.length === 0) return

  const file = input.files[0]
  const text = await file.text()

  let body: any
  try {
    body = JSON.parse(text)
  } catch {
    error.value = 'Invalid JSON file'
    return
  }

  const recipeList = Array.isArray(body)
    ? body
    : Array.isArray(body?.recipes)
      ? body.recipes
      : null

  if (!Array.isArray(recipeList)) {
    error.value = 'JSON must be an array of recipes or an object with a recipes array'
    return
  }

  importLoading.value = true
  try {
    const result = await $fetch<{
      success: boolean
      imported: number
      total: number
      errors: { index: number; message: string }[]
    }>('/api/recipes/import', {
      method: 'POST',
      body: recipeList
    })
    importSummary.value = result
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Import failed'
  } finally {
    importLoading.value = false
    if (input) input.value = ''
  }
}

async function fileSelected() {
  await importJson()
}
</script>

<template>
  <div class="dashboard-page">
    <div class="dashboard-header anim-fade-up">
      <NuxtLink to="/recipes" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Browse recipes
      </NuxtLink>
      <h1 class="dashboard-title">Dashboard</h1>
      <p class="dashboard-subtitle">Import and export {{ siteName }} data</p>
    </div>

    <div v-if="error" class="error-toast anim-fade-up">{{ error }}</div>

    <div class="dashboard-grid">
      <!-- Export card -->
      <div class="dashboard-card glass-card-static anim-fade-up anim-delay-1">
        <div class="card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <h2 class="card-title">Export Recipes</h2>
        <p class="card-desc">Download all recipes as a JSON file with descriptions, ingredients, instructions, and tags.</p>
        <button class="ios-btn ios-btn-primary card-btn" @click="exportJson">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download JSON
        </button>
      </div>

      <!-- Import card -->
      <div class="dashboard-card glass-card-static anim-fade-up anim-delay-2">
        <div class="card-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h2 class="card-title">Import Recipes</h2>
        <p class="card-desc">Upload a JSON file of recipes. New recipes will be added to the database; existing tags are reused.</p>

        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          class="hidden-input"
          @change="fileSelected"
        >

        <button
          class="ios-btn ios-btn-primary card-btn"
          :disabled="importLoading"
          @click="fileInput?.click()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          {{ importLoading ? 'Importing...' : 'Choose JSON File' }}
        </button>

        <div v-if="importSummary" class="import-summary">
          <p class="summary-line">
            <span class="summary-success">✓ {{ importSummary.imported }}</span> of {{ importSummary.total }} imported
            <span v-if="importSummary.errors.length"><span class="summary-errored">, {{ importSummary.errors.length }} skipped</span></span>
          </p>
          <ul v-if="importSummary.errors.length" class="error-list">
            <li v-for="e in importSummary.errors" :key="e.index">Row {{ e.index + 1 }}: {{ e.message }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  padding: 1.5rem;
  max-width: 48rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .dashboard-page { padding: 2rem; }
}

.dashboard-header {
  margin-bottom: 2rem;
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
  margin-bottom: 1rem;
}

.back-link:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.dashboard-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dashboard-subtitle {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
}

.dashboard-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.card-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(255, 107, 53, 0.1);
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
  flex: 1;
}

.card-btn {
  width: 100%;
  padding: 0.75rem;
}

.card-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-input {
  display: none;
}

.import-summary {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-glass);
}

.summary-line {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.summary-success {
  color: #4ade80;
  font-weight: 600;
}

.summary-errored {
  color: var(--destructive);
}

.error-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.error-list li {
  font-size: 0.75rem;
  color: var(--destructive);
}
</style>
