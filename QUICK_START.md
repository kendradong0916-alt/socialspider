# ⚡ DataSpider 快速开始 (2 分钟)

## 第 1 步: 验证环境

```bash
node --version   # 需要 v18+
npm --version    # 需要 v9+
```

## 第 2 步: 检查 .env.local

你的 `.env.local` 已包含凭证：

```bash
cat .env.local | grep SKYVERN_API_KEY
```

如果显示你的 API Key，说明配置正确。

## 第 3 步: 安装依赖

```bash
npm install
```

如果失败，尝试：

```bash
npm cache clean --force
npm install --legacy-peer-deps
```

## 第 4 步: 启动开发服务器

```bash
npm run dev
```

## 第 5 步: 打开浏览器

访问: **http://localhost:3000**

---

## 🎬 测试采集

1. 点击首页的 "🚀 立即开始免费采集" 按钮
2. 选择平台（推荐：小红书 📌）
3. 输入关键词，例如 "护肤品推荐"
4. 点击 "▶️ 开始实时采集"
5. 观看实时截图和进度跟踪！

---

## 📚 文档

- `SETUP_INSTRUCTIONS.md` - 完整安装指南
- `README.md` - 项目概述和文档
- `setup.sh` (MacOS/Linux) - 自动化设置脚本
- `setup.bat` (Windows) - 自动化设置脚本

---

## 🆘 常见问题

### Q: npm install 一直失败？

A: 尝试以下命令：
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

如果还是不行，使用 yarn:
```bash
yarn install
```

### Q: 如何更改端口？

A: 运行：
```bash
npm run dev -- -p 3001
```

### Q: 怎样停止开发服务器？

A: 按 `Ctrl+C`

### Q: 代码改了但没反映？

A: 重启开发服务器（`npm run dev`）或刷新浏览器

---

## 🚀 下一步

- 阅读 `SETUP_INSTRUCTIONS.md` 了解详细配置
- 在 `app/collect/page.tsx` 中自定义采集流程
- 在 `components/` 中修改 UI 组件
- 部署到 Vercel（见 README.md）

---

祝你开发顺利！有问题请查看完整文档。 🎉
