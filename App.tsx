
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import NutritionDashboard from './components/NutritionDashboard';
import { AppStatus, NutritionAnalysis } from './types';
import { analyzeFoodImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageCaptured = useCallback(async (base64: string) => {
    setStatus(AppStatus.LOADING);
    setError(null);
    setImagePreview(`data:image/jpeg;base64,${base64}`);

    try {
      const result = await analyzeFoodImage(base64);
      setAnalysis(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze meal. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setAnalysis(null);
    setError(null);
    setImagePreview(null);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                "Stop guessing. <br/>
                <span className="text-orange-600 underline decoration-orange-200 underline-offset-8">Know exactly</span> what you eat."
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                Namaste! Welcome to GovGuide India's specialized Nutrition wing. Get verified checklists for your Bengali and Indian household meals.
              </p>
            </div>
            <Scanner onImageCaptured={handleImageCaptured} isLoading={false} />
            
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-xl">🥛</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Macro Audit</h3>
                <p className="text-sm text-slate-500">Precise detection of Carbs, Proteins, and Fats in traditional curries.</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-xl">⚖️</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">Zero-Error Estimation</h3>
                <p className="text-sm text-slate-500">Specialized logic for Bengali household portion sizes and oil usage.</p>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-slate-100 border-t-orange-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🔍</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">AI Scanning in Progress...</h2>
              <p className="text-slate-500 mt-2">Checking your meal against 10,000+ Indian food variants.</p>
            </div>
            <div className="space-y-2 w-full max-w-xs">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-2/3 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Running Nutritional Audit</p>
            </div>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
          </div>
        )}

        {status === AppStatus.SUCCESS && analysis && (
          <NutritionDashboard 
            data={analysis} 
            onReset={reset} 
            imagePreview={imagePreview}
          />
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-10 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Audit Failed</h2>
            <p className="text-red-700 mb-8">{error}</p>
            <button 
              onClick={reset}
              className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
