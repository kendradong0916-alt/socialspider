// app/api/tasks/status/route.ts
// 查询任务状态

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少 task_id 参数' },
        { status: 400 }
      );
    }

    // 获取任务状态
    const { data: task, error } = await supabase
      .from('tasks')
      .select('id, status, created_at, completed_at, error_message')
      .eq('id', taskId)
      .single();

    if (error || !task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 获取结果数量
    let resultCount = 0;
    if (task.status === 'completed') {
      const { count } = await supabase
        .from('results')
        .select('*', { count: 'exact' })
        .eq('task_id', taskId);
      resultCount = count || 0;
    }

    return NextResponse.json({
      success: true,
      task_id: taskId,
      status: task.status,
      progress: task.status === 'completed' ? 100 : 50,
      result_count: resultCount,
      created_at: task.created_at,
      completed_at: task.completed_at,
      error_message: task.error_message,
    });
  } catch (error) {
    console.error('查询任务状态失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
