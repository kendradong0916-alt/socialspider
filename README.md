# 🎬 DataSpider - AI 驱动的社媒数据采集平台

一个现代化的 SaaS 应用，使用 AI 和浏览器自动化技术采集社交媒体数据。支持实时展示采集过程、数据标准化和一键导出。

## ✨ 核心特性

- **⚡ 极速采集** - 2-5 秒内获得结果
- **👁️ 实时展示** - 看到浏览器采集的全过程
- **📊 数据标准化** - 统一的 JSON/CSV 格式
- **🎬 实时截图** - 500ms 刷新频率的高清浏览器截图
- **📈 详细统计** - 采集速度、耗时、笔记数等

## 🌍 支持的平台

- 📌 小红书 (Xiaohongshu)
- 🎵 抖音 (Douyin)
- 🐦 微博 (Weibo)

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Skyvern API Key

### 安装和运行

```bash
# 1. 安装依赖
npm install

# 2. 配置 .env.local（已包含模板）
# 编辑 .env.local 填入你的 API Key

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# http://localhost:3000
```

## 📂 项目结构

```
cowork test/
├── app/
│   ├── page.tsx                   # 首页
│   ├── collect/page.tsx           # 采集页面
│   └── api/
│       ├── profile/init.ts        # 初始化
│       ├── profile/stream.ts      # 截图流
│       ├── tasks/create.ts        # 创建任务
│       └── tasks/status.ts        # 任务状态
├── components/
│   ├── BrowserStream.tsx          # 实时截图
│   └── CollectionProgress.tsx     # 进度跟踪
└── package.json
```

## 🎬 工作流程

1. **选择平台** → 输入关键词 → 点击采集
2. **实时监控** → 看浏览器操作、采集进度、统计数据
3. **导出结果** → CSV/JSON 格式的数据

## 🔑 环境变量

编辑 `.env.local`：

```env
SKYVERN_API_KEY=your_key
SKYVERN_API_URL=https://api.skyvern.com/v1
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 📖 详细文档

查看 `SETUP_INSTRUCTIONS.md` 了解完整的本地开发指南。

## 🚀 部署

```bash
# 生产构建
npm run build
npm start

# 或部署到 Vercel
npm i -g vercel
vercel
```

## 🆘 问题排查

- **npm install 失败**: `npm cache clean --force && npm install --legacy-peer-deps`
- **截图显示不了**: 检查 Skyvern API Key 是否有效
- **端口 3000 被占用**: `npm run dev -- -p 3001`

## 📊 技术栈

- Next.js 14 + React 18
- TypeScript + Tailwind CSS
- Framer Motion + Recharts
- Skyvern Cloud API
- Supabase (可选)

## 📝 更新日志

- **v1.0.0** (2026-05-24) - MVP 发布

## 📚 文档

- [Next.js 文档](https://nextjs.org/docs)
- [Skyvern API](https://docs.skyvern.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Ready to collect? Start with** `npm run dev` 🚀
# socialspider
