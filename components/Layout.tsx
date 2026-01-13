
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white text-2xl">🍲</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">NutriScan <span className="text-orange-600">India</span></h1>
              <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">By Padmanava Das</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200 uppercase">
              Live AI Scanner
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} NutriScan India. Designed by Padmanava Das.</p>
        <p className="mt-1">Dedicated to simplifying nutrition for Indian households.</p>
      </footer>
    </div>
  );
};

export default Layout;
