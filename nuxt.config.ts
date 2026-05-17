// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-auth-utils', '@nuxtjs/tailwindcss'],
  runtimeConfig: {
    // Set via NUXT_SITE_PASSWORD env var at runtime (for Docker/server)
    sitePassword: '',
    public: {
      // Set via NUXT_PUBLIC_SITE_NAME env var at runtime (for Docker/client)
      siteName: 'Jolt Recipes'
    }
  }
})