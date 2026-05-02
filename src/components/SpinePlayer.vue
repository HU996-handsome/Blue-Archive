<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  character: { type: String, default: 'arona' },
})

const emit = defineEmits(['toggle'])

const playerRef = ref(null)
const showDialog = ref(false)
const currentDialog = ref('')
const enabled = ref(true)
const loading = ref(true)

// drag state
const dragX = ref(null)
const dragY = ref(null)
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let startLeft = 0
let startBottom = 0
let dragMoved = false

const assets = {
  arona: {
    skel: '/spine_assets/arona/arona_spr.skel',
    atlas: '/spine_assets/arona/arona_spr.atlas',
    idle: 'Idle_01',
    blink: 'Eye_Close_01',
    eyeR: 'R_Eye_01',
    eyeL: 'L_Eye_01',
    headF: 'Head_01',
    headB: 'Head_Back',
    eyeAngle: 76.307,
    voices: [
      { audio: '/spine_assets/arona/audio/zh/arona_01.ogg', anim: '12', text: '您回来了？我等您很久啦！' },
      { audio: '/spine_assets/arona/audio/zh/arona_02.ogg', anim: '03', text: '嗯，不错，今天也是个好天气。' },
      { audio: '/spine_assets/arona/audio/zh/arona_03.ogg', anim: '02', text: '天空真是广啊……另一边会有些什么呢？' },
      { audio: '/spine_assets/arona/audio/zh/arona_04.ogg', anim: '18', text: '偶尔也要为自己的健康着想啊，老师，我会很担心的。' },
      { audio: '/spine_assets/arona/audio/zh/arona_05.ogg', anim: '25', text: '来，加油吧，老师！' },
      { audio: '/spine_assets/arona/audio/zh/arona_06.ogg', anim: '11', text: '今天又会有什么事情在等着我呢？' },
    ],
  },
  plana: {
    skel: '/spine_assets/plana/plana_spr.skel',
    atlas: '/spine_assets/plana/plana_spr.atlas',
    idle: 'Idle_01',
    blink: 'Eye_Close_01',
    eyeR: 'R_Eye_01',
    eyeL: 'L_Eye_01',
    headF: 'Head_Rot',
    headB: 'Head_Back',
    eyeAngle: 97.331,
    voices: [
      { audio: '/spine_assets/plana/audio/zh/plana_01.ogg', anim: '13', text: '混乱，该行动无法理解。请不要戳我，会出现故障。' },
      { audio: '/spine_assets/plana/audio/zh/plana_02.ogg', anim: '06', text: '我明白了，老师现在无事可做，很无聊。' },
      { audio: '/spine_assets/plana/audio/zh/plana_03.ogg', anim: '15', text: '确认连接。' },
      { audio: '/spine_assets/plana/audio/zh/plana_04.ogg', anim: '99', text: '正在待命，需要解决的任务还有很多。' },
      { audio: '/spine_assets/plana/audio/zh/plana_05.ogg', anim: '17', text: '等您很久了。' },
    ],
  },
}

let player = null
let animState = null
let blinkTimer = null
let isPlaying = false
let lastVoice = -1
let audioCtx = null
let moveHandler = null

function getCfg() {
  return assets[props.character]
}

function rotateVec(x, y, angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return { x: x * c - y * s, y: x * s + y * c }
}

function cleanup() {
  if (blinkTimer) { clearTimeout(blinkTimer); blinkTimer = null }
  if (moveHandler) { window.removeEventListener('mousemove', moveHandler); moveHandler = null }
  if (audioCtx) { audioCtx.close(); audioCtx = null }
  if (playerRef.value) {
    playerRef.value.innerHTML = ''
  }
  player = null
  animState = null
  isPlaying = false
  lastVoice = -1
  showDialog.value = false
}

