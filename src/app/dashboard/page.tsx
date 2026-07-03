'use client';

import { useState, useEffect } from 'react';

interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface ScoreRecord {
  id: number;
  subject: string;
  is_correct: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<SubjectStats[]>([]);
  const [overallStats, setOverallStats] = useState({ total: 0, correct: 0, accuracy: 0 });
  const [recentRecords, setRecentRecords] = useState<ScoreRecord[]>([]);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.stats || []);
        setOverallStats(data.overall || { total: 0, correct: 0, accuracy: 0 });
        setRecentRecords(data.recent || []);
        setWrongAnswerCount(data.wrongAnswerCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (accuracy >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <p className="text-xl text-slate-500 dark:text-slate-400">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">📊 我的成績</h1>

      {/* 整體統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">總作答題數</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{overallStats.total}</p>
            </div>
            <span className="text-4xl">📝</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">答對題數</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{overallStats.correct}</p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">整體正確率</p>
              <p className={`text-3xl font-bold ${getAccuracyColor(overallStats.accuracy)}`}>
                {overallStats.accuracy}%
              </p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>
        </div>
      </div>

      {/* 錯題本 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            ❌ 錯題本
          </h2>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">
            {wrongAnswerCount} 題待複習
          </span>
        </div>
        
        {wrongAnswerCount > 0 ? (
          <div className="space-y-3">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              您共有 {wrongAnswerCount} 題錯題需要複習，建議前往刷題頁面加強練習。
            </p>
            <a
              href="/quiz"
              className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              前往複習錯題
            </a>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-slate-600 dark:text-slate-400">太棒了！目前沒有錯題記錄</p>
          </div>
        )}
      </div>

      {/* 各科成績 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          📚 各科成績
        </h2>

        {userStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userStats.map((stat) => (
              <div
                key={stat.subject}
                className={`p-4 rounded-lg border ${getAccuracyBg(stat.accuracy)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">{stat.subject}</h3>
                  <span className={`text-lg font-bold ${getAccuracyColor(stat.accuracy)}`}>
                    {stat.accuracy}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>答對 {stat.correct} / 總 {stat.total} 題</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stat.accuracy >= 80
                        ? 'bg-green-500'
                        : stat.accuracy >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.accuracy}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              還沒有成績記錄，快去刷題吧！
            </p>
            <a
              href="/quiz"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              開始刷題
            </a>
          </div>
        )}
      </div>

      {/* 最近作答記錄 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          📋 最近作答記錄
        </h2>

        {recentRecords.length > 0 ? (
          <div className="space-y-2">
            {recentRecords.slice(0, 10).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${record.is_correct ? 'text-green-500' : 'text-red-500'}`}>
                    {record.is_correct ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {record.subject}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(record.created_at).toLocaleString('zh-TW')}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${
                    record.is_correct
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {record.is_correct ? '答對' : '答錯'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600 dark:text-slate-400">尚無作答記錄</p>
          </div>
        )}
      </div>
    </div>
  );
}