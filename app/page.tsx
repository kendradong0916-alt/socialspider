'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 导航栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h1 className="text-2xl font-bold text-gray-900">DataSpider</h1>
          </div>
          <button
            onClick={() => router.push('/collect')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            开始采集
          </button>
        </div>
      </header>

      {/* 主容器 */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            AI 驱动的社媒数据采集
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            一键采集小红书、抖音、微博数据 | 实时展示采集过程 | 智能数据标准化
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                emoji: '⚡',
                title: '极速采集',
                description: '2-5 秒内获得结果',
              },
              {
                emoji: '👁️',
                title: '实时展示',
                description: '看到浏览器采集过程',
              },
              {
                emoji: '📊',
                title: '数据标准化',
                description: '统一的 JSON/CSV 格式',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/collect')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all"
          >
            🚀 立即开始免费采集
          </button>
        </div>
      </main>
    </div>
  );
}
