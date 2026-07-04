'use client';

import { useState, useEffect } from 'react';

interface LawItem {
  id: string;
  name: string;
  updated_at?: string;
}

interface LawCategory {
  [category: string]: LawItem[];
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [lawsData, setLawsData] = useState<LawCategory>({});
  const [loading, setLoading] = useState(true);
  const [selectedLaw, setSelectedLaw] = useState<LawItem | null>(null);
  const [lawContent, setLawContent] = useState('');
  const [fetchingContent, setFetchingContent] = useState(false);

  // 法規定義 - 用於顯示即使尚未同步
  const lawDefinitions: LawCategory = {
    '憲法': [
      { id: 'DL000001', name: '中華民國憲法' },
      { id: 'DL000002', name: '憲法增修條文' },
      { id: 'DL000003', name: '司法院大法官憲法解釋' },
    ],
    '民事法': [
      { id: 'DL000004', name: '民法' },
      { id: 'DL000005', name: '民事訴訟法' },
      { id: 'DL000006', name: '家事事件法' },
      { id: 'DL000007', name: '強制執行法' },
      { id: 'DL000008', name: '涉外民事法律適用法' },
      { id: 'DL000009', name: '非訟事件法' },
      { id: 'DL000010', name: '仲裁法' },
    ],
    '刑事法': [
      { id: 'DL000012', name: '中華民國刑法' },
      { id: 'DL000013', name: '刑事訴訟法' },
      { id: 'DL000014', name: '刑事補償法' },
      { id: 'DL000015', name: '性侵害犯罪防治法' },
    ],
    '行政法': [
      { id: 'DL000016', name: '行政程序法' },
      { id: 'DL000017', name: '行政訴訟法' },
      { id: 'DL000018', name: '行政罰法' },
      { id: 'DL000019', name: '行政執行法' },
      { id: 'DL000020', name: '訴願法' },
      { id: 'DL000021', name: '國家賠償法' },
      { id: 'DL000022', name: '地方制度法' },
    ],
    '商事法': [
      { id: 'DL000024', name: '公司法' },
      { id: 'DL000025', name: '保險法' },
      { id: 'DL000026', name: '票據法' },
      { id: 'DL000027', name: '證券交易法' },
      { id: 'DL000028', name: '海商法' },
    ],
    '司法制度': [
      { id: 'DL000030', name: '法院組織法' },
      { id: 'DL000031', name: '法官法' },
      { id: 'DL000032', name: '律師法' },
    ],
    '勞動與社會法': [
      { id: 'DL000033', name: '勞動基準法' },
      { id: 'DL000034', name: '勞工保險條例' },
      { id: 'DL000035', name: '性別平等工作法' },
      { id: 'DL000036', name: '消費者保護法' },
    ],
    '土地與不動產': [
      { id: 'DL000037', name: '土地法' },
      { id: 'DL000038', name: '土地徵收條例' },
      { id: 'DL000039', name: '都市計畫法' },
    ],
    '智慧財產': [
      { id: 'DL000040', name: '著作權法' },
      { id: 'DL000041', name: '商標法' },
      { id: 'DL000042', name: '專利法' },
    ],
  };

  // 取得法規資料
  useEffect(() => {
    const fetchLaws = async () => {
      try {
        const response = await fetch('/api/laws');
        const data = await response.json();
        
        if (data.success && Object.keys(data.laws).length > 0) {
          setLawsData(data.laws);
        } else {
          // 如果還沒有法規資料，使用預定義的分類
          setLawsData(lawDefinitions);
        }
      } catch (error) {
        console.error('Failed to fetch laws:', error);
        // 出錯時使用預定義的分類
        setLawsData(lawDefinitions);
      } finally {
        setLoading(false);
      }
    };

    fetchLaws();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 取得法規內容
  const fetchLawContent = async (law: LawItem) => {
    setSelectedLaw(law);
    setFetchingContent(true);
    setLawContent('載入中...');

    try {
      const response = await fetch(`/api/laws?id=${law.id}`);
      const data = await response.json();

      if (data.success && data.law) {
        // 如果有內容，顯示內容
        if (data.law.content && data.law.content !== '[暫無內容]') {
          setLawContent(data.law.content);
        } else {
          setLawContent('此法規內容尚未同步，請至後台執行初始化以取得完整資料。\n\n來源：https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=' + law.id);
        }
      } else {
        setLawContent('無法取得此法規內容。\n\n請直接前往官方網站查詢：\nhttps://law.moj.gov.tw/LAW/LawMobile.aspx?ID=' + law.id);
      }
    } catch (error) {
      setLawContent('發生錯誤，無法取得法規內容。\n\n請直接前往官方網站：\nhttps://law.moj.gov.tw/LAW/LawMobile.aspx?ID=' + law.id);
    } finally {
      setFetchingContent(false);
    }
  };

  // 過濾法規
  const filteredLaws = Object.entries(lawsData).reduce((acc, [category, laws]) => {
    const filteredLaws = laws.filter(law =>
      law.name.includes(searchTerm) || searchTerm === ''
    );
    if (filteredLaws.length > 0) {
      acc[category] = filteredLaws;
    }
    return acc;
  }, {} as LawCategory);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">📖 法條查詢</h1>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="搜尋法典名稱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-600">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 法規資料來源：{' '}
          <a 
            href="https://law.moj.gov.tw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200"
          >
            全國法規資料庫
          </a>
          {' '}- 點擊法典名稱即可查看內容
        </p>
      </div>

      {/* Law Content Modal */}
      {selectedLaw && (
        <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-blue-200 dark:border-slate-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              📄 {selectedLaw.name}
            </h2>
            <button
              onClick={() => { setSelectedLaw(null); setLawContent(''); }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              ✕
            </button>
          </div>
          
          {fetchingContent ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">正在載入法規內容...</p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-300 font-sans">
                {lawContent}
              </pre>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            <a
              href={`https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=${selectedLaw.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              前往官方網站查看 ↗
            </a>
          </div>
        </div>
      )}

      {/* Law Categories */}
      {Object.keys(filteredLaws).length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-xl">暫無法規資料</p>
          <p className="text-sm mt-2">請先執行資料庫初始化以載入法規</p>
          <button
            onClick={async () => {
              try {
                await fetch('/api/init-db', { method: 'POST' });
                window.location.reload();
              } catch (e) {
                alert('初始化失敗，請稍後再試');
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            初始化法規資料
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(filteredLaws).map(([category, laws]) => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {category}
                </h2>
                <span className="text-slate-500 dark:text-slate-400">
                  {expandedCategories[category] ? '▾' : '▸'}
                </span>
              </button>
              
              {expandedCategories[category] && (
                <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {laws.map((law) => (
                    <button
                      key={law.id}
                      onClick={() => fetchLawContent(law)}
                      className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition border border-transparent hover:border-blue-200 dark:hover:border-blue-700 text-left"
                    >
                      <span className="text-blue-600 dark:text-blue-400">📄</span>
                      <span className="text-slate-700 dark:text-slate-300">{law.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searchTerm && Object.values(filteredLaws).every(laws => laws.length === 0) && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-xl">找不到符合搜尋條件的法典</p>
          <p className="text-sm mt-2">請嘗試其他關鍵字</p>
        </div>
      )}
    </div>
  );
}