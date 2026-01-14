
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Scanner from './components/Scanner';
import NutritionDashboard from './components/NutritionDashboard';
import UserProfileForm from './components/UserProfileForm';
import { AppStatus, NutritionAnalysis, Language, UserProfile } from './types';
import { analyzeFoodImage } from './services/geminiService';

const TECH_QUOTES = [
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Programming is the art of telling another human being what one wants the computer to do.", author: "Donald Knuth" },
  { text: "Software is a great combination between artistry and engineering.", author: "Bill Gates" },
  { text: "Optimism is an occupational hazard of programming: feedback is the treatment.", author: "Kent Beck" },
  { text: "Measuring programming progress by lines of code is like measuring aircraft building progress by weight.", author: "Bill Gates" },
  { text: "Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.", author: "Patrick McKenzie" },
  { text: "Computers are good at following instructions, but not at reading your mind.", author: "Donald Knuth" }
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Pick a random quote only when error occurs
  const randomQuote = useMemo(() => {
    return TECH_QUOTES[Math.floor(Math.random() * TECH_QUOTES.length)];
  }, [error]);

  useEffect(() => {
    const saved = localStorage.getItem('nutryscan_profile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (status === AppStatus.LOADING) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % 4);
      }, 1500);
      return () => clearInterval(interval);
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
      setError(err.message || "An unknown error occurred during scanning.");
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
      loadingSteps: [
        "Analyzing texture & density...",
        "Detecting oil absorption levels...",
        "Identifying carbohydrate ratio...",
        "Finalizing nutritional audit..."
      ],
      errorTitle: "Analysis Interrupted",
      limitTitle: "Taking a Breather",
      limitSub: "The free tier limit has been reached. Please wait a minute while the AI cools down.",
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
      errorTitle: "বিশ্লেষণ বাধাপ্রাপ্ত",
      limitTitle: "একটু বিরতি...",
      limitSub: "ফ্রি টিয়ারের সীমা শেষ হয়েছে। অনুগ্রহ করে এক মিনিট অপেক্ষা করুন।",
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
      errorTitle: "विश्लेषण बाधित",
      limitTitle: "थोड़ा विश्राम...",
      limitSub: "मुफ्त सीमा समाप्त हो गई है। कृपया एक मिनट प्रतीक्षा करें।",
      retryButton: "पुनः स्कैन करें",
      setupProfile: "हेल्थ प्रोफाइल सेटअप करें"
    },
    as: {
      title: "ঘৰৰ খাদ্যই সদায় স্বাস্থ্যকৰ নহয়।",
      subtitle: "বেছিভাগ ভাৰতীয় ঘৰুৱা খাদ্যত কেলৰি আৰু কাৰ্বহাইড্ৰেটৰ পৰিমাণ বেছি থাকে। ICMR নিৰ্দেশনা অনুসৰি আপোনাৰ খাদ্যৰ এক সঠিক অডিট লওক।",
      stat1: "৪ জনত ১ জন",
      stat1Sub: "ভাৰতীয় প্ৰাপ্তবয়স্ক এতিয়া অস্বাস্থ্যকৰ জীৱনশৈলীৰ চিকাৰ (NFHS-5)",
      stat2: "৭০%",
      stat2Sub: "গড় ভাৰতীয় খাদ্যত কেৱল পৰিশোধিত কাৰ্বহাইড্ৰেট থাকে (ICMR)",
      stat3: "১২০ kcal",
      stat3Sub: "মাত্ৰ ১ চামুচ সৰিয়হৰ তেলত লুকাই থকা কেলৰি",
      loadingSteps: [
        "খাদ্যৰ ঘনত্ব বিশ্লেষণ কৰা হৈছে...",
        "তেলৰ পৰিমাণ জোখা হৈছে...",
        "কাৰ্বহাইড্ৰেটৰ অনুপাত নিৰ্ণয় কৰা হৈছে...",
        "পুষ্টিৰ অডিট চূড়ান্ত কৰা হৈছে..."
      ],
      errorTitle: "বিশ্লেষণ বাধাপ্ৰাপ্ত",
      limitTitle: "অলপ বিৰতি...",
      limitSub: "বিনামূলীয়া সীমা শেষ হৈছে। অনুগ্ৰহ কৰি এ মিনিটমান ৰৈ দিয়ক।",
      retryButton: "পুনৰ স্কেন কৰক",
      setupProfile: "স্বাস্থ্য প্ৰফাইল ঠিক কৰক"
    }
  };

  const t = translations[language];
  const isLimitExceeded = error?.includes("LIMIT_EXCEEDED");

  return (
    <Layout onLogoClick={reset}>
      <div className="max-w-6xl mx-auto">
        {isProfileFormOpen && (
          <UserProfileForm 
            language={language} 
            initialProfile={userProfile} 
            onSave={handleSaveProfile} 
            onClose={() => setIsProfileFormOpen(false)} 
          />
        )}

        <div className="flex flex-col sm:flex-row justify-center items-center mb-10 gap-4 no-print">
          <div className="flex gap-2 flex-wrap justify-center">
            {(['en', 'bn', 'hi', 'as'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all transform active:scale-95 ${
                  language === l 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {l === 'en' ? 'English' : l === 'bn' ? 'বাংলা' : l === 'hi' ? 'হিन्दी' : 'অসমীয়া'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsProfileFormOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all"
          >
            <span>👤</span> {userProfile ? `${userProfile.tdee} kcal` : String(t.setupProfile)}
          </button>
        </div>

        {status === AppStatus.IDLE && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-orange-200 dark:border-orange-800">
                Scientifically Driven Nutrition
              </span>
              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
                {String(t.title)} <span className="text-orange-600 italic block">Reveal the Truth.</span>
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                {String(t.subtitle)}
              </p>
            </div>
            
            <Scanner onImageCaptured={handleImageCaptured} isLoading={false} language={language} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { val: t.stat1, sub: t.stat1Sub, icon: "🩺", color: "from-blue-500 to-blue-600" },
                { val: t.stat2, sub: t.stat2Sub, icon: "🌾", color: "from-orange-500 to-orange-600" },
                { val: t.stat3, sub: t.stat3Sub, icon: "🔥", color: "from-red-500 to-red-600" }
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-slate-50 dark:bg-slate-800 text-3xl`}>
                    {stat.icon}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{String(stat.val)}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold text-center leading-relaxed">{String(stat.sub)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.LOADING && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in fade-in duration-700">
             <div className="relative w-48 h-48 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-center overflow-hidden border-8 border-slate-100 dark:border-slate-800 mb-12">
                 <span className="text-7xl animate-float-cute">🍲</span>
                 <div className="absolute inset-x-0 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,1)] animate-scan-laser"></div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Scanning Plate...</h2>
              <p className="text-orange-600 dark:text-orange-400 font-black text-sm uppercase tracking-widest animate-pulse">
                {String(t.loadingSteps[loadingMessageIndex])}
              </p>
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
          <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 animate-in zoom-in-95 duration-700">
            <div className={`w-full max-w-4xl border-2 sm:border-4 rounded-[4rem] p-8 sm:p-20 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden transition-all duration-700 ${isLimitExceeded ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30' : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'}`}>
              
              {/* Background Ambient Glows */}
              <div className={`absolute top-0 left-1/4 w-96 h-96 ${isLimitExceeded ? 'bg-orange-500' : 'bg-red-500'} opacity-[0.05] blur-[120px] rounded-full`}></div>
              <div className={`absolute bottom-0 right-1/4 w-96 h-96 ${isLimitExceeded ? 'bg-orange-600' : 'bg-red-600'} opacity-[0.05] blur-[120px] rounded-full`}></div>

              <div className={`w-28 h-28 ${isLimitExceeded ? 'bg-orange-500 shadow-orange-500/20' : 'bg-red-500 shadow-red-500/20'} rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl transition-transform hover:scale-110 duration-500 relative group`}>
                <span className="text-5xl group-hover:animate-bounce">{isLimitExceeded ? '⏳' : '🛑'}</span>
              </div>

              <h2 className={`text-4xl sm:text-6xl font-black ${isLimitExceeded ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'} mb-6 tracking-tighter leading-none uppercase`}>
                {isLimitExceeded ? String(t.limitTitle) : String(t.errorTitle)}
              </h2>

              <p className={`text-lg sm:text-xl font-medium ${isLimitExceeded ? 'text-orange-800/60 dark:text-orange-400/60' : 'text-red-800/60 dark:text-red-400/60'} mb-16 max-w-xl mx-auto leading-relaxed`}>
                {isLimitExceeded ? String(t.limitSub) : (error?.includes(":") ? error.split(":")[1].trim() : error)}
              </p>

              {/* Enhanced Quote Section */}
              <div className="relative mb-16 py-14 px-8 bg-white/40 dark:bg-black/30 rounded-[3rem] border border-slate-200/50 dark:border-white/10 shadow-inner group transition-all hover:shadow-2xl animate-float-cute backdrop-blur-sm">
                {/* Decorative Quotes */}
                <span className="absolute top-6 left-8 text-8xl font-serif text-orange-500/10 dark:text-orange-500/5 pointer-events-none select-none">“</span>
                <span className="absolute bottom-[-10px] right-8 text-8xl font-serif text-orange-500/10 dark:text-orange-500/5 pointer-events-none select-none">”</span>
                
                <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100 italic font-bold mb-8 leading-relaxed relative z-10 px-4">
                  {randomQuote.text}
                </p>
                <div className="flex items-center justify-center space-x-4">
                   <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-orange-500/30"></div>
                   <p className="text-orange-600 dark:text-orange-500 text-[11px] font-black uppercase tracking-[0.4em]">
                     {randomQuote.author}
                   </p>
                   <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-orange-500/30"></div>
                </div>
              </div>

              <button 
                onClick={reset} 
                className={`w-full sm:w-auto px-16 py-7 text-white font-black rounded-[2.5rem] text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${isLimitExceeded ? 'bg-orange-600 border-orange-800 shadow-orange-900/40 hover:bg-orange-500' : 'bg-red-600 border-red-800 shadow-red-900/40 hover:bg-red-500'} border-b-8`}
              >
                {String(t.retryButton)}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
