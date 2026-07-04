import { NextResponse } from 'next/server';
import { getRandomQuizzes } from '@/lib/gas-client';

// 取得隨機題目
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject') || undefined;
    const count = parseInt(searchParams.get('count') || '10');
    
    const result = await getRandomQuizzes(subject, count);
    const data = result as any;
    
    return NextResponse.json({
      success: true,
      quizzes: data.quizzes || [],
      count: data.count || 0,
    });
  } catch (error) {
    console.error('Failed to get quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to get quizzes', details: String(error) },
      { status: 500 }
    );
  }
}