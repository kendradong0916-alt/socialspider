// app/page.tsx
// 主页面 - 数据采集工具

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiPlus, FiLoading } from 'react-icons/fi';
import axios from 'axios';
import useSWR from 'swr';

interface Task {
  id: string;
  website: string;
  keyword: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  result_count?: number;
}

interface User {
  email: string;
  plan: string;
  quota_used: number;
  quota_limit: number;
}

const WEBSITES = [
  { id: 'xiaohongshu', name: '小红书', icon: '📌' },
  { id: 'douyin', name: '抖音', icon: '🎵' },
  { id: 'weibo', name: '微博', icon: '🐦' },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('xiaohongshu');
  const [keyword, setKeyword] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch {
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  // 获取任务历史
  const { data: tasksData } = useSWR('/api/tasks/list', (url) =>
    axios.get(url).then((res) => res.data.tasks)
  );

  useEffect(() => {
    if (tasksData) {
      setTasks(tasksData);
    }
  }, [tasksData]);

  // 创建任务
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyword.trim()) {
      alert('请输入关键词');
      return;
    }

    setIsCreatingTask(true);

    try {
      const response = await axios.post('/api/tasks/create', {
        website: selectedWebsite,
        keyword: keyword.trim(),
        filters: {
          sort_by: 'latest',
          date_range: '7d',
        },
      });

      const newTask = {
        id: response.data.task_id,
        website: selectedWebsite,
        keyword: keyword.trim(),
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      setTasks([newTask, ...tasks]);
      setKeyword('');

      // 重定向到结果页面
      router.push(`/results/${response.data.task_id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || '创建任务失败，请重试');
    } finally {
      setIsCreatingTask(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <FiLoading className="text-4xl text-blue-500" />
          </div>
          <p className="mt-4 text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  const quotaPercentage = (user.quota_used / user.quota_limit) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕷️</span>
            <h1 className="text-3xl font-bold text-gray-900">DataSpider</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <p className="text-gray-600">
                配额: {user.quota_used} / {user.quota_limit}
              </p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${quotaPercentage}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-600 capitalize">{user.plan} 用户</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* 左侧：创建任务表单 */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                开始采集数据
              </h2>

              <form onSubmit={handleCreateTask} className="space-y-6">
                {/* 平台选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    选择平台
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {WEBSITES.map((site) => (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => setSelectedWebsite(site.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedWebsite === site.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{site.icon}</div>
                        <div className="text-sm font-medium">{site.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 关键词输入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    搜索关键词
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="例如: 护肤品推荐、闲鱼秒杀..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isCreatingTask}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    💡 输入你想搜索的关键词，我们会从{' '}
                    {WEBSITES.find((s) => s.id === selectedWebsite)?.name}
                    抓取最新数据
                  </p>
                </div>

                {/* 高级选项（可选） */}
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-gray-700 hover:text-gray-900">
                    高级筛选 (可选)
                  </summary>
                  <div className="mt-4 space-y-4 pt-4 border-t">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          时间范围
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="7d">最近 7 天</option>
                          <option value="30d">最近 30 天</option>
                          <option value="all">全部</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          排序方式
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="latest">最新</option>
                          <option value="trending">最热</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </details>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={isCreatingTask || !keyword.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isCreatingTask ? (
                    <>
                      <FiLoading className="animate-spin" />
                      正在创建任务...
                    </>
                  ) : (
                    <>
                      <FiPlus />
                      开始采集 (消耗 1 配额)
                    </>
                  )}
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-medium">⏱️ 采集需要 2-5 秒</p>
                  <p className="text-xs mt-1">
                    由 Skyvern AI 驱动，自动处理验证码和网站反爬。
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* 右侧：快速开始指南 */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                快速开始
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-2xl">1️⃣</div>
                  <div>
                    <p className="font-medium text-sm">选择平台</p>
                    <p className="text-xs text-gray-500">小红书、抖音或微博</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-2xl">2️⃣</div>
                  <div>
                    <p className="font-medium text-sm">输入关键词</p>
                    <p className="text-xs text-gray-500">如 "美妆" 或 "穿搭"</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-2xl">3️⃣</div>
                  <div>
                    <p className="font-medium text-sm">点击采集</p>
                    <p className="text-xs text-gray-500">2-5 秒内返回结果</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 text-2xl">4️⃣</div>
                  <div>
                    <p className="font-medium text-sm">导出数据</p>
                    <p className="text-xs text-gray-500">CSV、JSON 或下载图片</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-2">
                <p className="text-xs font-medium text-gray-700">常见问题</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 采集失败？检查关键词是否存在</li>
                  <li>• 需要更多配额？升级到付费计划</li>
                  <li>• 数据准确性？95%+ 采集成功率</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 任务历史 */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 bg-white rounded-xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              最近的采集任务
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      平台
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      关键词
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      结果数
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 5).map((task) => (
                    <tr
                      key={task.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {
                          WEBSITES.find((s) => s.id === task.website)?.name
                        }
                      </td>
                      <td className="py-3 px-4 font-medium">{task.keyword}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status === 'completed'
                            ? '已完成'
                            : task.status === 'failed'
                            ? '失败'
                            : '处理中'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{task.result_count || '-'}</td>
                      <td className="py-3 px-4">
                        <a
                          href={`/results/${task.id}`}
                          className="text-blue-500 hover:text-blue-700 font-medium"
                        >
                          查看 →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
