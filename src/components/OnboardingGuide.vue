<script setup>
import { ref, computed, onMounted, nextTick, watch, inject } from 'vue'

const active = ref(false)
const currentStep = ref(0)
const tooltipStyle = ref({})
const spotStyle = ref({})
const guideRestart = inject('guideRestart')
const user = inject('user')
const needsOnboarding = inject('needsOnboarding')
const onOnboardingComplete = inject('onOnboardingComplete')
const t = inject('t')

// Per-user storage key
const STORAGE_KEY = computed(() => {
  const uid = user.value?.id
  return uid ? `ba-onboarding-done-${uid}` : 'ba-onboarding-done-guest'
})

const stepTargets = [
  { target: '.sidebar-logo', pos: 'right' },
  { target: '.avatar-section', pos: 'right' },
  { target: '.clock-display', pos: 'right' },
  { target: '.weather-section', pos: 'right' },
  { target: '.birthday-section', pos: 'right' },
  { target: '.topbar-search', pos: 'bottom' },
  { target: '.link-category', pos: 'left' },
  { target: '.topbar-menu', pos: 'bottom' },
  { target: '.char-toggle', pos: 'right' },
]

const steps = computed(() => {
  const texts = t('guide.steps')
  return stepTargets.map((st, i) => ({ ...st, ...(texts[i] || {}) }))
})

const visibleSteps = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    const sidebarTargets = ['.sidebar-logo', '.avatar-section', '.clock-display', '.weather-section', '.birthday-section']
    return steps.value.filter(s => !sidebarTargets.includes(s.target))
  }
  return steps.value
})

function updatePosition() {
  const step = visibleSteps.value[currentStep.value]
  if (!step) return
  const el = document.querySelector(step.target)
  if (!el) return

  const rect = el.getBoundingClientRect()
  const gap = 16

  // spotlight
  spotStyle.value = {
    top: (rect.top - 8) + 'px',
    left: (rect.left - 8) + 'px',
    width: (rect.width + 16) + 'px',
    height: (rect.height + 16) + 'px',
  }

  // tooltip position
  const tooltipW = 300
  if (step.pos === 'right') {
    const left = rect.right + gap
    tooltipStyle.value = {
      top: Math.max(20, Math.min(rect.top + rect.height / 2 - 60, window.innerHeight - 160)) + 'px',
      left: Math.min(left, window.innerWidth - tooltipW - 16) + 'px',
    }
  } else if (step.pos === 'left') {
    tooltipStyle.value = {
      top: Math.max(20, Math.min(rect.top + rect.height / 2 - 60, window.innerHeight - 160)) + 'px',
      right: (window.innerWidth - rect.left + gap) + 'px',
      left: 'auto',
    }
  } else if (step.pos === 'bottom') {
    tooltipStyle.value = {
      top: Math.min(rect.bottom + gap, window.innerHeight - 160) + 'px',
      left: Math.max(16, Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - tooltipW - 16)) + 'px',
    }
  }
}

function next() {
  if (currentStep.value < visibleSteps.value.length - 1) {
    currentStep.value++
    nextTick(updatePosition)
  } else {
    finish()
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
    nextTick(updatePosition)
  }
}

function skip() { finish() }

function finish() {
  active.value = false
  localStorage.setItem(STORAGE_KEY.value, 'true')
  onOnboardingComplete?.()
}

function startGuide() {
  localStorage.removeItem(STORAGE_KEY.value)
  currentStep.value = 0
  active.value = true
  nextTick(updatePosition)
}

onMounted(() => {
  // If parent says onboarding is needed (fresh login), start it
  if (needsOnboarding?.value) {
    setTimeout(() => {
      active.value = true
      nextTick(updatePosition)
    }, 1200)
    return
  }
  // Otherwise check per-user storage
  if (localStorage.getItem(STORAGE_KEY.value) === 'true') return
  if (window.innerWidth <= 900) return
  setTimeout(() => {
    active.value = true
    nextTick(updatePosition)
  }, 1800)
})

