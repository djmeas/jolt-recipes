<script setup lang="ts">
const props = defineProps<{
  initialData?: {
    title: string
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
    ingredients: string
    instructions: string
    imageUrl: string
    prepTime: number | null
    cookTime: number | null
    tagNames: string[]
  }]
}>()

const title = ref(props.initialData?.title ?? '')
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
  if (!instructions.value.trim()) {
    error.value = 'Instructions are required'
    return
  }
  emit('submit', {
    title: title.value,
    ingredients: ingredients.value,
    instructions: instructions.value,
    imageUrl: imageUrl.value,
    prepTime: prepTime.value,
    cookTime: cookTime.value,
    tagNames: tagNames.value
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-6">
    <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
      {{ error }}
    </div>

    <div>
      <label for="title" class="block text-sm font-medium text-stone-700 mb-1.5">Title</label>
      <input
        id="title"
        v-model="title"
        type="text"
        placeholder="Grandma's Apple Pie"
        required
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
    </div>

    <div>
      <label for="imageUrl" class="block text-sm font-medium text-stone-700 mb-1.5">Image URL</label>
      <input
        id="imageUrl"
        v-model="imageUrl"
        type="url"
        placeholder="https://example.com/photo.jpg"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      >
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <label for="prepTime" class="block text-sm font-medium text-stone-700 mb-1.5">Prep time (minutes)</label>
        <input
          id="prepTime"
          v-model.number="prepTime"
          type="number"
          min="0"
          placeholder="15"
          class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
      </div>
      <div>
        <label for="cookTime" class="block text-sm font-medium text-stone-700 mb-1.5">Cook time (minutes)</label>
        <input
          id="cookTime"
          v-model.number="cookTime"
          type="number"
          min="0"
          placeholder="45"
          class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
      </div>
    </div>

    <div>
      <label for="ingredients" class="block text-sm font-medium text-stone-700 mb-1.5">Ingredients</label>
      <p class="text-xs text-stone-500 mb-1.5">One per line, e.g., "2 cups flour"</p>
      <textarea
        id="ingredients"
        v-model="ingredients"
        rows="8"
        required
        placeholder="2 cups flour&#10;1 tsp salt&#10;1/2 cup butter"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
      />
    </div>

    <div>
      <label for="instructions" class="block text-sm font-medium text-stone-700 mb-1.5">Instructions</label>
      <p class="text-xs text-stone-500 mb-1.5">One step per line</p>
      <textarea
        id="instructions"
        v-model="instructions"
        rows="8"
        required
        placeholder="Preheat oven to 350°F&#10;Mix dry ingredients&#10;Cut in butter"
        class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-stone-700 mb-1.5">Tags</label>
      <div class="flex gap-2">
        <input
          v-model="newTag"
          type="text"
          placeholder="Type a tag and press Enter"
          class="flex-1 px-4 py-2.5 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
          @keydown.enter.prevent="addTag()"
        >
        <button
          type="button"
          @click="addTag()"
          class="px-3 py-2.5 rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors text-sm"
        >
          Add
        </button>
      </div>
      <div v-if="suggestions.length" class="mt-2 flex flex-wrap gap-1.5">
        <button
          v-for="s in suggestions"
          :key="s"
          type="button"
          @click="addTag(s)"
          class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs hover:bg-amber-200 transition-colors"
        >
          + {{ s }}
        </button>
      </div>
      <div v-if="tagNames.length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="(tag, i) in tagNames"
          :key="tag"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-sm"
        >
          {{ tag }}
          <button type="button" @click="removeTag(i)" class="hover:text-red-600">&times;</button>
        </span>
      </div>
    </div>

    <button
      type="submit"
      class="w-full py-3 px-4 rounded-lg bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
    >
      <slot name="submitLabel">Save Recipe</slot>
    </button>
  </form>
</template>