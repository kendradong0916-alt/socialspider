// app/api/tasks/status.ts
// 查询任务状态

import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储（与 create.ts 共享）
const taskStates: Record<string, any> = {};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json(
        { error: '缺少 task_id 参数' },
        { status: 400 }
      );
    }

    // 检查任务是否存在
    const taskState = taskStates[task_id];

    if (!taskState) {
      // 返回默认的进行中状态（演示用）
      return NextResponse.json({
        success: true,
        task_id,
        status: 'in_progress',
        result_count: 0,
        progress: 0,
      });
    }

    return NextResponse.json({
      success: true,
      task_id,
      status: taskState.status,
      result_count: taskState.result_count || 0,
      progress: taskState.progress || 0,
      created_at: taskState.created_at,
      completed_at: taskState.completed_at,
      error: taskState.error || null,
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '获取任务状态失败' },
      { status: 500 }
    );
  }
}

// 辅助函数：初始化任务状态
export function initializeTaskState(taskId: string, data: any) {
  taskStates[taskId] = {
    ...data,
    created_at: new Date().toISOString(),
  };
}

// 辅助函数：更新任务状态
export function updateTaskState(taskId: string, updates: any) {
  if (taskStates[taskId]) {
    taskStates[taskId] = {
      ...taskStates[taskId],
      ...updates,
    };
  }
}
