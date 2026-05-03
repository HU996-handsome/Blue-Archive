<script setup>
import { inject } from 'vue'

const t = inject('t')
const show = defineModel({ type: Boolean, default: false })

const shortcuts = [
  { key: 'S', action: 'search' },
  { key: 'T', action: 'tools' },
  { key: 'Esc', action: 'close' },
  { key: '?', action: 'help' },
]
</script>

<template>
  <Transition name="shortcut-fade">
    <div v-if="show" class="shortcut-overlay" @click.self="show = false">
      <div class="shortcut-panel glass">
        <div class="shortcut-header">
          <span>⌨️</span>
          <span class="shortcut-title">{{ t('tools.shortcuts') || '快捷键' }}</span>
          <button class="close-btn" @click="show = false">✕</button>
        </div>
        <div class="shortcut-body">
          <div v-for="s in shortcuts" :key="s.key" class="shortcut-row">
            <kbd class="shortcut-key">{{ s.key }}</kbd>
            <span class="shortcut-desc">{{ t('tools.shortcut_' + s.action) || s.action }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.shortcut-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcut-panel {
  width: 320px;
  max-width: 90vw;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(11, 26, 46, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(45, 175, 255, 0.15);
}

.shortcut-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.shortcut-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
}

.shortcut-body {
  padding: 12px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shortcut-key {
  min-width: 36px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: 'SF Mono', 'Consolas', monospace;
  font-size: 0.72rem;
  color: var(--text-primary);
  text-align: center;
}

.shortcut-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.shortcut-fade-enter-active { transition: opacity 0.2s ease; }
.shortcut-fade-leave-active { transition: opacity 0.15s ease; }
.shortcut-fade-enter-from,
.shortcut-fade-leave-to { opacity: 0; }
</style>
