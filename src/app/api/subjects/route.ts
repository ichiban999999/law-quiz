import { NextResponse } from 'next/server';
import { getSubjects, initializeDatabase } from '@/db';

export async function GET() {
  try {
    initializeDatabase();
    const subjects = getSubjects();
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}