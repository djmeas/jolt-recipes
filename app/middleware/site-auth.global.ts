export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/gate') return

  const siteAuth = useCookie('site-auth')
  if (!siteAuth.value) {
    return navigateTo('/gate')
  }
})