<script setup>
import { ref, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const { getSchoolColor } = useSchoolColors()

const emit = defineEmits(['pull'])

const students = ref([])
const results = ref([])
const isPulling = ref(false)
const showResults = ref(false)
const pullCount = ref(0)
const pityCount = ref(0)

// gacha rates: 3* = 3%, 2* = 18%, 1* = 79%
const RATES = { 3: 0.03, 2: 0.18 }
const PITY_THRESHOLD = 200

onMounted(async () => {
  try {
    const res = await fetch('/assets/students_birthday.json')
    const data = await res.json()
    // filter out duplicate names and collab characters
    const seen = new Set()
    students.value = data.filter(s => {
      if (seen.has(s.name)) return false
      if (s.school === 'ETC' || s.school === 'Tokiwadai' || s.school === 'Sakugawa') return false
      seen.add(s.name)
      return true
    })
  } catch (e) {
    console.error('Failed to load students:', e)
  }
})

function pullOne() {
  pityCount.value++
  let star
  // pity system
  if (pityCount.value >= PITY_THRESHOLD) {
    star = 3
    pityCount.value = 0
  } else {
    const rand = Math.random()
    if (rand < RATES[3]) { star = 3; pityCount.value = 0 }
    else if (rand < RATES[3] + RATES[2]) star = 2
    else star = 1
  }

  const pool = students.value.filter(s => s.star === star)
  if (!pool.length) return { name: '???', school: '???', star: 1, bd: '-' }
  return pool[Math.floor(Math.random() * pool.length)]
}

async function pullTen() {
  if (isPulling.value || !students.value.length) return
  isPulling.value = true
  showResults.value = false
  results.value = []

  const pulls = []
  for (let i = 0; i < 10; i++) {
    pulls.push(pullOne())
  }

  // sort by star descending for dramatic effect
  pulls.sort((a, b) => b.star - a.star)

  // reveal one by one
  for (const s of pulls) {
    await new Promise(r => setTimeout(r, 200))
    results.value.push(s)
  }

  pullCount.value += 10
  isPulling.value = false
  showResults.value = true
  emit('pull', pulls)
}

function getStars(n) {
  return '★'.repeat(n)
}
</script>

<template>
  <div class="gacha-section glass-card">
    <div class="gacha-header">
      <span class="gacha-icon">🎰</span>
      <span class="gacha-title">{{ t('tools.gacha') }}</span>
      <span class="gacha-pity">{{ t('tools.pity', { n: pityCount }) }}</span>
    </div>
    <div class="gacha-info">
      <span>3★: 3% | 2★: 18% | 1★: 79%</span>
      <span v-if="pullCount > 0">{{ t('tools.pulled', { n: pullCount }) }}</span>
    </div>
    <button class="btn gacha-btn" :class="{ pulling: isPulling }" @click="pullTen" :disabled="isPulling">
      {{ isPulling ? t('tools.pulling') : t('tools.pullTen') }}
    </button>
    <Transition name="results-pop">
      <div v-if="showResults && results.length" class="gacha-results">
        <div v-for="(s, i) in results" :key="i" class="gacha-card" :class="'star-' + s.star">
          <div class="gacha-card-stars" :class="'stars-' + s.star">{{ getStars(s.star) }}</div>
          <div class="gacha-card-name">{{ s.name }}</div>
          <div class="gacha-card-school" :style="{ color: getSchoolColor(s.school) }">{{ t('schoolNames.' + s.school) || s.school }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gacha-section {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.gacha-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.gacha-icon { font-size: 1.2rem; }

.gacha-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.gacha-pity {
  font-size: 0.72rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 6px;
}

.gacha-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

.gacha-btn {
  width: 100%;
  padding: 12px !important;
  font-size: 0.95rem !important;
  background: linear-gradient(135deg, #f5c842, #ff9ecd) !important;
  color: #1a1a2e !important;
  font-weight: 700;
  letter-spacing: 2px;
  border-radius: 14px !important;
  transition: all 0.3s;
}

.gacha-btn:hover {
  box-shadow: 0 4px 24px rgba(245, 200, 66, 0.4) !important;
  transform: translateY(-2px);
}

.gacha-btn.pulling {
  opacity: 0.6;
  pointer-events: none;
}

.gacha-results {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.gacha-card {
  padding: 10px 6px;
  border-radius: 10px;
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: cardReveal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.gacha-card.star-3 {
  background: linear-gradient(135deg, rgba(245, 200, 66, 0.12), rgba(255, 158, 205, 0.08));
  border-color: rgba(245, 200, 66, 0.3);
}

.gacha-card.star-2 {
  background: rgba(116, 185, 255, 0.06);
  border-color: rgba(116, 185, 255, 0.15);
}

.gacha-card-stars {
  font-size: 0.65rem;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.stars-3 { color: #f5c842; }
.stars-2 { color: #74b9ff; }
.stars-1 { color: var(--text-secondary); opacity: 0.5; }

.gacha-card-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gacha-card-school {
  font-size: 0.6rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardReveal {
  from { opacity: 0; transform: scale(0.7) rotateY(90deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}

.results-pop-enter-active { transition: all 0.3s ease; }
.results-pop-leave-active { transition: all 0.2s ease; }
.results-pop-enter-from { opacity: 0; transform: translateY(10px); }
.results-pop-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .gacha-results { grid-template-columns: repeat(5, 1fr); gap: 5px; }
  .gacha-card { padding: 8px 2px; }
  .gacha-card-name { font-size: 0.65rem; }
}
</style>
