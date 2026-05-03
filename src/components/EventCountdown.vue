<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'

const t = inject('t')

const events = ref([])
const now = ref(Date.now())
let timer = null

// approximate BA event schedule (updated periodically)
const eventList = [
  { nameKey: 'tools.raid', icon: '⚔️', cycle: 14, offset: 0 },
  { nameKey: 'tools.grandAssault', icon: '🔥', cycle: 28, offset: 7 },
  { nameKey: 'tools.jointExercise', icon: '🛡️', cycle: 21, offset: 3 },
  { nameKey: 'tools.eventStory', icon: '📖', cycle: 14, offset: 10 },
]

function getNextEventDate(cycleDays, offsetDays) {
  const base = new Date('2026-01-01T04:00:00+09:00') // BA day reset at 4:00 JST
  const diff = now.value - base.getTime()
  const dayMs = 86400000
  const daysSinceBase = Math.floor(diff / dayMs)
  const daysUntilNext = (cycleDays - ((daysSinceBase - offsetDays) % cycleDays) + cycleDays) % cycleDays
  const nextDate = new Date(now.value + daysUntilNext * dayMs)
  nextDate.setHours(4, 0, 0, 0) // BA reset time
  if (nextDate.getTime() <= now.value) nextDate.setTime(nextDate.getTime() + cycleDays * dayMs)
  return nextDate
}

function updateEvents() {
  now.value = Date.now()
  events.value = eventList.map(e => {
    const nextDate = getNextEventDate(e.cycle, e.offset)
    const diff = nextDate.getTime() - now.value
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return {
      ...e,
      name: t(e.nameKey),
      nextDate,
      days, hours, mins,
      isToday: days === 0 && hours < 12,
    }
  }).sort((a, b) => a.nextDate - b.nextDate)
}

onMounted(() => {
  updateEvents()
  timer = setInterval(updateEvents, 60000) // update every minute
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div class="countdown-section glass-card">
    <div class="countdown-header">
      <span class="countdown-icon">⏰</span>
      <span class="countdown-title">{{ t('tools.eventCountdown') }}</span>
    </div>
    <div class="countdown-list">
      <div v-for="e in events" :key="e.name" class="countdown-item" :class="{ today: e.isToday }">
        <span class="countdown-item-icon">{{ e.icon }}</span>
        <span class="countdown-item-name">{{ e.name }}</span>
        <span v-if="e.isToday" class="countdown-badge">{{ t('tools.today') }}</span>
        <span v-else class="countdown-time">
          <template v-if="e.days > 0">{{ e.days }}{{ t('tools.days') }}</template>{{ e.hours }}{{ t('tools.hours') }}{{ e.mins }}{{ t('tools.mins') }}
        </span>
      </div>
    </div>
    <div class="countdown-note">{{ t('tools.countdownNote') }}</div>
  </div>
</template>

<style scoped>
.countdown-section {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.countdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.countdown-icon { font-size: 1.2rem; }

.countdown-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
}

.countdown-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.countdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s;
}

.countdown-item.today {
  background: rgba(245, 200, 66, 0.08);
  border-color: rgba(245, 200, 66, 0.2);
}

.countdown-item-icon { font-size: 1rem; flex-shrink: 0; }

.countdown-item-name {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
  flex: 1;
}

.countdown-time {
  font-size: 0.78rem;
  color: #2dafff;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.countdown-badge {
  font-size: 0.65rem;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(245, 200, 66, 0.15);
  color: #f5c842;
  font-weight: 600;
}

.countdown-note {
  font-size: 0.65rem;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-top: 10px;
}
</style>
