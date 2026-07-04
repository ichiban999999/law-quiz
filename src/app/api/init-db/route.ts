import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/gas-client';

// 初始化資料庫
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const force = body.force || false;
    
    const result = await initDatabase(force);
    const data = result as any;
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Database initialized',
      lawCount: data.lawCount || 0,
      quizCount: data.quizCount || 0,
    });
  } catch (error) {
    console.error('Failed to init database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}

// 檢查資料庫狀態
export async function GET() {
  try {
    const { checkDbStatus } = await import('@/lib/gas-client');
    const result = await checkDbStatus();
    
    return NextResponse.json({
      success: true,
      status: result,
    });
  } catch (error) {
    console.error('Failed to check DB status:', error);
    return NextResponse.json(
      { error: 'Failed to check database status', details: String(error) },
      { status: 500 }
    );
  }
}