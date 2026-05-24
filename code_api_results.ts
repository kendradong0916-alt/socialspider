// app/api/results/route.ts
// 获取采集结果

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少 task_id 参数' },
        { status: 400 }
      );
    }

    // 1. 获取任务信息，验证用户权限
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('token', token)
      .single();

    if (!user) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (taskError || !task) {
      return NextResponse.json(
        { error: '任务不存在' },
        { status: 404 }
      );
    }

    // 2. 获取任务结果
    const { data: results, error: resultsError, count } = await supabase
      .from('results')
      .select('data', { count: 'exact' })
      .eq('task_id', taskId)
      .range((page - 1) * limit, page * limit - 1);

    if (resultsError) {
      return NextResponse.json(
        { error: '获取结果失败' },
        { status: 500 }
      );
    }

    // 3. 展平数据
    const flatData = results?.flatMap((r) => r.data) || [];

    return NextResponse.json({
      success: true,
      task_id: taskId,
      task_status: task.status,
      total: count || 0,
      page,
      limit,
      data: flatData,
      export_urls: {
        csv: `/api/export?task_id=${taskId}&format=csv`,
        json: `/api/export?task_id=${taskId}&format=json`,
        images: `/api/export?task_id=${taskId}&format=images`,
      },
    });
  } catch (error) {
    console.error('获取结果失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}
