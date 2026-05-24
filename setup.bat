@echo off
REM DataSpider 本地开发环境自动化设置脚本 (Windows)

echo ================================
echo 🎬 DataSpider 本地开发环境设置
echo ================================
echo.

REM 检查 Node.js
echo 📋 检查系统环境...
node --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Node.js 未安装
  echo 请访问 https://nodejs.org 安装 Node.js 18+
  pause
  exit /b 1
)

echo ✅ Node.js 版本:
node --version
echo ✅ npm 版本:
npm --version
echo.

REM 检查 .env.local
echo 🔑 检查环境变量...
if exist ".env.local" (
  echo ✅ .env.local 文件存在
  findstr /M "SKYVERN_API_KEY=" .env.local >nul
  if errorlevel 1 (
    echo ⚠️  Skyvern API Key 未配置
  ) else (
    echo ✅ Skyvern API Key 已配置
  )
) else (
  echo ❌ .env.local 文件不存在
  echo 请创建 .env.local 文件并填入凭证
  pause
  exit /b 1
)
echo.

REM 安装依赖
echo 📦 安装 npm 依赖...
call npm cache clean --force
call npm install --legacy-peer-deps
if errorlevel 1 (
  echo ⚠️  npm 安装失败
  echo 请手动运行: npm install
  pause
  exit /b 1
) else (
  echo ✅ 依赖安装成功
)
echo.

REM 完成
echo ================================
echo ✨ 设置完成！
echo ================================
echo.
echo 🚀 启动开发服务器：
echo    npm run dev
echo.
echo 然后访问: http://localhost:3000
echo.
pause
