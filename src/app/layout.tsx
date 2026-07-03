import type { Metadata } from 'next';
import '@/globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: '法條本 - 國考刷題平台',
  description: '台灣法律條文查詢與國考刷題平台，提供民法、刑法、憲法等科目測驗',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-300 py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              © 2026 法條本 - 台灣法律條文查詢與國考刷題平台
            </p>
            <p className="text-xs mt-2 text-slate-500">
              法條資料來源：全國法規資料庫 | 本平台僅供學習用途
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}