function initPlayer() {
  const cfg = getCfg()
  if (!window.spine || !playerRef.value) return
  player = new window.spine.SpinePlayer(playerRef.value, {
    skelUrl: cfg.skel,
    atlasUrl: cfg.atlas,
    premultipliedAlpha: true,
    backgroundColor: '#00000000',
    alpha: true,
    showControls: false,
    success(inst) {
      loading.value = false
      inst.setAnimation(cfg.idle, true)
      const sk = inst.skeleton
      const as = inst.animationState
      animState = as

      const eyeR = sk.findBone(cfg.eyeR)
      const eyeL = sk.findBone(cfg.eyeL)
      const headF = sk.findBone(cfg.headF)
      const headB = sk.findBone(cfg.headB)
      const cR = { x: eyeR?.data.x || 0, y: eyeR?.data.y || 0 }
      const cL = { x: eyeL?.data.x || 0, y: eyeL?.data.y || 0 }
      const cF = { x: headF?.data.x || 0, y: headF?.data.y || 0 }
      const cB = { x: headB?.data.x || 0, y: headB?.data.y || 0 }

      const rad = 15, headRad = 2, backRad = 1

      function moveBones(e) {
        if (isPlaying || !playerRef.value) return
        const rect = playerRef.value.getBoundingClientRect()
        const mx = e.clientX - (rect.right - rect.width / 2)
        const my = e.clientY - (rect.bottom - rect.height * 4 / 5)
        const rot = rotateVec(mx, my, -(cfg.eyeAngle * Math.PI / 180))
        const dist = Math.sqrt(rot.x ** 2 + rot.y ** 2)
        const angle = Math.atan2(rot.y, rot.x)
        const md = Math.min(dist, rad)
        const dx = -md * Math.cos(angle)
        const dy = md * Math.sin(angle)

        if (eyeR) { eyeR.x = cR.x + dx; eyeR.y = cR.y + dy }
        if (eyeL) { eyeL.x = cL.x + dx; eyeL.y = cL.y + dy }
        if (headF) {
          headF.x = cF.x - Math.min(dist, headRad) * Math.cos(angle)
          headF.y = cF.y + Math.min(dist, headRad) * Math.sin(angle)
        }
        if (headB) {
          headB.x = cB.x + Math.min(dist, backRad) * Math.cos(angle)
          headB.y = cB.y - Math.min(dist, backRad) * Math.sin(angle)
        }
        sk.updateWorldTransform()
      }

      function resetBones() {
        if (eyeR) { eyeR.x = cR.x; eyeR.y = cR.y }
        if (eyeL) { eyeL.x = cL.x; eyeL.y = cL.y }
        if (headF) { headF.x = cF.x; headF.y = cF.y }
        if (headB) { headB.x = cB.x; headB.y = cB.y }
        sk.updateWorldTransform()
      }

      function blink() {
        const delay = (Math.random() * 3 + 3) * 1000
        blinkTimer = setTimeout(() => {
          as.setAnimation(1, cfg.blink, false)
          if (Math.random() > 0.5) as.addAnimation(1, cfg.blink, false, 0.1)
          blink()
        }, delay)
      }

      moveHandler = moveBones
      window.addEventListener('mousemove', moveBones)
      blink()

      playerRef.value._resetBones = resetBones
    },
    error(_, reason) {
      loading.value = false
      console.error('Spine load failed:', reason)
    },
  })
}

async function playVoice() {
  if (isPlaying) return
  const cfg = getCfg()
  isPlaying = true

  playerRef.value?._resetBones?.()

  let idx
  do { idx = Math.floor(Math.random() * cfg.voices.length) } while (idx === lastVoice && cfg.voices.length > 1)
  lastVoice = idx
  const v = cfg.voices[idx]

  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const resp = await fetch(v.audio)
    const buf = await resp.arrayBuffer()
    const decoded = await audioCtx.decodeAudioData(buf)

    currentDialog.value = v.text
    showDialog.value = true
    animState?.addAnimation(2, v.anim, false, 0)

    const source = audioCtx.createBufferSource()
    const gain = audioCtx.createGain()
    gain.gain.value = 0.6
    gain.connect(audioCtx.destination)
    source.buffer = decoded
    source.connect(gain)

    await new Promise(resolve => {
      source.onended = resolve
      source.start()
    })
  } catch (e) {
    console.warn('Voice play error:', e)
  }

  isPlaying = false
  animState?.setEmptyAnimation(2, 0)
  showDialog.value = false
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function loadCSS(href) {
  return new Promise((resolve) => {
    if (document.querySelector(`link[href="${href}"]`)) { resolve(); return }
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    l.onload = resolve
    document.head.appendChild(l)
  })
}

onMounted(async () => {
  // check WebGL
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  if (!gl) {
    loading.value = false
    console.warn('WebGL not supported, Spine disabled')
    return
  }

  // timeout — hide loading after 15s even if spine hasn't loaded
  const timeout = setTimeout(() => { loading.value = false }, 15000)

  try {
    await loadCSS('/spine/spine-player.css')
    await loadScript('/spine/spine-player.js')
    initPlayer()
  } catch (e) {
    loading.value = false
    console.error('Spine init error:', e)
  } finally {
    clearTimeout(timeout)
  }
})

