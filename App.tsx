import React, { useState, useCallback, useEffect } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import NutritionDashboard from './components/NutritionDashboard';
import UserProfileForm from './components/UserProfileForm';
import { AppStatus, NutritionAnalysis, Language, UserProfile } from './types';
import { analyzeFoodImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('nutryscan_profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
  }, []);

  // Cycle loading messages for a "smart" feel
  useEffect(() => {
    if (status === AppStatus.LOADING) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % 4);
      }, 1500); // Change message every 1.5s
      return () => clearInterval(interval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [status]);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('nutryscan_profile', JSON.stringify(profile));
    setIsProfileFormOpen(false);
  };

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
      // Dynamic Loading Messages
      loadingSteps: [
        "Analyzing texture & density...",
        "Detecting oil absorption levels...",
        "Identifying carbohydrate ratio...",
        "Finalizing nutritional audit..."
      ],
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
      retryButton: "RETRY SCAN",
      setupProfile: "Setup My Health Profile"
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
      loadingSteps: [
        "টেক্সচার এবং ঘনত্ব বিশ্লেষণ করা হচ্ছে...",
        "তেল শোষণের মাত্রা দেখা হচ্ছে...",
        "কার্বোহাইড্রেটের অনুপাত নির্ণয় করা হচ্ছে...",
        "পুষ্টির অডিট চূড়ান্ত করা হচ্ছে..."
      ],
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
      retryButton: "পুনরায় স্ক্যান করুন",
      setupProfile: "স্বাস্থ্য প্রোফাইল সেট আপ করুন"
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
      loadingSteps: [
        "बनावट और घनत्व का विश्लेषण...",
        "तेल अवशोषण का पता लगाया जा रहा है...",
        "कार्बोहाइड्रेट अनुपात की पहचान...",
        "पोषण ऑडिट को अंतिम रूप दिया जा रहा है..."
      ],
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
      retryButton: "पुनः स्कैन करें",
      setupProfile: "हेल्थ प्रोफाइल सेटअप करें"
    }
  };

  const t = translations[language];

  return (
    <Layout onLogoClick={reset}>
      <div className="max-w-6xl mx-auto">
        {/* Profile Form Overlay */}
        {isProfileFormOpen && (
          <UserProfileForm 
            language={language} 
            initialProfile={userProfile} 
            onSave={handleSaveProfile} 
            onClose={() => setIsProfileFormOpen(false)} 
          />
        )}

        {/* Language Switcher & Profile Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center mb-10 gap-4 no-print">
          <div className="flex gap-2">
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
          
          <button 
            onClick={() => setIsProfileFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <span>👤</span> {userProfile ? userProfile.tdee + ' kcal' : t.setupProfile}
          </button>
        </div>

        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { val: t.stat1, sub: t.stat1Sub, icon: "🩺", color: "from-blue-500 to-blue-600", baseColor: "blue" },
                { val: t.stat2, sub: t.stat2Sub, icon: "🌾", color: "from-orange-500 to-orange-600", baseColor: "orange" },
                { val: t.stat3, sub: t.stat3Sub, icon: "🔥", color: "from-red-500 to-red-600", baseColor: "red" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col items-center transition-colors">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-4xl shadow-md transition-transform group-hover:scale-110`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-2">{stat.val}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">{stat.sub}</p>
                </div>
              ))}
            </div>
            
            <Scanner onImageCaptured={handleImageCaptured} isLoading={false} language={language} />
            
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
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform">
                      <span className="text-3xl">🍳</span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-3 tracking-tight">{t.trap1}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t.trap1Sub}</p>
                  </div>
                  <div className="text-center group border-y md:border-y-0 md:border-x border-slate-800 py-10 md:py-0 md:px-6">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform">
                      <span className="text-3xl">🥘</span>
                    </div>
                    <h4 className="font-black text-white text-lg mb-3 tracking-tight">{t.trap2}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium px-4">{t.trap2Sub}</p>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transition-transform">
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
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in duration-700 py-12">
            
            {/* 
               THE BIOMETRIC VISION CORE 
               Designed for a high-tech "Medical Analysis" feel.
            */}
            <div className="relative w-80 h-80 flex items-center justify-center mb-16">
              
              {/* 1. Radar Background Sweep */}
              <div className="absolute inset-0 rounded-full opacity-20 animate-radar bg-[conic-gradient(from_0deg,transparent_0_300deg,theme(colors.orange.500)_360deg)]"></div>
              
              {/* 2. Outer Static Interface Ring */}
              <div className="absolute inset-0 border border-slate-200 dark:border-slate-800 rounded-full opacity-30 scale-110"></div>
              <div className="absolute inset-0 border border-dashed border-slate-300 dark:border-slate-700 rounded-full opacity-40 animate-spin-slower"></div>

              {/* 3. The Target Reticles (Corner Brackets) */}
              <div className="absolute w-64 h-64 pointer-events-none animate-pulse-fast">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl"></div>
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl"></div>
              </div>

              {/* 4. Central Core Container */}
              <div className="relative z-10 w-48 h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-orange-500/20 flex items-center justify-center overflow-hidden border-[6px] border-slate-100 dark:border-slate-800">
                 
                 {/* Food Object */}
                 <span className="text-7xl animate-float-cute relative z-10 filter drop-shadow-2xl">🍲</span>
                 
                 {/* 5. The High-Intensity Laser Scan */}
                 <div className="absolute inset-x-0 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] animate-scan-laser z-20"></div>
                 <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-orange-500/0 via-orange-500/20 to-orange-500/0 animate-scan-laser z-10" style={{animationDelay: '0.1s'}}></div>
                 
                 {/* Grid Overlay */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.1)_1px,transparent_1px)] bg-[size:20px_20px] z-0"></div>
              </div>

              {/* 6. Orbiting Data Points */}
              <div className="absolute w-[120%] h-[120%] animate-spin-reverse-slow opacity-60 pointer-events-none">
                 <div className="absolute top-0 left-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-[0_0_10px_theme(colors.orange.500)]"></div>
                 <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                 <div className="absolute top-1/2 right-0 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_theme(colors.green.500)]"></div>
              </div>

            </div>

            <div className="relative z-10 max-w-lg mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                Scanning Plate...
              </h2>
              
              {/* Dynamic Intelligent Status Bar */}
              <div className="bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1 rounded-full inline-flex items-center pr-6">
                <div className="bg-orange-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full mr-3 animate-pulse">
                  AI Processing
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-bold text-sm md:text-base tracking-wide min-w-[240px] text-left">
                  {t.loadingSteps[loadingMessageIndex]}
                </p>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.SUCCESS && analysis && (
          <NutritionDashboard 
            data={analysis} 
            onReset={reset} 
            imagePreview={imagePreview}
            language={language}
            userProfile={userProfile}
            onOpenProfile={() => setIsProfileFormOpen(true)}
          />
        )}

        {status === AppStatus.ERROR && (
          <div className="bg-red-50 dark:bg-red-900/10 border-4 border-red-100 dark:border-red-900/30 rounded-[3rem] p-16 text-center animate-in zoom-in duration-300">
            <div className="w-28 h-28 bg-red-100 dark:bg-red-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-xl">
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