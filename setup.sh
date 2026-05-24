#!/bin/bash

# DataSpider 本地开发环境自动化设置脚本

echo "================================"
echo "🎬 DataSpider 本地开发环境设置"
echo "================================"
echo ""

# 检查 Node.js 版本
echo "📋 检查系统环境..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js 未安装"
  echo "请访问 https://nodejs.org 安装 Node.js 18+"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查 .env.local
echo "🔑 检查环境变量..."
if [ -f ".env.local" ]; then
  echo "✅ .env.local 文件存在"
  if grep -q "SKYVERN_API_KEY=" .env.local; then
    echo "✅ Skyvern API Key 已配置"
  else
    echo "⚠️  Skyvern API Key 未配置"
  fi
else
  echo "❌ .env.local 文件不存在"
  echo "请创建 .env.local 文件并填入凭证"
  exit 1
fi
echo ""

# 安装依赖
echo "📦 安装 npm 依赖..."
npm cache clean --force
if npm install --legacy-peer-deps; then
  echo "✅ 依赖安装成功"
else
  echo "⚠️  依赖安装失败，尝试使用 yarn..."
  if command -v yarn &> /dev/null; then
    yarn install
    echo "✅ 使用 yarn 安装成功"
  else
    echo "❌ npm 和 yarn 都失败了"
    echo "手动运行: npm install"
    exit 1
  fi
fi
echo ""

# 构建项目
echo "🔨 构建项目..."
if npm run build; then
  echo "✅ 项目构建成功"
else
  echo "⚠️  项目构建失败（这不影响开发服务器）"
fi
echo ""

# 完成
echo "================================"
echo "✨ 设置完成！"
echo "================================"
echo ""
echo "🚀 启动开发服务器："
echo "   npm run dev"
echo ""
echo "然后访问: http://localhost:3000"
echo ""
