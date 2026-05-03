<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const locale = inject('locale')
const { getSchoolColor } = useSchoolColors()

const STORAGE_KEY = 'ba-collection'
const students = ref([])
const owned = ref(new Set())
const filterSchool = ref('')
const filterStar = ref(0)
const searchQuery = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    owned.value = new Set(saved)
    const res = await fetch('/assets/students.json')
    students.value = await res.json()
  } catch (e) {
    console.error('Failed to load students:', e)
  }
  loading.value = false
})

function toggleOwned(id) {
  if (owned.value.has(id)) {
    owned.value.delete(id)
  } else {
    owned.value.add(id)
  }
  owned.value = new Set(owned.value)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...owned.value]))
}

const filtered = computed(() => {
  let list = students.value
  if (filterSchool.value) list = list.filter(s => s.school === filterSchool.value)
  if (filterStar.value) list = list.filter(s => s.star === filterStar.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(s =>
      s.nameZh.toLowerCase().includes(q) ||
      s.nameJa.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q)
    )
  }
  return list
})

const schools = computed(() => [...new Set(students.value.map(s => s.school))].sort())

const progress = computed(() => {
  if (!students.value.length) return 0
  return Math.round(owned.value.size / students.value.length * 100)
})

function getStudentName(s) {
  if (locale.value === 'ja') return s.nameJa || s.nameZh
  return s.nameZh
}
</script>

<template>
  <div class="sc-section glass-card">
    <div class="sc-header">
      <span class="sc-icon">📦</span>
      <span class="sc-title">{{ t('tools.collection') || '学生图鉴' }}</span>
      <span class="sc-progress">{{ owned.size }}/{{ students.length }} ({{ progress }}%)</span>
    </div>
    <div class="sc-progress-bar">
      <div class="sc-progress-fill" :style="{ width: progress + '%' }"></div>
    </div>
    <div class="sc-filters">
      <input
        class="sc-search"
        v-model="searchQuery"
        :placeholder="t('tools.searchStudent') || '搜索...'"
      />
      <select class="sc-select" v-model="filterSchool">
        <option value="">{{ t('tools.allSchools') || '全部学校' }}</option>
        <option v-for="s in schools" :key="s" :value="s">{{ t('schoolNames.' + s) || s }}</option>
      </select>
      <select class="sc-select" v-model="filterStar">
        <option :value="0">{{ t('tools.allStars') || '全部星级' }}</option>
        <option :value="3">★★★</option>
        <option :value="2">★★</option>
        <option :value="1">★</option>
      </select>
    </div>
    <div class="sc-grid">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="sc-card"
        :class="{ owned: owned.has(s.id) }"
        @click="toggleOwned(s.id)"
      >
        <img
          class="sc-portrait"
          :src="s.portrait"
          :alt="getStudentName(s)"
          loading="lazy"
        />
        <div class="sc-name">{{ getStudentName(s) }}</div>
        <div class="sc-stars" :class="'star-' + s.star">{{ '★'.repeat(s.star) }}</div>
        <div class="sc-school" :style="{ color: getSchoolColor(s.school) }">{{ t('schoolNames.' + s.school) || s.school }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sc-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.sc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sc-icon { font-size: 1.1rem; }
.sc-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); flex: 1; }
.sc-progress { font-size: 0.68rem; color: var(--text-secondary); font-family: 'SF Mono', 'Consolas', monospace; }

.sc-progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  margin-bottom: 12px;
  overflow: hidden;
}

.sc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-1), var(--accent-3));
  border-radius: 2px;
  transition: width 0.3s ease;
}

.sc-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.sc-search {
  flex: 1;
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-size: 0.72rem;
  outline: none;
  font-family: inherit;
}

.sc-search:focus {
  border-color: var(--accent-1);
}

.sc-select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-size: 0.68rem;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.sc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.sc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.2s;
  opacity: 0.5;
}

.sc-card.owned {
  opacity: 1;
  background: rgba(45, 175, 255, 0.06);
  border-color: rgba(45, 175, 255, 0.15);
}

.sc-card:hover {
  transform: translateY(-2px);
  border-color: rgba(45, 175, 255, 0.25);
}

.sc-portrait {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  object-fit: cover;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.sc-name {
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 72px;
  line-height: 1.3;
}

.sc-stars {
  font-size: 0.55rem;
  letter-spacing: 1px;
}

.sc-stars.star-3 { color: #f5c842; }
.sc-stars.star-2 { color: #74b9ff; }
.sc-stars.star-1 { color: var(--text-secondary); opacity: 0.5; }

.sc-school {
  font-size: 0.5rem;
  opacity: 0.7;
}

.sc-grid::-webkit-scrollbar { width: 3px; }
.sc-grid::-webkit-scrollbar-track { background: transparent; }
.sc-grid::-webkit-scrollbar-thumb { background: rgba(45, 175, 255, 0.15); border-radius: 2px; }

@media (max-width: 600px) {
  .sc-grid { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 5px; }
  .sc-portrait { width: 40px; height: 40px; }
  .sc-name { font-size: 0.55rem; max-width: 58px; }
}
</style>
