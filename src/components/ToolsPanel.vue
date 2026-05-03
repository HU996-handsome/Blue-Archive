<script setup>
import { inject, ref } from 'vue'
import DailyQuote from './DailyQuote.vue'
import StudentRandom from './StudentRandom.vue'
import EventCountdown from './EventCountdown.vue'
import BirthdayCalendar from './BirthdayCalendar.vue'
import GachaSimulator from './GachaSimulator.vue'
import GachaHistory from './GachaHistory.vue'
import StudentCollection from './StudentCollection.vue'
import VoiceLibrary from './VoiceLibrary.vue'
import GiftGuide from './GiftGuide.vue'
import StudentCompare from './StudentCompare.vue'
import MaterialPlanner from './MaterialPlanner.vue'
import TeamBuilder from './TeamBuilder.vue'

const showTools = inject('showTools')
const closeTools = inject('closeTools')
const t = inject('t')

const gachaHistoryRef = ref(null)

function onGachaPull(results) {
  gachaHistoryRef.value?.addEntry(results)
}
</script>

<template>
  <Transition name="tools-panel">
    <div v-if="showTools" class="tools-overlay" @click.self="closeTools()">
      <div class="tools-panel glass">
        <div class="tools-header">
          <h2 class="tools-title">🧰 {{ t('tools.title') }}</h2>
          <button class="close-btn" @click="closeTools()">✕</button>
        </div>
        <div class="tools-body">
          <DailyQuote />
          <div class="tools-row">
            <StudentRandom class="tools-item" />
            <EventCountdown class="tools-item" />
          </div>
          <BirthdayCalendar />
          <GachaSimulator @pull="onGachaPull" />
          <GachaHistory ref="gachaHistoryRef" />
          <StudentCollection />
          <VoiceLibrary />
          <div class="tools-row">
            <GiftGuide class="tools-item" />
            <StudentCompare class="tools-item" />
          </div>
          <MaterialPlanner />
          <TeamBuilder />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tools-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 500;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 16px;
  overflow-y: auto;
}

.tools-panel {
  width: 520px;
  max-width: 100%;
  max-height: none;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(11, 26, 46, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(45, 175, 255, 0.15);
}

.tools-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.tools-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.tools-body {
  padding: 16px 20px 24px;
  overflow-y: visible;
}

.tools-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 0;
}

@media (max-width: 600px) {
  .tools-overlay {
    padding: 16px 8px;
    align-items: flex-start;
  }
  .tools-panel {
    border-radius: 16px;
  }
  .tools-row {
    grid-template-columns: 1fr;
  }
  .tools-body {
    padding: 12px 14px 20px;
  }
}

/* Panel transitions */
.tools-panel-enter-active {
  transition: opacity 0.25s ease;
}
.tools-panel-leave-active {
  transition: opacity 0.2s ease;
}
.tools-panel-enter-from,
.tools-panel-leave-to {
  opacity: 0;
}
.tools-panel-enter-active .tools-panel {
  animation: toolsSlideIn 0.3s ease;
}
.tools-panel-leave-active .tools-panel {
  animation: toolsSlideOut 0.2s ease;
}

@keyframes toolsSlideIn {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toolsSlideOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(20px) scale(0.96); }
}
</style>
