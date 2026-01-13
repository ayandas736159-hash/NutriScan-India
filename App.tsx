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
      setError(err.message || "Something went wrong. Let's try scanning again.");
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
      title: "Homemade ≠ Healthy.",
      subtitle: "Most Indian home meals are 'Carb Bombs' hidden in plain sight. Using ICMR guidelines, we reveal the hidden math of your plate.",
      stat1: "1 in 4",
      stat1Sub: "Adults in India are at risk of lifestyle diseases (NFHS-5)",
      stat2: "70%",
      stat2Sub: "Average Indian diet consists of refined carbs (ICMR)",
      stat3: "120kcal",
      stat3Sub: "Hidden calories in just 1 tbsp of Mustard Oil",
      loading: "Scanning Your Plate...",
      loadingSub: "Calculating oil soak and the carb-to-protein balance.",
      audit: "Real Meal Scan",
      trapsTitle: "Why Use NutryScan?",
      trap1: "The Oil Soak",
      trap1Sub: "'Bhaja' can absorb 3+ spoons of oil, adding 400 calories silently.",
      trap2: "The Rice Rush",
      trap2Sub: "Excess rice-to-protein ratio causes energy crashes and fat storage.",
      trap3: "Protein Gap",
      trap3Sub: "80% of Indian diets lack essential protein levels.",
      errorTitle: "Analysis Interrupted",
      errorMessage: "Something went wrong. Please try scanning again.",
      retryButton: "RETRY SCAN"
    },
    bn: {
      title: "বাড়ির খাবার মানেই কি ভালো?",
      subtitle: "আমাদের থালিতে প্রায়ই প্রয়োজনের চেয়ে অনেক বেশি কার্বোহাইড্রেট এবং তেল থাকে। ICMR-এর নির্দেশিকা মেনে আপনার খাবারের একটি Honest Check নিন।",
      stat1: "৪ জনে ১ জন",
      stat1Sub: "ভারতীয় প্রাপ্তবয়স্ক এখন স্থূলতা বা মেদজনিত সমস্যায় আক্রান্ত (NFHS-5)",
      stat2: "৭০%",
      stat2Sub: "গড় ভারতীয় ডায়েটে অতিরিক্ত কার্বোহাইড্রেট থাকে (ICMR)",
      stat3: "১২০ kcal",
      stat3Sub: "মাত্র ১ চামচ সরষের তেলে লুকানো ক্যালরি",
      loading: "প্লেট স্ক্যান করা হচ্ছে...",
      loadingSub: "তেলের পরিমাণ এবং কার্ব-প্রোটিন অনুপাত সঠিক ভাবে দেখা হচ্ছে।",
      audit: "Real Meal স্ক্যান",
      trapsTitle: "কেন NutryScan ব্যবহার করবেন?",
      trap1: "তেল সোক",
      trap1Sub: "যেকোনো 'ভাজা' ৩ চামচের বেশি তেল শুষে নিতে পারে, যা ওজন বাড়ায়।",
      trap2: "ভাতের আধিক্য",
      trap2Sub: "প্রোটিনের তুলনায় ভাতের পরিমাণ বেশি হলে শরীরে ক্লান্তি আসে।",
      trap3: "প্রোটিন অভাব",
      trap3Sub: "প্রায় ৮০% ভারতীয়র খাবারে সঠিক প্রোটিনের অভাব রয়েছে।",
      errorTitle: "বিশ্লেষণ বাধাপ্রাপ্ত",
      errorMessage: "কিছু ভুল হয়েছে। অনুগ্রহ করে আবার স্ক্যান করার চেষ্টা করুন।",
      retryButton: "পুনরায় স্ক্যান করুন"
    },
    hi: {
      title: "घर का खाना ≠ हेल्दी।",
      subtitle: "हमारी थालियों में अक्सर जरूरत से ज्यादा कार्ब्स और तेल होता है। ICMR के नियमों के अनुसार अपने भोजन का Honest Check प्राप्त करें।",
      stat1: "4 में से 1",
      stat1Sub: "भारतीय वयस्क अब जीवनशैली रोगों के खतरे में हैं (NFHS-5)",
      stat2: "70%",
      stat2Sub: "औसत भारतीय आहार में केवल रिफाइंड कार्ब्स होते हैं (ICMR)",
      stat3: "120kcal",
      stat3Sub: "केवल 1 चम्मच सरसों के तेल में छिपी कैलोरी",
      loading: "थाली स्कैन हो रही है...",
      loadingSub: "तेल और कार्ब-प्रोटीन के संतुलन की पहचान की जा रही है।",
      audit: "Real Meal स्कैन",
      trapsTitle: "NutryScan क्यों?",
      trap1: "ऑयल सोक",
      trap1Sub: "'भुना' हुआ खाना 3+ चम्मच तेल सोख सकता है, जो वजन बढ़ाता है।",
      trap2: "चावल का रश",
      trap2Sub: "चावल की अधिक मात्रा से शुगर और सुस्ती बढ़ती है।",
      trap3: "प्रोटीन गैप",
      trap3Sub: "80% भारतीयों के भोजन में पर्याप्त प्रोटीन नहीं होता।",
      errorTitle: "विश्लेषण बाधित",
      errorMessage: "कुछ गलत हो गया। कृपया फिर से स्कैन करने का प्रयास करें।",
      retryButton: "पुनः स्कैन करें"
    }
  };

  const t = translations[language];

  return (
    <Layout onLogoClick={reset}>
      <div className="max-w-6xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-center mb-10 gap-2 no-print">
          {(['en', 'bn', 'hi'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all transform active:scale-95 ${
                language === l 
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {l === 'en' ? 'English' : l === 'bn' ? 'বাংলা' : 'हिन्दी'}
            </button>
          ))}
        </div>

        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            {/* Attractive Hero Section */}
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-orange-200 dark:border-orange-800">
                Scientifically Driven Nutrition
              </span>
              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
                {t.title} <span className="text-orange-600 italic block">Reveal the Truth.</span>
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                {t.subtitle}
              </p>
            </div>

            {/* Research Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { val: t.stat1, sub: t.stat1Sub, icon: "🩺", color: "from-blue-500 to-blue-600", baseColor: "blue" },
                { val: t.stat2, sub: t.stat2Sub, icon: "🌾", color: "from-orange-500 to-orange-600", baseColor: "orange" },
                { val: t.stat3, sub: t.stat3Sub, icon: "🔥", color: "from-red-500 to-red-600", baseColor: "red" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col items-center transition-colors">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                  
                  {/* New styled icon container */}
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 
                                   bg-${stat.baseColor}-100 dark:bg-${stat.baseColor}-900/30 text-slate-900 dark:text-white
                                   text-4xl shadow-md dark:shadow-none transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                    {stat.icon}
                  </div>
                  
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.val}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">{stat.sub}</p>
                </div>
              ))}
            </div>
            
            <Scanner onImageCaptured={handleImageCaptured} isLoading={false} language={language} />
            
            {/* Truth Traps Section */}
            <div className="bg-slate-900 dark:bg-black rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border-b-[16px] border-orange-600">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600 opacity-5 blur-[120px] rounded-full"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-12 flex items-center justify-center text-center">
                  <span className="w-12 h-px bg-slate-800 mr-6"></span>
                  {t.trapsTitle}
                  <span className="w-12 h-px bg-slate-800 ml-6"></span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform group-hover:rotate-6">
                      <span className="text-3xl">🍳</span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-3 tracking-tight">{t.trap1}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t.trap1Sub}</p>
                  </div>
                  <div className="text-center group border-y md:border-y-0 md:border-x border-slate-800 py-10 md:py-0 md:px-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform group-hover:-rotate-6">
                      <span className="text-3xl">🥘</span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-3 tracking-tight">{t.trap2}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t.trap2Sub}</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform group-hover:scale-110">
                      <span className="text-3xl">🥗</span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-3 tracking-tight">{t.trap3}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t.trap3Sub}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-10 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-40 h-40 border-[12px] border-slate-100 dark:border-slate-800 border-t-orange-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-bounce">🍲</span>
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.loading}</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold text-lg">{t.loadingSub}</p>
            </div>
            <div className="space-y-4 w-full max-w-sm">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-orange-600 w-2/3 animate-[loading_1.5s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-black tracking-[0.3em]">{t.audit}</p>
            </div>
            <style>{`
              @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
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
          <div className="bg-red-50 dark:bg-red-900/10 border-4 border-red-100 dark:border-red-900/30 rounded-[3rem] p-16 text-center animate-in zoom-in duration-300">
            <div className="w-28 h-28 bg-red-100 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-red-200 dark:shadow-none">
              <span className="text-6xl">🛑</span>
            </div>
            <h2 className="text-4xl font-black text-red-900 dark:text-red-200 mb-4 tracking-tighter">{t.errorTitle}</h2>
            <p className="text-red-700 dark:text-red-300 mb-12 text-xl font-medium max-w-md mx-auto">{t.errorMessage}</p>
            <button onClick={reset} className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white font-black rounded-[2rem] text-lg transition-all shadow-xl shadow-red-200 dark:shadow-red-900/40 transform active:scale-95">
              {t.retryButton}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;