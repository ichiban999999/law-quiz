import { NextResponse } from 'next/server';
import { initializeDatabase, seedSampleQuizzes } from '@/db';

export async function POST() {
  try {
    initializeDatabase();
    seedSampleQuizzes();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully with sample quizzes.'
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}