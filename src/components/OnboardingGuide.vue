<script setup>
import { ref, computed, onMounted, nextTick, watch, inject } from 'vue'

const active = ref(false)
const currentStep = ref(0)
const tooltipStyle = ref({})
const spotStyle = ref({})
const guideRestart = inject('guideRestart')
const user = inject('user')
const needsOnboarding = inject('needsOnboarding')
const onOnboardingComplete = inject('onOnboardingComplete')

// Per-user storage key
const STORAGE_KEY = computed(() => {
  const uid = user.value?.id
  return uid ? `ba-onboarding-done-${uid}` : 'ba-onboarding-done-guest'
})

const visibleSteps = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth <= 900) {
    const sidebarTargets = ['.sidebar-logo', '.avatar-section', '.clock-display', '.weather-section', '.birthday-section']
    return steps.filter(s => !sidebarTargets.includes(s.target))
  }
  return steps
})

const steps = [
  {
    target: '.sidebar-logo',
    title: '各位老师，欢迎来到中转站！',
    desc: '这里是 Blue Archive 资源中转站，一个为蔚蓝档案玩家打造的常用站点导航页。背景视频来自 bluearchive.cafe 开源项目，logo 使用了 BA 经典风格渲染。接下来带各位老师快速了解一下本站的功能~',
    pos: 'right',
  },
  {
    target: '.avatar-section',
    title: '阿罗娜 & 音乐',
    desc: '这里是阿罗娜的头像区域。下方是音乐播放器，收录了多首蔚蓝档案经典原声，支持上下首切换、进度拖拽和音量调节~',
    pos: 'right',
  },
  {
    target: '.clock-display',
    title: '时间 & 停留时长',
    desc: '实时显示当前时间与日期。下方还会记录你在中转站停留了多久，看看谁待得最久！',
    pos: 'right',
  },
  {
    target: '.weather-section',
    title: '实时天气',
    desc: '允许浏览器定位权限后，这里会显示实时天气信息，包括温度、体感、湿度和风速。数据来自 Open-Meteo，完全免费且无需注册。',
    pos: 'right',
  },
  {
    target: '.birthday-section',
    title: '学生生日日历',
    desc: '收录了 194 位学生的生日数据。每天会显示今天过生日的学生（金色高亮），以及未来 30 天内的生日倒计时。搜索框可以查询任意学生的生日，不要忘了给学生过生日哦~',
    pos: 'right',
  },
  {
    target: '.topbar-search',
    title: '搜索站点',
    desc: '在顶部搜索栏输入关键词即可快速过滤网站卡片。比如搜「蔚蓝」会显示所有相关站点，搜「wiki」能找到 Wiki 类站点。支持按名称和描述模糊搜索~',
    pos: 'bottom',
  },
  {
    target: '.link-category',
    title: '分类资源站点',
    desc: '主页收录了 15 个蔚蓝档案常用站点，分为「数据查询 & 图鉴」「实用工具」「剧情 & 社区」三大类。鼠标悬停有弹跳效果，点击即可跳转。下方还有更多功能开发中，敬请期待~',
    pos: 'left',
  },
  {
    target: '.topbar-menu',
    title: '菜单导航',
    desc: '顶部菜单栏包含首页、小工具、公告、设置、关于和彩蛋。小工具里有抽卡模拟器、生日日历等趣味功能；公告查看更新日志；设置中可调节鼠标拖尾、卡片光晕、侧栏透明度等；关于页面有声明和致谢；彩蛋有惊喜哦~',
    pos: 'bottom',
  },
  {
    target: '.char-toggle',
    title: '角色切换',
    desc: '点击这个小按钮可以在阿罗娜（☀️）和普拉娜（🌙）之间切换，两个角色都有各自的语音和互动哦~',
    pos: 'right',
  },
]

function updatePosition() {
  const step = visibleSteps.value[currentStep.value]
  if (!step) return
  const el = document.querySelector(step.target)
  if (!el) return

  const rect = el.getBoundingClientRect()
  const gap = 16

  // spotlight
  spotStyle.value = {
    top: (rect.top - 8) + 'px',
    left: (rect.left - 8) + 'px',
    width: (rect.width + 16) + 'px',
    height: (rect.height + 16) + 'px',
  }

  // tooltip position
  const tooltipW = 300
  if (step.pos === 'right') {
    const left = rect.right + gap
    tooltipStyle.value = {
      top: Math.max(20, Math.min(rect.top + rect.height / 2 - 60, window.innerHeight - 160)) + 'px',
      left: Math.min(left, window.innerWidth - tooltipW - 16) + 'px',
    }
  } else if (step.pos === 'left') {
    tooltipStyle.value = {
      top: Math.max(20, Math.min(rect.top + rect.height / 2 - 60, window.innerHeight - 160)) + 'px',
      right: (window.innerWidth - rect.left + gap) + 'px',
      left: 'auto',
    }
  } else if (step.pos === 'bottom') {
    tooltipStyle.value = {
      top: Math.min(rect.bottom + gap, window.innerHeight - 160) + 'px',
      left: Math.max(16, Math.min(rect.left + rect.width / 2 - 150, window.innerWidth - tooltipW - 16)) + 'px',
    }
  }
}

function next() {
  if (currentStep.value < visibleSteps.value.length - 1) {
    currentStep.value++
    nextTick(updatePosition)
  } else {
    finish()
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
    nextTick(updatePosition)
  }
}

function skip() { finish() }

function finish() {
  active.value = false
  localStorage.setItem(STORAGE_KEY.value, 'true')
  onOnboardingComplete?.()
}

