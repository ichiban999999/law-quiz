import { NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/gas-client';

// 提交答案
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, quizId, subject, isCorrect, userAnswer } = body;
    
    if (!userId || !quizId || !subject || isCorrect === undefined || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await submitAnswer(userId, quizId, subject, isCorrect, userAnswer);
    
    return NextResponse.json({
      success: true,
      id: (result as any).id || null,
    });
  } catch (error) {
    console.error('Failed to submit answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer', details: String(error) },
      { status: 500 }
    );
  }
}