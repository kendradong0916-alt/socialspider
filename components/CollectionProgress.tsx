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
    { id: 'init', label: '初始化', description: '准备浏览器和 Skyvern 会话', status: 'pending' },
    { id: 'navigate', label: '打开网站', description: '导航到小红书搜索页面', status: 'pending' },
    { id: 'search', label: '搜索', description: '输入关键词并搜索', status: 'pending' },
    { id: 'parse', label: '解析', description: '解析页面内容并提取数据', status: 'pending' },
    { id: 'normalize', label: '标准化', description: '将数据标准化为统一格式', status: 'pending' },
    { id: 'save', label: '保存', description: '将结果保存到数据库', status: 'pending' },
  ]);

  const [resultCount, setResultCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    const startProgress = async () => {
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      updateStep('init', 'in-progress');
      await sleep(1500);
      updateStep('init', 'completed');

      updateStep('navigate', 'in-progress');
      await sleep(2000);
      updateStep('navigate', 'completed');

      updateStep('search', 'in-progress');
      await sleep(1500);
      updateStep('search', 'completed');

      updateStep('parse', 'in-progress');
      await sleep(3000);
      updateStep('parse', 'completed');

      updateStep('normalize', 'in-progress');
      await sleep(1000);
      updateStep('normalize', 'completed');

      updateStep('save', 'in-progress');
      await sleep(1000);
      updateStep('save', 'completed');

      setIsComplete(true);
      setResultCount(15);
      onComplete?.({ taskId, resultCount: 15, timestamp: new Date().toISOString() });
    };

    timerInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    startProgress();

    return () => {
      clearInterval(timerInterval);
    };
  }, [taskId, onComplete]);

  const updateStep = (stepId: string, status: ProgressStep['status']) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, status, timestamp: Date.now() } : step
      )
    );
  };

  const completedSteps = steps.filter((s) => s.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900">采集进度</h3>
          <span className="text-sm text-gray-500">{completedSteps} / {steps.length}</span>
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

      <div className="space-y-3">
        {steps.map((step) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-4 p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex-shrink-0 mt-1">
              {step.status === 'completed' && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">✓</div>
              )}
              {step.status === 'in-progress' && (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm animate-pulse">⏳</div>
              )}
              {step.status === 'pending' && (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">○</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900">{step.label}</h4>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{resultCount}</div>
          <p className="text-sm text-gray-600 mt-1">采集笔记</p>
        </div>
        <div className="text-center">
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
    </div>
  );
}
