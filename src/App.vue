<script setup>
import { ref, reactive, computed, provide, watch, onMounted, onUnmounted } from 'vue'
import { useSupabase } from './composables/useSupabase.js'
import VideoBg from './components/VideoBg.vue'
import MouseTrail from './components/MouseTrail.vue'
import SideBar from './components/SideBar.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import AboutPanel from './components/AboutPanel.vue'
import OnboardingGuide from './components/OnboardingGuide.vue'
import SpinePlayer from './components/SpinePlayer.vue'
import TopBar from './components/TopBar.vue'
import ChangelogPanel from './components/ChangelogPanel.vue'
import BirthdayConfetti from './components/BirthdayConfetti.vue'
import ToolsPanel from './components/ToolsPanel.vue'
import AuthModal from './components/AuthModal.vue'

/* ========== Disclaimer ========== */
const disclaimerVisible = ref(true)
const disclaimerReady = ref(false)

function acceptDisclaimer() {
  disclaimerReady.value = false
  setTimeout(() => {
    disclaimerVisible.value = false
    // After disclaimer, check if auth is needed
    if (!isAuthenticated.value) {
      showAuth.value = true
    }
  }, 400)
}

// show disclaimer immediately
disclaimerReady.value = true

/* ========== Supabase Auth ========== */
const { user, isAuthenticated, isConfigured, authLoading, syncOnLogin, syncOnLogout, signOut, debouncedSave, applyDataToLocal } = useSupabase()

const showAuth = ref(false)
const needsOnboarding = ref(false)

function toggleAuth() { showAuth.value = !showAuth.value }
function closeAuth() { showAuth.value = false }

async function onAuthSuccess() {
  // After login, merge local data with cloud
  const merged = await syncOnLogin()
  if (merged) {
    applyDataToLocal(merged)
    // Sync avatar reactive state from merged data
  }
  // Check if this user needs onboarding
  const uid = user.value?.id
  const onboardingKey = `ba-onboarding-done-${uid}`
  if (!localStorage.getItem(onboardingKey)) {
    needsOnboarding.value = true
  }
}

function onOnboardingComplete() {
  needsOnboarding.value = false
}

async function handleLogout() {
  await syncOnLogout()
  await signOut()
  // isAuthenticated becomes false → layout hides, auth-required screen shows
  // Show auth modal for switching account
  setTimeout(() => { showAuth.value = true }, 300)
}

provide('user', user)
provide('isAuthenticated', isAuthenticated)
provide('isConfigured', isConfigured)
provide('authLoading', authLoading)
provide('showAuth', showAuth)
provide('toggleAuth', toggleAuth)
provide('closeAuth', closeAuth)
provide('onAuthSuccess', onAuthSuccess)
provide('handleLogout', handleLogout)
provide('debouncedSave', debouncedSave)
provide('needsOnboarding', needsOnboarding)
provide('onOnboardingComplete', onOnboardingComplete)

