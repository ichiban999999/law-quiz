import { NextResponse } from 'next/server';
import { getAllLaws, saveLaw, clearLaws } from '@/db';

const lawDefinitions = [
  { id: 'DL000001', name: '中華民國憲法', category: '憲法' },
  { id: 'DL000002', name: '憲法增修條文', category: '憲法' },
  { id: 'DL000003', name: '司法院大法官憲法解釋', category: '憲法' },
  { id: 'DL000004', name: '民法', category: '民事法' },
  { id: 'DL000005', name: '民事訴訟法', category: '民事法' },
  { id: 'DL000006', name: '家事事件法', category: '民事法' },
  { id: 'DL000007', name: '強制執行法', category: '民事法' },
  { id: 'DL000008', name: '涉外民事法律適用法', category: '民事法' },
  { id: 'DL000009', name: '非訟事件法', category: '民事法' },
  { id: 'DL000010', name: '仲裁法', category: '民事法' },
  { id: 'DL000012', name: '中華民國刑法', category: '刑事法' },
  { id: 'DL000013', name: '刑事訴訟法', category: '刑事法' },
  { id: 'DL000014', name: '刑事補償法', category: '刑事法' },
  { id: 'DL000015', name: '性侵害犯罪防治法', category: '刑事法' },
  { id: 'DL000016', name: '行政程序法', category: '行政法' },
  { id: 'DL000017', name: '行政訴訟法', category: '行政法' },
  { id: 'DL000018', name: '行政罰法', category: '行政法' },
  { id: 'DL000019', name: '行政執行法', category: '行政法' },
  { id: 'DL000020', name: '訴願法', category: '行政法' },
  { id: 'DL000021', name: '國家賠償法', category: '行政法' },
  { id: 'DL000022', name: '地方制度法', category: '行政法' },
  { id: 'DL000024', name: '公司法', category: '商事法' },
  { id: 'DL000025', name: '保險法', category: '商事法' },
  { id: 'DL000026', name: '票據法', category: '商事法' },
  { id: 'DL000027', name: '證券交易法', category: '商事法' },
  { id: 'DL000028', name: '海商法', category: '商事法' },
  { id: 'DL000030', name: '法院組織法', category: '司法制度' },
  { id: 'DL000031', name: '法官法', category: '司法制度' },
  { id: 'DL000032', name: '律師法', category: '司法制度' },
  { id: 'DL000033', name: '勞動基準法', category: '勞動與社會法' },
  { id: 'DL000034', name: '勞工保險條例', category: '勞動與社會法' },
  { id: 'DL000035', name: '性別平等工作法', category: '勞動與社會法' },
  { id: 'DL000036', name: '消費者保護法', category: '勞動與社會法' },
  { id: 'DL000037', name: '土地法', category: '土地與不動產' },
  { id: 'DL000038', name: '土地徵收條例', category: '土地與不動產' },
  { id: 'DL000039', name: '都市計畫法', category: '土地與不動產' },
  { id: 'DL000040', name: '著作權法', category: '智慧財產' },
  { id: 'DL000041', name: '商標法', category: '智慧財產' },
  { id: 'DL000042', name: '專利法', category: '智慧財產' },
];

function parseLawResponse(data: any): string {
  if (!data || !data.Data) {
    return '[無法解析的回傳格式]';
  }
  
  const lawDetail = data.Data.LawDetail || data.Data;
  let content = '';
  
  if (lawDetail.Items && Array.isArray(lawDetail.Items)) {
    const items = lawDetail.Items.map((item: any) => {
      const itemNum = item.LName || item.ZHNM || item.No || '';
      const itemContent = item.Content || item.NR || item.MContent || '';
      return itemNum ? `第${itemNum}條 ${itemContent}` : itemContent;
    });
    if (items.length > 0) {
      content = items.filter((i: string) => i).join('\n\n');
    }
  }
  
  if (!content && lawDetail.Chapters && Array.isArray(lawDetail.Chapters)) {
    content = lawDetail.Chapters.map((ch: any) => {
      const chName = ch.ZM || ch.Name || '';
      const chArticles = ch.Items || ch.Articles || [];
      const articles = chArticles.map((a: any) => 
        `第${a.LName || a.No || ''}條 ${a.Content || a.NR || ''}`
      ).filter(Boolean).join('\n');
      return chName ? `【${chName}】\n${articles}` : articles;
    }).join('\n\n');
  }
  
  if (!content && lawDetail.LawArticle && Array.isArray(lawDetail.LawArticle)) {
    content = lawDetail.LawArticle.map((a: any) => {
      const no = a.ZHNM || a.No || a.ItemNo || '';
      const text = a.NR || a.Content || a.Text || '';
      return no ? `第${no}條 ${text}` : text;
    }).filter(Boolean).join('\n\n');
  }
  
  if (!content) {
    const rawJson = JSON.stringify(lawDetail, null, 2);
    content = rawJson.length > 5000 ? rawJson.substring(0, 5000) + '...\n[內容過長，已截斷]' : rawJson;
  }
  
  return content || '[暫無內容]';
}

export async function POST(request: Request) {
  const { all, ids } = await request.json().catch(() => ({ all: false, ids: [] }));
  
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
  
  let synced = 0;
  let failed = 0;
  
  for (const law of lawsToSync) {
    try {
      const response = await fetch(`https://law.moj.gov.tw/API/${law.id}`, {
        signal: AbortSignal.timeout(15000),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const content = parseLawResponse(data);
      
      saveLaw({
        id: law.id,
        name: law.name,
        category: law.category,
        content,
        updated_at: new Date().toISOString(),
      });
      
      synced++;
    } catch (error) {
      console.error(`Failed to sync ${law.name}:`, error);
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return NextResponse.json({
    success: true,
    synced,
    failed,
    total: lawsToSync.length,
  });
}

export async function GET() {
  const laws = getAllLaws();
  
  const summary = laws.map((l: any) => ({
    id: l.id,
    name: l.name,
    category: l.category,
    hasContent: l.content && l.content !== '[暫無內容]' && !l.content.startsWith('[同步失敗'),
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