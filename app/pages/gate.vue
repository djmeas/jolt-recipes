<script setup lang="ts">
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/site-auth', {
      method: 'POST',
      body: { password: password.value }
    })
    navigateTo('/')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message ?? 'Incorrect password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="gate-page">
    <div class="gate-card glass-card-static anim-fade-up">
      <div class="gate-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h1 class="gate-title">Carly's Recipes</h1>
      <p class="gate-subtitle">Enter the site password to continue</p>

      <form @submit.prevent="submit" class="gate-form">
        <div v-if="error" class="error-toast">{{ error }}</div>
        <input
          v-model="password"
          type="password"
          placeholder="Site password"
          required
          autofocus
          class="ios-input gate-input"
        >
        <button type="submit" class="ios-btn ios-btn-primary gate-btn" :disabled="loading">
          {{ loading ? 'Checking...' : 'Enter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.gate-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 56px - 64px);
  padding: 1.5rem;
}

.gate-card {
  padding: 2.5rem 2rem;
  max-width: 24rem;
  width: 100%;
  text-align: center;
}

.gate-icon {
  color: var(--accent);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.gate-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.gate-subtitle {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin-bottom: 1.75rem;
}

.gate-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gate-input {
  text-align: center;
}

.gate-btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.gate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>