function startGuide() {
  localStorage.removeItem(STORAGE_KEY.value)
  currentStep.value = 0
  active.value = true
  nextTick(updatePosition)
}

onMounted(() => {
  // If parent says onboarding is needed (fresh login), start it
  if (needsOnboarding?.value) {
    setTimeout(() => {
      active.value = true
      nextTick(updatePosition)
    }, 1200)
    return
  }
  // Otherwise check per-user storage
  if (localStorage.getItem(STORAGE_KEY.value) === 'true') return
  if (window.innerWidth <= 900) return
  setTimeout(() => {
    active.value = true
    nextTick(updatePosition)
  }, 1800)
})

watch(currentStep, () => { nextTick(updatePosition) })
watch(guideRestart, (val) => { if (val > 0 && window.innerWidth > 900) startGuide() })
watch(needsOnboarding, (val) => {
  if (val && window.innerWidth > 900) {
    setTimeout(() => {
      active.value = true
      nextTick(updatePosition)
    }, 800)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="guide">
      <div v-if="active" class="guide-overlay">
        <!-- Spotlight cutout -->
        <div class="guide-spotlight" :style="spotStyle"></div>

        <!-- Tooltip -->
        <div class="guide-tooltip glass-card" :style="tooltipStyle">
          <div class="guide-step-badge">{{ currentStep + 1 }} / {{ visibleSteps.length }}</div>
          <div class="guide-avatar">✦</div>
          <h3 class="guide-title">{{ visibleSteps[currentStep].title }}</h3>
          <p class="guide-desc">{{ visibleSteps[currentStep].desc }}</p>
          <div class="guide-actions">
            <button class="btn guide-skip" @click="skip">跳过</button>
            <button class="btn guide-prev" v-if="currentStep > 0" @click="prev">上一步</button>
            <button class="btn guide-next" @click="next">
              {{ currentStep < visibleSteps.length - 1 ? '下一步' : '开始探索' }}
            </button>
          </div>
          <!-- arrow -->
          <div class="guide-arrow" :class="visibleSteps[currentStep].pos"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* global — not scoped, since teleported to body */
.guide-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px);
}

.guide-spotlight {
  position: fixed;
  border-radius: 14px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);
  transition: all 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
  pointer-events: none;
  z-index: 3001;
}

.guide-tooltip {
  position: fixed;
  width: 300px;
  padding: 24px !important;
  z-index: 3002;
  animation: tooltipIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: top 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), left 0.45s cubic-bezier(0.34, 1.2, 0.64, 1), right 0.45s cubic-bezier(0.34, 1.2, 0.64, 1);
  background: rgba(11, 26, 46, 0.95) !important;
  border: 1px solid rgba(45, 175, 255, 0.2) !important;
}

@keyframes tooltipIn {
  from { opacity: 0; transform: scale(0.9) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.guide-step-badge {
  position: absolute; top: 12px; right: 14px;
  font-size: 0.68rem; color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px; border-radius: 8px;
}

.guide-avatar {
  font-size: 1.6rem; margin-bottom: 10px;
  background: linear-gradient(135deg, #2dafff, #f5c842);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.guide-title {
  font-size: 1.05rem; font-weight: 600;
  margin-bottom: 8px; color: var(--text-primary);
}

.guide-desc {
  font-size: 0.82rem; color: var(--text-secondary);
  line-height: 1.7; margin-bottom: 18px;
}

.guide-actions {
  display: flex; gap: 10px; justify-content: flex-end;
}

.guide-skip {
  background: rgba(255, 255, 255, 0.06) !important;
  font-size: 0.82rem !important; padding: 7px 16px !important;
}

.guide-skip:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.guide-prev {
  background: rgba(255, 255, 255, 0.06) !important;
  font-size: 0.82rem !important; padding: 7px 16px !important;
}

.guide-prev:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.guide-next {
  font-size: 0.82rem !important; padding: 7px 20px !important;
  background: linear-gradient(135deg, #2dafff, #4dc9f6) !important;
}

.guide-next:hover {
  box-shadow: 0 4px 16px rgba(45, 175, 255, 0.4) !important;
}

/* Arrow */
.guide-arrow {
  position: absolute;
  width: 12px; height: 12px;
  background: rgba(11, 26, 46, 0.95);
  border: 1px solid rgba(45, 175, 255, 0.2);
  transform: rotate(45deg);
}

.guide-arrow.right {
  left: -7px; top: 50%; margin-top: -6px;
  border-right: none; border-top: none;
}

.guide-arrow.left {
  right: -7px; top: 50%; margin-top: -6px;
  border-left: none; border-bottom: none;
}

.guide-arrow.bottom {
  top: -7px; left: 50%; margin-left: -6px;
  border-bottom: none; border-right: none;
}

.guide-arrow.top {
  bottom: -7px; left: 50%; margin-left: -6px;
  border-top: none; border-left: none;
}

/* Transition */
.guide-enter-active { transition: opacity 0.4s ease; }
.guide-leave-active { transition: opacity 0.3s ease; }
.guide-enter-from, .guide-leave-to { opacity: 0; }

/* Mobile */
@media (max-width: 900px) {
  .guide-tooltip {
    width: calc(100vw - 32px);
    max-width: 300px;
    padding: 18px !important;
  }
  .guide-title { font-size: 0.95rem; }
  .guide-desc { font-size: 0.78rem; line-height: 1.6; }
  .guide-actions { gap: 8px; }
  .guide-next { padding: 6px 16px !important; font-size: 0.78rem !important; }
  .guide-skip, .guide-prev { padding: 6px 12px !important; font-size: 0.78rem !important; }
}
</style>
