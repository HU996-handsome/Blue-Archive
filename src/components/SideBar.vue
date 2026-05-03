<script setup>
import { ref, onMounted, onUnmounted, inject, computed, nextTick } from 'vue'
import BALogo from './BALogo.vue'

const settings = inject('settings')
const t = inject('t')
const locale = inject('locale')

/* ========== Music ========== */
const playlist = [
  { name: 'Constant Moderato', artist: 'Mitsukiyo', src: '/assets/music/constant-moderato.mp3' },
  { name: 'Constant Moderato', artist: 'ミツキヨ', src: '/assets/music/ミツキヨ - Constant Moderato.mp3' },
  { name: 'Unwelcome School', artist: 'ミツキヨ', src: '/assets/music/ミツキヨ - Unwelcome school.mp3' },
  { name: 'RE Aoharu', artist: 'Nor', src: '/assets/music/Nor - RE Aoharu.mp3' },
]

const currentTrack = ref(0)
const bgmAudio = ref(null)
const isPlaying = ref(false)
const bgmProgress = ref(0)
const bgmDuration = ref(0)
const showPlaylist = ref(false)
const bgmVolume = ref(parseFloat(localStorage.getItem('ba-bgm-volume') ?? '0.7'))
const isMuted = ref(false)
const showVolume = ref(false)
let bgmTimer = null
let wantAutoPlay = false

function setVolume(val) {
  bgmVolume.value = val
  localStorage.setItem('ba-bgm-volume', val.toString())
  if (bgmAudio.value) bgmAudio.value.volume = isMuted.value ? 0 : val
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (bgmAudio.value) bgmAudio.value.volume = isMuted.value ? 0 : bgmVolume.value
}

function startProgressTimer() {
  clearInterval(bgmTimer)
  bgmTimer = setInterval(() => {
    if (bgmAudio.value) {
      bgmProgress.value = bgmAudio.value.currentTime
      bgmDuration.value = bgmAudio.value.duration || 0
    }
  }, 200)
}

function toggleBgm() {
  if (!bgmAudio.value) return
  if (isPlaying.value) {
    bgmAudio.value.pause()
    isPlaying.value = false
    clearInterval(bgmTimer)
  } else {
    bgmAudio.value.play()
    isPlaying.value = true
    startProgressTimer()
  }
}

function playTrack(index) {
  if (index < 0 || index >= playlist.length) return
  const wasPlaying = isPlaying.value
  clearInterval(bgmTimer)
  currentTrack.value = index
  bgmProgress.value = 0
  nextTick(() => {
    if (!bgmAudio.value) return
    bgmAudio.value.load()
    if (wasPlaying) {
      bgmAudio.value.play().then(() => {
        isPlaying.value = true
        startProgressTimer()
      })
    }
  })
}

function nextTrack() {
  playTrack((currentTrack.value + 1) % playlist.length)
}

function prevTrack() {
  playTrack((currentTrack.value - 1 + playlist.length) % playlist.length)
}

function onBgmLoaded() {
  if (bgmAudio.value) {
    bgmDuration.value = bgmAudio.value.duration || 0
    bgmAudio.value.volume = isMuted.value ? 0 : bgmVolume.value
  }
}

function onBgmCanPlay() {
  if (bgmAudio.value && wantAutoPlay && !isPlaying.value) {
    wantAutoPlay = false
    bgmAudio.value.play().then(() => {
      isPlaying.value = true
      startProgressTimer()
    }).catch(() => {})
  }
}

function onBgmEnded() {
  nextTrack()
  if (bgmAudio.value) {
    bgmAudio.value.play().then(() => {
      isPlaying.value = true
      startProgressTimer()
    }).catch(() => { isPlaying.value = false })
  }
}

