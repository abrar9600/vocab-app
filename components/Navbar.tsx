'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-2 text-xl font-black text-[#0f172a] tracking-tight">
          <span className="bg-[#1d4ed8] text-white p-1.5 rounded-xl text-sm">V</span>
          <span>Vocab Practice</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              pathname === '/'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-white/80'
            }`}
          >
            Home
          </Link>
          <Link
            href="/team"
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${
              pathname === '/team'
                ? 'bg-[#1d4ed8] text-white shadow-sm'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-white/80'
            }`}
          >
            Team
          </Link>
        </div>
      </div>
    </nav>
  );
}