import { NextResponse } from 'next/server';
import { initializeDatabase, seedSampleQuizzes, clearLaws, getAllLaws } from '@/db';

// 法規定義 - 對應到 articles 頁面的分類
const lawDefinitions = [
  // 憲法類
  { id: 'DL000001', name: '中華民國憲法', category: '憲法' },
  { id: 'DL000002', name: '憲法增修條文', category: '憲法' },
  { id: 'DL000003', name: '司法院大法官憲法解釋', category: '憲法' },
  
  // 民事法類
  { id: 'DL000004', name: '民法', category: '民事法' },
  { id: 'DL000005', name: '民事訴訟法', category: '民事法' },
  { id: 'DL000006', name: '家事事件法', category: '民事法' },
  { id: 'DL000007', name: '強制執行法', category: '民事法' },
  { id: 'DL000008', name: '涉外民事法律適用法', category: '民事法' },
  { id: 'DL000009', name: '非訟事件法', category: '民事法' },
  { id: 'DL000010', name: '仲裁法', category: '民事法' },
  
  // 刑事法類
  { id: 'DL000012', name: '中華民國刑法', category: '刑事法' },
  { id: 'DL000013', name: '刑事訴訟法', category: '刑事法' },
  { id: 'DL000014', name: '刑事補償法', category: '刑事法' },
  { id: 'DL000015', name: '性侵害犯罪防治法', category: '刑事法' },
  
  // 行政法類
  { id: 'DL000016', name: '行政程序法', category: '行政法' },
  { id: 'DL000017', name: '行政訴訟法', category: '行政法' },
  { id: 'DL000018', name: '行政罰法', category: '行政法' },
  { id: 'DL000019', name: '行政執行法', category: '行政法' },
  { id: 'DL000020', name: '訴願法', category: '行政法' },
  { id: 'DL000021', name: '國家賠償法', category: '行政法' },
  { id: 'DL000022', name: '地方制度法', category: '行政法' },
  
  // 商事法類
  { id: 'DL000024', name: '公司法', category: '商事法' },
  { id: 'DL000025', name: '保險法', category: '商事法' },
  { id: 'DL000026', name: '票據法', category: '商事法' },
  { id: 'DL000027', name: '證券交易法', category: '商事法' },
  { id: 'DL000028', name: '海商法', category: '商事法' },
  
  // 司法制度類
  { id: 'DL000030', name: '法院組織法', category: '司法制度' },
  { id: 'DL000031', name: '法官法', category: '司法制度' },
  { id: 'DL000032', name: '律師法', category: '司法制度' },
  
  // 勞動與社會法類
  { id: 'DL000033', name: '勞動基準法', category: '勞動與社會法' },
  { id: 'DL000034', name: '勞工保險條例', category: '勞動與社會法' },
  { id: 'DL000035', name: '性別平等工作法', category: '勞動與社會法' },
  { id: 'DL000036', name: '消費者保護法', category: '勞動與社會法' },
  
  // 土地與不動產類
  { id: 'DL000037', name: '土地法', category: '土地與不動產' },
  { id: 'DL000038', name: '土地徵收條例', category: '土地與不動產' },
  { id: 'DL000039', name: '都市計畫法', category: '土地與不動產' },
  
  // 智慧財產類
  { id: 'DL000040', name: '著作權法', category: '智慧財產' },
  { id: 'DL000041', name: '商標法', category: '智慧財產' },
  { id: 'DL000042', name: '專利法', category: '智慧財產' },
];

async function fetchLawContent(lawId: string): Promise<string | null> {
  try {
    // 使用全國法規資料庫 API 取得法規內容
    const response = await fetch(`https://law.moj.gov.tw/API/${lawId}`, {
      next: { revalidate: 3600 }, // 快取 1 小時
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // API 回傳格式可能不同，嘗試多種方式取得內容
    if (data.Data && data.Data.Chapters) {
      // 將章節內容組合起來
      return data.Data.Chapters.map((ch: any) => ch.ZM || '').join('\n');
    }
    
    if (data.Content) {
      return typeof data.Content === 'string' ? data.Content : JSON.stringify(data.Content);
    }
    
    // 如果 API 回傳格式不同，嘗試直接序列化
    return JSON.stringify(data);
  } catch (error) {
    console.error(`Failed to fetch law ${lawId}:`, error);
    return null;
  }
}

async function fetchLawsFromAPI() {
  const laws = getAllLaws();
  const existingIds = new Set(laws.map((l: any) => l.id));
  
  // 如果已有法規資料，跳過同步
  if (existingIds.size > 0) {
    return { skipped: existingIds.size, fetched: 0 };
  }
  
  let fetched = 0;
  let skipped = 0;
  
  for (const law of lawDefinitions) {
    try {
      console.log(`Fetching law: ${law.name} (${law.id})`);
      
      const response = await fetch(`https://law.moj.gov.tw/API/${law.id}`, {
        signal: AbortSignal.timeout(10000), // 10秒超時
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch ${law.id}: ${response.status}`);
        skipped++;
        continue;
      }
      
      const data = await response.json();
      
      // 解析並格式化法規內容
      let content = '';
      if (data.Data && data.Data.LawArticle) {
        // 將條文內容組合起來
        content = data.Data.LawArticle.map((article: any) => 
          `${article.ZHNM || ''}: ${article.NR || ''}`
        ).join('\n\n');
      } else if (data.Content) {
        content = typeof data.Content === 'string' ? data.Content : JSON.stringify(data.Content);
      } else {
        // 如果無法解析，儲存原始 JSON
        content = JSON.stringify(data, null, 2);
      }
      
      // 儲存到資料庫
      const { saveLaw } = await import('@/db');
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content: content || '[暫無內容]',
        updated_at: new Date().toISOString(),
      });
      
      fetched++;
      console.log(`Successfully fetched: ${law.name}`);
      
      // 避免請求太快，加個小延遲
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching ${law.id}:`, error);
      skipped++;
    }
  }
  
  return { skipped, fetched };
}

export async function POST() {
  try {
    initializeDatabase();
    seedSampleQuizzes();
    
    // 同步法規資料
    console.log('Starting law synchronization...');
    const result = await fetchLawsFromAPI();
    console.log(`Law sync complete: ${result.fetched} fetched, ${result.skipped} skipped`);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully.',
      lawsSynced: result.fetched,
      lawsSkipped: result.skipped,
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}

// 支援 GET 請求查看同步狀態
export async function GET() {
  try {
    const laws = getAllLaws();
    return NextResponse.json({
      success: true,
      lawCount: laws.length,
      laws: laws.slice(0, 10), // 只回傳前10筆作為示範
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get laws' },
      { status: 500 }
    );
  }
}