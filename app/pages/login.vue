<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const { fetch: refreshSession } = useUserSession()
const credentials = reactive({
  email: '',
  password: ''
})
const error = ref('')

async function login() {
  error.value = ''
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    await refreshSession()
    await navigateTo('/recipes')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-lg border border-amber-200/50 p-8">
        <h1 class="text-2xl font-serif font-bold text-amber-900 mb-6">
          Sign in
        </h1>
        <form @submit.prevent="login" class="space-y-5">
          <div v-if="error" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {{ error }}
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="you@example.com"
              required
              autocomplete="email"
              class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="Your password"
              required
              autocomplete="current-password"
              class="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
          </div>
          <button
            type="submit"
            class="w-full py-3 px-4 rounded-lg bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  </div>
</template>