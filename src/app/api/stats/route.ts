import { NextResponse } from 'next/server';
import { getUserStats } from '@/lib/gas-client';

// 取得使用者統計
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const result = await getUserStats(userId);
    const data = result as any;
    
    return NextResponse.json({
      success: true,
      stats: data.stats || [],
    });
  } catch (error) {
    console.error('Failed to get stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats', details: String(error) },
      { status: 500 }
    );
  }
}