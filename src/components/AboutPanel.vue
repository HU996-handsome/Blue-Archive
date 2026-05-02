<script setup>
import { inject } from 'vue'

const showAbout = inject('showAbout')
const closeAbout = inject('closeAbout')

const credits = [
  {
    name: 'Bluearchive-logo',
    desc: 'BA 风格标题生成器',
    detail: '参考了该项目的 Canvas 渲染逻辑，使用 RoGSanSrfStd-Bd 字体、光环与十字架素材，实现 BA 风格的 Logo 绘制，包括空心三角形裁切和渐变文字效果。',
    url: 'https://github.com/nulla2011/Bluearchive-logo',
    icon: '🎨',
  },
  {
    name: 'bluearchive.cafe-frontend',
    desc: '视频背景、UI 设计与角色系统',
    detail: '借鉴了该项目的全屏视频背景方案、毛玻璃 UI 风格、三角形几何背景纹理、金色 hover 高亮、蓝色选中指示器等设计语言。Spine 角色系统（阿罗娜/普拉娜的眼球跟踪、眨眼、语音播放）也来源于此。',
    url: 'https://github.com/bluearchive-cafe/bluearchive.cafe-frontend',
    icon: '☕',
  },
  {
    name: 'vitepress-theme-bluearchive',
    desc: '侧栏头像、音乐播放器与主题配色',
    detail: '参考了该项目的头像组件、BGM 背景音乐播放器实现，以及 BA 主题的配色方案（#128afa 蓝、#ffe401 金）和侧栏布局设计。',
    url: 'https://github.com/Alittfre/vitepress-theme-bluearchive',
    icon: '🎵',
  },
  {
    name: 'BASPark',
    desc: '鼠标拖尾粒子特效',
    detail: '将该项目的 WPF/C# 粒子系统移植为 Web Canvas JavaScript 实现，保留了 BA 风格的粒子颜色、衰减曲线和点击爆发效果。',
    url: 'https://github.com/DoomVoss/BASPark',
    icon: '✨',
  },
  {
    name: 'Spine Runtimes',
    desc: '2D 骨骼动画引擎',
    detail: '使用 Spine 官方提供的 spine-player.js 运行时加载 .skel 骨骼文件和 .atlas 图集，实现角色的实时渲染、动画混合和 WebGL 抗锯齿。',
    url: 'https://github.com/EsotericSoftware/spine-runtimes',
    icon: '🦴',
  },
  {
    name: 'Open-Meteo',
    desc: '免费开源天气 API',
    detail: '提供实时温度、体感温度、湿度、风速和天气代码等数据，无需注册和 API Key，支持全球定位。',
    url: 'https://open-meteo.com/',
    icon: '🌤️',
  },
  {
    name: 'SchaleDB',
    desc: '学生数据与生日信息',
    detail: '提供蔚蓝档案学生数据库，本站的生日日历、抽卡模拟器等功能使用了 SchaleDB 的学生数据（194 位学生）。',
    url: 'https://schaledb.com/',
    icon: '📊',
  },
  {
    name: 'RoGSans / GlowSans',
    desc: 'BA 风格中文字体',
    detail: 'RoGSans 用于 Logo 标题渲染，GlowSans 用于界面正文显示，均为开源中文字体。',
    url: 'https://github.com/CeriseBouquet/static',
    icon: '🔤',
  },
]
</script>

