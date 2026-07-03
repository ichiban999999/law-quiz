'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
          ⚖️ 法條本
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          台灣法律條文查詢與國考刷題平台<br />
          法條查詢、試題練習、成績追蹤，一次到位！
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/articles"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition"
          >
            📖 開始查詢法條
          </Link>
          <Link
            href="/quiz"
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-green-700 transition"
          >
            📝 開始刷題
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white">
          平台特色
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
              完整法條資料庫
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              涵蓋憲法、民法、刑法、行政法等多個法律領域，同步全國法規資料庫最新修法內容。
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
              國考刷題系統
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              針對律師、司法官、高考三等國考設計，每題附詳細解析與相關法條，幫助高效準備。
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
              成績追蹤分析
            </h3>
            <p className="text-slate-600 dark:text-slate-300">
              記錄測驗成績與錯題，提供各科目的正確率統計，讓您清楚掌握學習進度。
            </p>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-12 bg-white dark:bg-slate-800 rounded-xl p-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          涵蓋科目
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['憲法', '民法', '刑法', '行政法', '民事訴訟法', '刑事訴訟法', '商事法', '勞動法'].map((subject) => (
            <Link
              key={subject}
              href={`/quiz?subject=${encodeURIComponent(subject)}`}
              className="bg-blue-50 dark:bg-slate-700 p-4 rounded-lg text-center hover:bg-blue-100 dark:hover:bg-slate-600 transition"
            >
              <span className="text-blue-600 dark:text-blue-400 font-medium">{subject}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          準備好開始了嗎？
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
          登入帳號，開始您的國考準備之旅！
        </p>
        <Link
          href="/api/auth/signin"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 transition inline-block"
        >
          🔐 立即登入
        </Link>
      </section>
    </div>
  );
}