function seekBgm(e) {
  if (!bgmAudio.value || !bgmDuration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  bgmAudio.value.currentTime = ratio * bgmDuration.value
  bgmProgress.value = bgmAudio.value.currentTime
}

function tryAutoPlay() {
  if (!bgmAudio.value) return
  wantAutoPlay = true
  bgmAudio.value.play().then(() => {
    wantAutoPlay = false
    isPlaying.value = true
    startProgressTimer()
  }).catch(() => {
    // autoplay blocked or audio not ready — onBgmLoaded will retry
    const handler = () => {
      document.removeEventListener('click', handler)
      wantAutoPlay = false
      toggleBgm()
    }
    document.addEventListener('click', handler)
  })
}

/* ========== Clock ========== */
const time = ref('')
const date = ref('')
const weekday = ref('')
const stayDuration = ref('00:00:00')
let timer
const startTime = Date.now()

function updateClock() {
  const now = new Date()
  time.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  date.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  weekday.value = t(`weekdayNames.${now.getDay()}`)

  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0')
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
  const s = String(elapsed % 60).padStart(2, '0')
  stayDuration.value = `${h}:${m}:${s}`
}

/* ========== Weather ========== */
const weather = ref(null)
const weatherLoading = ref(false)
const weatherError = ref('')
const permissionDenied = ref(false)
const weatherIcons = {
  'Clear': '☀️', 'Sunny': '☀️', 'Partly cloudy': '⛅', 'Cloudy': '☁️',
  'Overcast': '☁️', 'Mist': '🌫️', 'Fog': '🌫️', 'Light rain': '🌦️',
  'Moderate rain': '🌧️', 'Heavy rain': '🌧️', 'Light snow': '🌨️',
  'Snow': '❄️', 'Thunderstorm': '⛈️',
}

function getWeatherDesc(code) {
  const map = {
    0: 'Clear', 1: 'Sunny', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Fog', 51: 'Light rain', 53: 'Light rain',
    55: 'Moderate rain', 61: 'Light rain', 63: 'Moderate rain',
    65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Snow',
    80: 'Light rain', 81: 'Moderate rain', 82: 'Heavy rain',
    95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
  }
  return map[code] || 'Cloudy'
}

async function fetchWeather(lat, lon) {
  weatherLoading.value = true; weatherError.value = ''
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`)
    const data = await res.json()
    if (data.current) {
      const code = data.current.weather_code; const desc = getWeatherDesc(code)
      weather.value = {
        temp: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        wind: Math.round(data.current.wind_speed_10m),
        desc, icon: weatherIcons[desc] || '🌤️',
      }
    }
  } catch { weatherError.value = t('sidebar.weatherFail') }
  finally { weatherLoading.value = false }
}

function requestLocation() {
  if (!navigator.geolocation) { weatherError.value = t('sidebar.geoUnsupported'); return }
  weatherLoading.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      fetchWeather(pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      weatherLoading.value = false
      if (err.code === 1) { permissionDenied.value = true; weatherError.value = t('sidebar.geoDenied') }
      else weatherError.value = t('sidebar.geoFail')
    }
  )
}

/* ========== Birthday ========== */
const todayBirthdays = ref([])
const upcomingBirthdays = ref([])
const allStudents = ref([])
const birthdaySearch = ref('')
const showBirthdaySearch = ref(false)

const schoolNames = computed(() => ({
  Abydos: t('schoolNames.Abydos'), Gehenna: t('schoolNames.Gehenna'), Trinity: t('schoolNames.Trinity'), Millennium: t('schoolNames.Millennium'),
  Hyakkiyako: t('schoolNames.Hyakkiyako'), Shanhaijing: t('schoolNames.Shanhaijing'), RedWinter: t('schoolNames.RedWinter'), Valkyrie: t('schoolNames.Valkyrie'),
  SRT: 'SRT', Arius: t('schoolNames.Arius'), ETC: t('schoolNames.ETC'),
}))

const searchedStudents = computed(() => {
  const q = birthdaySearch.value.trim().toLowerCase()
  if (!q) return []
  return allStudents.value.filter(s =>
    s.name.toLowerCase().includes(q) || (schoolNames.value[s.school] || '').includes(q)
  ).slice(0, 8)
})

function formatBd(bd) {
  const parts = bd.split('/')
  if (locale.value === 'ja') return `${parts[0]}月${parts[1]}日`
  return `${parts[0]}月${parts[1]}日`
}

async function loadBirthdays() {
  try {
    const res = await fetch('/assets/students_birthday.json')
    const data = await res.json()
    allStudents.value = data
    const now = new Date()
    const today = `${now.getMonth() + 1}/${now.getDate()}`

    todayBirthdays.value = data.filter(s => s.bd === today)

    const upcoming = []
    for (let i = 1; i <= 30; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      const key = `${d.getMonth() + 1}/${d.getDate()}`
      data.filter(s => s.bd === key).forEach(s => upcoming.push({ ...s, daysLeft: i, dateStr: locale.value === 'ja' ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getMonth() + 1}月${d.getDate()}日` }))
    }
    upcomingBirthdays.value = upcoming.slice(0, 5)
  } catch (e) {
    console.warn('Birthday data load failed:', e)
  }
}

