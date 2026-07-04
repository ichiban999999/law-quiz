import { NextResponse } from 'next/server';
import { initializeDatabase, seedSampleQuizzes, getAllLaws, saveLaw, clearLaws } from '@/db';

// 設定 Node.js runtime 以支援 better-sqlite3
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Hobby 方案最多 60 秒

// 法規定義 - 使用正確的 pcode 格式 (A 開頭)
const lawDefinitions = [
  // 憲法類
  { id: 'A0000001', name: '中華民國憲法', category: '憲法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000001' },
  { id: 'A0000002', name: '憲法增修條文', category: '憲法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000002' },
  { id: 'A0000003', name: '司法院大法官憲法解釋', category: '憲法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000003' },
  
  // 民事法類
  { id: 'A0000004', name: '民法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000004' },
  { id: 'A0000005', name: '民事訴訟法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000005' },
  { id: 'A0000006', name: '家事事件法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000006' },
  { id: 'A0000007', name: '強制執行法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000007' },
  { id: 'A0000008', name: '涉外民事法律適用法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000008' },
  { id: 'A0000009', name: '非訟事件法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000009' },
  { id: 'A0000010', name: '仲裁法', category: '民事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000010' },
  
  // 刑事法類
  { id: 'A0000012', name: '中華民國刑法', category: '刑事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000012' },
  { id: 'A0000013', name: '刑事訴訟法', category: '刑事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000013' },
  { id: 'A0000014', name: '刑事補償法', category: '刑事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000014' },
  { id: 'A0000015', name: '性侵害犯罪防治法', category: '刑事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000015' },
  
  // 行政法類
  { id: 'A0000016', name: '行政程序法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000016' },
  { id: 'A0000017', name: '行政訴訟法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000017' },
  { id: 'A0000018', name: '行政罰法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000018' },
  { id: 'A0000019', name: '行政執行法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000019' },
  { id: 'A0000020', name: '訴願法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000020' },
  { id: 'A0000021', name: '國家賠償法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000021' },
  { id: 'A0000022', name: '地方制度法', category: '行政法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000022' },
  
  // 商事法類
  { id: 'A0000024', name: '公司法', category: '商事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000024' },
  { id: 'A0000025', name: '保險法', category: '商事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000025' },
  { id: 'A0000026', name: '票據法', category: '商事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000026' },
  { id: 'A0000027', name: '證券交易法', category: '商事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000027' },
  { id: 'A0000028', name: '海商法', category: '商事法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000028' },
  
  // 司法制度類
  { id: 'A0000030', name: '法院組織法', category: '司法制度', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000030' },
  { id: 'A0000031', name: '法官法', category: '司法制度', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000031' },
  { id: 'A0000032', name: '律師法', category: '司法制度', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000032' },
  
  // 勞動與社會法類
  { id: 'A0000033', name: '勞動基準法', category: '勞動與社會法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000033' },
  { id: 'A0000034', name: '勞工保險條例', category: '勞動與社會法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000034' },
  { id: 'A0000035', name: '性別平等工作法', category: '勞動與社會法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000035' },
  { id: 'A0000036', name: '消費者保護法', category: '勞動與社會法', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000036' },
  
  // 土地與不動產類
  { id: 'A0000037', name: '土地法', category: '土地與不動產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000037' },
  { id: 'A0000038', name: '土地徵收條例', category: '土地與不動產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000038' },
  { id: 'A0000039', name: '都市計畫法', category: '土地與不動產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000039' },
  
  // 智慧財產類
  { id: 'A0000040', name: '著作權法', category: '智慧財產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000040' },
  { id: 'A0000041', name: '商標法', category: '智慧財產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000041' },
  { id: 'A0000042', name: '專利法', category: '智慧財產', url: 'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=A0000042' },
];

/**
 * 從 HTML 頁面解析法規內容
 */
function parseLawHTML(html: string): string {
  // 提取法規名稱
  const nameMatch = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const lawName = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '未知法規';
  
  // 提取所有條文內容 - 多種選擇器
  let articles: string[] = [];
  
  // 方法 1: 尋找 law-article 類別
  const articleRegex = /class="law-article"[^>]*>([\s\S]*?)<\/div>/g;
  let match;
  while ((match = articleRegex.exec(html)) !== null) {
    let content = match[1];
    content = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (content && content.length > 5) {
      articles.push(content);
    }
  }
  
  // 方法 2: 如果方法 1 找不到，嘗試尋找所有條文
  if (articles.length === 0) {
    const articleNumRegex = /第[零一二三四五六七八九十\d]+條[^\n]*/g;
    const matches = html.match(articleNumRegex);
    if (matches) {
      articles = matches.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(m => m.length > 5);
    }
  }
  
  if (articles.length > 0) {
    return `【${lawName}】\n\n` + articles.slice(0, 100).join('\n\n'); // 限制最多 100 條
  }
  
  // 如果完全無法解析，返回基本資訊
  return `【${lawName}】\n\n[內容無法自動解析，請前往官方網站查看]`;
}

async function fetchSingleLaw(lawDef: typeof lawDefinitions[0]): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    console.log(`Fetching law: ${lawDef.name} (${lawDef.id})`);
    const response = await fetch(lawDef.url, {
      headers: {
        'User-Agent': 'LawQuizApp/1.0 (law-quiz@vercel)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(30000),
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch ${lawDef.name}: HTTP ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    console.log(`Got ${html.length} bytes from ${lawDef.name}`);
    const content = parseLawHTML(html);
    
    return { success: true, content };
  } catch (error) {
    console.error(`Error fetching ${lawDef.name}:`, error);
    return { success: false, error: String(error) };
  }
}

async function syncLawsFromAPI(forceSync: boolean = false) {
  const existingLaws = getAllLaws();
  
  // 如果不是強制同步且已有資料，跳過
  if (!forceSync && existingLaws.length > 0) {
    return { synced: 0, skipped: existingLaws.length, failed: 0, message: `已有 ${existingLaws.length} 筆法規資料，跳過同步。使用 force=true 可強制重新同步。` };
  }
  
  // 如果已有資料且強制同步，先清空
  if (existingLaws.length > 0 && forceSync) {
    clearLaws();
  }
  
  let synced = 0;
  let skipped = 0;
  let failed = 0;
  
  for (let i = 0; i < lawDefinitions.length; i++) {
    const law = lawDefinitions[i];
    console.log(`[${i + 1}/${lawDefinitions.length}] Fetching: ${law.name}`);
    
    const result = await fetchSingleLaw(law);
    
    if (result.success && result.content && !result.content.includes('[內容無法自動解析')) {
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content: result.content,
        updated_at: new Date().toISOString(),
      });
      synced++;
      console.log(`✓ Synced: ${law.name} (${synced}/${lawDefinitions.length})`);
    } else {
      // 即使失敗也儲存基本資料
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content: result.content || `[同步失敗: ${result.error}] 請參考官方網站: ${law.url}`,
        updated_at: new Date().toISOString(),
      });
      failed++;
      console.log(`✗ Failed: ${law.name} - ${result.error}`);
    }
    
    // 避免請求太快，加個小延遲
    if (i < lawDefinitions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return { synced, skipped, failed, message: `同步完成: ${synced} 成功, ${failed} 失敗` };
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/init-db called');
    const body = await request.json().catch(() => ({}));
    const { force } = body as { force?: boolean };
    console.log(`Request body:`, body);
    
    console.log('Step 1: Initializing database...');
    initializeDatabase();
    console.log('Step 2: Seeding sample quizzes...');
    seedSampleQuizzes();
    
    console.log(`Step 3: Starting law synchronization (force=${force})...`);
    const result = await syncLawsFromAPI(force || false);
    console.log(result.message);
    
    // 驗證最終結果
    const finalLaws = getAllLaws();
    console.log(`Final law count: ${finalLaws.length}`);
    
    return NextResponse.json({
      success: true,
      message: `Database initialized. ${result.message}. Total laws: ${finalLaws.length}`,
      synced: result.synced,
      skipped: result.skipped,
      failed: result.failed,
      totalLaws: finalLaws.length,
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    console.error('Error stack:', String(error));
    return NextResponse.json(
      { 
        error: 'Failed to initialize database', 
        details: String(error),
        message: '請查看伺服器日誌以取得更多詳細資訊'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('GET /api/init-db called');
    const laws = getAllLaws();
    return NextResponse.json({
      success: true,
      lawCount: laws.length,
      laws: laws.slice(0, 10),
      message: laws.length > 0 
        ? `資料庫已初始化，共有 ${laws.length} 筆法規` 
        : '資料庫尚未初始化，請發送 POST 請求進行初始化',
    });
  } catch (error) {
    console.error('Failed to get laws:', error);
    return NextResponse.json(
      { error: 'Failed to get laws', details: String(error) },
      { status: 500 }
    );
  }
}