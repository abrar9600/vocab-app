'use client';

import React, { useState } from 'react';
import GameBoard from '@/components/GameBoard';

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <span className="inline-block px-4 py-1.5 bg-white border border-blue-100 text-[#1d4ed8] font-bold text-xs rounded-full shadow-sm">
          Learn, see, remember.
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0f172a] tracking-tight leading-tight">
          Start your learning
        </h1>
      </div>

      {/* Applications / Features Section */}
      {!isOpen ? (
        <div className="max-w-md mx-auto pt-4">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full p-6 rounded-3xl border border-blue-100 bg-white hover:bg-blue-50/50 hover:border-[#1d4ed8]/30 font-bold text-[#0f172a] transition-all shadow-xl shadow-blue-900/5 flex items-center justify-between group"
          >
            <div className="flex items-center space-x-4">
              <span className="p-3 bg-blue-50 text-[#1d4ed8] rounded-2xl text-xl">📚</span>
              <div className="text-left">
                <span className="text-lg font-extrabold block text-[#0f172a] group-hover:text-[#1d4ed8] transition">
                  Vocabulary Learning
                </span>
                <span className="text-xs font-normal text-[#64748b]">
                  Study & Match modes available
                </span>
              </div>
            </div>
            <span className="w-10 h-10 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
              &rarr;
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs font-bold text-[#64748b] hover:text-[#0f172a] hover:underline transition flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Features</span>
          </button>
          <GameBoard />
        </div>
      )}
    </div>
  );
}