const volumeRef = ref(null)

function onDocClick(e) {
  if (showVolume.value && volumeRef.value && !volumeRef.value.contains(e.target)) {
    showVolume.value = false
  }
}

onMounted(() => { updateClock(); timer = setInterval(updateClock, 1000); requestLocation(); tryAutoPlay(); loadBirthdays(); document.addEventListener('click', onDocClick) })
onUnmounted(() => { clearInterval(timer); document.removeEventListener('click', onDocClick) })
</script>

<template>
  <aside class="sidebar" :style="{ '--sidebar-opacity': settings.sidebarOpacity }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <BALogo />
    </div>

    <!-- Avatar (static) -->
    <div class="sidebar-section avatar-section">
      <div class="avatar-wrap">
        <img src="/assets/avatar.webp" class="avatar-img" alt="avatar" />
      </div>
    </div>

    <!-- Music -->
    <div class="sidebar-section music-section">
      <audio ref="bgmAudio" :src="playlist[currentTrack].src" preload="auto" @loadedmetadata="onBgmLoaded" @canplay="onBgmCanPlay" @ended="onBgmEnded"></audio>
      <div class="music-now">
        <span class="music-track-name">{{ playlist[currentTrack].name }}</span>
        <span class="music-artist">{{ playlist[currentTrack].artist }}</span>
      </div>
      <div class="music-bar" @click="seekBgm">
        <div class="music-bar-fill" :style="{ width: bgmDuration ? (bgmProgress / bgmDuration * 100) + '%' : '0%' }"></div>
      </div>
      <div class="music-controls">
        <button class="music-btn" @click="prevTrack" :title="t('sidebar.prevTrack')">
          <span class="material-symbols-outlined">skip_previous</span>
        </button>
        <button class="music-btn music-btn-play" @click="toggleBgm">
          <span class="material-symbols-outlined">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
        </button>
        <button class="music-btn" @click="nextTrack" :title="t('sidebar.nextTrack')">
          <span class="material-symbols-outlined">skip_next</span>
        </button>
        <div class="music-volume" ref="volumeRef">
          <button class="music-btn music-btn-vol" @click.stop="showVolume = !showVolume" :title="isMuted ? t('sidebar.unmute') : t('sidebar.mute')">
            <span class="material-symbols-outlined">{{ isMuted || bgmVolume === 0 ? 'volume_off' : bgmVolume < 0.5 ? 'volume_down' : 'volume_up' }}</span>
          </button>
          <div v-if="showVolume" class="volume-popup" @click.stop>
            <input type="range" class="volume-slider" min="0" max="1" step="0.05" :value="isMuted ? 0 : bgmVolume" @input="setVolume(parseFloat($event.target.value))" />
            <span class="volume-val">{{ Math.round((isMuted ? 0 : bgmVolume) * 100) }}%</span>
          </div>
        </div>
        <button class="music-btn music-btn-list" @click="showPlaylist = !showPlaylist" :title="t('sidebar.playlist')">
          <span class="material-symbols-outlined">queue_music</span>
        </button>
      </div>
      <!-- Playlist -->
      <div v-if="showPlaylist" class="music-playlist">
        <div
          v-for="(track, i) in playlist"
          :key="i"
          class="music-playlist-item"
          :class="{ active: i === currentTrack }"
          @click="playTrack(i)"
        >
          <span class="music-playlist-num">{{ i === currentTrack && isPlaying ? '♪' : i + 1 }}</span>
          <div class="music-playlist-info">
            <span class="music-playlist-name">{{ track.name }}</span>
            <span class="music-playlist-artist">{{ track.artist }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Clock -->
    <div class="sidebar-section">
      <div class="clock-display">
        <span class="clock-time">{{ time }}</span>
      </div>
      <div class="clock-meta">
        <span>{{ date }}</span>
        <span class="clock-dot">·</span>
        <span>{{ weekday }}</span>
      </div>
      <div class="clock-stay">{{ t('sidebar.stayTime') }}{{ stayDuration }}</div>
    </div>

    <!-- Weather -->
    <div class="sidebar-section weather-section">
      <div v-if="weatherLoading" class="weather-loading">
        <div class="spinner"></div><span>{{ t('sidebar.weatherLoading') }}</span>
      </div>
      <div v-else-if="weather" class="weather-info">
        <div class="weather-row">
          <span class="weather-icon">{{ weather.icon }}</span>
          <span class="weather-temp">{{ weather.temp }}°C</span>
        </div>
        <div class="weather-desc">{{ weather.desc }} · 体感 {{ weather.feelsLike }}°C</div>
        <div class="weather-extra">
          <span>💧 {{ weather.humidity }}%</span>
          <span>🌬️ {{ weather.wind }}km/h</span>
        </div>
      </div>
      <div v-else class="weather-error">
        <span>{{ weatherError || t('sidebar.weatherUnavailable') }}</span>
        <button class="btn-text" @click="requestLocation">{{ permissionDenied ? t('sidebar.reauth') : t('sidebar.retry') }}</button>
      </div>
    </div>

    <!-- Birthday -->
    <div class="sidebar-section birthday-section">
      <div class="birthday-title">🎂 {{ t('sidebar.birthdayCalendar') }}</div>
      <div v-if="todayBirthdays.length" class="birthday-today">
        <div class="birthday-badge">{{ t('sidebar.todayBirthday') }}</div>
        <div v-for="s in todayBirthdays" :key="s.name" class="birthday-item today">
          <span class="birthday-name">{{ s.name }}</span>
          <span class="birthday-school">{{ schoolNames.value[s.school] || s.school }}</span>
        </div>
      </div>
      <div v-if="upcomingBirthdays.length" class="birthday-upcoming">
        <div v-for="s in upcomingBirthdays" :key="s.name+s.bd" class="birthday-item">
          <span class="birthday-name">{{ s.name }}</span>
          <span class="birthday-date">{{ s.dateStr }}（{{ t('sidebar.daysLater', { n: s.daysLeft }) }}）</span>
        </div>
      </div>
      <div v-if="!todayBirthdays.length && !upcomingBirthdays.length" class="birthday-empty">
        {{ t('sidebar.loading') }}
      </div>
      <!-- Search -->
      <div class="birthday-search">
        <div class="birthday-search-box" @click="showBirthdaySearch = true">
          <span class="material-symbols-outlined birthday-search-icon">search</span>
          <input
            v-model="birthdaySearch"
            class="birthday-search-input"
            :placeholder="t('sidebar.searchBirthday')"
            @focus="showBirthdaySearch = true"
          />
        </div>
        <div v-if="showBirthdaySearch && searchedStudents.length" class="birthday-results">
          <div v-for="s in searchedStudents" :key="s.name+s.bd" class="birthday-result-item">
            <div class="birthday-result-info">
              <span class="birthday-result-name">{{ s.name }}</span>
              <span class="birthday-result-school">{{ schoolNames.value[s.school] || s.school }}</span>
            </div>
            <span class="birthday-result-date">{{ formatBd(s.bd) }}</span>
          </div>
        </div>
        <div v-if="showBirthdaySearch && birthdaySearch.trim() && !searchedStudents.length" class="birthday-no-result">
          {{ t('sidebar.noMatch') }}
        </div>
      </div>
    </div>

  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px; min-width: 240px; height: 100vh;
  display: flex; flex-direction: column; padding: 0;
  overflow-y: auto; overflow-x: hidden;
  position: relative;
  border-radius: 0 20px 20px 0;
  border-right: 1px solid rgba(18, 138, 250, 0.2);
  background: transparent;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sidebar::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(6, 12, 24, 0.35);
  z-index: 0;
  border-radius: inherit;
}

