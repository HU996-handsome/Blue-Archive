<script setup>
import { inject } from 'vue'

const searchQuery = inject('searchQuery')
const showSettings = inject('showSettings')
const showAbout = inject('showAbout')
const toggleSettings = inject('toggleSettings')
const toggleAbout = inject('toggleAbout')
const guideRestart = inject('guideRestart')
const showChangelog = inject('showChangelog')
const toggleChangelog = inject('toggleChangelog')
const toggleSidebar = inject('toggleSidebar')
const showTools = inject('showTools')
const toggleTools = inject('toggleTools')
const user = inject('user')
const isAuthenticated = inject('isAuthenticated')
const toggleAuth = inject('toggleAuth')
const handleLogout = inject('handleLogout')

const menuItems = [
  { label: '首页', id: 'home' },
  { label: '小工具', id: 'tools' },
  { label: '公告', id: 'changelog' },
  { label: '设置', id: 'settings' },
  { label: '关于', id: 'about' },
  { label: '彩蛋', id: 'easter' },
]

const itemIcons = {
  home: '🏠',
  tools: '🧰',
  changelog: '📢',
  settings: '⚙️',
  about: 'ℹ️',
  easter: '🥚',
}

function isActive(item) {
  if (item.id === 'settings') return showSettings.value
  if (item.id === 'about') return showAbout.value
  if (item.id === 'changelog') return showChangelog.value
  if (item.id === 'tools') return showTools.value
  return false
}

function handleClick(item) {
  if (item.id === 'settings') toggleSettings()
  else if (item.id === 'about') toggleAbout()
  else if (item.id === 'changelog') toggleChangelog()
  else if (item.id === 'tools') toggleTools()
  else if (item.id === 'guide') guideRestart.value++
  else if (item.id === 'easter') window.open('https://www.bilibili.com/video/BV1UT42167xb', '_blank')
  else document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <header class="topbar">
    <nav class="topbar-nav">
      <button class="hamburger" @click="toggleSidebar">
        <span></span><span></span><span></span>
      </button>
      <span class="topbar-logo">BA中转站</span>
      <ul class="topbar-menu">
        <li v-for="item in menuItems" :key="item.id">
          <a
            class="topbar-link"
            :class="{ active: isActive(item) }"
            @click.prevent="handleClick(item)"
          >{{ item.label }}</a>
        </li>
      </ul>
      <div class="topbar-search">
        <span class="material-symbols-outlined topbar-search-icon">search</span>
        <input v-model="searchQuery" class="topbar-search-input" placeholder="搜索站点..." />
      </div>
      <div class="topbar-user">
        <template v-if="isAuthenticated">
          <div class="user-menu">
            <span class="user-email">{{ user?.email?.split('@')[0] }}</span>
            <button class="user-logout" @click="handleLogout" title="退出登录">退出</button>
          </div>
        </template>
        <button v-else class="login-btn" @click="toggleAuth">
          <span class="login-icon">🔑</span>
          <span class="login-text">登录</span>
        </button>
      </div>
    </nav>
  </header>

  <!-- Mobile bottom nav -->
  <nav class="bottom-nav">
    <a v-for="item in menuItems" :key="item.id"
      class="bottom-nav-item"
      :class="{ active: isActive(item) }"
      @click.prevent="handleClick(item)"
    >
      <span class="bottom-nav-icon">{{ itemIcons[item.id] }}</span>
      <span class="bottom-nav-label">{{ item.label }}</span>
    </a>
  </nav>
</template>

<style scoped>
.topbar {
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  z-index: 50;
  height: 56px;
}

.topbar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 28px;
  border-radius: 0 0 24px 24px;
  border-bottom: 2px solid rgba(18, 138, 250, 0.35);
  border-left: 1px solid rgba(18, 138, 250, 0.15);
  border-right: 1px solid rgba(18, 138, 250, 0.15);
  background:
    repeating-linear-gradient(60deg, rgba(18, 138, 250, 0.03), transparent 35px),
    repeating-linear-gradient(180deg, transparent, rgba(18, 138, 250, 0.02) 30px),
    repeating-linear-gradient(120deg, rgba(18, 138, 250, 0.02), transparent 46px),
    rgba(8, 16, 32, 0.7);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  box-shadow: 0 4px 16px rgba(18, 138, 250, 0.1);
}

