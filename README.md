# Blue Archive 资源中转站

一个为蔚蓝档案（Blue Archive）玩家打造的常用站点导航页，收录了数据查询、实用工具、剧情社区等常用站点，并提供丰富的互动功能。

## 功能一览

**站点导航**
- 收录 15 个蔚蓝档案常用站点，分为「数据查询 & 图鉴」「实用工具」「剧情 & 社区」三大类
- 站点收藏、最近访问记录、热门站点标记
- 关键词搜索快速过滤

**小工具**
- 十连抽卡模拟器（含保底机制与抽卡记录）
- 角色生日日历（194 位学生数据）
- 每日随机语录、学生随机推荐、活动倒计时

**个性化**
- 鼠标拖尾粒子特效 & 点击特效
- 卡片光晕、侧栏透明度等可调设置
- 背景音乐播放器（多首蔚蓝档案原声）

**角色互动**
- Spine 2D 骨骼动画角色（阿罗娜 / 普拉娜）
- 眼球跟踪、眨眼动画、语音播放
- 角色一键切换

**账号系统**
- 邮箱注册 / 登录
- 用户数据云端同步（收藏、设置、抽卡记录等）
- 跨设备数据同步
- 新手引导教程

**其他**
- 全屏视频背景
- 实时天气（Open-Meteo）
- 时钟 & 停留时长统计
- 生日彩纸庆祝动画
- 移动端适配（底部导航栏 + 侧栏抽屉）

## 本地运行

```bash
# 安装依赖
npm install

# 创建 .env 文件，填入 Supabase 凭据
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 启动开发服务器
npm run dev
```

## 部署

```bash
# 构建生产版本
npm run build
```

将 `dist` 目录部署到 Netlify、Vercel 或 Cloudflare Pages，并在平台后台设置以下环境变量：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名公钥 |

## 致谢

本站参考或使用了以下开源项目：

- [Bluearchive-logo](https://github.com/nulla2011/Bluearchive-logo) — BA 风格标题生成器
- [bluearchive.cafe-frontend](https://github.com/bluearchive-cafe/bluearchive.cafe-frontend) — 视频背景、UI 设计与角色系统
- [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) — 侧栏头像、音乐播放器与主题配色
- [BASPark](https://github.com/DoomVoss/BASPark) — 鼠标拖尾粒子特效
- [Spine Runtimes](https://github.com/EsotericSoftware/spine-runtimes) — 2D 骨骼动画引擎
- [Open-Meteo](https://open-meteo.com/) — 免费开源天气 API
- [SchaleDB](https://schaledb.com/) — 学生数据与生日信息
- [RoGSans / GlowSans](https://github.com/CeriseBouquet/static) — BA 风格中文字体

## 免责声明

本站为无任何盈利意图的同人站点，所有内容均来源于网络公开资料，仅用于个人学习与交流。如有侵权相关内容，请及时联系删除。
