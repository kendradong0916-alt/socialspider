// app/api/tasks/create/route.ts
// 创建数据采集任务

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface CreateTaskRequest {
  website: 'xiaohongshu' | 'douyin' | 'weibo';
  keyword: string;
  filters?: {
    sort_by?: 'latest' | 'trending';
    date_range?: '7d' | '30d' | 'all';
    location?: string;
  };
}

interface SkyvemTaskResponse {
  id: string;
  status: string;
  estimated_duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json();

    // 1. 验证请求数据
    if (!body.website || !body.keyword) {
      return NextResponse.json(
        { error: '缺少必要参数: website, keyword' },
        { status: 400 }
      );
    }

    // 2. 获取当前用户 (从 JWT token)
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    // 3. 检查用户配额
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, quota_used, plan')
      .eq('token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '用户不存在或令牌过期' },
        { status: 401 }
      );
    }

    // 4. 检查配额是否足够
    const quotaLimits: { [key: string]: number } = {
      free: 5,
      basic: 1000,
      pro: 999999,
      enterprise: 999999,
    };

    const userPlan = user.plan || 'free';
    const monthlyQuota = quotaLimits[userPlan] || 5;

    if (user.quota_used >= monthlyQuota) {
      return NextResponse.json(
        {
          error: '本月配额已用尽',
          quota: { used: user.quota_used, limit: monthlyQuota },
        },
        { status: 429 }
      );
    }

    // 5. 调用 Skyvern API 创建任务
    const skyvernResponse = await axios.post<SkyvemTaskResponse>(
      `${process.env.SKYVERN_API_URL}/tasks`,
      {
        website: body.website,
        action: 'search',
        params: {
          keyword: body.keyword,
          filters: body.filters || {},
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SKYVERN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const skyvernTaskId = skyvernResponse.data.id;

    // 6. 在 Supabase 中创建任务记录
    const taskId = uuidv4();
    const { error: insertError } = await supabase
      .from('tasks')
      .insert({
        id: taskId,
        user_id: user.id,
        website: body.website,
        keyword: body.keyword,
        status: 'pending',
        skyvern_task_id: skyvernTaskId,
        filters: body.filters || {},
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { error: '创建任务失败' },
        { status: 500 }
      );
    }

    // 7. 更新用户配额
    await supabase
      .from('users')
      .update({ quota_used: user.quota_used + 1 })
      .eq('id', user.id);

    // 8. 异步轮询 Skyvern 任务状态（在后台）
    // 这里可以使用 Vercel Cron 或队列服务
    pollSkyvemTask(skyvernTaskId, taskId);

    return NextResponse.json(
      {
        success: true,
        task_id: taskId,
        skyvern_task_id: skyvernTaskId,
        status: 'pending',
        estimated_wait: '2-5s',
        quota_remaining: monthlyQuota - (user.quota_used + 1),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建任务失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 后台轮询函数（实际应该使用队列）
async function pollSkyvemTask(skyvernTaskId: string, taskId: string) {
  try {
    // 简单的轮询实现，实际应该使用 job queue (如 Bull, RabbitMQ)
    const maxRetries = 30;
    let retries = 0;

    while (retries < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待 1 秒

      const response = await axios.get(
        `${process.env.SKYVERN_API_URL}/tasks/${skyvernTaskId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.SKYVERN_API_KEY}`,
          },
        }
      );

      if (response.data.status === 'completed') {
        // 数据采集完成，保存结果
        await supabase
          .from('tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId);

        // 保存结果到 results 表
        await supabase
          .from('results')
          .insert({
            task_id: taskId,
            data: normalizeData(response.data.results),
            raw_html: response.data.html_snapshot || null,
          });

        return;
      } else if (response.data.status === 'failed') {
        await supabase
          .from('tasks')
          .update({
            status: 'failed',
            error_message: response.data.error || '未知错误',
          })
          .eq('id', taskId);
        return;
      }

      retries++;
    }

    // 超时
    await supabase
      .from('tasks')
      .update({
        status: 'failed',
        error_message: '采集超时',
      })
      .eq('id', taskId);
  } catch (error) {
    console.error('轮询任务失败:', error);
    await supabase
      .from('tasks')
      .update({
        status: 'failed',
        error_message: '轮询过程出错',
      })
      .eq('id', taskId);
  }
}

// 数据标准化函数
function normalizeData(rawData: any[]) {
  return rawData.map((item) => ({
    id: item.id || item.note_id,
    title: item.title,
    content: item.content || item.description,
    author: {
      id: item.author_id,
      name: item.author_name,
      avatar_url: item.author_avatar,
      followers: item.author_followers || 0,
      verified: item.author_verified || false,
    },
    metrics: {
      likes: item.likes || 0,
      comments: item.comments || 0,
      shares: item.shares || item.reposts || 0,
      bookmarks: item.bookmarks || item.favorites || 0,
      views: item.views || 0,
    },
    publish_time: item.published_at || item.created_at,
    url: item.url || item.link,
    images: item.images || item.image_urls || [],
    tags: item.tags || [],
    location: item.location,
    platform: item.platform,
  }));
}
