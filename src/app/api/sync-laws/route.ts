import { NextResponse } from 'next/server';
import { getAllLaws, saveLaw } from '@/db';

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
 * 使用 Cheerio-like 的正則表達式解析
 */
function parseLawHTML(html: string): string {
  // 提取法規名稱
  const nameMatch = html.match(/<h2[^>]*>[^<]*<\/h2>/);
  const lawName = nameMatch ? nameMatch[0].replace(/<[^>]+>/g, '') : '';
  
  // 提取所有條文內容
  // 匹配模式: <div class="row">...<div class="col-data"><div class="law-article">...</div></div></div>
  const articleRegex = /<div\s+class="row"[^>]*>.*?<div\s+class="col-data">.*?<div\s+class="law-article">([\s\S]*?)<\/div>/gi;
  
  let articles: string[] = [];
  let match;
  
  while ((match = articleRegex.exec(html)) !== null) {
    let content = match[1];
    // 移除 HTML 標籤
    content = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (content && content.length > 5) {
      articles.push(content);
    }
  }
  
  // 如果找到了條文，返回格式化內容
  if (articles.length > 0) {
    return `【${lawName}】\n\n` + articles.join('\n\n');
  }
  
  // 如果沒找到條文，嘗試另一種格式
  // 匹配: <div class="col-data"><div class="law-article">...</div></div>
  const simpleArticleRegex = /class="law-article"[^>]*>([\s\S]*?)<\/div>/g;
  let simpleMatches: string[] = [];
  let simpleMatch;
  
  while ((simpleMatch = simpleArticleRegex.exec(html)) !== null) {
    let content = simpleMatch[1];
    content = content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (content && content.length > 5) {
      simpleMatches.push(content);
    }
  }
  
  if (simpleMatches.length > 0) {
    return `【${lawName}】\n\n` + simpleMatches.join('\n\n');
  }
  
  return '[無法解析內容，請參考官方網站]';
}

async function fetchLawFromHTML(url: string, lawName: string): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LawQuizApp/1.0 (contact: lawquiz@example.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(20000),
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const html = await response.text();
    const content = parseLawHTML(html);
    
    return { success: true, content };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function POST(request: Request) {
  const { all, ids, force } = await request.json().catch(() => ({ all: false, ids: [], force: false }));
  
  let lawsToSync = [];
  
  if (all) {
    lawsToSync = lawDefinitions;
  } else if (ids && Array.isArray(ids) && ids.length > 0) {
    lawsToSync = lawDefinitions.filter(l => ids.includes(l.id));
  } else {
    return NextResponse.json({
      success: false,
      error: 'Please specify "all: true" or provide "ids" array',
    }, { status: 400 });
  }
  
  // 檢查是否已有資料
  const existingLaws = getAllLaws();
  if (!force && existingLaws.length > 0) {
    return NextResponse.json({
      success: true,
      synced: 0,
      skipped: existingLaws.length,
      failed: 0,
      total: lawsToSync.length,
      message: `已有 ${existingLaws.length} 筆法規資料。如需重新同步，請設定 force: true。`,
    });
  }
  
  // 如果強制同步且已有資料，先清除
  if (force && existingLaws.length > 0) {
    // Note: We can't clear laws directly, so we'll just overwrite
  }
  
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const law of lawsToSync) {
    // 檢查是否已存在
    const existing = existingLaws.find((l: any) => l.id === law.id);
    if (existing && existing.content && !existing.content.includes('[無法解析') && !existing.content.includes('[同步失敗')) {
      skipped++;
      console.log(`⊘ Skipped (already has content): ${law.name}`);
      continue;
    }
    
    const result = await fetchLawFromHTML(law.url, law.name);
    
    if (result.success && result.content) {
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content: result.content,
        updated_at: new Date().toISOString(),
      });
      
      if (result.content.includes('[無法解析') || result.content.includes('[同步失敗')) {
        failed++;
        console.log(`✗ Failed to parse: ${law.name}`);
      } else {
        synced++;
        console.log(`✓ Synced: ${law.name} (${result.content.length} chars)`);
      }
    } else {
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content: `[同步失敗: ${result.error}] 請參考官方網站: ${law.url}`,
        updated_at: new Date().toISOString(),
      });
      failed++;
      console.log(`✗ Failed: ${law.name} - ${result.error}`);
    }
    
    // 避免請求太快，加個小延遲
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return NextResponse.json({
    success: true,
    synced,
    skipped,
    failed,
    total: lawsToSync.length,
    message: `同步完成: ${synced} 成功, ${skipped} 跳過, ${failed} 失敗`,
  });
}

export async function GET() {
  const laws = getAllLaws();
  
  const summary = laws.map((l: any) => ({
    id: l.id,
    name: l.name,
    category: l.category,
    hasContent: l.content && !l.content.includes('[無法解析') && !l.content.includes('[同步失敗'),
    updated_at: l.updated_at,
  }));
  
  const withContent = summary.filter((s: any) => s.hasContent).length;
  
  return NextResponse.json({
    success: true,
    total: laws.length,
    withContent,
    withoutContent: laws.length - withContent,
    laws: summary,
  });
}