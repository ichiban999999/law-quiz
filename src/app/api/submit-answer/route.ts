import { NextResponse } from 'next/server';
import { initializeDatabase, recordScore } from '@/db';

export async function POST(request: Request) {
  try {
    initializeDatabase();
    const body = await request.json();
    const { quizId, subject, answer, isCorrect } = body;

    // 使用模擬用戶 ID（實際應用中應從認證系統獲取）
    const userId = 'demo-user-' + Date.now();

    recordScore(userId, quizId, subject, isCorrect, answer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}