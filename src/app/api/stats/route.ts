import { NextResponse } from 'next/server';
import { initializeDatabase, getUserStats, getQuizStats, getWrongAnswers } from '@/db';

export async function GET() {
  try {
    initializeDatabase();
    
    // 使用模擬用戶 ID（實際應用中應從認證系統獲取）
    const userId = 'demo-user';

    const stats = getUserStats(userId);
    const quizStats = getQuizStats(userId);
    const wrongAnswers = getWrongAnswers(userId);

    return NextResponse.json({
      success: true,
      stats,
      overall: quizStats,
      recent: [],
      wrongAnswerCount: wrongAnswers.length
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}