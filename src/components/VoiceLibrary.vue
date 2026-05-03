<script setup>
import { ref, computed, onMounted, inject } from 'vue'

const t = inject('t')
const locale = inject('locale')

const voices = ref({})
const activeChar = ref('arona')
const playingId = ref(null)
let audioCtx = null
let currentSource = null

onMounted(async () => {
  try {
    const res = await fetch('/assets/voices.json')
    voices.value = await res.json()
  } catch (e) {
    console.error('Failed to load voices:', e)
  }
})

const lang = computed(() => locale.value === 'ja' ? 'jp' : 'zh')

const currentVoices = computed(() => {
  const char = voices.value[activeChar.value]
  if (!char) return []
  return char[lang.value] || char.zh || []
})

async function playVoice(v) {
  if (playingId.value === v.id) {
    stopVoice()
    return
  }
  stopVoice()
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const resp = await fetch(`/spine_assets/${activeChar.value}/audio/${lang.value}/${v.file}`)
    const buf = await resp.arrayBuffer()
    const decoded = await audioCtx.decodeAudioData(buf)
    const source = audioCtx.createBufferSource()
    const gain = audioCtx.createGain()
    gain.gain.value = 0.6
    gain.connect(audioCtx.destination)
    source.buffer = decoded
    source.connect(gain)
    currentSource = source
    playingId.value = v.id
    source.onended = () => { playingId.value = null; currentSource = null }
    source.start()
  } catch (e) {
    console.warn('Voice play error:', e)
    playingId.value = null
  }
}

function stopVoice() {
  try { currentSource?.stop() } catch {}
  currentSource = null
  playingId.value = null
}
</script>

<template>
  <div class="vl-section glass-card">
    <div class="vl-header">
      <span class="vl-icon">🎵</span>
      <span class="vl-title">{{ t('tools.voiceLibrary') || '语音库' }}</span>
      <div class="vl-tabs">
        <button class="vl-tab" :class="{ active: activeChar === 'arona' }" @click="activeChar = 'arona'; stopVoice()">
          {{ locale === 'ja' ? 'アロナ' : '阿罗娜' }}
        </button>
        <button class="vl-tab" :class="{ active: activeChar === 'plana' }" @click="activeChar = 'plana'; stopVoice()">
          {{ locale === 'ja' ? 'プラナ' : '普拉娜' }}
        </button>
      </div>
    </div>
    <div class="vl-list">
      <div
        v-for="v in currentVoices"
        :key="v.id"
        class="vl-item"
        :class="{ playing: playingId === v.id }"
        @click="playVoice(v)"
      >
        <span class="vl-play">{{ playingId === v.id ? '⏸' : '▶' }}</span>
        <span class="vl-text">{{ v.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vl-section {
  padding: 16px 18px;
  margin-bottom: 20px;
}

.vl-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.vl-icon { font-size: 1.1rem; }
.vl-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); flex: 1; }

.vl-tabs {
  display: flex;
  gap: 4px;
}

.vl-tab {
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-secondary);
  font-size: 0.68rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.vl-tab.active {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-color: transparent;
  color: #fff;
}

.vl-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.vl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}

.vl-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.vl-item.playing {
  background: rgba(45, 175, 255, 0.08);
  border-color: rgba(45, 175, 255, 0.2);
}

.vl-play {
  font-size: 0.75rem;
  color: var(--accent-1);
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.vl-text {
  font-size: 0.75rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.vl-list::-webkit-scrollbar { width: 3px; }
.vl-list::-webkit-scrollbar-track { background: transparent; }
.vl-list::-webkit-scrollbar-thumb { background: rgba(45, 175, 255, 0.15); border-radius: 2px; }
</style>