/* ========== BA Links ========== */
const baCategories = [
  {
    title: '数据查询 & 图鉴',
    icon: '📊',
    links: [
      { name: 'Schale DB', desc: '学生数据与图鉴查询', url: 'https://schaledb.brightsu.cn/home', icon: '📊' },
      { name: '蔚蓝档案中文Wiki', desc: 'gamekee 综合资料站', url: 'https://www.gamekee.com/ba', icon: '📖' },
      { name: '基沃托斯Wiki', desc: 'kivo.wiki 百科全书', url: 'https://kivo.wiki/', icon: '🌐' },
      { name: '素材一览表', desc: 'game-db 素材数据查询', url: 'https://ba.game-db.tw/', icon: '📦' },
      { name: '蔚蓝档案工具站', desc: '学生数据与工具集合', url: 'https://ba.brightsu.cn/students', icon: '🔧' },
    ],
  },
  {
    title: '实用工具',
    icon: '🧮',
    links: [
      { name: '总力战算分网站', desc: 'BA 总力战分数计算', url: 'https://ba.gc.gg/scorecalc', icon: '🧮' },
      { name: '什亭之匣', desc: 'arona.icu 综合工具', url: 'https://arona.icu/', icon: '🤖' },
      { name: '蔚蓝档案资讯攻略', desc: 'blue-utils 资讯与攻略', url: 'https://blue-utils.me/', icon: '📰' },
      { name: '蔚蓝档案标题生成器', desc: 'BA Logo 在线生成', url: 'https://lab.nulla.top/ba-logo', icon: '🎨' },
      { name: '蔚蓝档案像素画', desc: 'BA 角色像素头像', url: 'https://www.pixelartcss.com/', icon: '🖼️' },
    ],
  },
  {
    title: '剧情 & 社区',
    icon: '📜',
    links: [
      { name: '蔚蓝档案剧情站', desc: '主线剧情在线阅读', url: 'https://blue-archive.io/mainStory', icon: '📜' },
      { name: '蔚蓝咖啡厅', desc: 'bluearchive.cafe 社区', url: 'https://bluearchive.cafe/', icon: '☕' },
      { name: '蔚蓝档案国服', desc: 'bluearchive-cn 官网', url: 'https://bluearchive-cn.com/', icon: '🇨🇳' },
      { name: '日服官网', desc: 'bluearchive.jp (需魔法)', url: 'https://bluearchive.jp/', icon: '🇯🇵' },
      { name: '蔚蓝档案吧', desc: '百度贴吧蔚蓝档案吧', url: 'https://tieba.baidu.com/f?kw=蔚蓝档案', icon: '💬' },
    ],
  },
]

const allLinks = baCategories.flatMap(c => c.links)
const searchQuery = ref('')
const activeCategory = ref(null)

const filteredLinks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return baCategories
  return baCategories.map(cat => ({
    ...cat,
    links: cat.links.filter(l =>
      l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
    ),
  })).filter(cat => cat.links.length > 0)
})

const totalResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return allLinks.length
  return allLinks.filter(l =>
    l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)
  ).length
})

provide('searchQuery', searchQuery)

/* ========== Settings ========== */
const STORAGE_KEY = 'ba-site-settings'

const defaultSettings = {
  trailEnabled: true,
  clickEffectEnabled: true,
  trailColor: '45,175,255',
  trailScale: 1.5,
  cardGlow: true,
  sidebarOpacity: 0.7,
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved) return { ...defaultSettings, ...saved }
  } catch {}
  return { ...defaultSettings }
}

const settings = reactive(loadSettings())

function updateSetting(key, value) {
  settings[key] = value
}

function resetSettings() {
  Object.assign(settings, defaultSettings)
}

watch(settings, (val) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  debouncedSave()
}, { deep: true })

const showSettings = ref(false)

function toggleSettings() { showSettings.value = !showSettings.value }
function closeSettings() { showSettings.value = false }

provide('settings', settings)
provide('updateSetting', updateSetting)
provide('resetSettings', resetSettings)
provide('showSettings', showSettings)
provide('toggleSettings', toggleSettings)
provide('closeSettings', closeSettings)

/* ========== About ========== */
const showAbout = ref(false)
function toggleAbout() { showAbout.value = !showAbout.value }
function closeAbout() { showAbout.value = false }

provide('showAbout', showAbout)
provide('toggleAbout', toggleAbout)
provide('closeAbout', closeAbout)

/* ========== Changelog ========== */
const showChangelog = ref(false)
function toggleChangelog() { showChangelog.value = !showChangelog.value }
function closeChangelog() { showChangelog.value = false }

provide('showChangelog', showChangelog)
provide('toggleChangelog', toggleChangelog)
provide('closeChangelog', closeChangelog)

/* ========== Tools ========== */
const showTools = ref(false)
function toggleTools() { showTools.value = !showTools.value }
function closeTools() { showTools.value = false }

provide('showTools', showTools)
provide('toggleTools', toggleTools)
provide('closeTools', closeTools)

