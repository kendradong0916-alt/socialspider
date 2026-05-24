# DataSpider 本地开发环境设置指南

## 🎯 项目概述

DataSpider 是一个 AI 驱动的社媒数据采集 SaaS 平台，支持实时展示浏览器采集过程。

## 📋 前置要求

- Node.js 18+ 和 npm 9+
- Skyvern API Key（从 https://app.skyvern.com 获取）
- Supabase 项目 URL 和密钥（从 https://supabase.com 获取）

## 🚀 快速开始

### 第 1 步：准备环境变量

✅ **已完成** - `.env.local` 文件已在项目根目录创建并填入你的 Supabase 和 Skyvern 凭证。

验证 `.env.local` 包含以下变量：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
SKYVERN_API_KEY=your_api_key
SKYVERN_API_URL=https://api.skyvern.com/v1
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 第 2 步：安装依赖

在项目根目录运行：

```bash
npm install
```

### 第 3 步：启动开发服务器

```bash
npm run dev
```

开发服务器将在 **http://localhost:3000** 启动。

### 第 4 步：在浏览器中打开项目

访问 http://localhost:3000，你将看到 DataSpider 的首页。

## 📂 项目文件结构

```
cowork test/
├── app/
│   ├── page.tsx              # 首页
│   ├── collect/
│   │   └── page.tsx          # 采集页面（核心）
│   ├── api/
│   │   ├── profile/
│   │   │   ├── init.ts       # 初始化浏览器会话
│   │   │   └── stream.ts     # 获取实时截图
│   │   └── tasks/
│   │       ├── create.ts     # 创建采集任务
│   │       └── status.ts     # 查询任务状态
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── BrowserStream.tsx     # 实时浏览器截图显示
│   └── CollectionProgress.tsx # 采集进度跟踪
├── package.json              # NPM 依赖
├── .env.local               # 环境变量（已填入）
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.js       # Tailwind 配置
├── next.config.js           # Next.js 配置
└── postcss.config.js        # PostCSS 配置
```

## 🎬 工作流程

### 三阶段采集流程

**阶段 1: 表单输入**
- 用户选择采集平台（小红书 / 抖音 / 微博）
- 输入搜索关键词

**阶段 2: 实时采集中**
- 左侧：实时浏览器截图（500ms 更新一次）
- 右侧：采集进度跟踪（6 个步骤）
- 展示：帧数、FPS、采集速度

**阶段 3: 采集完成**
- 显示采集成功的笔记数
- 提供 CSV 导出、分享、新建采集等操作

## 🔌 API 路由说明

### POST /api/profile/init
初始化浏览器会话
```javascript
// 请求
{ website: 'xiaohongshu' }

// 响应
{
  status: 'success',
  session_id: 'session_xxx',
  browser_url: 'https://...'
}
```

### POST /api/profile/stream
启动截图流（500ms 轮询）
```javascript
// 请求
{ session_id: 'session_xxx', interval: 500 }

// 响应
{
  success: true,
  initial_screenshot: 'base64_image_data'
}
```

### GET /api/profile/stream?session_id=xxx
获取下一帧截图
```javascript
// 响应
{
  success: true,
  screenshot: 'base64_image_data',
  timestamp: 1716554000000
}
```

### POST /api/tasks/create
创建采集任务
```javascript
// 请求
{
  website: 'xiaohongshu',
  keyword: '护肤品推荐',
  filters: { sort_by: 'latest', date_range: '7d' }
}

// 响应
{
  success: true,
  task_id: 'task_1716554000000_abc123',
  status: 'created'
}
```

### GET /api/tasks/status?task_id=xxx
查询任务状态
```javascript
// 响应
{
  success: true,
  status: 'in_progress',
  result_count: 15,
  progress: 100
}
```

## 🧪 本地测试步骤

1. **访问首页** → http://localhost:3000
   - 看到 DataSpider 品牌和功能介绍
   - 点击 "🚀 立即开始免费采集"

2. **选择平台和关键词** → /collect
   - 选择采集平台（推荐：小红书）
   - 输入关键词，例如 "护肤品推荐"
   - 点击 "▶️ 开始实时采集"

3. **观看实时采集过程**
   - 左侧显示浏览器实时截图（每 500ms 更新）
   - 右侧显示 6 个采集步骤的进度
   - 底部显示采集统计（笔记数、耗时、速度）

4. **采集完成**
   - 显示采集成功的笔记数
   - 可导出 CSV、创建新任务、分享结果

## ⚙️ 技术栈

- **框架**: Next.js 14 (App Router)
- **前端**: React 18 + TypeScript
- **UI 库**: Tailwind CSS + Framer Motion
- **数据库**: Supabase (PostgreSQL)
- **认证**: NextAuth.js
- **API 集成**: Skyvern Cloud API
- **图表**: Recharts
- **图标**: React Icons

## 🔐 安全说明

### 环境变量

- `.env.local` 包含敏感凭证，**不要提交到 Git**
- `.env.local` 已在 `.gitignore` 中
- 生产环境使用 Vercel 的 Environment Variables

### Skyvern API

- API Key 用于后端调用
- 前端不直接调用 Skyvern API
- 所有截图通过后端代理

## 📊 数据流

```
用户表单提交
    ↓
POST /api/profile/init → 创建 Skyvern 浏览器会话
    ↓
POST /api/tasks/create → 记录采集任务
    ↓
前端开始轮询 GET /api/profile/stream
    ↓
后端调用 Skyvern API 获取截图
    ↓
返回 Base64 编码的截图
    ↓
前端显示实时截图 + 进度
    ↓
采集完成 → 显示结果
```

## 🆘 常见问题

### npm install 失败

如果遇到 npm registry 访问问题：

```bash
npm cache clean --force
npm install --legacy-peer-deps
```

或使用 yarn：

```bash
yarn install
```

### 环境变量未加载

确保：
1. `.env.local` 文件在项目根目录
2. 重启开发服务器：`npm run dev`
3. 检查 `.env.local` 的格式（无引号、无空格）

### Skyvern API 连接失败

检查：
1. `SKYVERN_API_KEY` 是否正确
2. `SKYVERN_API_URL` 是否为 `https://api.skyvern.com/v1`
3. API Key 是否已过期

### 本地 Supabase 不需要

本地开发中，API routes 使用内存存储，不需要 Supabase 连接。
如需持久化，请配置 Supabase RLS 策略。

## 🚀 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量
4. 部署

```bash
git push origin main
```

## 📖 进一步阅读

- [Next.js 文档](https://nextjs.org/docs)
- [Skyvern API 文档](https://skyvern.com/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## ✅ 检查清单

- [ ] 安装了 Node.js 18+
- [ ] 复制了 .env.local 文件
- [ ] 填入了 Skyvern API Key
- [ ] 填入了 Supabase 凭证
- [ ] 运行 npm install
- [ ] 运行 npm run dev
- [ ] 访问 http://localhost:3000
- [ ] 看到首页正常显示
- [ ] 可以点击 "开始采集"
- [ ] 可以选择平台和输入关键词
- [ ] 可以看到实时采集过程

---

祝你本地开发顺利！🎉
