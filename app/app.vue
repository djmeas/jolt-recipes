<script setup lang="ts">
const { loggedIn, user, clear: clearSession } = useUserSession()
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'Jolt Recipes'
const mobileMenuOpen = ref(false)

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clearSession()
  mobileMenuOpen.value = false
  await navigateTo('/recipes')
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <NuxtLink to="/" class="logo">
          <span class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 2v7a1.5 1.5 0 0 0 1.5 1.5v10.5" />
              <path d="M9 2v5" />
              <path d="M5 2v5" />
              <path d="M5 7h4" />
              <path d="M18 2c-1.5 0-2 2.5-2 5 0 2.5 1 3 2 3.5v9.5" />
              <path d="M18 2c1.5 0 2 2.5 2 5 0 2.5-1 3-2 3.5" />
            </svg>
          </span>
          <span class="logo-text">{{ siteName }}</span>
        </NuxtLink>
        <nav class="nav-links">
          <!-- desktop links always visible -->
          <div class="desktop-nav">
            <NuxtLink to="/recipes" class="nav-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Browse
            </NuxtLink>
            <NuxtLink
              v-if="loggedIn"
              to="/dashboard"
              class="nav-link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </NuxtLink>
            <NuxtLink
              v-if="loggedIn"
              to="/recipes/new"
              class="nav-cta"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Recipe
            </NuxtLink>
            <button
              v-if="loggedIn"
              @click="logout"
              class="nav-link nav-link--subtle"
            >
              Sign out
            </button>
            <NuxtLink
              v-if="!loggedIn"
              to="/login"
              class="nav-link nav-link--subtle"
            >
              Sign in
            </NuxtLink>
          </div>

          <!-- mobile hamburger -->
          <button
            class="hamburger mobile-only"
            aria-label="Toggle navigation"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <svg v-if="!mobileMenuOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </nav>

        <!-- mobile drawer overlay -->
        <transition name="drawer">
          <div v-if="mobileMenuOpen" class="mobile-drawer" @click.self="mobileMenuOpen = false">
            <div class="mobile-drawer-inner">
              <NuxtLink to="/recipes" class="drawer-link" @click="mobileMenuOpen = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Browse
              </NuxtLink>
              <NuxtLink v-if="loggedIn" to="/dashboard" class="drawer-link" @click="mobileMenuOpen = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </NuxtLink>
              <NuxtLink v-if="loggedIn" to="/recipes/new" class="drawer-link drawer-link--cta" @click="mobileMenuOpen = false">
                Add Recipe
              </NuxtLink>
              <button v-if="loggedIn" class="drawer-link" @click="logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
              <NuxtLink v-if="!loggedIn" to="/login" class="drawer-link drawer-link--subtle" @click="mobileMenuOpen = false">
                Sign in
              </NuxtLink>
            </div>
          </div>
        </transition>
      </div>
    </header>
    <main class="app-main">
      <NuxtPage />
    </main>
    <footer class="app-footer">
      <p>Made with love for you</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=SF+Pro+Display:wght@300;400;500;600&display=swap');

:root {
  --bg-base: #0c1412;
  --bg-surface: rgba(255, 255, 255, 0.04);
  --bg-glass: rgba(255, 255, 255, 0.06);
  --bg-glass-hover: rgba(255, 255, 255, 0.10);
  --bg-glass-active: rgba(255, 255, 255, 0.14);
  --bg-glass-strong: rgba(255, 255, 255, 0.08);
  --border-glass: rgba(255, 255, 255, 0.08);
  --border-glass-hover: rgba(255, 255, 255, 0.16);
  --border-input: rgba(255, 255, 255, 0.1);
  --text-primary: rgba(255, 255, 255, 0.92);
  --text-secondary: rgba(255, 255, 255, 0.55);
  --text-tertiary: rgba(255, 255, 255, 0.35);
  --accent: #10b981;
  --accent-soft: rgba(16, 185, 129, 0.15);
  --accent-glow: rgba(16, 185, 129, 0.3);
  --rose: #34d399;
  --rose-soft: rgba(52, 211, 153, 0.12);
  --destructive: #ef4444;
  --destructive-soft: rgba(239, 68, 68, 0.12);
  --radius-sm: 10px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --accent-hover: #34d399;
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  --shadow-card-hover: 0 8px 40px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  --blur-amount: 24px;
  --transition-fast: 180ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --transition-smooth: 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

* {
  -webkit-tap-highlight-color: transparent;
}

.app-shell {
  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  overflow-x: hidden;
  position: relative;
}

.app-shell::before {
  content: '';
  position: fixed;
  inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 10%, rgba(16, 185, 129, 0.08), transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(110, 231, 183, 0.06), transparent 60%),
      radial-gradient(ellipse 40% 30% at 50% 50%, rgba(52, 211, 153, 0.04), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.app-shell > * {
  position: relative;
  z-index: 1;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(15, 15, 20, 0.72);
  backdrop-filter: saturate(180%) blur(var(--blur-amount));
  -webkit-backdrop-filter: saturate(180%) blur(var(--blur-amount));
  border-bottom: 1px solid var(--border-glass);
}

.header-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (min-width: 640px) {
  .header-inner { padding: 0 2rem; }
}
@media (min-width: 1024px) {
  .header-inner { padding: 0 2.5rem; }
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text-primary);
}

.logo-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-glass);
}