/* ========== Guide Replay ========== */
const guideRestart = ref(0)
provide('guideRestart', guideRestart)

/* ========== Character Toggle ========== */
const currentCharacter = ref('arona')
function toggleCharacter() {
  currentCharacter.value = currentCharacter.value === 'arona' ? 'plana' : 'arona'
}

/* ========== Sidebar (Mobile) ========== */
const sidebarOpen = ref(false)
function toggleSidebar() { sidebarOpen.value = !sidebarOpen.value }
function closeSidebar() { sidebarOpen.value = false }

provide('sidebarOpen', sidebarOpen)
provide('toggleSidebar', toggleSidebar)
provide('closeSidebar', closeSidebar)

/* ========== Favorites ========== */
const FAV_KEY = 'ba-favorites'
const favorites = ref(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))

function toggleFavorite(url) {
  const idx = favorites.value.indexOf(url)
  if (idx >= 0) favorites.value.splice(idx, 1)
  else favorites.value.push(url)
  localStorage.setItem(FAV_KEY, JSON.stringify(favorites.value))
  debouncedSave()
}

function isFavorite(url) {
  return favorites.value.includes(url)
}

const favoriteLinks = computed(() => {
  if (!favorites.value.length) return []
  return allLinks.filter(l => favorites.value.includes(l.url))
})

provide('favorites', favorites)
provide('toggleFavorite', toggleFavorite)
provide('isFavorite', isFavorite)

