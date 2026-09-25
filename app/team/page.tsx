import React from 'react';

export default function TeamPage() {
  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white border border-blue-100 rounded-3xl shadow-xl shadow-blue-900/5 p-8 text-center space-y-6">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-50 text-[#1d4ed8] font-bold text-xs rounded-full mb-3">
            Author
          </span>
          <h1 className="text-2xl font-black text-[#0f172a]">Project Team</h1>
          <p className="text-[#64748b] text-sm mt-1 font-medium">Meet the developer behind this application</p>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              Name
            </span>
            <p className="text-xl font-extrabold text-[#0f172a]">Asaduzzaman Abrar</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              Role
            </span>
            <div>
              <span className="text-xs font-bold text-[#1d4ed8] bg-blue-50 px-4 py-1.5 rounded-full inline-block border border-blue-100">
                Project Developer
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              Deployed On
            </span>
            <p className="text-sm font-semibold text-[#334155]">25 Sep 2026</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
              Contact
            </span>
            <div>
              <a
                href="mailto:abrar.ruet13@gmail.com"
                className="text-sm font-semibold text-[#1d4ed8] hover:underline transition"
              >
                abrar.ruet13@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}