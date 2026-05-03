<script setup>
import { inject } from 'vue'

const settings = inject('settings')
const updateSetting = inject('updateSetting')
const resetSettings = inject('resetSettings')
const showSettings = inject('showSettings')
const closeSettings = inject('closeSettings')
const t = inject('t')
const locale = inject('locale')
const setLocale = inject('setLocale')
const currentTheme = inject('currentTheme')
const setTheme = inject('setTheme')
const getThemes = inject('getThemes')

const colorPresets = [
  { labelKey: 0, value: '45,175,255' },
  { labelKey: 1, value: '255,158,205' },
  { labelKey: 2, value: '245,200,66' },
  { labelKey: 3, value: '52,211,153' },
  { labelKey: 4, value: '167,139,250' },
  { labelKey: 5, value: '251,146,60' },
]

</script>

<template>
  <Transition name="panel">
    <div v-if="showSettings" class="settings-overlay" @click.self="closeSettings()">
      <div class="settings-panel glass">
        <div class="settings-header">
          <h2 class="settings-title">⚙️ {{ t('settings.title') }}</h2>
          <button class="close-btn" @click="closeSettings()">✕</button>
        </div>

        <div class="settings-body">
          <!-- 语言切换 -->
          <div class="setting-group">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.language') }}</span>
              </div>
              <div class="lang-btns">
                <button class="lang-btn" :class="{ active: locale === 'zh' }" @click="setLocale('zh')">中</button>
                <button class="lang-btn" :class="{ active: locale === 'ja' }" @click="setLocale('ja')">日</button>
              </div>
            </div>

            <!-- 主题切换 -->
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.theme') }}</span>
              </div>
              <div class="theme-dots">
                <button
                  v-for="th in getThemes()"
                  :key="th.key"
                  class="theme-dot"
                  :class="{ active: currentTheme === th.key }"
                  :style="{ background: th.color }"
                  :title="th.label"
                  @click="setTheme(th.key)"
                ></button>
              </div>
            </div>
          </div>

          <!-- 拖尾特效 -->
          <div class="setting-group">
            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.trail') }}</span>
                <span class="setting-desc">{{ t('settings.trailDesc') }}</span>
              </div>
              <button class="toggle" :class="{ on: settings.trailEnabled }" @click="updateSetting('trailEnabled', !settings.trailEnabled)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.clickEffect') }}</span>
                <span class="setting-desc">{{ t('settings.clickEffectDesc') }}</span>
              </div>
              <button class="toggle" :class="{ on: settings.clickEffectEnabled }" @click="updateSetting('clickEffectEnabled', !settings.clickEffectEnabled)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.trailColor') }}</span>
              </div>
              <div class="color-presets">
                <button
                  v-for="c in colorPresets"
                  :key="c.value"
                  class="color-dot"
                  :style="{ background: `rgb(${c.value})` }"
                  :class="{ active: settings.trailColor === c.value }"
                  :title="t('colorPresets.' + c.labelKey)"
                  @click="updateSetting('trailColor', c.value)"
                ></button>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.trailSize') }}</span>
              </div>
              <div class="slider-row">
                <input type="range" class="slider" min="0.5" max="3" step="0.1" :value="settings.trailScale" @input="updateSetting('trailScale', parseFloat($event.target.value))" />
                <span class="slider-val">{{ settings.trailScale.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- 界面设置 -->
          <div class="setting-group">
            <div class="group-title">{{ t('settings.interface') }}</div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.cardGlow') }}</span>
                <span class="setting-desc">{{ t('settings.cardGlowDesc') }}</span>
              </div>
              <button class="toggle" :class="{ on: settings.cardGlow }" @click="updateSetting('cardGlow', !settings.cardGlow)">
                <span class="toggle-knob"></span>
              </button>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <span class="setting-label">{{ t('settings.sidebarOpacity') }}</span>
              </div>
              <div class="slider-row">
                <input type="range" class="slider" min="0.3" max="1" step="0.05" :value="settings.sidebarOpacity" @input="updateSetting('sidebarOpacity', parseFloat($event.target.value))" />
                <span class="slider-val">{{ Math.round(settings.sidebarOpacity * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- 恢复默认 -->
          <div class="setting-group">
            <button class="btn btn-ghost reset-btn" @click="resetSettings">
              {{ t('settings.reset') }}
            </button>
          </div>

          <!-- 数据说明 -->
          <div class="setting-group data-notice" style="border-bottom:none;">
            <div class="data-notice-icon">ℹ️</div>
            <div class="data-notice-text">
              <strong>{{ t('settings.dataNotice') }}</strong>
              <p>{{ t('settings.dataNoticeText') }}</p>
            </div>
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

/* Language buttons */
.lang-btns {
  display: flex;
  gap: 4px;
}

.lang-btn {
  width: 32px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(45, 175, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.lang-btn:hover {
  background: rgba(45, 175, 255, 0.12);
  border-color: rgba(45, 175, 255, 0.3);
}

.lang-btn.active {
  background: linear-gradient(135deg, #2dafff, #4dc9f6);
  border-color: transparent;
  color: #fff;
}

/* Theme dots */
.theme-dots {
  display: flex;
  gap: 8px;
}

.theme-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-dot:hover {
  transform: scale(1.2);
}

.theme-dot.active {
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

/* Data notice */
.data-notice {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 16px;
  background: rgba(45, 175, 255, 0.04);
  border-radius: 10px;
  margin: 4px 0;
}

.data-notice-icon {
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.data-notice-text {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.data-notice-text strong {
  display: block;
  font-size: 0.78rem;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.data-notice-text p {
  margin: 0;
  opacity: 0.8;
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
