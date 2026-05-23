<script setup lang="ts">
const props = defineProps<{
  initialData?: {
    title: string
    description: string
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
    description: string
    ingredients: string
    instructions: string
    imageUrl: string
    prepTime: number | null
    cookTime: number | null
    tagNames: string[]
  }]
}>()

const title = ref(props.initialData?.title ?? '')
const description = ref(props.initialData?.description ?? '')
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
  emit('submit', {
    title: title.value,
    description: description.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    imageUrl: imageUrl.value,
    prepTime: prepTime.value ?? undefined,
    cookTime: cookTime.value ?? undefined,
    tagNames: tagNames.value
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="recipe-form">
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="title" class="ios-label">Title <span class="required-asterisk">*</span></label>
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="Grandma's Apple Pie"
        required
        class="ios-input"
      >
    </div>

    <div class="form-group">
      <label for="description" class="ios-label">Description</label>
      <textarea
        id="description"
        v-model="description"
        rows="3"
        placeholder="A short summary of this recipe..."
        class="ios-input ios-textarea"
      />
    </div>

    <div class="form-group">
      <label for="imageUrl" class="ios-label">Image URL</label>
      <input
        id="imageUrl"
        v-model="imageUrl"
        type="url"
        placeholder="https://example.com/photo.jpg"
        class="ios-input"
      >
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="prepTime" class="ios-label">Prep time (min)</label>
        <input
          id="prepTime"
          v-model.number="prepTime"
          type="number"
          min="0"
          placeholder="15"
          class="ios-input"
        >
      </div>
      <div class="form-group">
        <label for="cookTime" class="ios-label">Cook time (min)</label>
        <input
          id="cookTime"
          v-model.number="cookTime"
          type="number"
          min="0"
          placeholder="45"
          class="ios-input"
        >
      </div>
    </div>

    <div class="form-group">
      <label for="ingredients" class="ios-label">Ingredients <span class="required-asterisk">*</span></label>
      <p class="ios-hint">One per line, e.g., "2 cups flour"</p>
      <textarea
        id="ingredients"
        v-model="ingredients"
        rows="8"
        required
        placeholder="2 cups flour&#10;1 tsp salt&#10;1/2 cup butter"
        class="ios-input ios-textarea"
      />
    </div>

    <div class="form-group">
      <label for="instructions" class="ios-label">Instructions</label>
      <p class="ios-hint">One step per line</p>
      <textarea
        id="instructions"
        v-model="instructions"
        rows="8"
        placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Cut in butter"
        class="ios-input ios-textarea"
      />
    </div>

    <div class="form-group">
      <label class="ios-label">Tags</label>
      <div class="tag-input-row">
        <input
          v-model="newTag"
          type="text"
          placeholder="Type a tag and press Enter"
          class="ios-input tag-input"
          @keydown.enter.prevent="addTag()"
        >
        <button type="button" @click="addTag()" class="ios-btn ios-btn-ghost tag-add-btn">
          Add
        </button>
      </div>
      <div v-if="suggestions.length" class="tag-suggestions">
        <button
          v-for="s in suggestions"
          :key="s"
          type="button"
          @click="addTag(s)"
          class="tag-suggestion"
        >
          + {{ s }}
        </button>
      </div>
      <div v-if="tagNames.length" class="tag-chips">
        <span
          v-for="(tag, i) in tagNames"
          :key="tag"
          class="tag-chip"
        >
          {{ tag }}
          <button type="button" @click="removeTag(i)" class="tag-remove">&times;</button>
        </span>
      </div>
    </div>

    <button type="submit" class="ios-btn ios-btn-primary submit-btn">
      <slot name="submitLabel">Save Recipe</slot>
    </button>
  </form>
</template>

<style scoped>
.recipe-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.tag-input-row {
  display: flex;
  gap: 0.5rem;
}

.tag-input {
  flex: 1;
  font-size: 0.8125rem;
}

.tag-add-btn {
  white-space: nowrap;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.tag-suggestion {
  padding: 0.1875rem 0.5rem;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 500;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(16, 185, 129, 0.12);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-family: var(--font-body);
}

.tag-suggestion:hover {
  background: rgba(16, 185, 129, 0.22);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.625rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 100px;
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--bg-glass-hover);
  border: 1px solid var(--border-glass);
  color: var(--text-primary);
}

.tag-remove {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  line-height: 1;
  transition: color var(--transition-fast);
}

.tag-remove:hover {
  color: var(--destructive);
}

.submit-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.required-asterisk {
  color: var(--destructive);
  margin-left: 0.125rem;
}
</style>