<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  await navigateTo('/recipes')
}
</script>

<template>
  <div class="min-h-screen bg-amber-50 text-stone-800">
    <header class="border-b border-amber-200 bg-amber-50/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="text-xl font-serif font-bold text-amber-800">
          Carly's Recipes
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/recipes" class="text-stone-600 hover:text-amber-800 transition-colors text-sm">
            Browse
          </NuxtLink>
          <NuxtLink
            v-if="loggedIn && user?.isAdmin"
            to="/recipes/new"
            class="text-sm px-3 py-1.5 rounded-lg bg-amber-700 text-amber-50 font-medium hover:bg-amber-600 transition-colors"
          >
            Add Recipe
          </NuxtLink>
          <button
            v-if="loggedIn"
            @click="logout"
            class="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Sign out
          </button>
          <NuxtLink
            v-if="!loggedIn"
            to="/login"
            class="text-sm text-stone-500 hover:text-stone-700 transition-colors"
          >
            Sign in
          </NuxtLink>
        </nav>
      </div>
    </header>
    <main>
      <NuxtPage />
    </main>
    <footer class="border-t border-amber-200 mt-16">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-stone-400 text-sm">
          Made with love for Carly
        </p>
      </div>
    </footer>
  </div>
</template>