.nav-link--subtle {
  color: var(--text-tertiary);
}

.nav-link--subtle:hover {
  color: var(--text-secondary);
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  font-weight: 600;
  color: white;
  text-decoration: none;
  background: var(--accent);
  transition: all var(--transition-fast);
  box-shadow: 0 2px 12px var(--accent-glow);
}

.nav-cta:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 20px var(--accent-glow);
  transform: translateY(-1px);
}

.nav-cta:active {
  transform: translateY(0);
}

.app-main {
  min-height: calc(100vh - 56px - 64px);
}

.app-footer {
  border-top: 1px solid var(--border-glass);
  padding: 1.5rem;
  text-align: center;
}

.app-footer p {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-weight: 400;
}

.glass-card {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--transition-smooth);
}

.glass-card:hover {
  background: var(--bg-glass-hover);
  border-color: var(--border-glass-hover);
  box-shadow: var(--shadow-card-hover);
}

.glass-card-static {
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ios-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-input);
  background: var(--bg-glass-strong);
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  outline: none;
}

.ios-input::placeholder {
  color: var(--text-tertiary);
}

.ios-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  background: var(--bg-glass-hover);
}

.ios-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
}

.ios-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  letter-spacing: 0.01em;
}

.ios-hint {
  font-size: 0.6875rem;
  color: var(--text-tertiary);
  margin-bottom: 0.5rem;
}

.ios-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.ios-btn-primary {
  background: var(--accent);
  color: white;
  box-shadow: 0 2px 16px var(--accent-glow);
}

.ios-btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 4px 24px var(--accent-glow);
  transform: translateY(-1px);
}

.ios-btn-primary:active {
  transform: translateY(0);
}

.ios-btn-ghost {
  background: var(--bg-glass);
  color: var(--text-secondary);
  border: 1px solid var(--border-glass);
}

.ios-btn-ghost:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
  border-color: var(--border-glass-hover);
}

.ios-btn-danger {
  background: var(--destructive-soft);
  color: var(--destructive);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.ios-btn-danger:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.3);
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(16, 185, 129, 0.12);
}

.tag-pill--rose {
  background: var(--rose-soft);
  color: var(--rose);
  border-color: rgba(244, 114, 182, 0.12);
}

.error-toast {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--destructive-soft);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: var(--destructive);
  font-size: 0.8125rem;
  font-weight: 500;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.anim-fade-up {
  animation: fadeUp 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) both;
}

.anim-delay-1 { animation-delay: 80ms; }
.anim-delay-2 { animation-delay: 160ms; }
.anim-delay-3 { animation-delay: 240ms; }
.anim-delay-4 { animation-delay: 320ms; }
.anim-delay-5 { animation-delay: 400ms; }

/* Mobile hamburger & drawer */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 640px) {
  .desktop-nav { display: flex; }
}

.mobile-only {
  display: block;
}

@media (min-width: 640px) {
  .mobile-only { display: none; }
}

.hamburger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--bg-glass);
  border: 1px solid var(--border-glass);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
}

.hamburger:hover {
  background: var(--bg-glass-hover);
  color: var(--text-primary);
}

.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
}

.mobile-drawer-inner {
  width: 70%;
  max-width: 280px;
  height: 100%;
  background: rgba(15, 15, 20, 0.82);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 0.5rem;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  text-decoration: none;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all var(--transition-fast);
  cursor: pointer;
  font-family: inherit;
}

.drawer-link:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.12);
}

.drawer-link--cta {
  background: var(--accent);
  color: white;
  border-color: transparent;
  box-shadow: 0 2px 12px var(--accent-glow);
}

.drawer-link--cta:hover {
  background: var(--accent-hover);
}

.drawer-link--subtle {
  background: none;
  border-color: transparent;
  color: var(--text-secondary);
}

.drawer-link--subtle:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.drawer-divider {
  height: 1px;
  background: var(--border-glass);
  margin: 0.25rem 0;
}

.drawer-link--signout {
  background: none;
  border-color: transparent;
  color: var(--text-tertiary);
  font-size: 0.8125rem;
}

.drawer-link--signout:hover {
  color: var(--destructive);
  background: var(--destructive-soft);
  border-color: rgba(239, 68, 68, 0.15);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 200ms ease;
}

.drawer-enter-active > .mobile-drawer-inner,
.drawer-leave-active > .mobile-drawer-inner {
  transition: transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > .mobile-drawer-inner,
.drawer-leave-to > .mobile-drawer-inner {
  transform: translateX(100%);
}

.drawer-enter-to,
.drawer-leave-from {
  opacity: 1;
}

.drawer-enter-to > .mobile-drawer-inner,
.drawer-leave-from > .mobile-drawer-inner {
  transform: translateX(0);
}

@media (min-width: 640px) {
  .mobile-drawer { display: none; }
}
</style>