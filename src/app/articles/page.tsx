'use client';

import { useState, useEffect } from 'react';

interface LawItem {
  name: string;
  url: string;
}

const lawCategories = [
  {
    name: '憲法',
    laws: [
      { name: '中華民國憲法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000001' },
      { name: '憲法增修條文', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000002' },
      { name: '司法院大法官憲法解釋', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000003' },
    ]
  },
  {
    name: '民事法',
    laws: [
      { name: '民法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000004' },
      { name: '民事訴訟法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000005' },
      { name: '家事事件法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000006' },
      { name: '強制執行法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000007' },
      { name: '涉外民事法律適用法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000008' },
      { name: '非訟事件法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000009' },
      { name: '仲裁法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000010' },
      { name: '公證法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000011' },
    ]
  },
  {
    name: '刑事法',
    laws: [
      { name: '中華民國刑法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000012' },
      { name: '刑事訴訟法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000013' },
      { name: '刑事補償法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000014' },
      { name: '性侵害犯罪防治法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000015' },
    ]
  },
  {
    name: '行政法',
    laws: [
      { name: '行政程序法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000016' },
      { name: '行政訴訟法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000017' },
      { name: '行政罰法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000018' },
      { name: '行政執行法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000019' },
      { name: '訴願法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000020' },
      { name: '國家賠償法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000021' },
      { name: '地方制度法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000022' },
      { name: '公務員服務法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000023' },
    ]
  },
  {
    name: '商事法',
    laws: [
      { name: '公司法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000024' },
      { name: '保險法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000025' },
      { name: '票據法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000026' },
      { name: '證券交易法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000027' },
      { name: '海商法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000028' },
      { name: '企業併購法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000029' },
    ]
  },
  {
    name: '司法制度',
    laws: [
      { name: '法院組織法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000030' },
      { name: '法官法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000031' },
      { name: '律師法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000032' },
    ]
  },
  {
    name: '勞動與社會法',
    laws: [
      { name: '勞動基準法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000033' },
      { name: '勞工保險條例', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000034' },
      { name: '性別平等工作法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000035' },
      { name: '消費者保護法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000036' },
    ]
  },
  {
    name: '土地與不動產',
    laws: [
      { name: '土地法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000037' },
      { name: '土地徵收條例', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000038' },
      { name: '都市計畫法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000039' },
    ]
  },
  {
    name: '智慧財產',
    laws: [
      { name: '著作權法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000040' },
      { name: '商標法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000041' },
      { name: '專利法', url: 'https://law.moj.gov.tw/LAW/LawMobile.aspx?ID=DL000042' },
    ]
  },
];

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredLaws = lawCategories
    .map(category => ({
      ...category,
      laws: category.laws.filter(law =>
        law.name.includes(searchTerm) || searchTerm === ''
      )
    }))
    .filter(category => category.laws.length > 0);

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

      {/* Quick Access to National Law Database */}
      <div className="mb-8 p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-600">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 所有法條資料同步自{' '}
          <a 
            href="https://law.moj.gov.tw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200"
          >
            全國法規資料庫 (law.moj.gov.tw)
          </a>
        </p>
      </div>

      {/* Law Categories */}
      <div className="space-y-4">
        {filteredLaws.map((category) => (
          <div key={category.name} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {category.name}
              </h2>
              <span className="text-slate-500 dark:text-slate-400">
                {expandedCategories[category.name] ? '▾' : '▸'}
              </span>
            </button>
            
            {expandedCategories[category.name] && (
              <div className="px-6 pb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.laws.map((law) => (
                  <a
                    key={law.name}
                    href={law.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                  >
                    <span className="text-blue-600 dark:text-blue-400">📄</span>
                    <span className="text-slate-700 dark:text-slate-300">{law.name}</span>
                    <span className="ml-auto text-slate-400">↗</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLaws.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <p className="text-xl">找不到符合搜尋條件的法典</p>
          <p className="text-sm mt-2">請嘗試其他關鍵字</p>
        </div>
      )}
    </div>
  );
}