<template>
  <Transition name="panel">
    <div v-if="showAbout" class="about-overlay" @click.self="closeAbout()">
      <div class="about-panel glass">
        <div class="about-header">
          <h2 class="about-title">关于本站</h2>
          <button class="close-btn" @click="closeAbout()">✕</button>
        </div>

        <div class="about-body">
          <!-- 声明 -->
          <section class="about-section">
            <h3 class="section-title">关于本站 / About this site</h3>
            <p class="about-text">
              本站为<strong>无任何盈利意图、形式和行为</strong>的同人站点，旨在为《蔚蓝档案（又译：碧蓝档案）》的玩家提供<strong>已公开</strong>常用站点的导航与资源整理。
            </p>
            <p class="about-text about-en">
              We are a non-profit, non-commercial fan site for the game <em>"Blue Archive (ブルーアーカイブ)"</em>. We aim to provide players with a curated collection of publicly available community resources and navigation links.
            </p>
          </section>

          <!-- 联系 -->
          <section class="about-section">
            <h3 class="section-title">联系我们 / Contact</h3>
            <p class="about-text">
              如您有任何疑问、意见或建议，或对本站收录的内容存在疑义，欢迎随时联系我们。我们不是官方，无法也不能对游戏内容进行解释和解答。若您有条件体验游戏内容，我们强烈建议您下载游戏并体验。
            </p>
            <p class="about-text about-en">
              If you have any questions, suggestions, or concerns, please feel free to reach out to us. We are not affiliated with Blue Archive in any form, so please be aware that we cannot answer questions regarding any in-game contents. If you have interest, we strongly recommend you download the game and have a try.
            </p>
          </section>

          <!-- 致谢 -->
          <section class="about-section">
            <h3 class="section-title">致谢 / Credits</h3>
            <p class="about-text">本站的制作过程中参考或使用了以下开源项目与资源：</p>
            <div class="credits-grid">
              <a
                v-for="c in credits"
                :key="c.name"
                :href="c.url"
                target="_blank"
                class="credit-card"
              >
                <div class="credit-icon">{{ c.icon }}</div>
                <div class="credit-info">
                  <div class="credit-name">{{ c.name }}</div>
                  <div class="credit-desc">{{ c.desc }}</div>
                  <div class="credit-detail">{{ c.detail }}</div>
                </div>
              </a>
            </div>
          </section>

          <!-- 免责 -->
          <section class="about-section" style="border-bottom: none;">
            <h3 class="section-title">免责声明 / Disclaimer</h3>
            <p class="about-text about-small">
              本站所有内容均来源于网络公开资料，仅用于个人学习与交流。如有侵权相关内容，请及时联系，我们将第一时间予以删除。本站不承担因内容引发的任何法律责任。
            </p>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.about-overlay {
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

.about-panel {
  width: 600px;
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

.about-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.about-title {
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

.about-body {
  overflow-y: auto;
  padding: 8px 24px 20px;
}

.about-section {
  padding: 16px 0;
  border-bottom: 1px solid rgba(45, 175, 255, 0.06);
}

.section-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.about-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 6px;
}

.about-text strong {
  color: var(--text-primary);
  font-weight: 600;
}

.about-text.about-en {
  font-size: 0.78rem;
  opacity: 0.7;
  margin-top: 8px;
  font-style: italic;
}

.about-small {
  font-size: 0.75rem !important;
  opacity: 0.6;
}

/* Credits grid */
.credits-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.credit-card {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(45, 175, 255, 0.08);
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
}

.credit-card:hover {
  background: rgba(18, 138, 250, 0.08);
  border-color: rgba(18, 138, 250, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(18, 138, 250, 0.1);
}

.credit-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(18, 138, 250, 0.06);
}

.credit-info {
  flex: 1;
  min-width: 0;
}

.credit-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #2dafff;
  margin-bottom: 2px;
}

.credit-desc {
  font-size: 0.78rem;
  color: var(--text-primary);
  margin-bottom: 6px;
  font-weight: 500;
}

.credit-detail {
  font-size: 0.72rem;
  color: var(--text-secondary);
  line-height: 1.6;
  opacity: 0.8;
}

/* Panel transition */
.panel-enter-active { transition: opacity 0.25s ease; }
.panel-leave-active { transition: opacity 0.2s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-active .about-panel { animation: slideIn 0.3s ease; }
.panel-leave-active .about-panel { animation: slideOut 0.2s ease; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(20px); }
}
</style>
