<script setup lang="ts">
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
    <div class="text-center max-w-2xl mx-auto">
      <h1 class="text-5xl sm:text-6xl font-serif font-bold text-amber-900 tracking-tight">
        Carly's Recipes
      </h1>
      <p class="mt-6 text-lg text-stone-500 leading-relaxed">
        A personal collection of favorite recipes, always within reach.
      </p>
      <div class="mt-10">
        <NuxtLink
          to="/recipes"
          class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600 transition-colors text-lg"
        >
          Browse Recipes
        </NuxtLink>
      </div>
    </div>

    <div class="mt-20 grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#127859;</div>
        <h3 class="font-serif font-semibold text-amber-900">Add Recipes</h3>
        <p class="mt-2 text-sm text-stone-500">Save your favorites with ingredients, steps, and times.</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#128269;</div>
        <h3 class="font-serif font-semibold text-amber-900">Find Recipes</h3>
        <p class="mt-2 text-sm text-stone-500">Search by name, ingredient, or tag. What's for dinner?</p>
      </div>
      <div class="text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50">
        <div class="text-4xl mb-3">&#9999;&#65039;</div>
        <h3 class="font-serif font-semibold text-amber-900">Update Anytime</h3>
        <p class="mt-2 text-sm text-stone-500">Tweak a recipe as you go. It's your cookbook.</p>
      </div>
    </div>
  </div>
</template>