// components/BrowserStream.tsx
// 实时浏览器截图显示组件

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface BrowserStreamProps {
  sessionId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  showControls?: boolean;
}

interface StreamStatus {
  isPlaying: boolean;
  isPaused: boolean;
  frameCount: number;
  fps: number;
  isLoading: boolean;
  error: string | null;
}

export function BrowserStream({
  sessionId,
  onComplete,
  onError,
  autoStart = true,
  showControls = true,
}: BrowserStreamProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<StreamStatus>({
    isPlaying: false,
    isPaused: false,
    frameCount: 0,
    fps: 0,
    isLoading: false,
    error: null,
  });
  const [currentScreenshot, setCurrentScreenshot] = useState<string>('');
  const frameTimesRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());

  // 获取下一帧
  const fetchNextFrame = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true }));

      const response = await fetch(
        `/api/profile/stream?session_id=${sessionId}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (!data.success) {
        // 会话已完成
        stopStream();
        onComplete?.();
        return;
      }

      // 更新截图
      setCurrentScreenshot(`data:image/png;base64,${data.screenshot}`);

      // 更新 FPS
      const now = Date.now();
      frameTimesRef.current.push(now);

      // 只保留最后 10 帧的时间戳以计算 FPS
      if (frameTimesRef.current.length > 10) {
        frameTimesRef.current.shift();
      }

      const timeDiff = frameTimesRef.current[frameTimesRef.current.length - 1] - frameTimesRef.current[0];
      const fps = timeDiff > 0 ? Math.round((frameTimesRef.current.length / timeDiff) * 1000) : 0;

      setStatus((prev) => ({
        ...prev,
        frameCount: prev.frameCount + 1,
        fps: Math.min(fps, 60), // 最多显示 60 FPS
        isLoading: false,
        error: null,
      }));

      lastUpdateRef.current = now;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      onError?.(errorMsg);
    }
  };

  // 启动流
  const startStream = async () => {
    try {
      setStatus((prev) => ({ ...prev, isLoading: true }));

      // 初始化流，获取第一帧
      const response = await fetch('/api/profile/stream', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          interval: 500,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 设置初始截图
        setCurrentScreenshot(`data:image/png;base64,${data.initial_screenshot}`);

        // 启动轮询
        setStatus((prev) => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
          frameCount: 1,
          isLoading: false,
          error: null,
        }));

        // 开始定期获取新帧
        intervalRef.current = setInterval(() => {
          fetchNextFrame();
        }, 500); // 每 500ms 获取一次
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '初始化失败';
      setStatus((prev) => ({
        ...prev,
        error: errorMsg,
        isLoading: false,
      }));
      onError?.(errorMsg);
    }
  };

  // 暂停流
  const pauseStream = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));
  };

  // 恢复流
  const resumeStream = () => {
    setStatus((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
    }));

    intervalRef.current = setInterval(() => {
      fetchNextFrame();
    }, 500);
  };

  // 停止流
  const stopStream = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
    }));
  };

  // 自动启动
  useEffect(() => {
    if (autoStart && sessionId) {
      startStream();
    }

    return () => {
      stopStream();
    };
  }, [sessionId, autoStart]);

  return (
    <div className="space-y-4">
      {/* 浏览器视窗 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* 浏览器标题栏 */}
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-sm font-medium text-gray-700 ml-2">
              小红书 - DataSpider
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {status.isLoading && '⏳ 加载中...'}
            {!status.isLoading && status.isPlaying && `📹 实时 ${status.fps} FPS`}
            {status.isPaused && '⏸️ 已暂停'}
            {!status.isPlaying && !status.isPaused && '⏹️ 已停止'}
          </div>
        </div>

        {/* 主要内容区 */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {currentScreenshot ? (
            <img
              ref={imageRef}
              src={currentScreenshot}
              alt="Browser Stream"
              className="w-full h-full object-contain"
              onLoad={() => {
                setStatus((prev) => ({ ...prev, isLoading: false }));
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-gray-400">等待截图...</p>
            </div>
          )}

          {/* 加载指示器 */}
          {status.isLoading && currentScreenshot && (
            <div className="absolute bottom-4 right-4 bg-blue-500 rounded-full p-3">
              <div className="animate-spin text-white">⏳</div>
            </div>
          )}

          {/* 错误提示 */}
          {status.error && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg max-w-xs">
              <p className="text-sm">❌ {status.error}</p>
            </div>
          )}
        </div>

        {/* 统计信息栏 */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-between items-center text-xs text-gray-600">
          <div>
            📊 帧数: <span className="font-mono font-bold">{status.frameCount}</span>
          </div>
          <div>
            ⏱️ FPS: <span className="font-mono font-bold">{status.fps}</span>
          </div>
          <div>
            Session ID: <span className="font-mono text-gray-500 truncate max-w-xs">{sessionId}</span>
          </div>
        </div>
      </div>

      {/* 控制按钮 */}
      {showControls && (
        <div className="flex gap-2 justify-center">
          {!status.isPlaying && !status.isPaused && (
            <button
              onClick={startStream}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>▶️</span> 开始采集
            </button>
          )}

          {status.isPlaying && (
            <button
              onClick={pauseStream}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>⏸️</span> 暂停
            </button>
          )}

          {status.isPaused && (
            <button
              onClick={resumeStream}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>▶️</span> 继续
            </button>
          )}

          {(status.isPlaying || status.isPaused) && (
            <button
              onClick={stopStream}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>⏹️</span> 停止
            </button>
          )}

          {/* 全屏按钮 */}
          <button
            onClick={() => {
              const elem = imageRef.current?.parentElement;
              if (elem) {
                elem.requestFullscreen?.();
              }
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            title="全屏显示"
          >
            🖥️
          </button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="font-medium">💡 实时采集提示</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li>• 每 500ms 刷新一次截图</li>
          <li>• 显示采集过程的完整流程</li>
          <li>• 如果采集失败会自动停止</li>
          <li>• 支持全屏查看（按 🖥️ 按钮）</li>
        </ul>
      </div>
    </div>
  );
}
