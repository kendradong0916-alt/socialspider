// app/api/tasks/create/route.ts
// 创建数据采集任务

import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储，生产环境使用 Supabase
const tasks: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const { website, keyword, filters } = await request.json();

    if (!website || !keyword) {
      return NextResponse.json(
        { error: '缺少必要参数：website 和 keyword' },
        { status: 400 }
      );
    }

    const task_id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 创建任务记录
    tasks[task_id] = {
      task_id,
      website,
      keyword,
      filters: filters || {},
      status: 'pending',
      created_at: new Date().toISOString(),
      results: [],
      result_count: 0,
    };

    return NextResponse.json({
      success: true,
      task_id,
      status: 'created',
      message: '任务已创建，等待采集开始',
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建任务失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// 辅助函数：获取任务信息（用于其他 API 调用）
export function getTaskInfo(taskId: string) {
  return tasks[taskId] || null;
}

// 辅助函数：更新任务信息
export function updateTask(taskId: string, updates: any) {
  if (tasks[taskId]) {
    tasks[taskId] = { ...tasks[taskId], ...updates };
    return tasks[taskId];
  }
  return null;
}
