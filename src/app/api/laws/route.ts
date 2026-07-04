import { NextResponse } from 'next/server';
import { getAllLaws, getLawById } from '@/db';

// 取得所有法規列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lawId = searchParams.get('id');
    
    if (lawId) {
      // 取得單一法規內容
      const law = getLawById(lawId);
      if (law) {
        return NextResponse.json({
          success: true,
          law: {
            id: law.id,
            name: law.name,
            category: law.category,
            content: law.content,
            updated_at: law.updated_at,
          }
        });
      }
      return NextResponse.json(
        { error: 'Law not found' },
        { status: 404 }
      );
    }
    
    // 取得所有法規列表
    const laws = getAllLaws();
    
    // 按類別分組
    const groupedLaws: Record<string, any[]> = {};
    for (const law of laws) {
      if (!groupedLaws[law.category]) {
        groupedLaws[law.category] = [];
      }
      groupedLaws[law.category].push({
        id: law.id,
        name: law.name,
        updated_at: law.updated_at,
      });
    }
    
    return NextResponse.json({
      success: true,
      count: laws.length,
      laws: groupedLaws,
    });
  } catch (error) {
    console.error('Failed to get laws:', error);
    return NextResponse.json(
      { error: 'Failed to get laws' },
      { status: 500 }
    );
  }
}