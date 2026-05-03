<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const { getSchoolColor } = useSchoolColors()

const allStudents = ref([])
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth()) // 0-indexed

const schoolNames = computed(() => ({
  Abydos: t('schoolNames.Abydos'), Gehenna: t('schoolNames.Gehenna'), Trinity: t('schoolNames.Trinity'), Millennium: t('schoolNames.Millennium'),
  Hyakkiyako: t('schoolNames.Hyakkiyako'), Shanhaijing: t('schoolNames.Shanhaijing'), RedWinter: t('schoolNames.RedWinter'), Valkyrie: t('schoolNames.Valkyrie'),
  SRT: 'SRT', Arius: t('schoolNames.Arius'), ETC: t('schoolNames.ETC'),
}))

const monthNames = computed(() => t('tools.monthNames'))
const weekDays = computed(() => t('tools.weekDays'))

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
})

const birthdayMap = computed(() => {
  const map = {}
  allStudents.value.forEach(s => {
    const parts = s.bd.split('/')
    const m = parseInt(parts[0]) - 1
    const d = parseInt(parts[1])
    if (m === currentMonth.value) {
      if (!map[d]) map[d] = []
      map[d].push(s)
    }
  })
  return map
})

const selectedDay = ref(null)
const selectedStudents = computed(() => {
  if (!selectedDay.value) return []
  return birthdayMap.value[selectedDay.value] || []
})

function isToday(day) {
  const now = new Date()
  return day === now.getDate() && currentMonth.value === now.getMonth() && currentYear.value === now.getFullYear()
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  selectedDay.value = null
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  selectedDay.value = null
}

function goToday() {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  selectedDay.value = null
}

function selectDay(day) {
  if (!day) return
  selectedDay.value = selectedDay.value === day ? null : day
}

onMounted(async () => {
  try {
    const res = await fetch('/assets/students_birthday.json')
    allStudents.value = await res.json()
  } catch {}
})
</script>

<template>
  <div class="cal-section glass-card">
    <div class="cal-header">
      <span class="cal-icon">📅</span>
      <span class="cal-title">{{ t('tools.birthdayCalendar') }}</span>
    </div>
    <div class="cal-nav">
      <button class="cal-nav-btn" @click="prevMonth">&lt;</button>
      <span class="cal-nav-label" @click="goToday">{{ t('tools.yearMonth', { y: currentYear, m: monthNames[currentMonth] }) }}</span>
      <button class="cal-nav-btn" @click="nextMonth">&gt;</button>
    </div>
    <div class="cal-weekdays">
      <span v-for="w in weekDays" :key="w" class="cal-weekday">{{ w }}</span>
    </div>
    <div class="cal-grid">
      <div
        v-for="(day, i) in calendarDays"
        :key="i"
        class="cal-day"
        :class="{
          empty: !day,
          today: day && isToday(day),
          hasBd: day && birthdayMap[day],
          selected: day && day === selectedDay
        }"
        @click="selectDay(day)"
      >
        <span v-if="day" class="cal-day-num">{{ day }}</span>
        <span v-if="day && birthdayMap[day]" class="cal-day-dot">🎂</span>
      </div>
    </div>
    <Transition name="detail-pop">
      <div v-if="selectedStudents.length" class="cal-detail">
        <div class="cal-detail-title">🎂 {{ currentMonth + 1 }}月{{ selectedDay }}日</div>
        <div v-for="s in selectedStudents" :key="s.name" class="cal-detail-item">
          <span class="cal-detail-name">{{ s.name }}</span>
          <span class="cal-detail-school" :style="{ color: getSchoolColor(s.school) }">{{ schoolNames[s.school] || s.school }}</span>
        </div>
      </div>
    </Transition>
    <div class="cal-legend">
      <span class="cal-legend-item"><span class="cal-legend-dot today-dot"></span> {{ t('tools.legendToday') }}</span>
      <span class="cal-legend-item"><span class="cal-legend-dot bd-dot"></span> {{ t('tools.legendBd') }}</span>
    </div>
  </div>
</template>

<style scoped>
.cal-section {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.cal-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.cal-icon { font-size: 1.2rem; }
.cal-title { font-size: 0.92rem; font-weight: 600; color: var(--text-primary); }

.cal-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.cal-nav-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(45, 175, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.cal-nav-btn:hover {
  background: rgba(45, 175, 255, 0.12);
  border-color: rgba(45, 175, 255, 0.3);
}

.cal-nav-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  user-select: none;
  min-width: 100px;
  text-align: center;
}

.cal-nav-label:hover { color: #2dafff; }

.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}

.cal-weekday {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 4px 0;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  gap: 1px;
}

.cal-day.empty { cursor: default; }

.cal-day:not(.empty):hover {
  background: rgba(45, 175, 255, 0.08);
}

.cal-day.today {
  background: rgba(45, 175, 255, 0.12);
  border: 1px solid rgba(45, 175, 255, 0.3);
}

.cal-day.selected {
  background: rgba(245, 200, 66, 0.12);
  border: 1px solid rgba(245, 200, 66, 0.3);
}

.cal-day.hasBd { background: rgba(245, 200, 66, 0.06); }

.cal-day-num {
  font-size: 0.72rem;
  color: var(--text-primary);
  font-weight: 500;
}

.cal-day.today .cal-day-num { color: #2dafff; font-weight: 700; }

.cal-day-dot {
  font-size: 0.5rem;
  line-height: 1;
}

.cal-detail {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(245, 200, 66, 0.06);
  border: 1px solid rgba(245, 200, 66, 0.12);
}

.cal-detail-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #f5c842;
  margin-bottom: 6px;
}

.cal-detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;
}

.cal-detail-name { font-size: 0.75rem; color: var(--text-primary); }
.cal-detail-school { font-size: 0.65rem; }

.cal-legend {
  display: flex;
  gap: 14px;
  margin-top: 10px;
}

.cal-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.62rem;
  color: var(--text-secondary);
}

.cal-legend-dot {
  width: 8px; height: 8px;
  border-radius: 3px;
}

.today-dot { background: rgba(45, 175, 255, 0.3); border: 1px solid rgba(45, 175, 255, 0.5); }
.bd-dot { background: rgba(245, 200, 66, 0.3); }

.detail-pop-enter-active { transition: all 0.25s ease; }
.detail-pop-leave-active { transition: all 0.2s ease; }
.detail-pop-enter-from { opacity: 0; transform: translateY(-6px); }
.detail-pop-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 600px) {
  .cal-section { padding: 14px 14px; }
  .cal-header { margin-bottom: 10px; }
  .cal-title { font-size: 0.85rem; }
  .cal-nav { gap: 12px; margin-bottom: 8px; }
  .cal-nav-label { font-size: 0.82rem; min-width: 90px; }
  .cal-day-num { font-size: 0.65rem; }
  .cal-day-dot { font-size: 0.45rem; }
  .cal-detail { padding: 8px 10px; }
  .cal-detail-title { font-size: 0.72rem; }
  .cal-detail-name { font-size: 0.7rem; }
  .cal-detail-school { font-size: 0.6rem; }
}
</style>
