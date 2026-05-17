<script setup lang="ts">
definePageMeta({
  middleware: ['guest']
})

const { fetch: refreshSession } = useUserSession()
const router = useRouter()

const { data: setupStatus } = await useFetch<{ setupComplete: boolean }>('/api/auth/setup-status')

if (setupStatus.value?.setupComplete) {
  await navigateTo('/login')
}

const form = reactive({
  email: '',
  password: ''
})
const error = ref('')

async function createAdmin() {
  error.value = ''
  try {
    await $fetch('/api/auth/setup', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })
    await refreshSession()
    await navigateTo('/recipes')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Setup failed'
  }
}
</script>

<template>
  <div class="setup-page">
    <div class="setup-glow" />
    <div class="setup-card glass-card-static anim-fade-up">
      <div class="setup-header">
        <span class="setup-icon">🍳</span>
        <h1 class="setup-title">Welcome to Carly's Recipes</h1>
        <p class="setup-subtitle">Create your admin account to get started</p>
      </div>
      <form @submit.prevent="createAdmin" class="setup-form">
        <div v-if="error" class="error-toast">
          {{ error }}
        </div>
        <div class="form-group">
          <label for="email" class="ios-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="carly@example.com"
            required
            autocomplete="email"
            class="ios-input"
          >
        </div>
        <div class="form-group">
          <label for="password" class="ios-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="At least 8 characters"
            required
            minlength="8"
            autocomplete="new-password"
            class="ios-input"
          >
        </div>
        <button type="submit" class="ios-btn ios-btn-primary setup-btn">
          Create Admin Account
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.setup-page {
  min-height: calc(100vh - 56px - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
}

.setup-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--accent-glow) 0%, rgba(244, 114, 182, 0.15) 40%, transparent 70%);
  filter: blur(60px);
  opacity: 0.4;
  pointer-events: none;
}

.setup-card {
  width: 100%;
  max-width: 26rem;
  padding: 2rem;
  position: relative;
}

.setup-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.setup-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.setup-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.375rem;
}

.setup-subtitle {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 300;
}

.setup-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.setup-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
}
</style>