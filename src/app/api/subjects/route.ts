import { NextResponse } from 'next/server';
import { getSubjects } from '@/lib/gas-client';

// 取得所有科目列表
export async function GET() {
  try {
    const result = await getSubjects();
    const data = result as any;
    
    return NextResponse.json({
      success: true,
      subjects: data.subjects || [],
    });
  } catch (error) {
    console.error('Failed to get subjects:', error);
    return NextResponse.json(
      { error: 'Failed to get subjects', details: String(error) },
      { status: 500 }
    );
  }
}