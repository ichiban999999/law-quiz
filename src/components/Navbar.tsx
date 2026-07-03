'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              法條本
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/articles" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              📖 法條查詢
            </Link>
            <Link href="/quiz" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              📝 刷題測驗
            </Link>
            <Link href="/dashboard" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
              📊 我的成績
            </Link>
            <Link href="/api/auth/signin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              🔐 登入
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-700 dark:text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/articles" className="block py-2 text-slate-700 dark:text-slate-300" onClick={() => setIsOpen(false)}>
              📖 法條查詢
            </Link>
            <Link href="/quiz" className="block py-2 text-slate-700 dark:text-slate-300" onClick={() => setIsOpen(false)}>
              📝 刷題測驗
            </Link>
            <Link href="/dashboard" className="block py-2 text-slate-700 dark:text-slate-300" onClick={() => setIsOpen(false)}>
              📊 我的成績
            </Link>
            <Link href="/api/auth/signin" className="block py-2 text-blue-600 dark:text-blue-400 font-medium" onClick={() => setIsOpen(false)}>
              🔐 登入
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}