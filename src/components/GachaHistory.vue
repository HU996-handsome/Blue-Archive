<script setup>
import { ref } from 'vue'

const STORAGE_KEY = 'ba-gacha-history'
const history = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
const expanded = ref(false)

const schoolColors = {
  Gehenna: '#ff6b6b', Trinity: '#74b9ff', Millennium: '#a29bfe',
  Abydos: '#ffeaa7', Shanhaijing: '#55efc4', Hyakkiyako: '#fd79a8',
  RedWinter: '#dfe6e9', SRT: '#00cec9', Arius: '#636e72',
  Valkyrie: '#e17055',
}

function addEntry(results) {
  const entry = {
    time: Date.now(),
    students: results.map(s => ({ name: s.name, star: s.star, school: s.school })),
  }
  history.value.unshift(entry)
  if (history.value.length > 50) history.value.pop()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
}

function clearHistory() {
  history.value = []
  localStorage.removeItem(STORAGE_KEY)
}

function getStars(n) { return '★'.repeat(n) }

function formatTime(ts) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getStarCount(students, star) {
  return students.filter(s => s.star === star).length
}

defineExpose({ addEntry })
</script>

<template>
  <div class="gh-section glass-card" v-if="history.length">
    <div class="gh-header" @click="expanded = !expanded">
      <span class="gh-icon">📜</span>
      <span class="gh-title">抽卡记录</span>
      <span class="gh-count">{{ history.length }}次</span>
      <span class="gh-expand">{{ expanded ? '▲' : '▼' }}</span>
    </div>
    <Transition name="gh-expand">
      <div v-if="expanded" class="gh-body">
        <div class="gh-stats">
          <span class="gh-stat">共 {{ history.length * 10 }} 抽</span>
          <span class="gh-stat star3">3★: {{ history.reduce((s, h) => s + getStarCount(h.students, 3), 0) }}</span>
          <span class="gh-stat star2">2★: {{ history.reduce((s, h) => s + getStarCount(h.students, 2), 0) }}</span>
          <button class="gh-clear" @click.stop="clearHistory">清空</button>
        </div>
        <div class="gh-list">
          <div v-for="(entry, i) in history.slice(0, 20)" :key="i" class="gh-entry">
            <span class="gh-time">{{ formatTime(entry.time) }}</span>
            <div class="gh-cards">
              <span
                v-for="(s, j) in entry.students"
                :key="j"
                class="gh-card"
                :class="'star-' + s.star"
                :title="s.name + ' (' + s.school + ')'"
              >{{ s.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.gh-section {
  padding: 14px 18px;
  margin-bottom: 20px;
}

.gh-header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.gh-icon { font-size: 1.1rem; }
.gh-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); flex: 1; }
.gh-count { font-size: 0.65rem; color: var(--text-secondary); }
.gh-expand { font-size: 0.6rem; color: var(--text-secondary); }

.gh-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.gh-stat {
  font-size: 0.68rem;
  color: var(--text-secondary);
}

.gh-stat.star3 { color: #f5c842; }
.gh-stat.star2 { color: #74b9ff; }

.gh-clear {
  margin-left: auto;
  font-size: 0.62rem;
  color: var(--text-secondary);
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.gh-clear:hover {
  border-color: rgba(255, 80, 80, 0.3);
  color: #ff6b6b;
}

.gh-list {
  max-height: 240px;
  overflow-y: auto;
}

.gh-entry {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.gh-time {
  font-size: 0.6rem;
  color: var(--text-secondary);
  opacity: 0.5;
  min-width: 48px;
  padding-top: 2px;
  flex-shrink: 0;
  font-family: 'SF Mono', 'Consolas', monospace;
}

.gh-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.gh-card {
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  white-space: nowrap;
}

.gh-card.star-3 {
  color: #f5c842;
  background: rgba(245, 200, 66, 0.08);
  border-color: rgba(245, 200, 66, 0.2);
}

.gh-card.star-2 {
  color: #74b9ff;
  background: rgba(116, 185, 255, 0.06);
  border-color: rgba(116, 185, 255, 0.12);
}

.gh-card.star-1 {
  color: var(--text-secondary);
  opacity: 0.6;
}

.gh-expand-enter-active { transition: all 0.25s ease; }
.gh-expand-leave-active { transition: all 0.2s ease; }
.gh-expand-enter-from { opacity: 0; max-height: 0; }
.gh-expand-leave-to { opacity: 0; max-height: 0; }

.gh-list::-webkit-scrollbar { width: 3px; }
.gh-list::-webkit-scrollbar-track { background: transparent; }
.gh-list::-webkit-scrollbar-thumb { background: rgba(45, 175, 255, 0.15); border-radius: 2px; }

@media (max-width: 600px) {
  .gh-section { padding: 12px 14px; }
  .gh-title { font-size: 0.82rem; }
  .gh-stats { gap: 6px; }
  .gh-time { min-width: 40px; font-size: 0.55rem; }
  .gh-card { font-size: 0.52rem; padding: 1px 4px; }
  .gh-list { max-height: 180px; }
}
</style>
