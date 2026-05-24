// app/api/profile/stream/route.ts
// 获取浏览器实时截图流

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface StreamRequest {
  session_id: string;
  interval?: number; // 轮询间隔（毫秒），默认 500ms
}

export async function POST(request: NextRequest) {
  try {
    const body: StreamRequest = await request.json();
    const { session_id, interval = 500 } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: '缺少 session_id 参数' },
        { status: 400 }
      );
    }

    // 获取初始截图
    const screenshotResponse = await getScreenshot(session_id);

    return NextResponse.json({
      success: true,
      stream_id: `stream_${Date.now()}`,
      initial_screenshot: screenshotResponse.screenshot,
      polling_interval: interval,
      message: '使用返回的 stream_id 调用 /api/profile/stream/next 来获取下一帧',
    });
  } catch (error) {
    console.error('创建流失败:', error);
    return NextResponse.json(
      { error: '创建流失败' },
      { status: 500 }
    );
  }
}

// 获取单一截图
async function getScreenshot(sessionId: string) {
  try {
    const response = await axios.get(
      `${process.env.SKYVERN_API_URL}/sessions/${sessionId}/screenshot`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SKYVERN_API_KEY}`,
        },
      }
    );

    return {
      screenshot: response.data.screenshot, // base64 格式
      timestamp: response.data.timestamp || Date.now(),
      status: response.data.status,
    };
  } catch (error) {
    console.error('获取截图失败:', error);
    throw error;
  }
}

// 获取下一帧截图
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 session_id 参数' },
        { status: 400 }
      );
    }

    const screenshotData = await getScreenshot(sessionId);

    return NextResponse.json({
      success: true,
      ...screenshotData,
    });
  } catch (error: any) {
    // 如果会话已完成，返回特殊状态
    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found or completed',
          status: 'completed',
        },
        { status: 200 } // 返回 200，告诉前端会话已结束
      );
    }

    console.error('获取截图失败:', error);
    return NextResponse.json(
      { error: '获取截图失败' },
      { status: 500 }
    );
  }
}
