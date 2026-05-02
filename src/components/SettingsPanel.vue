<script setup>
import { inject } from 'vue'

const settings = inject('settings')
const updateSetting = inject('updateSetting')
const resetSettings = inject('resetSettings')
const showSettings = inject('showSettings')
const closeSettings = inject('closeSettings')

const colorPresets = [
  { label: '蔚蓝', value: '45,175,255' },
  { label: '粉樱', value: '255,158,205' },
  { label: '金黄', value: '245,200,66' },
  { label: '翠绿', value: '52,211,153' },
  { label: '紫罗兰', value: '167,139,250' },
  { label: '烈焰', value: '251,146,60' },
]

</script>

<template>
  <Transition name="panel">
    <div v-if="showSettings" class="settings-overlay" @click.self="closeSettings()">
      <div class="settings-panel glass">
        <div class="settings-header">
          <h2 class="settings-title">⚙️ 设置</h2>
          <button class="close-btn" @click="closeSettings()">✕</button>
        </div>

        <div class="settings-body">
          <!-- 拖尾特效 -->
          <div class="setting-group">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">鼠标拖尾</span>
                <span class="setting-desc">鼠标移动时产生粒子拖尾</span>
              </div>
              <button class="toggle" :class="{ on: settings.trailEnabled }" @click="updateSetting('trailEnabled', !settings.trailEnabled)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">点击特效</span>
                <span class="setting-desc">点击时产生光环与火花</span>
              </div>
              <button class="toggle" :class="{ on: settings.clickEffectEnabled }" @click="updateSetting('clickEffectEnabled', !settings.clickEffectEnabled)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">拖尾颜色</span>
              </div>
              <div class="color-presets">
                <button
                  v-for="c in colorPresets"
                  :key="c.value"
                  class="color-dot"
                  :style="{ background: `rgb(${c.value})` }"
                  :class="{ active: settings.trailColor === c.value }"
                  :title="c.label"
                  @click="updateSetting('trailColor', c.value)"
                ></button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">拖尾大小</span>
              </div>
              <div class="slider-row">
                <input type="range" class="slider" min="0.5" max="3" step="0.1" :value="settings.trailScale" @input="updateSetting('trailScale', parseFloat($event.target.value))" />
                <span class="slider-val">{{ settings.trailScale.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- 界面设置 -->
          <div class="setting-group">
            <div class="group-title">界面</div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">卡片光晕</span>
                <span class="setting-desc">悬停卡片时的蓝色光晕</span>
              </div>
              <button class="toggle" :class="{ on: settings.cardGlow }" @click="updateSetting('cardGlow', !settings.cardGlow)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">侧栏透明度</span>
              </div>
              <div class="slider-row">
                <input type="range" class="slider" min="0.3" max="1" step="0.05" :value="settings.sidebarOpacity" @input="updateSetting('sidebarOpacity', parseFloat($event.target.value))" />
                <span class="slider-val">{{ Math.round(settings.sidebarOpacity * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- 恢复默认 -->
          <div class="setting-group" style="border-bottom:none;">
            <button class="btn btn-ghost reset-btn" @click="resetSettings">
              恢复默认设置
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-panel {
  width: 420px;
  max-width: 92vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(11, 26, 46, 0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(45, 175, 255, 0.15);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.settings-title {
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

.settings-body {
  overflow-y: auto;
  padding: 8px 0;
}

.setting-group {
  padding: 8px 24px 12px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.06);
}

.group-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  font-weight: 600;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-desc {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

/* Toggle */
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.25s;
  flex-shrink: 0;
}

.toggle.on {
  background: linear-gradient(135deg, #2dafff, #4dc9f6);
}

.toggle-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.25s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.toggle.on .toggle-knob {
  transform: translateX(20px);
}

/* Color dots */
.color-presets {
  display: flex;
  gap: 8px;
}

.color-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-dot:hover {
  transform: scale(1.2);
}

.color-dot.active {
  border-color: #fff;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

/* Slider */
.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #2dafff;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(45, 175, 255, 0.4);
}

.slider-val {
  font-size: 0.78rem;
  color: var(--text-secondary);
  min-width: 32px;
  text-align: right;
  font-family: 'SF Mono', 'Consolas', monospace;
}

/* Reset button */
.reset-btn {
  width: 100%;
  justify-content: center;
  margin-top: 4px;
}

/* Panel transition */
.panel-enter-active {
  transition: opacity 0.25s ease;
}
.panel-leave-active {
  transition: opacity 0.2s ease;
}
.panel-enter-from,
.panel-leave-to {
  opacity: 0;
}
.panel-enter-active .settings-panel {
  animation: slideIn 0.3s ease;
}
.panel-leave-active .settings-panel {
  animation: slideOut 0.2s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(20px); }
}
</style>