/* ========== Recent Visits ========== */
const RECENT_KEY = 'ba-recent-visits'
const recentVisits = ref(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'))

function addRecentVisit(link) {
  const visits = recentVisits.value.filter(v => v.url !== link.url)
  visits.unshift({ url: link.url, name: link.name, icon: link.icon, time: Date.now() })
  if (visits.length > 10) visits.pop()
  recentVisits.value = visits
  localStorage.setItem(RECENT_KEY, JSON.stringify(visits))
  debouncedSave()
}

provide('recentVisits', recentVisits)
provide('addRecentVisit', addRecentVisit)

/* ========== Click Stats ========== */
const STATS_KEY = 'ba-click-stats'
const clickStats = ref(JSON.parse(localStorage.getItem(STATS_KEY) || '{}'))

function recordClick(url) {
  clickStats.value[url] = (clickStats.value[url] || 0) + 1
  localStorage.setItem(STATS_KEY, JSON.stringify(clickStats.value))
  debouncedSave()
}

function getClickCount(url) {
  return clickStats.value[url] || 0
}

function isHotLink(url) {
  return (clickStats.value[url] || 0) >= 5
}

provide('clickStats', clickStats)
provide('recordClick', recordClick)
provide('getClickCount', getClickCount)
provide('isHotLink', isHotLink)

/* ========== Keyboard Shortcuts ========== */
function onKeydown(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  if (e.key === 'Escape') {
    if (showAuth.value) closeAuth()
    else if (showTools.value) closeTools()
    else if (showSettings.value) closeSettings()
    else if (showAbout.value) closeAbout()
    else if (showChangelog.value) closeChangelog()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // If "remember me" was not checked last time, sign out immediately
  const remember = localStorage.getItem('ba-remember-me')
  if (remember === '0') {
    localStorage.removeItem('ba-remember-me')
    const { supabase } = useSupabase()
    supabase?.auth.signOut()
  }
})
onUnmounted(() => { document.removeEventListener('keydown', onKeydown) })
</script>

<template>
  <!-- Video background -->
  <VideoBg />

  <!-- BASPark spark effect -->
  <MouseTrail />

  <!-- Disclaimer Modal -->
  <Transition name="disclaimer-fade">
    <div v-if="disclaimerVisible" class="disclaimer-overlay">
      <div class="disclaimer-card glass-card" :class="{ ready: disclaimerReady }">
        <div class="disclaimer-glow"></div>
        <div class="disclaimer-icon" :class="{ ready: disclaimerReady }">⚠️</div>
        <h2 class="disclaimer-title" :class="{ ready: disclaimerReady }">免责声明</h2>
        <div class="disclaimer-body" :class="{ ready: disclaimerReady }">
          <p>本网站大部分内容均为网络搜集整理，仅用于个人学习与交流。</p>
          <p>如有侵权相关内容，请及时联系作者，我们将第一时间予以删除。</p>
          <p class="disclaimer-note">本站不承担因内容引发的任何法律责任。</p>
        </div>
        <button class="btn disclaimer-btn" :class="{ ready: disclaimerReady }" @click="acceptDisclaimer">
          我已知晓，进入网站
        </button>
      </div>
    </div>
  </Transition>

  <!-- Main 16:9 Layout (blocked until disclaimer accepted + authenticated) -->
  <div class="layout" v-if="!disclaimerVisible && isAuthenticated">
    <!-- Mobile sidebar overlay -->
    <Transition name="overlay-fade">
      <div v-if="sidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
    </Transition>
    <SideBar :class="{ open: sidebarOpen }" />
    <div class="content-area">
      <TopBar />
      <main class="main-content">
      <div class="main-inner">
        <h1 class="main-title">
          <span class="title-line">欢迎来到</span>
          <span class="title-line text-gradient">Blue Archive 资源中转站</span>
        </h1>
        <p class="main-desc" v-if="!searchQuery.trim()">收录蔚蓝档案常用站点，点击即可跳转。</p>
        <p class="main-desc" v-else>搜索 "{{ searchQuery }}" — 找到 {{ totalResults }} 个结果</p>

        <!-- Favorites -->
        <div v-if="!searchQuery.trim() && favoriteLinks.length" class="link-category">
          <div class="category-header">
            <span class="category-icon">⭐</span>
            <span class="category-title">我的收藏</span>
            <span class="category-count">{{ favoriteLinks.length }}</span>
          </div>
          <div class="links-grid">
            <a
              v-for="(link, i) in favoriteLinks"
              :key="'fav-'+i"
              :href="link.url"
              target="_blank"
              class="link-card glass-card"
              :class="{ noGlow: !settings.cardGlow }"
              @click="addRecentVisit(link); recordClick(link.url)"
            >
              <span class="link-emoji">{{ link.icon }}</span>
              <div class="link-info">
                <span class="link-name">{{ link.name }}</span>
                <span class="link-desc">{{ link.desc }}</span>
              </div>
              <button class="fav-star active" @click.prevent.stop="toggleFavorite(link.url)" title="取消收藏">★</button>
              <svg class="link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
            </a>
          </div>
        </div>

        <!-- Recent Visits -->
        <div v-if="!searchQuery.trim() && recentVisits.length && !favoriteLinks.length" class="recent-section">
          <div class="recent-header">
            <span class="recent-icon">🕐</span>
            <span class="recent-title">最近访问</span>
          </div>
          <div class="recent-list">
            <a
              v-for="v in recentVisits.slice(0, 5)"
              :key="v.url"
              :href="v.url"
              target="_blank"
              class="recent-item"
              @click="recordClick(v.url)"
            >
              <span class="recent-item-icon">{{ v.icon }}</span>
              <span class="recent-item-name">{{ v.name }}</span>
            </a>
          </div>
        </div>

        <template v-if="filteredLinks.length">
          <div v-for="cat in filteredLinks" :key="cat.title" class="link-category">
            <div class="category-header">
              <span class="category-icon">{{ cat.icon }}</span>
              <span class="category-title">{{ cat.title }}</span>
              <span class="category-count">{{ cat.links.length }}</span>
            </div>
            <div class="links-grid">
              <a
                v-for="(link, i) in cat.links"
                :key="i"
                :href="link.url"
                target="_blank"
                class="link-card glass-card"
                :class="{ noGlow: !settings.cardGlow }"
                @click="addRecentVisit(link); recordClick(link.url)"
              >
                <span class="link-emoji">{{ link.icon }}</span>
                <div class="link-info">
                  <span class="link-name">{{ link.name }}
                    <span v-if="isHotLink(link.url)" class="hot-badge">🔥</span>
                  </span>
                  <span class="link-desc">{{ link.desc }}</span>
                </div>
                <button class="fav-star" :class="{ active: isFavorite(link.url) }" @click.prevent.stop="toggleFavorite(link.url)" :title="isFavorite(link.url) ? '取消收藏' : '收藏'">
                  {{ isFavorite(link.url) ? '★' : '☆' }}
                </button>
                <svg class="link-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
              </a>
            </div>
          </div>
        </template>
        <div v-else class="no-results">
          <span class="no-results-icon">🔍</span>
          <span class="no-results-text">未找到 "{{ searchQuery }}" 相关站点</span>
        </div>

        <!-- More features -->
        <div class="more-section" v-if="!searchQuery.trim()">
          <div class="more-card glass-card">
            <span class="more-icon">🚀</span>
            <div class="more-info">
              <span class="more-title">更多功能开发中</span>
              <span class="more-desc">目前还在开发中，老师耐心等待哦~</span>
            </div>
            <span class="more-badge">Coming Soon</span>
          </div>
        </div>
      </div>
    </main>
    </div>
  </div>

  <!-- Auth-required screen (after disclaimer, before login) -->
  <div v-if="!disclaimerVisible && !isAuthenticated" class="auth-required-screen">
    <div class="auth-required-card glass-card">
      <div class="auth-required-icon">🔐</div>
      <h2 class="auth-required-title">请先登录</h2>
      <p class="auth-required-desc">登录后即可使用本站所有功能，数据将在云端保存</p>
      <button class="btn auth-required-btn" @click="showAuth = true">登录 / 注册</button>
    </div>
  </div>

  <!-- Spine Character -->
  <SpinePlayer v-if="!disclaimerVisible && isAuthenticated" :character="currentCharacter" @toggle="toggleCharacter" />

  <!-- Settings Panel -->
  <SettingsPanel v-if="!disclaimerVisible && isAuthenticated" />

  <!-- About Panel -->
  <AboutPanel v-if="!disclaimerVisible && isAuthenticated" />

  <!-- Changelog Panel -->
  <ChangelogPanel v-if="!disclaimerVisible && isAuthenticated" />

  <!-- Tools Panel -->
  <ToolsPanel v-if="!disclaimerVisible && isAuthenticated" />

  <!-- Auth Modal (always available after disclaimer) -->
  <AuthModal v-if="!disclaimerVisible" />

  <!-- Onboarding Guide -->
  <OnboardingGuide v-if="!disclaimerVisible && isAuthenticated" />

  <!-- Birthday Confetti -->
  <BirthdayConfetti v-if="!disclaimerVisible && isAuthenticated" />
</template>

<style scoped>
.layout {
  display: flex; width: 100vw; height: 100vh;
  overflow: hidden; position: relative; z-index: 1;
}

.content-area {
  flex: 1; display: flex; flex-direction: column;
  overflow: hidden; position: relative;
}

.main-content {
  flex: 1; display: flex; justify-content: center;
  padding: 24px 48px 40px; overflow-y: auto; overflow-x: hidden;
  margin-top: 56px;
}

.main-inner {
  width: 100%; max-width: 820px;
  padding-top: 20px; padding-bottom: 40px;
}

.main-title { margin-bottom: 12px; text-align: center; }

.title-line { display: block; font-weight: 700; line-height: 1.3; }

.title-line:first-child {
  font-size: 1.4rem; font-weight: 400; color: var(--text-secondary); margin-bottom: 6px;
}

.title-line.text-gradient {
  font-size: 2.4rem;
  background: linear-gradient(135deg, #2dafff, #4dc9f6, #f5c842);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.main-desc { color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 32px; line-height: 1.6; text-align: center; }

/* ========== Categories ========== */
.link-category {
  margin-bottom: 28px;
}

.category-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.1);
}

.category-icon {
  font-size: 1.1rem;
}

.category-title {
  font-size: 1rem; font-weight: 600;
  color: var(--text-primary);
}

.category-count {
  font-size: 0.65rem; padding: 1px 8px; border-radius: 8px;
  background: rgba(18, 138, 250, 0.1); color: #2dafff;
  font-weight: 500;
}

/* ========== Link Cards ========== */
.links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.link-card {
  display: flex; align-items: center; gap: 14px;
  padding: 16px 18px; text-decoration: none; color: var(--text-primary);
  cursor: pointer; position: relative;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
}

.link-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(45, 175, 255, 0.15), 0 0 20px rgba(45, 175, 255, 0.08);
  border-color: rgba(45, 175, 255, 0.3);
}

