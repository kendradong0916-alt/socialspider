// app/api/profile/init.ts
// 初始化浏览器会话

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { website } = await request.json();

    // 添加这两行日志
    console.log('Skyvern API Key:', process.env.SKYVERN_API_KEY?.substring(0, 10) + '...');
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('SKYVERN')));

    if (!website) {
      return NextResponse.json(
        { error: '缺少必要参数：website' },
        { status: 400 }
      );
    }


    const apiKey = process.env.SKYVERN_API_KEY;
    const apiUrl = process.env.SKYVERN_API_URL || 'https://api.skyvern.com';

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务器配置错误：缺少 Skyvern API Key' },
        { status: 500 }
      );
    }

    // 调用 Skyvern API 创建新的浏览器会话
    const response = await fetch(`${apiUrl}/sessions`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhook_url: `${process.env.NEXTAUTH_URL}/api/webhooks/session-complete`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Skyvern API 错误:', errorData);
      return NextResponse.json(
        { error: '无法创建浏览器会话', status: 'error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'success',
      session_id: data.session_id,
      browser_url: data.browser_url,
      website,
    });
  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      {
        error: '服务器错误',
        status: 'error',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
