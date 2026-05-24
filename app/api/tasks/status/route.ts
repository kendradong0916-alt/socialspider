// app/api/tasks/status/route.ts
// 查询任务状态

import { NextRequest, NextResponse } from 'next/server';
import { taskStates } from '../utils';

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