.sidebar > * {
  position: relative; z-index: 1;
}

.sidebar-logo {
  display: flex; align-items: center; justify-content: center;
  padding: 20px 16px 16px; margin-bottom: 4px;
}

.sidebar-section {
  margin: 0 12px 6px; padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(18, 138, 250, 0.1);
}

.avatar-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.avatar-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(18, 138, 250, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-section {
  padding: 10px 14px;
}

.music-now {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.music-track-name {
  font-size: 0.72rem;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-artist {
  font-size: 0.58rem;
  color: var(--text-secondary);
  opacity: 0.5;
  white-space: nowrap;
  flex-shrink: 0;
}

.music-bar {
  width: 100%;
  height: 3px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  cursor: pointer;
  transition: height 0.2s;
  margin-bottom: 8px;
}

.music-bar:hover {
  height: 5px;
}

.music-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #128afa, #4dc9f6);
  transition: width 0.2s linear;
}

.music-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.music-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(18, 138, 250, 0.3);
  background: rgba(18, 138, 250, 0.1);
  color: #128afa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.music-btn:hover {
  background: rgba(18, 138, 250, 0.2);
  box-shadow: 0 0 12px rgba(18, 138, 250, 0.3);
}

.music-btn .material-symbols-outlined {
  font-size: 0.95rem;
}

.music-btn-play {
  width: 32px;
  height: 32px;
}

.music-btn-play .material-symbols-outlined {
  font-size: 1.1rem;
}

.music-btn-list,
.music-btn-vol {
  border: none;
  background: none;
  color: var(--text-secondary);
  opacity: 0.5;
}

.music-btn-list:hover,
.music-btn-vol:hover {
  opacity: 1;
  background: none;
  box-shadow: none;
  color: #128afa;
}

.music-volume {
  position: relative;
}

.volume-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 8px 6px;
  margin-bottom: 6px;
  background: rgba(8, 16, 32, 0.95);
  border: 1px solid rgba(18, 138, 250, 0.15);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(4px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.volume-slider {
  writing-mode: vertical-lr;
  direction: rtl;
  width: 20px;
  height: 72px;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-runnable-track {
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #2dafff;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(45, 175, 255, 0.4);
  margin-left: -5px;
}

.volume-val {
  font-size: 0.6rem;
  color: var(--text-secondary);
  font-family: 'SF Mono', 'Consolas', monospace;
}

/* Playlist */
.music-playlist {
  margin-top: 8px;
  border-radius: 10px;
  background: rgba(8, 16, 32, 0.85);
  border: 1px solid rgba(18, 138, 250, 0.1);
  max-height: 200px;
  overflow-y: auto;
  animation: slideDown 0.25s ease;
}

@keyframes slideDown {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 200px; }
}

.music-playlist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.music-playlist-item:hover {
  background: rgba(18, 138, 250, 0.08);
}

.music-playlist-item.active {
  background: rgba(18, 138, 250, 0.12);
}

.music-playlist-num {
  width: 18px;
  font-size: 0.65rem;
  color: var(--text-secondary);
  text-align: center;
  flex-shrink: 0;
}

.music-playlist-item.active .music-playlist-num {
  color: #128afa;
}

.music-playlist-info {
  flex: 1;
  min-width: 0;
}

.music-playlist-name {
  font-size: 0.7rem;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-playlist-item.active .music-playlist-name {
  color: #128afa;
}

.music-playlist-artist {
  font-size: 0.58rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.music-playlist::-webkit-scrollbar {
  width: 4px;
}

.music-playlist::-webkit-scrollbar-track {
  background: transparent;
}

.music-playlist::-webkit-scrollbar-thumb {
  background: rgba(18, 138, 250, 0.2);
  border-radius: 4px;
}

.clock-display { text-align: center; margin-bottom: 4px; }

.clock-time {
  font-size: 2.4rem; font-weight: 700;
  font-family: 'SF Mono', 'Consolas', monospace; letter-spacing: 4px;
  background: linear-gradient(135deg, #128afa, #4dc9f6, #ffe401);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.clock-meta {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; font-size: 0.75rem; color: var(--text-secondary);
}

.clock-dot { opacity: 0.3; }

.clock-stay {
  text-align: center; font-size: 0.68rem; color: var(--text-secondary);
  margin-top: 6px; opacity: 0.5;
  font-family: 'SF Mono', 'Consolas', monospace;
}

.weather-section { min-height: 80px; overflow: hidden; }

.weather-loading {
  display: flex; align-items: center; gap: 8px;
  color: var(--text-secondary); font-size: 0.78rem; padding: 8px 0;
}

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.06);
  border-top-color: #128afa; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.weather-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.weather-icon { font-size: 1.5rem; }

.weather-temp {
  font-size: 1.8rem; font-weight: 700;
  background: linear-gradient(135deg, #f0f6fc, #128afa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.weather-desc { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.weather-extra { display: flex; gap: 12px; font-size: 0.72rem; color: var(--text-secondary); flex-wrap: wrap; }

.weather-error {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.78rem; color: var(--text-secondary); padding: 8px 0;
}

.btn-text {
  background: none; border: none; color: #128afa;
  font-size: 0.78rem; cursor: pointer; font-family: inherit;
  padding: 2px 8px; border-radius: 6px; transition: all 0.2s;
}

.btn-text:hover {
  background: rgba(18, 138, 250, 0.1);
  text-shadow: 0 0 8px rgba(18, 138, 250, 0.4);
}

/* Birthday */
.birthday-section { padding: 12px 14px; }

.birthday-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.birthday-badge {
  display: inline-block;
  font-size: 0.65rem;
  color: #f5c842;
  background: rgba(245, 200, 66, 0.1);
  border: 1px solid rgba(245, 200, 66, 0.2);
  padding: 1px 8px;
  border-radius: 6px;
  margin-bottom: 6px;
}

.birthday-today {
  margin-bottom: 8px;
}

.birthday-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 0.75rem;
}

.birthday-item.today {
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(245, 200, 66, 0.08);
  margin-bottom: 2px;
}

.birthday-item.today .birthday-name {
  color: #f5c842;
  font-weight: 600;
}

.birthday-name {
  color: var(--text-primary);
  font-size: 0.75rem;
}

.birthday-school {
  font-size: 0.65rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

.birthday-date {
  font-size: 0.65rem;
  color: var(--text-secondary);
}

.birthday-upcoming {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 6px;
}

.birthday-empty {
  font-size: 0.72rem;
  color: var(--text-secondary);
  opacity: 0.5;
  text-align: center;
  padding: 8px 0;
}

.birthday-search {
  margin-top: 8px;
  position: relative;
}

.birthday-search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(18, 138, 250, 0.1);
  transition: all 0.2s;
}

.birthday-search-box:focus-within {
  border-color: rgba(18, 138, 250, 0.35);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 8px rgba(18, 138, 250, 0.12);
}

.birthday-search-icon {
  font-size: 0.85rem;
  color: var(--text-secondary);
  opacity: 0.4;
  flex-shrink: 0;
}

.birthday-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.72rem;
  min-width: 0;
}

.birthday-search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.4;
}

.birthday-results {
  margin-top: 6px;
  border-radius: 10px;
  background: rgba(8, 16, 32, 0.85);
  border: 1px solid rgba(18, 138, 250, 0.12);
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.birthday-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  transition: background 0.2s;
}

.birthday-result-item:hover {
  background: rgba(18, 138, 250, 0.08);
}

.birthday-result-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.birthday-result-name {
  font-size: 0.72rem;
  color: var(--text-primary);
  font-weight: 500;
}

.birthday-result-school {
  font-size: 0.6rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.birthday-result-date {
  font-size: 0.68rem;
  color: #f5c842;
  font-weight: 500;
}

.birthday-no-result {
  margin-top: 6px;
  font-size: 0.68rem;
  color: var(--text-secondary);
  opacity: 0.5;
  text-align: center;
  padding: 8px 0;
}

.birthday-results::-webkit-scrollbar {
  width: 4px;
}

.birthday-results::-webkit-scrollbar-track {
  background: transparent;
}

.birthday-results::-webkit-scrollbar-thumb {
  background: rgba(18, 138, 250, 0.2);
  border-radius: 4px;
}

/* Mobile drawer */
@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 16px 16px 0;
    width: 260px; min-width: 260px;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
