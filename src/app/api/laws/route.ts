import { NextResponse } from 'next/server';
import { getAllLaws, getLawById } from '@/lib/gas-client';

// 取得所有法規列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lawId = searchParams.get('id');
    
    if (lawId) {
      // 取得單一法規內容
      const result = await getLawById(lawId);
      if (result && (result as any).id) {
        return NextResponse.json({
          success: true,
          law: result,
        });
      }
      return NextResponse.json(
        { error: 'Law not found' },
        { status: 404 }
      );
    }
    
    // 取得所有法規列表
    const result = await getAllLaws();
    const data = result as any;
    
    return NextResponse.json({
      success: true,
      count: data.count || 0,
      laws: data.laws || {},
    });
  } catch (error) {
    console.error('Failed to get laws:', error);
    return NextResponse.json(
      { error: 'Failed to get laws', details: String(error) },
      { status: 500 }
    );
  }
}