watch(currentStep, () => { nextTick(updatePosition) })
watch(guideRestart, (val) => { if (val > 0 && window.innerWidth > 900) startGuide() })
watch(needsOnboarding, (val) => {
  if (val && window.innerWidth > 900) {
    setTimeout(() => {
      active.value = true
      nextTick(updatePosition)
    }, 800)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="guide">
      <div v-if="active" class="guide-overlay">
        <!-- Spotlight cutout -->
        <div class="guide-spotlight" :style="spotStyle"></div>

        <!-- Tooltip -->
        <div class="guide-tooltip glass-card" :style="tooltipStyle">
          <div class="guide-step-badge">{{ currentStep + 1 }} / {{ visibleSteps.length }}</div>
          <div class="guide-avatar">✦</div>
          <h3 class="guide-title">{{ visibleSteps[currentStep].title }}</h3>
          <p class="guide-desc">{{ visibleSteps[currentStep].desc }}</p>
          <div class="guide-actions">
            <button class="btn guide-skip" @click="skip">{{ t('guide.skip') }}</button>
            <button class="btn guide-prev" v-if="currentStep > 0" @click="prev">{{ t('guide.prev') }}</button>
            <button class="btn guide-next" @click="next">
              {{ currentStep < visibleSteps.length - 1 ? t('guide.next') : t('guide.start') }}
            </button>
          </div>
          <!-- arrow -->
          <div class="guide-arrow" :class="visibleSteps[currentStep].pos"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* global — not scoped, since teleported to body */
.guide-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
}

.guide-spotlight {
  position: fixed;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
  transition: all 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
  pointer-events: none;
  z-index: 3001;
}

.guide-tooltip {
  position: fixed;
  width: 300px;
  padding: 24px !important;
  z-index: 3002;
  animation: tooltipIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: top 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), left 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
  background: rgba(11, 26, 46, 0.95) !important;
  border: 1px solid rgba(45, 175, 255, 0.2) !important;
}

@keyframes tooltipIn {
  from { opacity: 0; transform: scale(0.9) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.guide-step-badge {
  position: absolute; top: 12px; right: 14px;
  font-size: 0.68rem; color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px; border-radius: 8px;
}

.guide-avatar {
  font-size: 1.6rem; margin-bottom: 10px;
  background: linear-gradient(135deg, #2dafff, #f5c842);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guide-title {
  font-size: 1.05rem; font-weight: 600;
  margin-bottom: 8px; color: var(--text-primary);
}

.guide-desc {
  font-size: 0.82rem; color: var(--text-secondary);
  line-height: 1.7; margin-bottom: 18px;
}

.guide-actions {
  display: flex; gap: 10px; justify-content: flex-end;
}

.guide-skip {
  background: rgba(255, 255, 255, 0.06) !important;
  font-size: 0.82rem !important; padding: 7px 16px !important;
}

.guide-skip:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.guide-prev {
  background: rgba(255, 255, 255, 0.06) !important;
  font-size: 0.82rem !important; padding: 7px 16px !important;
}

.guide-prev:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.guide-next {
  font-size: 0.82rem !important; padding: 7px 20px !important;
  background: linear-gradient(135deg, #2dafff, #4dc9f6) !important;
}

.guide-next:hover {
  box-shadow: 0 4px 16px rgba(45, 175, 255, 0.4) !important;
}

/* Arrow */
.guide-arrow {
  position: absolute;
  width: 12px; height: 12px;
  background: rgba(11, 26, 46, 0.95);
  border: 1px solid rgba(45, 175, 255, 0.2);
  transform: rotate(45deg);
}

.guide-arrow.right {
  left: -7px; top: 50%; margin-top: -6px;
  border-right: none; border-top: none;
}

.guide-arrow.left {
  right: -7px; top: 50%; margin-top: -6px;
  border-left: none; border-bottom: none;
}

.guide-arrow.bottom {
  top: -7px; left: 50%; margin-left: -6px;
  border-bottom: none; border-right: none;
}

.guide-arrow.top {
  bottom: -7px; left: 50%; margin-left: -6px;
  border-top: none; border-left: none;
}

/* Transition */
.guide-enter-active { transition: opacity 0.4s ease; }
.guide-leave-active { transition: opacity 0.3s ease; }
.guide-enter-from, .guide-leave-to { opacity: 0; }

/* Mobile */
@media (max-width: 900px) {
  .guide-tooltip {
    width: calc(100vw - 32px);
    max-width: 300px;
    padding: 18px !important;
  }
  .guide-title { font-size: 0.95rem; }
  .guide-desc { font-size: 0.78rem; line-height: 1.6; }
  .guide-actions { gap: 8px; }
  .guide-next { padding: 6px 16px !important; font-size: 0.78rem !important; }
  .guide-skip, .guide-prev { padding: 6px 12px !important; font-size: 0.78rem !important; }
}
</style>
