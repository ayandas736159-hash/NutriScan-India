
import React, { useEffect, useState } from 'react';
import InfoModal from './InfoModal';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogoClick }) => {
  const [isDark, setIsDark] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
      
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 no-print transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={onLogoClick}>
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none group-hover:scale-105 transition-transform">
              <span className="text-white text-2xl">🍲</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">NutryScan</h1>
              <span className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] leading-tight mt-0.5">India</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-orange-500 dark:hover:text-orange-500 transition-all active:scale-95"
              aria-label="Open Information"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </button>

            <div className="hidden sm:flex items-center px-4 py-1.5 bg-orange-950/20 border border-orange-500/30 rounded-full">
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Beta</span>
            </div>

            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-inner"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-slate-400 dark:text-slate-500 text-sm no-print transition-colors duration-300">
        <p>© {new Date().getFullYear()} NutryScan India. Designed by <a href="https://www.linkedin.com/in/padmanavadas/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors">Padmanava Das</a></p>
        <p className="mt-1 text-xs opacity-75 uppercase tracking-widest font-black">AI Analysis Powered by Gemini-Flash-Latest</p>
      </footer>
    </div>
  );
};

export default Layout;
