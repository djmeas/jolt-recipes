<script setup lang="ts">
const config = useRuntimeConfig()
const siteName = config.public.siteName || 'Jolt Recipes'
const [firstWord, ...rest] = siteName.split(' ')
const remainingWords = rest.join(' ')

// Generate 40 static particles (no randomness in template to avoid hydration mismatch)
const particles = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  size: [2, 3, 4, 5, 6][i % 5],
  left: (i * 2.5) % 100,
  top: (i * 7.3) % 100,
  delay: (i * 0.7) % 8,
  duration: 6 + (i % 6),
  drift: (i % 3) - 1,
  opacity: 0.15 + (i % 4) * 0.1
}))
</script>

<template>
  <div class="landing">
    <div class="landing-hero">
      <div class="hero-glow" />

      <!-- emerald particles -->
      <div class="particles" aria-hidden="true">
        <div
          v-for="p in particles"
          :key="p.id"
          class="particle"
          :style="{
            width: p.size + 'px',
            height: p.size + 'px',
            left: p.left + '%',
            top: p.top + '%',
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's',
            opacity: p.opacity,
            '--drift': p.drift + 'px'
          }"
        />
      </div>

      <div class="hero-content anim-fade-up">
        <div class="hero-badge">Personal Cookbook</div>
        <h1 class="hero-title anim-fade-up anim-delay-1">
          {{ firstWord }}<br><span class="hero-title-accent">{{ remainingWords || '' }}</span>
        </h1>
        <p class="hero-subtitle anim-fade-up anim-delay-2">
          A curated collection of favorite recipes,<br>always just a tap away.
        </p>
        <NuxtLink to="/recipes" class="ios-btn ios-btn-primary hero-cta anim-fade-up anim-delay-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Browse Recipes
        </NuxtLink>
      </div>
    </div>

    <div class="features">
      <div class="feature-card glass-card anim-fade-up anim-delay-3">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <h3 class="feature-title">Add Recipes</h3>
        <p class="feature-desc">Save your favorites with structured ingredients, step-by-step instructions, and cook times.</p>
      </div>
      <div class="feature-card glass-card anim-fade-up anim-delay-4">
        <div class="feature-icon-wrap feature-icon-wrap--rose">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 class="feature-title">Find Recipes</h3>
        <p class="feature-desc">Search by name, ingredient, or tag. What's for dinner tonight?</p>
      </div>
      <div class="feature-card glass-card anim-fade-up anim-delay-5">
        <div class="feature-icon-wrap feature-icon-wrap--purple">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <h3 class="feature-title">Update Anytime</h3>
        <p class="feature-desc">Tweak and refine as you go. It's your personal cookbook.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing {
  padding: 0 1.5rem;
  max-width: 72rem;
  margin: 0 auto;
}

@media (min-width: 640px) {
  .landing { padding: 0 2rem; }
}
@media (min-width: 1024px) {
  .landing { padding: 0 2.5rem; }
}

.landing-hero {
  position: relative;
  padding: 6rem 0 5rem;
  text-align: center;
  overflow: hidden;
}

@media (min-width: 768px) {
  .landing-hero { padding: 8rem 0 6rem; }
}

.hero-glow {
  position: absolute;
  top: -40%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  filter: blur(80px);
  opacity: 0.5;
  pointer-events: none;
}

.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: var(--accent);
  box-shadow:
    0 0 6px var(--accent),
    0 0 12px var(--accent-soft);
  animation: particleFloat var(--duration, 6s) ease-in-out infinite;
  will-change: transform, opacity;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: var(--particle-opacity, 0.4);
  }
  50% {
    transform: translateY(-30px) translateX(var(--drift, 0));
    opacity: var(--particle-opacity, 0.4);
  }
  90% {
    opacity: var(--particle-opacity, 0.4);
  }
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
}

.hero-content {
  position: relative;
  max-width: 40rem;
  margin: 0 auto;
}

.hero-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 100px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  background: var(--accent-soft);
  border: 1px solid rgba(16, 185, 129, 0.15);
  margin-bottom: 1.5rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--text-primary);
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--accent), var(--rose));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin-top: 1.25rem;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  font-weight: 300;
}

.hero-cta {
  margin-top: 2.5rem;
  padding: 0.875rem 2rem;
  border-radius: var(--radius-lg);
  font-size: 1rem;
}

.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 48rem;
  margin: 0 auto 4rem;
}

@media (min-width: 640px) {
  .features { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
}

.feature-card {
  padding: 1.75rem;
  text-align: left;
}

.feature-icon-wrap {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid rgba(16, 185, 129, 0.1);
}

.feature-icon-wrap--rose {
  background: var(--rose-soft);
  color: var(--rose);
  border-color: rgba(244, 114, 182, 0.1);
}

.feature-icon-wrap--purple {
  background: rgba(139, 92, 246, 0.12);
  color: #a78bfa;
  border-color: rgba(139, 92, 246, 0.1);
}

.feature-title {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.feature-desc {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--text-secondary);
  font-weight: 300;
}
</style>