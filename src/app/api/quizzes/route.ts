import { NextResponse, NextRequest } from 'next/server';
import { getQuizzesBySubject, initializeDatabase } from '@/db';

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const count = parseInt(searchParams.get('count') || '10');

    let quizzes;
    if (subject) {
      quizzes = getQuizzesBySubject(subject, count);
    } else {
      quizzes = getQuizzesBySubject('', count);
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}