function onDragStart(e) {
  const touch = e.touches ? e.touches[0] : e
  isDragging = true
  dragMoved = false
  dragStartX = touch.clientX
  dragStartY = touch.clientY
  const wrap = playerRef.value?.parentElement
  if (wrap) {
    const rect = wrap.getBoundingClientRect()
    startLeft = rect.left
    startBottom = window.innerHeight - rect.bottom
  }
}

function onDragMove(e) {
  if (!isDragging) return
  const touch = e.touches ? e.touches[0] : e
  const dx = touch.clientX - dragStartX
  const dy = touch.clientY - dragStartY
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true
  dragX.value = Math.max(0, Math.min(window.innerWidth - 100, startLeft + dx))
  dragY.value = Math.max(0, Math.min(window.innerHeight - 100, startBottom - dy))
}

function onDragEnd() {
  isDragging = false
}

function onPlayerClick() {
  if (!dragMoved) playVoice()
}

watch(() => props.character, () => {
  loading.value = true
  dragX.value = null
  dragY.value = null
  cleanup()
  initPlayer()
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div v-if="enabled" class="spine-wrap" :style="dragX !== null ? { left: dragX + 'px', bottom: dragY + 'px', right: 'auto', transition: 'none' } : {}">
    <div v-if="loading" class="spine-loading">✦</div>
    <button class="char-toggle" @click.stop="$emit('toggle')" title="切换角色">
      <span class="char-toggle-icon">{{ character === 'arona' ? '🌙' : '☀️' }}</span>
    </button>
    <div ref="playerRef" class="spine-player"
      @mousedown="onDragStart"
      @mousemove="onDragMove"
      @mouseup="onDragEnd"
      @touchstart.passive="onDragStart"
      @touchmove.passive="onDragMove"
      @touchend="onDragEnd"
      @click="onPlayerClick"
    ></div>
    <Transition name="dialog-fade">
      <div v-if="showDialog" class="spine-dialog-wrap">
        <div class="spine-dialog-arrow"></div>
        <div class="spine-dialog">{{ currentDialog }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.spine-wrap {
  position: fixed;
  bottom: 20px;
  left: 250px;
  z-index: 110;
  pointer-events: none;
  transition: left 0.3s, bottom 0.3s;
}

.spine-player {
  width: 130px;
  height: 260px;
  cursor: pointer;
  pointer-events: auto;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
}

.char-toggle {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(18, 138, 250, 0.3);
  background: rgba(8, 16, 32, 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  pointer-events: auto;
}

.char-toggle:hover {
  background: rgba(18, 138, 250, 0.2);
  border-color: rgba(18, 138, 250, 0.6);
  box-shadow: 0 0 10px rgba(18, 138, 250, 0.3);
  transform: translateX(-50%) scale(1.1);
}

.char-toggle-icon {
  font-size: 0.85rem;
  line-height: 1;
}

.spine-loading {
  position: absolute;
  bottom: 100px;
  left: 40px;
  font-size: 2rem;
  animation: spineLoadPulse 1.5s ease-in-out infinite;
  background: linear-gradient(135deg, #2dafff, #f5c842);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes spineLoadPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.spine-dialog-wrap {
  position: absolute;
  bottom: 220px;
  left: 10px;
  pointer-events: none;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

.spine-dialog-arrow {
  position: absolute;
  left: 24px;
  bottom: -8px;
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(255, 255, 255, 0.92);
}

.spine-dialog {
  background: rgba(255, 255, 255, 0.92);
  color: #1a1a2e;
  border-radius: 16px;
  padding: 10px 18px;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: pre-wrap;
  max-width: 200px;
  user-select: none;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .spine-wrap { left: 10px; bottom: 64px; }
  .spine-player { width: 100px; height: 200px; cursor: grab; }
  .spine-player:active { cursor: grabbing; }
  .spine-loading { bottom: 80px; left: 30px; font-size: 1.5rem; }
  .spine-dialog-wrap { bottom: 160px; }
  .spine-dialog { font-size: 0.7rem; max-width: 160px; }
  .char-toggle { width: 26px; height: 26px; }
  .char-toggle-icon { font-size: 0.75rem; }
}
</style>
