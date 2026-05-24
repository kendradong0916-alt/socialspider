// app/collect/page.tsx
// 实时数据采集页面

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BrowserStream } from '@/components/BrowserStream';
import { CollectionProgress } from '@/components/CollectionProgress';
import { FiArrowLeft, FiShare2, FiDownload } from 'react-icons/fi';

interface CollectPageState {
  phase: 'form' | 'collecting' | 'completed';
  sessionId: string | null;
  taskId: string | null;
  website: string;
  keyword: string;
  resultCount: number;
}

export default function CollectPage() {
  const router = useRouter();
  const [state, setState] = useState<CollectPageState>({
    phase: 'form',
    sessionId: null,
    taskId: null,
    website: 'xiaohongshu',
    keyword: '',
    resultCount: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理采集表单提交
  const handleStartCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.keyword.trim()) {
      alert('请输入关键词');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: 初始化浏览器会话
      const initRes = await fetch('/api/profile/init', {
        method: 'POST',
        body: JSON.stringify({
          website: state.website,
        }),
      });

      const initData = await initRes.json();

      if (!initData.status || initData.status.includes('error')) {
        throw new Error('初始化浏览器会话失败');
      }

      const sessionId = initData.browser_url?.split('/').pop() || `session_${Date.now()}`;

      // Step 2: 创建采集任务
      const taskRes = await fetch('/api/tasks/create', {
        method: 'POST',
        body: JSON.stringify({
          website: state.website,
          keyword: state.keyword.trim(),
          filters: {
            sort_by: 'latest',
            date_range: '7d',
          },
        }),
      });

      const taskData = await taskRes.json();

      if (!taskData.success) {
        throw new Error(taskData.error || '创建任务失败');
      }

      // 更新状态，进入采集阶段
      setState((prev) => ({
        ...prev,
        phase: 'collecting',
        sessionId,
        taskId: taskData.task_id,
      }));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '发生错误';
      alert(`采集失败：${errorMsg}`);
      setIsSubmitting(false);
    }
  };

  // 处理采集完成
  const handleCollectionComplete = (results: any) => {
    setState((prev) => ({
      ...prev,
      phase: 'completed',
      resultCount: results.result_count || 0,
    }));
  };

  // 处理采集错误
  const handleCollectionError = (error: string) => {
    alert(`采集出错：${error}`);
    setState((prev) => ({
      ...prev,
      phase: 'form',
      sessionId: null,
      taskId: null,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft />
            <span>返回</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">🎬 实时数据采集</h1>
          <div className="w-20" /> {/* 占位符保持居中 */}
        </div>
      </header>

      {/* 主容器 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 阶段 1: 表单 */}
        {state.phase === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">开始采集</h2>
            <p className="text-gray-600 mb-8">
              输入关键词，我们将实时为您采集社媒数据。整个过程透明可见！
            </p>

            <form onSubmit={handleStartCollection} className="space-y-6">
              {/* 平台选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  选择平台
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'xiaohongshu', name: '小红书', emoji: '📌' },
                    { id: 'douyin', name: '抖音', emoji: '🎵' },
                    { id: 'weibo', name: '微博', emoji: '🐦' },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() =>
                        setState((prev) => ({ ...prev, website: platform.id }))
                      }
                      className={`p-4 rounded-lg border-2 transition-all ${
                        state.website === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl mb-2">{platform.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">
                        {platform.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 关键词输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜索关键词
                </label>
                <input
                  type="text"
                  value={state.keyword}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, keyword: e.target.value }))
                  }
                  placeholder="例如: 护肤品推荐、闲鱼秒杀、穿搭技巧..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-sm text-gray-500">
                  💡 输入你想搜索的关键词，我们会采集相关的最新内容
                </p>
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isSubmitting || !state.keyword.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    正在初始化...
                  </>
                ) : (
                  <>
                    <span>▶️</span> 开始实时采集
                  </>
                )}
              </button>

              {/* 功能说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-blue-900">✨ 你将看到：</p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4">
                  <li>• 浏览器实时截图（左侧）</li>
                  <li>• 采集进度步骤（右侧）</li>
                  <li>• 采集统计数据（笔记数、耗时等）</li>
                  <li>• 完成后可导出 CSV/JSON</li>
                </ul>
              </div>
            </form>
          </motion.div>
        )}

        {/* 阶段 2: 采集中 */}
        {state.phase === 'collecting' && state.taskId && state.sessionId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid lg:grid-cols-3 gap-8">
              {/* 左侧: 浏览器流 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <BrowserStream
                    sessionId={state.sessionId}
                    autoStart={true}
                    onError={handleCollectionError}
                  />
                </div>
              </div>

              {/* 右侧: 采集进度 */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <CollectionProgress
                  taskId={state.taskId}
                  onComplete={handleCollectionComplete}
                  onError={handleCollectionError}
                />
              </div>
            </div>

            {/* 信息面板 */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">采集平台</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {state.website === 'xiaohongshu'
                    ? '📌 小红书'
                    : state.website === 'douyin'
                    ? '🎵 抖音'
                    : '🐦 微博'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600">搜索关键词</p>
                <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                  {state.keyword}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">任务 ID</p>
                <p className="text-xs font-mono text-gray-600 mt-1 truncate">
                  {state.taskId}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 阶段 3: 完成 */}
        {state.phase === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">采集成功！</h2>
              <p className="text-xl text-gray-600 mb-8">
                共获得 <span className="font-bold text-blue-600">{state.resultCount}</span> 条笔记数据
              </p>

              {/* 结果统计 */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {state.resultCount}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">采集笔记</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">100%</div>
                  <p className="text-sm text-gray-600 mt-2">成功率</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-purple-600">⚡</div>
                  <p className="text-sm text-gray-600 mt-2">已就绪</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push(`/results/${state.taskId}`)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>📊</span> 查看详细结果
                </button>

                <button
                  onClick={() => {
                    // 触发导出
                    window.location.href = `/api/export?task_id=${state.taskId}&format=csv`;
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiDownload /> 导出为 CSV
                </button>

                <button
                  onClick={() => {
                    setState({
                      phase: 'form',
                      sessionId: null,
                      taskId: null,
                      website: 'xiaohongshu',
                      keyword: '',
                      resultCount: 0,
                    });
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  🔄 新建采集
                </button>

                <button
                  onClick={() => {
                    // 分享结果
                    const text = `我用 DataSpider 采集了 ${state.resultCount} 条笔记！🎉`;
                    if (navigator.share) {
                      navigator.share({ title: 'DataSpider', text });
                    } else {
                      alert(text);
                    }
                  }}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FiShare2 /> 分享成果
                </button>
              </div>

              {/* 提示 */}
              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-medium">✨ 下一步建议</p>
                <ul className="mt-2 space-y-1 text-xs ml-4">
                  <li>• 下载 CSV 在 Excel 中进行分析</li>
                  <li>• 筛选互动最高的笔记</li>
                  <li>• 分析热门的内容类型和话题</li>
                  <li>• 研究竞品的运营策略</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
