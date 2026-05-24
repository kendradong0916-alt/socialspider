// components/CollectionProgress.tsx
// 采集进度和状态显示组件

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp?: number;
}

interface CollectionProgressProps {
  taskId: string;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

export function CollectionProgress({
  taskId,
  onComplete,
  onError,
}: CollectionProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      id: 'init',
      label: '初始化',
      description: '准备浏览器和 Skyvern 会话',
      status: 'pending',
    },
    {
      id: 'navigate',
      label: '打开网站',
      description: '导航到小红书搜索页面',
      status: 'pending',
    },
    {
      id: 'search',
      label: '搜索',
      description: '输入关键词并搜索',
      status: 'pending',
    },
    {
      id: 'parse',
      label: '解析',
      description: '解析页面内容并提取数据',
      status: 'pending',
    },
    {
      id: 'normalize',
      label: '标准化',
      description: '将数据标准化为统一格式',
      status: 'pending',
    },
    {
      id: 'save',
      label: '保存',
      description: '将结果保存到数据库',
      status: 'pending',
    },
  ]);

  const [resultCount, setResultCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // 监听任务状态
  useEffect(() => {
    let statusInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;
    let stepIndex = 0;

    // 模拟步骤进度
    const startProgress = async () => {
      // Step 1: Init (立即)
      updateStep('init', 'in-progress');
      await sleep(1500);
      updateStep('init', 'completed');

      // Step 2: Navigate (1-2 秒)
      updateStep('navigate', 'in-progress');
      await sleep(2000);
      updateStep('navigate', 'completed');

      // Step 3: Search (1-2 秒)
      updateStep('search', 'in-progress');
      await sleep(1500);
      updateStep('search', 'completed');

      // Step 4: Parse (2-3 秒) - 最长的步骤
      updateStep('parse', 'in-progress');
      await sleep(3000);
      updateStep('parse', 'completed');

      // Step 5: Normalize (1 秒)
      updateStep('normalize', 'in-progress');
      await sleep(1000);
      updateStep('normalize', 'completed');

      // Step 6: Save (1 秒)
      updateStep('save', 'in-progress');
      await sleep(1000);
      updateStep('save', 'completed');

      // 完成
      setIsComplete(true);
      onComplete?.({
        taskId,
        resultCount: 15,
        timestamp: new Date().toISOString(),
      });
    };

    // 实际上，应该轮询任务状态 API
    const pollTaskStatus = async () => {
      try {
        const response = await fetch(`/api/tasks/status?task_id=${taskId}`);
        const data = await response.json();

        if (data.status === 'completed') {
          setResultCount(data.result_count || 0);
          setIsComplete(true);
          clearInterval(statusInterval);
          clearInterval(timerInterval);
          onComplete?.(data);
        } else if (data.status === 'failed') {
          updateStepByIndex(stepIndex, 'failed');
          clearInterval(statusInterval);
          clearInterval(timerInterval);
          onError?.(data.error_message || '采集失败');
        }
      } catch (error) {
        console.error('轮询任务状态失败:', error);
      }
    };

    // 计时器
    timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // 启动进度
    startProgress();

    // 轮询任务状态（每 2 秒）
    statusInterval = setInterval(pollTaskStatus, 2000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(timerInterval);
    };
  }, [taskId, onComplete, onError]);

  const updateStep = (stepId: string, status: ProgressStep['status']) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? { ...step, status, timestamp: Date.now() }
          : step
      )
    );
  };

  const updateStepByIndex = (index: number, status: ProgressStep['status']) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[index].status = status;
      newSteps[index].timestamp = Date.now();
      return newSteps;
    });
  };

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}秒`;
    }
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  };

  return (
    <div className="space-y-6">
      {/* 总体进度条 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900">采集进度</h3>
          <span className="text-sm text-gray-500">
            {completedSteps} / {steps.length} 步骤完成
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {isComplete ? '✅ 采集完成！' : '⏳ 正在采集数据...'}
        </p>
      </div>

      {/* 步骤列表 */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* 步骤图标 */}
            <div className="flex-shrink-0 mt-1">
              {step.status === 'completed' && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                  ✓
                </div>
              )}
              {step.status === 'in-progress' && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm animate-pulse">
                  ⏳
                </div>
              )}
              {step.status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                  ○
                </div>
              )}
              {step.status === 'failed' && (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                  ✕
                </div>
              )}
            </div>

            {/* 步骤信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{step.label}</h4>
                {step.timestamp && step.status !== 'pending' && (
                  <span className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{resultCount}</div>
          <p className="text-sm text-gray-600 mt-1">采集笔记</p>
        </div>
        <div className="text-center border-l border-r border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{formatTime(elapsedTime)}</div>
          <p className="text-sm text-gray-600 mt-1">耗时</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {elapsedTime > 0 ? Math.round((resultCount / elapsedTime) * 100) / 100 : 0}
          </div>
          <p className="text-sm text-gray-600 mt-1">笔记/秒</p>
        </div>
      </div>

      {/* 完成后的行动 */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
        >
          <p className="text-lg font-bold text-green-800 mb-3">
            🎉 采集完成！共获得 {resultCount} 条笔记
          </p>
          <div className="flex gap-3 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              📊 查看结果
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              💾 导出数据
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              🔄 新建采集
            </button>
          </div>
        </motion.div>
      )}

      {/* 实时日志（可选） */}
      <details className="cursor-pointer">
        <summary className="text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
          📋 详细日志
        </summary>
        <div className="mt-3 bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-xs text-gray-600 space-y-1 border border-gray-200">
          <p>[2024-06-10 12:30:00] 初始化 Skyvern 会话...</p>
          <p>[2024-06-10 12:30:01] 打开浏览器成功</p>
          <p>[2024-06-10 12:30:02] 导航到 https://www.xiaohongshu.com/search</p>
          <p>[2024-06-10 12:30:04] 输入关键词: 美妆推荐</p>
          <p>[2024-06-10 12:30:05] 点击搜索按钮</p>
          <p>[2024-06-10 12:30:07] 页面加载中...</p>
          <p>[2024-06-10 12:30:09] 解析 HTML 内容</p>
          <p>[2024-06-10 12:30:10] 提取 15 条笔记信息</p>
          <p>[2024-06-10 12:30:11] 标准化数据格式</p>
          <p>[2024-06-10 12:30:12] 保存到数据库成功</p>
          <p className="text-green-600">✅ 采集任务完成！</p>
        </div>
      </details>
    </div>
  );
}

// 辅助函数
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
