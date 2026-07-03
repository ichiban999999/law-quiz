'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Quiz {
  id: number;
  subject: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  answer: string;
  articles: string;
  explanation: string;
  difficulty: number;
}

interface QuizStats {
  total: number;
  correct: number;
  accuracy: number;
}

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';

  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [stats, setStats] = useState<QuizStats>({ total: 0, correct: 0, accuracy: 0 });
  const [loading, setLoading] = useState(false);
  const [quizCount, setQuizCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // 取得科目列表
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data.subjects))
      .catch(err => console.error('Failed to fetch subjects:', err));
  }, []);

  // 載入題目
  const loadQuizzes = async (subject: string, count: number = 10) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/quizzes?subject=${encodeURIComponent(subject)}&count=${count}`
      );
      const data = await response.json();
      setQuizzes(data.quizzes);
      setCurrentQuizIndex(0);
      setQuizStarted(true);
      setSelectedAnswer('');
      setShowResult(false);
      setCorrectCount(0);
      setWrongCount(0);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      alert('載入題目失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 開始測驗
  const handleStartQuiz = () => {
    if (!selectedSubject) {
      alert('請先選擇科目');
      return;
    }
    loadQuizzes(selectedSubject, quizCount);
  };

  // 選擇答案
  const handleSelectAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  // 提交答案
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      alert('請選擇答案');
      return;
    }

    const currentQuiz = quizzes[currentQuizIndex];
    const correct = selectedAnswer === currentQuiz.answer;
    
    setShowResult(true);
    setIsCorrect(correct);

    // 記錄成績
    try {
      await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: currentQuiz.id,
          subject: currentQuiz.subject,
          answer: selectedAnswer,
          isCorrect: correct,
        }),
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }

    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  // 下一題
  const handleNextQuestion = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      // 測驗結束，顯示結果
      const total = correctCount + wrongCount;
      setStats({
        total,
        correct: correctCount,
        accuracy: total > 0 ? Math.round((correctCount / total) * 100) : 0,
      });
      setQuizStarted(false);
      setShowResult(false);
      setSelectedAnswer('');
    }
  };

  // 返回科目選擇
  const handleBackToSelection = () => {
    setQuizStarted(false);
    setQuizzes([]);
    setSelectedAnswer('');
    setShowResult(false);
  };

  // 取得選項內容
  const getOptionContent = (quiz: Quiz, option: string): string => {
    if (option === 'A') return quiz.option_a;
    if (option === 'B') return quiz.option_b;
    if (option === 'C') return quiz.option_c;
    if (option === 'D') return quiz.option_d;
    return '';
  };

  const currentQuiz = quizzes[currentQuizIndex];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">📝 刷題測驗</h1>

      {!quizStarted ? (
        /* 科目選擇頁面 */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
            選擇科目
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              科目
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">請選擇科目</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              題數
            </label>
            <select
              value={quizCount}
              onChange={(e) => setQuizCount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 題</option>
              <option value={10}>10 題</option>
              <option value={20}>20 題</option>
              <option value={30}>30 題</option>
              <option value={50}>50 題</option>
            </select>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={!selectedSubject || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '載入中...' : '開始測驗'}
          </button>

          {/* 快速進入各科目 */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">快速選擇</h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => {
                    setSelectedSubject(subject);
                    loadQuizzes(subject, quizCount);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : currentQuiz ? (
        /* 測驗頁面 */
        <div>
          {/* 進度條 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
              <span>第 {currentQuizIndex + 1} / {quizzes.length} 題</span>
              <span>✅ {correctCount} | ❌ {wrongCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 題目卡片 */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                {currentQuiz.subject}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                currentQuiz.difficulty === 1 
                  ? 'bg-green-100 text-green-700' 
                  : currentQuiz.difficulty === 2 
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {'⭐'.repeat(currentQuiz.difficulty)}
              </span>
            </div>

            <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-6 leading-relaxed">
              {currentQuiz.question}
            </h2>

            {/* 選項 */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map(option => (
                <button
                  key={option}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? option === currentQuiz.answer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : selectedAnswer === option && option !== currentQuiz.answer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-600 opacity-60'
                      : selectedAnswer === option
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {option}. {getOptionContent(currentQuiz, option)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 結果回饋 */}
          {showResult && (
            <div className={`rounded-xl p-6 mb-6 ${
              isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                <h3 className={`text-lg font-semibold ${
                  isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                }`}>
                  {isCorrect ? '回答正確！' : '回答錯誤'}
                </h3>
              </div>

              <div className="text-slate-700 dark:text-slate-300 space-y-2">
                <p>
                  <strong>正確答案：</strong>
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    {currentQuiz.answer}
                  </span>
                </p>
                <p>
                  <strong>相關法條：</strong>
                  <span className="text-blue-700 dark:text-blue-400">{currentQuiz.articles}</span>
                </p>
                <p>
                  <strong>解析：</strong>
                  {currentQuiz.explanation}
                </p>
              </div>
            </div>
          )}

          {/* 按鈕區域 */}
          <div className="flex gap-4">
            {!showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                提交答案
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
              >
                {currentQuizIndex < quizzes.length - 1 ? '下一題' : '查看成績'}
              </button>
            )}
            <button
              onClick={handleBackToSelection}
              className="px-6 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              返回
            </button>
          </div>
        </div>
      ) : (
        /* 測驗結束 - 顯示統計 */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">🎉 測驗結束！</h2>
          
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">總題數</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.correct}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">答對</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.accuracy}%</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">正確率</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              查看成績紀錄
            </button>
            <button
              onClick={handleBackToSelection}
              className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              重新選擇科目
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">載入中...</div>}>
      <QuizContent />
    </Suspense>
  );
}