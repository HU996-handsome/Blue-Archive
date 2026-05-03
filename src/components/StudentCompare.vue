<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const locale = inject('locale')
const { getSchoolColor } = useSchoolColors()

const students = ref([])
const selectedA = ref(null)
const selectedB = ref(null)
const searchA = ref('')
const searchB = ref('')
const showDropdownA = ref(false)
const showDropdownB = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/assets/students.json')
    students.value = await res.json()
  } catch (e) {
    console.error('Failed to load students:', e)
  }
})

function getName(s) {
  if (!s) return ''
  return locale.value === 'ja' ? s.nameJa || s.nameZh : s.nameZh
}

function filterStudents(query) {
  if (!query.trim()) return students.value.slice(0, 20)
  const q = query.trim().toLowerCase()
  return students.value.filter(s =>
    s.nameZh.toLowerCase().includes(q) ||
    s.nameJa.toLowerCase().includes(q) ||
    s.nameEn.toLowerCase().includes(q)
  ).slice(0, 20)
}

function selectStudent(slot, s) {
  if (slot === 'A') {
    selectedA.value = s
    searchA.value = getName(s)
    showDropdownA.value = false
  } else {
    selectedB.value = s
    searchB.value = getName(s)
    showDropdownB.value = false
  }
}

const roleMap = {
  DamageDealer: { zh: '输出', ja: 'アタッカー' },
  Tanker: { zh: '坦克', ja: 'タンク' },
  Supporter: { zh: '辅助', ja: 'サポーター' },
  Healer: { zh: '治疗', ja: 'ヒーラー' },
}

const positionMap = {
  Front: { zh: '前排', ja: '前衛' },
  Middle: { zh: '中排', ja: '中衛' },
  Back: { zh: '后排', ja: '後衛' },
}

const attackMap = {
  Explosion: { zh: '爆发', ja: '爆発' },
  Pierce: { zh: '贯穿', ja: '貫通' },
  Mystic: { zh: '神秘', ja: '神秘' },
  Normal: { zh: '通常', ja: '通常' },
}

const defenseMap = {
  LightArmor: { zh: '轻甲', ja: '軽装甲' },
  HeavyArmor: { zh: '重甲', ja: '重装甲' },
  Unarmed: { zh: '特殊', ja: '特殊装甲' },
}

function getLocalized(map, key) {
  const entry = map[key]
  if (!entry) return key
  return locale.value === 'ja' ? entry.ja : entry.zh
}

const stats = [
  { key: 'role', label: { zh: '角色', ja: 'ロール' }, map: roleMap },
  { key: 'position', label: { zh: '站位', ja: 'ポジション' }, map: positionMap },
  { key: 'attackType', label: { zh: '攻击', ja: '攻撃タイプ' }, map: attackMap },
  { key: 'defenseType', label: { zh: '防御', ja: '防御タイプ' }, map: defenseMap },
  { key: 'weapon', label: { zh: '武器', ja: '武器' }, map: null },
]
</script>

<template>
  <div class="cmp-section glass-card">
    <div class="cmp-header">
      <span class="cmp-icon">⚖️</span>
      <span class="cmp-title">{{ t('tools.studentCompare') || '学生对比' }}</span>
    </div>
    <div class="cmp-selectors">
      <div class="cmp-selector">
        <input
          class="cmp-input"
          v-model="searchA"
          :placeholder="t('tools.selectStudent') || '选择学生A'"
          @focus="showDropdownA = true"
          @blur="setTimeout(() => showDropdownA = false, 200)"
        />
        <div v-if="showDropdownA" class="cmp-dropdown">
          <div
            v-for="s in filterStudents(searchA)"
            :key="s.id"
            class="cmp-option"
            @mousedown.prevent="selectStudent('A', s)"
          >{{ getName(s) }}</div>
        </div>
      </div>
      <span class="cmp-vs">VS</span>
      <div class="cmp-selector">
        <input
          class="cmp-input"
          v-model="searchB"
          :placeholder="t('tools.selectStudent') || '选择学生B'"
          @focus="showDropdownB = true"
          @blur="setTimeout(() => showDropdownB = false, 200)"
        />
        <div v-if="showDropdownB" class="cmp-dropdown">
          <div
            v-for="s in filterStudents(searchB)"
            :key="s.id"
            class="cmp-option"
            @mousedown.prevent="selectStudent('B', s)"
          >{{ getName(s) }}</div>
        </div>
      </div>
    </div>
    <div v-if="selectedA && selectedB" class="cmp-body">
      <div class="cmp-portraits">
        <div class="cmp-portrait-wrap">
          <img :src="selectedA.portrait" class="cmp-portrait" />
          <div class="cmp-name" :style="{ color: getSchoolColor(selectedA.school) }">{{ getName(selectedA) }}</div>
          <div class="cmp-stars">{{ '★'.repeat(selectedA.star) }}</div>
        </div>
        <div class="cmp-portrait-wrap">
          <img :src="selectedB.portrait" class="cmp-portrait" />
          <div class="cmp-name" :style="{ color: getSchoolColor(selectedB.school) }">{{ getName(selectedB) }}</div>
          <div class="cmp-stars">{{ '★'.repeat(selectedB.star) }}</div>
        </div>
      </div>
      <div v-for="s in stats" :key="s.key" class="cmp-stat-row">
        <span class="cmp-stat-val">{{ s.map ? getLocalized(s.map, selectedA[s.key]) : selectedA[s.key] }}</span>
        <span class="cmp-stat-label">{{ locale === 'ja' ? s.label.ja : s.label.zh }}</span>
        <span class="cmp-stat-val">{{ s.map ? getLocalized(s.map, selectedB[s.key]) : selectedB[s.key] }}</span>
      </div>
      <div class="cmp-stat-row">
        <span class="cmp-stat-val" :style="{ color: getSchoolColor(selectedA.school) }">{{ t('schoolNames.' + selectedA.school) || selectedA.school }}</span>
        <span class="cmp-stat-label">{{ t('schoolNames._label') || '学校' }}</span>
        <span class="cmp-stat-val" :style="{ color: getSchoolColor(selectedB.school) }">{{ t('schoolNames.' + selectedB.school) || selectedB.school }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cmp-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.cmp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.cmp-icon { font-size: 1.1rem; }
.cmp-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }

.cmp-selectors {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.cmp-selector {
  flex: 1;
  position: relative;
}

.cmp-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-size: 0.75rem;
  outline: none;
  font-family: inherit;
}

.cmp-input:focus {
  border-color: var(--accent-1);
}

.cmp-vs {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-3);
  flex-shrink: 0;
}

.cmp-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(11, 26, 46, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 2px;
}

.cmp-option {
  padding: 6px 10px;
  font-size: 0.72rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.cmp-option:hover {
  background: rgba(255, 255, 255, 0.06);
}

.cmp-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cmp-portraits {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.cmp-portrait-wrap {
  text-align: center;
}

.cmp-portrait {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.05);
}

.cmp-name {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 4px;
}

.cmp-stars {
  font-size: 0.6rem;
  color: #f5c842;
  letter-spacing: 1px;
}

.cmp-stat-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.cmp-stat-val {
  flex: 1;
  font-size: 0.72rem;
  color: var(--text-primary);
  text-align: center;
}

.cmp-stat-label {
  font-size: 0.62rem;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: center;
}
</style>
