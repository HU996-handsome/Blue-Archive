<script setup>
import { ref, onMounted } from 'vue'

const students = ref([])
const current = ref(null)
const isAnimating = ref(false)

const schoolColors = {
  Gehenna: '#ff6b6b',
  Trinity: '#74b9ff',
  Millennium: '#a29bfe',
  Abydos: '#ffeaa7',
  Shanhaijing: '#55efc4',
  Hyakkiyako: '#fd79a8',
  RedWinter: '#dfe6e9',
  SRT: '#00cec9',
  Arius: '#636e72',
  Valkyrie: '#e17055',
  ETC: '#b2bec3',
  Tokiwadai: '#e056fd',
  Sakugawa: '#badc58',
}

onMounted(async () => {
  try {
    const res = await fetch('/assets/students_birthday.json')
    students.value = await res.json()
    roll()
  } catch (e) {
    console.error('Failed to load students:', e)
  }
})

function roll() {
  if (!students.value.length) return
  isAnimating.value = true

  // quick shuffle animation
  let count = 0
  const interval = setInterval(() => {
    const idx = Math.floor(Math.random() * students.value.length)
    current.value = students.value[idx]
    count++
    if (count > 12) {
      clearInterval(interval)
      isAnimating.value = false
    }
  }, 80)
}

function getStars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n)
}

function getSchoolColor(school) {
  return schoolColors[school] || '#2dafff'
}
</script>

<template>
  <div class="random-section glass-card">
    <div class="random-header">
      <span class="random-icon">🎲</span>
      <span class="random-title">学生随机器</span>
      <button class="btn random-btn" :class="{ spinning: isAnimating }" @click="roll">
        {{ isAnimating ? '抽取中...' : '🎲 抽一个' }}
      </button>
    </div>
    <Transition name="card-pop" mode="out-in">
      <div v-if="current" :key="current.name" class="random-card">
        <div class="random-avatar" :style="{ background: `linear-gradient(135deg, ${getSchoolColor(current.school)}, rgba(45,175,255,0.3))` }">
          {{ current.name.charAt(0) }}
        </div>
        <div class="random-info">
          <div class="random-name">{{ current.name }}</div>
          <div class="random-meta">
            <span class="random-school" :style="{ color: getSchoolColor(current.school) }">{{ current.school }}</span>
            <span class="random-stars">{{ getStars(current.star) }}</span>
          </div>
          <div class="random-bd">🎂 {{ current.bd === '-' ? '未知' : current.bd }}</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.random-section {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.random-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.random-icon {
  font-size: 1.2rem;
}

.random-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.random-btn {
  font-size: 0.78rem !important;
  padding: 6px 16px !important;
  background: linear-gradient(135deg, #2dafff, #4dc9f6) !important;
  white-space: nowrap;
}

.random-btn.spinning {
  opacity: 0.7;
  pointer-events: none;
}

.random-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(45, 175, 255, 0.08);
}

.random-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.random-info {
  flex: 1;
  min-width: 0;
}

.random-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
}

.random-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.random-school {
  font-size: 0.72rem;
  font-weight: 500;
}

.random-stars {
  font-size: 0.72rem;
  color: #f5c842;
  letter-spacing: 1px;
}

.random-bd {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.card-pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.card-pop-leave-active { transition: all 0.15s ease; }
.card-pop-enter-from { opacity: 0; transform: scale(0.9) translateY(8px); }
.card-pop-leave-to { opacity: 0; transform: scale(0.95); }
</style>
