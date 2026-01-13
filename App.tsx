
import React, { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import NutritionDashboard from './components/NutritionDashboard';
import { AppStatus, NutritionAnalysis, Language } from './types';
import { analyzeFoodImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const handleImageCaptured = useCallback(async (base64: string) => {
    setStatus(AppStatus.LOADING);
    setError(null);
    setImagePreview(`data:image/jpeg;base64,${base64}`);

    try {
      const result = await analyzeFoodImage(base64, language);
      setAnalysis(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setError(err.message || "Failed to analyze meal. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  }, [language]);

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setAnalysis(null);
    setError(null);
    setImagePreview(null);
  };

  const translations = {
    en: {
      title: "Stop guessing. Know exactly what you eat.",
      subtitle: "Namaste! Welcome to GovGuide India's specialized Nutrition wing. Get verified checklists for your Bengali and Indian household meals.",
      loading: "AI Scanning in Progress...",
      loadingSub: "Checking your meal against 10,000+ Indian food variants.",
      audit: "Running Nutritional Audit"
    },
    bn: {
      title: "অন্দাজ বন্ধ করুন। আপনি কি খাচ্ছেন তা সঠিকভাবে জানুন।",
      subtitle: "নমস্কার! GovGuide India-র বিশেষ পুষ্টি বিভাগে আপনাকে স্বাগতম। আপনার বাঙালি ও ভারতীয় খাবারের জন্য যাচাইকৃত তালিকা পান।",
      loading: "AI স্ক্যানিং চলছে...",
      loadingSub: "১০,০০০+ ভারতীয় খাবারের সাথে আপনার খাবার যাচাই করা হচ্ছে।",
      audit: "পুষ্টি অডিট চলছে"
    },
    hi: {
      title: "अनुमान लगाना बंद करें। जानें कि आप क्या खा रहे हैं।",
      subtitle: "नमस्ते! GovGuide India के विशेष पोषण विंग में आपका स्वागत है। अपने बंगाली और भारतीय भोजन के लिए सत्यापित चेकलिस्ट प्राप्त करें।",
      loading: "AI स्कैनिंग जारी है...",
      loadingSub: "10,000+ भारतीय खाद्य पदार्थों के साथ आपके भोजन की जाँच की जा रही है।",
      audit: "पोषण ऑडिट चल रहा है"
    }
  };

  const t = translations[language];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-center mb-8 gap-2">
          {(['en', 'bn', 'hi'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                language === l ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {l === 'en' ? 'English' : l === 'bn' ? 'বাংলা' : 'हिन्दी'}
            </button>
          ))}
        </div>

        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                {t.title.split('. ').map((line, i) => (
                  <React.Fragment key={i}>
                    {i === 1 ? <span className="text-orange-600 underline decoration-orange-200 underline-offset-8">{line}</span> : line}
                    {i === 0 && <br/>}
                  </React.Fragment>
                ))}
              </h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto">
                {t.subtitle}
              </p>
            </div>
            <Scanner onImageCaptured={handleImageCaptured} isLoading={false} language={language} />
            
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
              <h2 className="text-2xl font-bold text-slate-900">{t.loading}</h2>
              <p className="text-slate-500 mt-2">{t.loadingSub}</p>
            </div>
            <div className="space-y-2 w-full max-w-xs">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 w-2/3 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t.audit}</p>
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
            language={language}
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
