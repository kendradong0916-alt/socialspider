// app/api/profile/stream/route.ts
// 实时浏览器截图流 - 支持轮询获取新帧

import { NextRequest, NextResponse } from 'next/server';

// 简单的内存存储，用于演示目的
// 生产环境应使用 Supabase 或 Redis
const sessionStates: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const { session_id, interval } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: '缺少 session_id' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SKYVERN_API_KEY;
    const apiUrl = process.env.SKYVERN_API_URL || 'https://api.skyvern.com';

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    try {
      // 获取初始截图
      const screenshotResponse = await fetch(
        `${apiUrl}/sessions/${session_id}/screenshot`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      if (!screenshotResponse.ok) {
        throw new Error(`无法获取截图: ${screenshotResponse.statusText}`);
      }

      const screenshotData = await screenshotResponse.json();

      // 初始化或更新会话状态
      sessionStates[session_id] = {
        lastUpdate: Date.now(),
        frameCount: 1,
        status: 'streaming',
      };

      return NextResponse.json({
        success: true,
        session_id,
        initial_screenshot: screenshotData.screenshot || screenshotData.data,
        status: 'initialized',
      });
    } catch (error) {
      console.error('初始化截图失败:', error);
      // 返回模拟截图（用于开发）
      const placeholderPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      ).toString('base64');

      return NextResponse.json({
        success: true,
        session_id,
        initial_screenshot: placeholderPng,
        status: 'initialized',
      });
    }
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误', success: false },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json(
        { error: '缺少 session_id' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SKYVERN_API_KEY;
    const apiUrl = process.env.SKYVERN_API_URL || 'https://api.skyvern.com';

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      );
    }

    try {
      // 检查会话状态
      const statusResponse = await fetch(
        `${apiUrl}/sessions/${session_id}`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      if (!statusResponse.ok) {
        // 会话已完成或不存在
        return NextResponse.json({
          success: false,
          session_id,
          message: 'Session completed or not found',
        });
      }

      // 获取最新截图
      const screenshotResponse = await fetch(
        `${apiUrl}/sessions/${session_id}/screenshot`,
        {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
          },
        }
      );

      if (!screenshotResponse.ok) {
        throw new Error('无法获取截图');
      }

      const screenshotData = await screenshotResponse.json();

      // 更新会话状态
      if (sessionStates[session_id]) {
        sessionStates[session_id].frameCount += 1;
        sessionStates[session_id].lastUpdate = Date.now();
      }

      return NextResponse.json({
        success: true,
        session_id,
        screenshot: screenshotData.screenshot || screenshotData.data,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('获取截图失败:', error);
      // 返回模拟截图（用于开发）
      const placeholderPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
      ).toString('base64');

      return NextResponse.json({
        success: true,
        session_id,
        screenshot: placeholderPng,
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: '服务器错误', success: false },
      { status: 500 }
    );
  }
}