.link-card:active {
  transform: translateY(-2px) scale(0.98);
  transition-duration: 0.1s;
}

.link-card.noGlow:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

.link-card.noGlow:active {
  transform: translateY(-1px) scale(0.98);
}

.link-emoji {
  font-size: 1.8rem; flex-shrink: 0;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: rgba(45, 175, 255, 0.06);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.link-card:hover .link-emoji {
  transform: scale(1.15) rotate(-5deg);
}

.link-info {
  flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;
}

.link-name {
  font-size: 0.92rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.link-desc {
  font-size: 0.72rem; color: var(--text-secondary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.link-arrow {
  flex-shrink: 0; color: var(--text-secondary); opacity: 0.4;
  transition: opacity 0.2s, transform 0.3s;
}

.link-card:hover .link-arrow {
  opacity: 1; color: #2dafff;
  transform: translate(2px, -2px);
}

/* No results */
.no-results {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px; color: var(--text-secondary);
}

.no-results-icon { font-size: 2.5rem; opacity: 0.5; }
.no-results-text { font-size: 0.92rem; }

/* More section */
.more-section {
  margin-top: 20px;
}

.more-card {
  display: flex; align-items: center; gap: 14px;
  padding: 18px 20px; cursor: default; position: relative;
  border: 1px dashed rgba(45, 175, 255, 0.2) !important;
  background: rgba(45, 175, 255, 0.03) !important;
}

.more-icon {
  font-size: 1.6rem; flex-shrink: 0;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  background: rgba(45, 175, 255, 0.06);
}

.more-info {
  flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0;
}

.more-title {
  font-size: 0.92rem; font-weight: 600;
  color: var(--text-primary);
}

.more-desc {
  font-size: 0.75rem; color: var(--text-secondary);
}

.more-badge {
  font-size: 0.62rem; padding: 3px 10px; border-radius: 10px;
  background: rgba(245, 200, 66, 0.12); color: #f5c842;
  border: 1px solid rgba(245, 200, 66, 0.2);
  flex-shrink: 0;
  font-weight: 500;
}

/* Auth required screen */
.auth-required-screen {
  position: fixed; inset: 0; z-index: 50;
  display: flex; align-items: center; justify-content: center;
  background: rgba(6, 12, 24, 0.85);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}

.auth-required-card {
  text-align: center; padding: 40px 36px;
  max-width: 380px; width: 92%;
  animation: authCardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes authCardIn {
  from { opacity: 0; transform: scale(0.9) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.auth-required-icon {
  font-size: 2.5rem; margin-bottom: 16px;
}

.auth-required-title {
  font-size: 1.3rem; font-weight: 700; margin-bottom: 10px;
  background: linear-gradient(135deg, #2dafff, #4dc9f6);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}

.auth-required-desc {
  font-size: 0.85rem; color: var(--text-secondary);
  line-height: 1.6; margin-bottom: 24px;
}

.auth-required-btn {
  padding: 11px 36px; font-size: 0.95rem; border-radius: 50px;
  background: linear-gradient(135deg, #2dafff, #4dc9f6) !important;
}

.auth-required-btn:hover {
  box-shadow: 0 4px 24px rgba(45, 175, 255, 0.5) !important;
}

/* Disclaimer */
.disclaimer-overlay {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
}

.disclaimer-card {
  text-align: center; padding: 44px 36px 36px !important;
  max-width: 440px; width: 92%;
  border: 1px solid rgba(245, 200, 66, 0.15) !important;
  position: relative; overflow: hidden;
  transform: scale(0.85) translateY(24px);
  opacity: 0;
  transition: transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease;
}

.disclaimer-card.ready {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.disclaimer-glow {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  width: 200px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245, 200, 66, 0.15), transparent 70%);
  pointer-events: none;
}

.disclaimer-icon {
  font-size: 3rem; margin-bottom: 16px;
  display: inline-block; opacity: 0; transform: scale(0.2) rotate(-20deg);
  transition: opacity 0.4s ease 0.25s, transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s;
}

.disclaimer-icon.ready { opacity: 1; transform: scale(1) rotate(0deg); }

.disclaimer-title {
  font-size: 1.5rem; font-weight: 700; margin-bottom: 20px;
  background: linear-gradient(135deg, #f5c842, #ff9ecd);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.4s ease 0.35s, transform 0.4s ease 0.35s;
}

.disclaimer-title.ready { opacity: 1; transform: translateY(0); }

.disclaimer-body {
  margin-bottom: 28px;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.4s ease 0.45s, transform 0.4s ease 0.45s;
}

.disclaimer-body.ready { opacity: 1; transform: translateY(0); }
.disclaimer-body p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.8; margin-bottom: 8px; }
.disclaimer-note { font-size: 0.8rem !important; opacity: 0.6; margin-top: 8px; }

.disclaimer-btn {
  padding: 12px 36px; font-size: 1rem; border-radius: 50px;
  background: linear-gradient(135deg, #2dafff, #4dc9f6) !important;
  opacity: 0; transform: translateY(12px);
  transition: opacity 0.4s ease 0.55s, transform 0.4s ease 0.55s, box-shadow 0.2s;
}

.disclaimer-btn.ready { opacity: 1; transform: translateY(0); }
.disclaimer-btn:hover { box-shadow: 0 4px 24px rgba(45, 175, 255, 0.5) !important; }

/* Disclaimer overlay fade */
.disclaimer-fade-enter-active { transition: opacity 0.5s ease; }
.disclaimer-fade-leave-active { transition: opacity 0.45s ease; }
.disclaimer-fade-enter-from, .disclaimer-fade-leave-to { opacity: 0; }

/* Sidebar overlay (mobile) */
.sidebar-overlay {
  position: fixed; inset: 0; z-index: 99;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
}

.overlay-fade-enter-active { transition: opacity 0.3s ease; }
.overlay-fade-leave-active { transition: opacity 0.25s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

/* Favorite star */
.fav-star {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-secondary);
  opacity: 0.3;
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px;
  line-height: 1;
}

.fav-star:hover {
  opacity: 1;
  transform: scale(1.2);
}

.fav-star.active {
  color: #f5c842;
  opacity: 1;
  text-shadow: 0 0 8px rgba(245, 200, 66, 0.4);
}

/* Hot badge */
.hot-badge {
  font-size: 0.65rem;
  margin-left: 4px;
  vertical-align: middle;
}

/* Recent visits */
.recent-section {
  margin-bottom: 20px;
}

.recent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.1);
}

.recent-icon { font-size: 1rem; }
.recent-title { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }

.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(45, 175, 255, 0.08);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 0.78rem;
  transition: all 0.2s;
  cursor: pointer;
}

.recent-item:hover {
  background: rgba(45, 175, 255, 0.08);
  border-color: rgba(45, 175, 255, 0.2);
  transform: translateY(-2px);
}

.recent-item-icon { font-size: 0.9rem; }
.recent-item-name { font-size: 0.75rem; }

@media (max-width: 900px) {
  .links-grid { grid-template-columns: 1fr; }
  .title-line.text-gradient { font-size: 1.8rem; }
  .main-content { padding: 16px 16px 72px; margin-top: 48px; }
  .main-inner { padding-top: 12px; padding-bottom: 24px; }
}

</style>
