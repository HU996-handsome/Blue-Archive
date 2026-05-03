<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useSchoolColors } from '../composables/useSchoolColors.js'

const t = inject('t')
const locale = inject('locale')
const { getSchoolColor } = useSchoolColors()

const teamsData = ref(null)
const students = ref([])
const activeTag = ref('')
const collection = ref(new Set())

onMounted(async () => {
  try {
    const [teamsRes, studentsRes] = await Promise.all([
      fetch('/assets/teams.json'),
      fetch('/assets/students.json'),
    ])
    teamsData.value = await teamsRes.json()
    students.value = await studentsRes.json()
    const saved = JSON.parse(localStorage.getItem('ba-collection') || '[]')
    collection.value = new Set(saved)
  } catch (e) {
    console.error('Failed to load:', e)
  }
})

function getName(s) {
  return locale.value === 'ja' ? s.nameJa || s.nameZh : s.nameZh
}

const lang = computed(() => locale.value === 'ja' ? 'ja' : 'zh')

const tags = computed(() => {
  if (!teamsData.value) return []
  const tagMap = teamsData.value.tags[lang.value] || teamsData.value.tags.zh
  return Object.entries(tagMap).map(([key, label]) => ({ key, label }))
})

const filteredTeams = computed(() => {
  if (!teamsData.value) return []
  let list = teamsData.value.teams
  if (activeTag.value) list = list.filter(team => team.tags.includes(activeTag.value))
  return list.map(team => ({
    ...team,
    name: team.name[lang.value] || team.name.zh,
    desc: team.desc[lang.value] || team.desc.zh,
    members: team.students.map(name => {
      const s = students.value.find(st => st.nameZh === name)
      return s ? {
        ...s,
        displayName: getName(s),
        owned: collection.value.has(s.id),
      } : { nameZh: name, displayName: name, owned: false, portrait: '', school: '', star: 0 }
    }),
    ownedCount: team.students.filter(name => {
      const s = students.value.find(st => st.nameZh === name)
      return s && collection.value.has(s.id)
    }).length,
  }))
})
</script>

<template>
  <div class="tb-section glass-card">
    <div class="tb-header">
      <span class="tb-icon">👥</span>
      <span class="tb-title">{{ t('tools.teamBuilder') || '队伍推荐' }}</span>
    </div>
    <div class="tb-tags">
      <button
        class="tb-tag"
        :class="{ active: activeTag === '' }"
        @click="activeTag = ''"
      >{{ t('tools.all') || '全部' }}</button>
      <button
        v-for="tag in tags"
        :key="tag.key"
        class="tb-tag"
        :class="{ active: activeTag === tag.key }"
        @click="activeTag = tag.key"
      >{{ tag.label }}</button>
    </div>
    <div class="tb-list">
      <div v-for="team in filteredTeams" :key="team.id" class="tb-team">
        <div class="tb-team-header">
          <span class="tb-team-name">{{ team.name }}</span>
          <span class="tb-team-owned">{{ team.ownedCount }}/{{ team.members.length }}</span>
        </div>
        <div class="tb-team-desc">{{ team.desc }}</div>
        <div class="tb-members">
          <div v-for="(m, i) in team.members" :key="i" class="tb-member" :class="{ owned: m.owned }">
            <img v-if="m.portrait" :src="m.portrait" class="tb-portrait" loading="lazy" />
            <div v-else class="tb-portrait tb-placeholder">{{ m.displayName.charAt(0) }}</div>
            <div class="tb-mem-name">{{ m.displayName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tb-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.tb-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tb-icon { font-size: 1.1rem; }
.tb-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }

.tb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 14px;
}

.tb-tag {
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: 0.65rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.tb-tag.active {
  background: rgba(45, 175, 255, 0.12);
  border-color: rgba(45, 175, 255, 0.3);
  color: var(--accent-1);
}

.tb-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
}

.tb-team {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.tb-team-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.tb-team-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tb-team-owned {
  font-size: 0.6rem;
  color: var(--accent-1);
  font-family: 'SF Mono', 'Consolas', monospace;
}

.tb-team-desc {
  font-size: 0.62rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.tb-members {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tb-member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  opacity: 0.4;
}

.tb-member.owned { opacity: 1; }

.tb-portrait {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.05);
}

.tb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tb-mem-name {
  font-size: 0.5rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.tb-list::-webkit-scrollbar { width: 3px; }
.tb-list::-webkit-scrollbar-track { background: transparent; }
.tb-list::-webkit-scrollbar-thumb { background: rgba(45, 175, 255, 0.15); border-radius: 2px; }
</style>