.topbar-logo {
  font-size: 1rem;
  font-weight: 800;
  color: #128afa;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(18, 138, 250, 0.5);
  cursor: default;
  user-select: none;
  flex-shrink: 0;
}

.topbar-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
}

.topbar-link {
  display: block;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
}

.topbar-link:hover {
  color: #ffe401;
  background: rgba(18, 138, 250, 0.08);
  transform: translateY(-1px);
  text-shadow: 0 0 8px rgba(255, 228, 1, 0.3);
}

.topbar-link.active {
  color: #128afa;
  background: rgba(18, 138, 250, 0.12);
}

.topbar-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 3px;
  background: #128afa;
  box-shadow: 0 0 8px rgba(18, 138, 250, 0.6);
}

.topbar-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(18, 138, 250, 0.12);
  transition: all 0.2s;
  min-width: 180px;
}

.topbar-search:focus-within {
  border-color: rgba(18, 138, 250, 0.4);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 0 10px rgba(18, 138, 250, 0.12);
}

.topbar-search-icon {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0.5;
  flex-shrink: 0;
}

.topbar-search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.8rem;
  min-width: 0;
}

.topbar-search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.4;
}

/* User / Login */
.topbar-user {
  flex-shrink: 0;
  margin-left: 8px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid rgba(45, 175, 255, 0.2);
  background: rgba(45, 175, 255, 0.08);
  color: #2dafff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: rgba(45, 175, 255, 0.15);
  border-color: rgba(45, 175, 255, 0.4);
  box-shadow: 0 0 10px rgba(45, 175, 255, 0.15);
}

.login-icon { font-size: 0.85rem; }

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}


.user-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 400;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-logout {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 2px 6px;
  transition: all 0.2s;
  opacity: 0.4;
  letter-spacing: 1px;
}

.user-logout:hover {
  opacity: 1;
  color: #ff6b6b;
}

/* Hamburger button */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 32px; height: 32px;
  background: none; border: none; cursor: pointer;
  padding: 4px; flex-shrink: 0;
}

.hamburger span {
  display: block; width: 18px; height: 2px;
  background: var(--text-primary);
  border-radius: 2px;
  transition: all 0.2s;
}

.hamburger:hover span {
  background: #2dafff;
}

/* Bottom nav — hidden on desktop */
.bottom-nav {
  display: none;
}

@media (max-width: 900px) {
  .topbar { left: 0; }
  .topbar-nav { border-radius: 0; padding: 0 10px; gap: 6px; }

  .hamburger { display: flex; }

  .topbar-logo { font-size: 0.85rem; letter-spacing: 1px; }

  /* hide top menu on mobile */
  .topbar-menu { display: none; }

  .topbar-search {
    min-width: 0;
    flex: 1;
    padding: 0 8px;
    height: 32px;
  }

  .topbar-search-input { font-size: 0.72rem; }

  .login-text { display: none; }
  .login-btn { padding: 6px 8px; }
  .user-email { max-width: 48px; font-size: 0.68rem; }

  /* bottom nav */
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 90;
    height: 56px;
    background: rgba(8, 16, 32, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(18, 138, 250, 0.2);
    justify-content: space-around;
    align-items: center;
    padding: 0 4px;
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    border-radius: 10px;
    text-decoration: none;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;
  }

  .bottom-nav-item:active {
    transform: scale(0.92);
  }

  .bottom-nav-item.active {
    color: #2dafff;
    background: rgba(18, 138, 250, 0.1);
  }

  .bottom-nav-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .bottom-nav-label {
    font-size: 0.6rem;
    font-weight: 500;
  }
}
</style>
