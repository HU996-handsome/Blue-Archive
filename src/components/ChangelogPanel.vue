<script setup>
import { inject, computed } from 'vue'

const showChangelog = inject('showChangelog')
const closeChangelog = inject('closeChangelog')
const t = inject('t')
const locale = inject('locale')

const defaultChangelogs = [
  {
    date: '2026年5月3日',
    title: '账号系统 & 云端数据同步',
    content: '接入 Supabase 后端，新增邮箱注册/登录功能。每位用户的数据（收藏、抽卡记录、点击统计、设置、头像等）独立存储于云端，换设备也能同步。支持"自动登录"选项、邮箱验证码注册、账号切换。未登录时数据保存在本地，登录后自动合并。',
    tags: ['新功能', '账号', '同步'],
  },
  {
    date: '2026年5月3日',
    title: '小工具面板上线',
    content: '顶栏新增「小工具」菜单，汇聚所有趣味功能：每日随机语录、学生随机推荐、活动倒计时、角色生日日历、抽卡模拟器与抽卡记录。面板从右侧滑入，点击外部区域即可关闭。',
    tags: ['新功能', '工具'],
  },
  {
    date: '2026年5月3日',
    title: '收藏 & 最近访问 & 热门标记',
    content: '网站卡片支持收藏（点击 ☆ 即可），收藏的站点会在主页顶部单独展示。自动记录最近访问的站点，方便快速回访。点击次数达到 5 次的站点会显示 🔥 热门标记。所有数据支持云端同步。',
    tags: ['新功能', '收藏', '统计'],
  },
  {
    date: '2026年5月3日',
    title: '抽卡模拟器 & 记录',
    content: '新增蔚蓝档案风格的十连抽卡模拟器，包含 3★（3%）、2★（18%）、1★（79%）概率和 200 抽保底机制。抽卡结果自动记录，可展开查看历史记录和统计（总抽数、3★/2★ 数量）。',
    tags: ['新功能', '抽卡'],
  },
  {
    date: '2026年5月3日',
    title: '生日日历 & 生日彩纸',
    content: '新增角色生日日历，以月历形式展示 194 位学生的生日，点击日期可查看当天过生日的学生。当天有学生生日时，页面会飘落 BA 主题色彩的庆祝彩纸。支持月份切换和今日快速定位。',
    tags: ['新功能', '生日', '彩蛋'],
  },
  {
    date: '2026年5月3日',
    title: '每日随机语录 & 登录流程优化',
    content: '每日语录改为每次打开页面随机显示，不再固定。新增完整的登录流程：免责申明 → 注册/登录 → 新手教程 → 正常使用。注册后显示"验证邮件已发送"提示。退出登录后自动弹出登录界面，支持账号切换。',
    tags: ['优化', '体验'],
  },
  {
    date: '2026年5月2日',
    title: '历史头像 & BGM 播放器升级',
    content: '设置面板新增历史头像功能，上传过的头像会自动保存（最多 20 张），可随时切换回之前的头像。BGM 播放器升级为多曲目播放列表，支持上下首切换、进度拖拽。收录 8 首蔚蓝档案经典原声。',
    tags: ['新功能', '头像', '音乐'],
  },
  {
    date: '2026年5月2日',
    title: '学生生日系统 & 角色切换',
    content: '侧栏新增学生生日提醒功能，数据来自 SchaleDB（194 位学生）。左下角新增阿罗娜/普拉娜切换功能，两位 AI 助手都有各自的语音和互动动画。同步更新了新手指引教程（共 9 步）。',
    tags: ['新功能', '生日', '角色'],
  },
  {
    date: '2026年5月2日',
    title: '网站初始版本',
    content: 'Blue Archive 资源中转站正式上线。包含 15 个蔚蓝档案常用站点导航、视频背景、鼠标拖尾粒子特效、实时天气、时钟、新手引导等功能。',
    tags: ['初始版本'],
  },
]

const changelogs = computed(() => locale.value !== 'zh' ? t('changelog.entries') : defaultChangelogs)
</script>

<template>
  <Transition name="panel">
    <div v-if="showChangelog" class="changelog-overlay" @click.self="closeChangelog()">
      <div class="changelog-panel glass">
        <div class="changelog-header">
          <h2 class="changelog-title">{{ t('changelog.title') }}</h2>
          <button class="close-btn" @click="closeChangelog()">✕</button>
        </div>
        <div class="changelog-body">
          <div v-for="(log, i) in changelogs" :key="i" class="changelog-item">
            <div class="changelog-date">{{ log.date }}</div>
            <div class="changelog-item-title">{{ log.title }}</div>
            <div class="changelog-content">{{ log.content }}</div>
            <div class="changelog-tags">
              <span v-for="tag in log.tags" :key="tag" class="changelog-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.changelog-overlay {
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

.changelog-panel {
  width: 520px;
  max-width: 92vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(11, 26, 46, 0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(45, 175, 255, 0.15);
}

.changelog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(45, 175, 255, 0.08);
}

.changelog-title {
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

.changelog-body {
  overflow-y: auto;
  padding: 8px 24px 20px;
}

.changelog-item {
  padding: 16px 0;
  border-bottom: 1px solid rgba(45, 175, 255, 0.06);
}

.changelog-item:last-child {
  border-bottom: none;
}

.changelog-date {
  font-size: 0.72rem;
  color: var(--text-secondary);
  opacity: 0.6;
  margin-bottom: 4px;
}

.changelog-item-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.changelog-content {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 10px;
}

.changelog-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.changelog-tag {
  font-size: 0.65rem;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(18, 138, 250, 0.1);
  color: #2dafff;
  border: 1px solid rgba(18, 138, 250, 0.15);
}

/* Panel transition */
.panel-enter-active { transition: opacity 0.25s ease; }
.panel-leave-active { transition: opacity 0.2s ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; }
.panel-enter-active .changelog-panel { animation: slideIn 0.3s ease; }
.panel-leave-active .changelog-panel { animation: slideOut 0.2s ease; }

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(20px); }
}
</style>
