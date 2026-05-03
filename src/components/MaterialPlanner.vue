<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const t = inject('t')
const locale = inject('locale')

const materialsData = ref(null)
const targetLevel = ref(80)
const targetSkill = ref(4)
const targetGear = ref(4)
const result = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/assets/materials.json')
    materialsData.value = await res.json()
  } catch (e) {
    console.error('Failed to load materials:', e)
  }
})

function getMatName(mat) {
  if (!mat) return ''
  return locale.value === 'ja' ? mat.name.ja : mat.name.zh
}

function calculate() {
  if (!materialsData.value) return
  const costs = materialsData.value.upgradeCosts
  const needed = {}

  // Level costs
  for (const lc of costs.level) {
    if (lc.to <= targetLevel.value) {
      needed['exp_report_3'] = (needed['exp_report_3'] || 0) + Math.ceil(lc.exp / 5000)
      needed['credit_3'] = (needed['credit_3'] || 0) + Math.ceil(lc.credits / 100000)
    }
  }

  // Skill costs (per skill)
  for (const sc of costs.skill) {
    if (sc.to <= targetSkill.value) {
      for (const [mat, count] of Object.entries(sc.books)) {
        needed[mat] = (needed[mat] || 0) + count
      }
      needed['credit_2'] = (needed['credit_2'] || 0) + Math.ceil(sc.credits / 10000)
    }
  }

  // Gear costs (per slot)
  for (const gc of costs.gear) {
    if (gc.to <= targetGear.value) {
      for (const [mat, count] of Object.entries(gc.parts)) {
        needed[mat] = (needed[mat] || 0) + count
      }
      needed['credit_2'] = (needed['credit_2'] || 0) + Math.ceil(gc.credits / 10000)
    }
  }

  result.value = Object.entries(needed).map(([id, count]) => {
    const mat = materialsData.value.materials.find(m => m.id === id)
    return { id, name: getMatName(mat), icon: mat?.icon || '📦', count, rarity: mat?.rarity || 1 }
  }).sort((a, b) => b.rarity - a.rarity)
}
</script>

<template>
  <div class="mp-section glass-card">
    <div class="mp-header">
      <span class="mp-icon">📋</span>
      <span class="mp-title">{{ t('tools.materialPlanner') || '素材规划' }}</span>
    </div>
    <div class="mp-controls">
      <div class="mp-control">
        <label class="mp-label">{{ t('tools.targetLevel') || '目标等级' }}</label>
        <select class="mp-select" v-model.number="targetLevel">
          <option :value="30">30</option>
          <option :value="50">50</option>
          <option :value="70">70</option>
          <option :value="80">80</option>
          <option :value="90">90</option>
        </select>
      </div>
      <div class="mp-control">
        <label class="mp-label">{{ t('tools.targetSkill') || '目标技能' }}</label>
        <select class="mp-select" v-model.number="targetSkill">
          <option :value="2">Lv.2</option>
          <option :value="3">Lv.3</option>
          <option :value="4">Lv.4</option>
          <option :value="5">Lv.5</option>
        </select>
      </div>
      <div class="mp-control">
        <label class="mp-label">{{ t('tools.targetGear') || '目标装备' }}</label>
        <select class="mp-select" v-model.number="targetGear">
          <option :value="2">T2</option>
          <option :value="3">T3</option>
          <option :value="4">T4</option>
          <option :value="5">T5</option>
        </select>
      </div>
      <button class="btn mp-calc-btn" @click="calculate">{{ t('tools.calculate') || '计算' }}</button>
    </div>
    <Transition name="mp-pop">
      <div v-if="result" class="mp-result">
        <div class="mp-result-title">{{ t('tools.requiredMaterials') || '所需素材（单角色）' }}</div>
        <div class="mp-grid">
          <div v-for="m in result" :key="m.id" class="mp-mat" :class="'rarity-' + m.rarity">
            <span class="mp-mat-icon">{{ m.icon }}</span>
            <span class="mp-mat-name">{{ m.name }}</span>
            <span class="mp-mat-count">x{{ m.count }}</span>
          </div>
        </div>
        <div class="mp-note">{{ t('tools.materialNote') || '* 技能和装备按 3 个槽位计算' }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.mp-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.mp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.mp-icon { font-size: 1.1rem; }
.mp-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }

.mp-controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.mp-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mp-label {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.mp-select {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  font-size: 0.72rem;
  outline: none;
  font-family: inherit;
  cursor: pointer;
}

.mp-calc-btn {
  font-size: 0.72rem !important;
  padding: 6px 16px !important;
}

.mp-result-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.mp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 6px;
}

.mp-mat {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.mp-mat.rarity-4 { border-color: rgba(245, 200, 66, 0.3); background: rgba(245, 200, 66, 0.05); }
.mp-mat.rarity-3 { border-color: rgba(167, 139, 250, 0.2); }

.mp-mat-icon { font-size: 0.85rem; }
.mp-mat-name { font-size: 0.62rem; color: var(--text-primary); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-mat-count { font-size: 0.62rem; color: var(--accent-1); font-family: 'SF Mono', 'Consolas', monospace; }

.mp-note {
  font-size: 0.6rem;
  color: var(--text-secondary);
  margin-top: 10px;
  opacity: 0.6;
}

.mp-pop-enter-active { transition: all 0.25s ease; }
.mp-pop-leave-active { transition: all 0.2s ease; }
.mp-pop-enter-from { opacity: 0; transform: translateY(8px); }
.mp-pop-leave-to { opacity: 0; }
</style>
