import React, { useRef, useState } from 'react';
import { NutritionAnalysis, Language, LocalizedText, UserProfile } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface NutritionDashboardProps {
  data: NutritionAnalysis;
  onReset: () => void;
  imagePreview: string | null;
  language: Language;
  userProfile?: UserProfile | null;
  onOpenProfile: () => void;
}

// Custom Tooltip for Recharts PieChart - Made more robust
const CustomTooltip = ({ active, payload, label, language }: { active?: boolean; payload?: any[]; label?: string; language: Language }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const name = String(entry.name || '');
    const value = String(entry.value || '0');

    const translations = {
      en: "Gram",
      bn: "গ্রাম",
      hi: "ग्राम"
    }

    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-900 dark:text-white">{`${name}: ${value}${translations[language]}`}</p>
      </div>
    );
  }
  return null;
};


const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ data, onReset, imagePreview, language, userProfile, onOpenProfile }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extremely defensive getLocalized to prevent React error #31
  const getLocalized = (content: any): string => {
    if (typeof content === 'string') return content;
    if (content && typeof content === 'object') {
      // If it has our expected keys, return the localized string
      if ('en' in content || 'bn' in content || 'hi' in content) {
        const val = content[language] || content['en'] || content['bn'] || content['hi'] || '';
        return typeof val === 'string' ? val : JSON.stringify(val);
      }
      // If it's a different object, return empty or string representation
      return '';
    }
    if (content === null || content === undefined) return '';
    return String(content);
  };

  const hasFoodDetected = data && data.items && data.items.length > 0 && Number(data.totalCalories) > 0;

  const chartData = [
    { name: language === 'bn' ? 'প্রোটিন' : language === 'hi' ? 'प्रोटीन' : 'Protein', value: Number(data.totalProtein) || 0, color: '#22c55e' },
    { name: language === 'bn' ? 'কার্বোহাইড্রেট' : language === 'hi' ? 'কার্বস' : 'Carbs', value: Number(data.totalCarbs) || 0, color: '#3b82f6' },
    { name: language === 'bn' ? 'ফ্যাট' : language === 'hi' ? 'ফ্যাট' : 'Fats', value: Number(data.totalFats) || 0, color: '#f59e0b' },
  ];

  const safeTarget = userProfile ? Number(userProfile.tdee) : 2000;
  const safeTotalCalories = Number(data.totalCalories) || 0;
  const remainingCalories = Math.max(0, safeTarget - safeTotalCalories);

  const translations = {
    en: {
      nextStep: "What's next? Keep tracking to spot patterns and improve your health naturally.",
      ready: "THE TRUTH IS OUT!",
      zeroError: "Your honest meal scan is ready below.",
      btn: "Check Another Meal",
      rejectionTitle: "Common Household Traps",
      rejections: [
        "Oil Soak: Fried items or oily curries often hide excess fat, hindering weight loss efforts.",
        "Rice Overload: A disproportionate rice-to-protein ratio can lead to energy crashes and sugar spikes.",
        "Protein Gap: Many Indian diets fall short on essential protein, affecting muscle and overall health."
      ],
      checklistTitle: "🍱 What's on your plate",
      auditSummary: "The Real Count",
      rating: "Health Score",
      generating: "Generating Report...",
      generatingSub: "Creating a high-quality multi-page PDF...",
      reportTitle: "NutryScan India - Meal Analysis Report",
      mealPhoto: "Scanned Meal Photo",
      btnScanNew: "SCAN NEW",
      btnSavePdf: "SAVE AS PDF",
      pdfGeneratedPrefix: "Generated on",
      pdfFileNamePrefix: "NutryScan_Honest_Report",
      invalidScan: "Invalid Scan",
      invalidScanSub: "We couldn't detect any food in this image. Please scan a clear photo of your thali or meal.",
      dailyBalance: "Daily Calorie Balance",
      target: "Daily Goal",
      remaining: "Remaining After This Meal",
      personalize: "Personalize My Goals"
    },
    bn: {
      nextStep: "পরবর্তী ধাপ? আপনার খাবারের অভ্যাসের আসল প্যাটার্ন বুঝতে সাহায্য করবে এই ট্র্যাক।",
      ready: "আসল সত্যিটা দেখুন!",
      zeroError: "আপনার খাবারের Honest Check নিচে দেওয়া হলো।",
      btn: "অন্য খাবার চেক করুন",
      rejectionTitle: "সাধারণ গৃহস্থালীর ভুলগুলো",
      rejections: [
        "তেল সোক: ভাজা বা তৈলাক্ত তরকারিতে প্রায়শই অতিরিক্ত ফ্যাট থাকে, যা ওজন কমাতে বাধা দেয়।",
        "ভাতের আধিক্য: প্রোটিনের তুলনায় ভাতের অসম অনুপাত শক্তি হ্রাস এবং চিনি বৃদ্ধির কারণ হতে পারে।",
        "প্রোটিন অভাব: অনেক ভারতীয় খাদ্যে প্রয়োজনীয় প্রোটিনের অভাব থাকে, যা পেশী এবং সামগ্রিক স্বাস্থ্যকে প্রভাবিত করে।"
      ],
      checklistTitle: "🍱 খাবারের বিবরণ",
      auditSummary: "আসল ক্যালরি",
      rating: "হেলথ স্কোর",
      generating: "রিপোর্ট তৈরি হচ্ছে...",
      generatingSub: "উচ্চ মানের মাল্টি-পেজ পিডিএফ তৈরি হচ্ছে...",
      reportTitle: "NutryScan India - খাবার বিশ্লেষণ রিপোর্ট",
      mealPhoto: "স্ক্যান করা খাবারের ছবি",
      btnScanNew: "নতুন স্ক্যান করুন",
      btnSavePdf: "পিডিএফ হিসাবে সংরক্ষণ করুন",
      pdfGeneratedPrefix: "তৈরি করা হয়েছে",
      pdfFileNamePrefix: "NutryScan_Honest_Report",
      invalidScan: "অবৈধ স্ক্যান",
      invalidScanSub: "আমরা এই ছবিতে কোনও খাবার শনাক্ত করতে পারিনি। আপনার থালি বা খাবারের একটি পরিষ্কার ছবি স্ক্যান করুন।",
      dailyBalance: "দৈনিক ক্যালরি ব্যালেন্স",
      target: "দৈনিক লক্ষ্য",
      remaining: "এই খাবারের পর বাকি",
      personalize: "লক্ষ্য নির্ধারণ করুন"
    },
    hi: {
      nextStep: "आगे क्या? अपनी सेहत सुधारने के लिए अपने खान-पान को ट्रैक करते रहें।",
      ready: "सच्चाई आपके सामने है!",
      zeroError: "आपका Honest Check नीचे दिया गया है।",
      btn: "दूसरा भोजन चेक करें",
      rejectionTitle: "सामान्य घरेलू गलतियाँ",
      rejections: [
        "ऑयल सोक: तले हुए खाद्य पदार्थ या तैलीय करी में अक्सर अतिरिक्त वसा होती है, जो वजन घटाने के प्रयासों में बाधा डालती है।",
        "चावल की अधिकता: प्रोटीन और चावल का असंतुलित अनुपात ऊर्जा में गिरावट और शुगर स्पाइक्स का कारण बन सकता है।",
        "प्रोटीन की कमी: कई भारतीय आहारों में आवश्यक प्रोटीन की कमी होती है, जो मांसपेशियों और समग्र स्वास्थ्य को प्रभावित करता है।"
      ],
      checklistTitle: "🍱 भोजन का विवरण",
      auditSummary: "असली कैलोरी",
      rating: "हेल्थ स्कोर",
      generating: "रिपोर्ट तैयार हो रही है...",
      generatingSub: "उच्च गुणवत्ता वाली मल्टी-पेज पीडीएफ बनाई जा रही है...",
      reportTitle: "NutryScan India - भोजन विश्लेषण रिपोर्ट",
      mealPhoto: "स्कैन किए गए भोजन की तस्वीर",
      btnScanNew: "नया स्कैन करें",
      btnSavePdf: "पीडीएफ के रूप में सहेजें",
      pdfGeneratedPrefix: "पर उत्पन्न हुआ",
      pdfFileNamePrefix: "NutryScan_Honest_Report",
      invalidScan: "अमान्य स्कैन",
      invalidScanSub: "हम इस तस्वीर में किसी भी भोजन का पता नहीं लगा सके। कृपया अपनी थाली या भोजन की स्पष्ट तस्वीर स्कैन करें।",
      dailyBalance: "দৈনিক ক্যালরি ব্যালেন্স",
      target: "दैनिक लक्ष्य",
      remaining: "इस भोजन के बाद शेष",
      personalize: "लक्ष्य निर्धारित करें"
    }
  };

  const t = translations[language];

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    setIsGeneratingPdf(true);
    const dashboard = dashboardRef.current;
    const originalStyle = dashboard.getAttribute('style') || '';
    const wasDark = document.documentElement.classList.contains('dark');

    try {
      if (wasDark) document.documentElement.classList.remove('dark');
      dashboard.style.width = '1200px'; 
      dashboard.style.padding = '60px';
      dashboard.style.backgroundColor = '#ffffff';
      dashboard.style.borderRadius = '0px';
      dashboard.style.boxShadow = 'none';
      dashboard.style.margin = '0';
      dashboard.classList.add('pdf-active');

      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = await html2canvas(dashboard, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, 
        onclone: (clonedDoc) => {
          const clonedDashboard = clonedDoc.querySelector('.print-container') as HTMLElement;
          if (clonedDashboard) {
            clonedDashboard.style.animation = 'none';
            clonedDashboard.style.transition = 'none';
          }
          const printHeader = clonedDoc.querySelector('.print-only-header') as HTMLElement;
          if (printHeader) {
            printHeader.style.display = 'block';
            printHeader.style.marginBottom = '40px';
          }
          const dailyBalanceCard = clonedDoc.querySelector('.daily-balance-card') as HTMLElement;
          if (dailyBalanceCard) {
            dailyBalanceCard.classList.remove('no-print');
            dailyBalanceCard.style.cssText = `
              display: block !important;
              margin-bottom: 40px !important;
              background-color: #0f172a !important;
              color: white !important;
              border-radius: 40px !important;
              padding: 40px !important;
              width: calc(100% - 4px) !important;
              box-sizing: border-box !important;
            `;
            const balanceText = dailyBalanceCard.querySelectorAll('p, span');
            balanceText.forEach(t => (t as HTMLElement).style.color = 'white');
          }
          const mainLayoutGrid = clonedDoc.querySelector('.lg\\:grid-cols-\\[380px_1fr\\]') as HTMLElement;
          if (mainLayoutGrid) {
            mainLayoutGrid.style.display = 'flex';
            mainLayoutGrid.style.flexDirection = 'column';
            mainLayoutGrid.style.gap = '40px';
          }
          const chartsContainer = clonedDoc.querySelector('.chart-card-container') as HTMLElement;
          if (chartsContainer) {
            chartsContainer.style.width = '100%';
            chartsContainer.style.marginBottom = '20px';
            chartsContainer.style.minHeight = '500px';
          }
          const itemsContainer = clonedDoc.querySelector('.items-card-container') as HTMLElement;
          if (itemsContainer) {
            itemsContainer.style.width = '100%';
            itemsContainer.style.marginBottom = '40px';
          }
          const scrollContainers = clonedDoc.querySelectorAll('.custom-scrollbar');
          scrollContainers.forEach(el => {
            (el as HTMLElement).style.maxHeight = 'none';
            (el as HTMLElement).style.overflow = 'visible';
          });
          const trapsGrid = clonedDoc.querySelector('.traps-grid-fix') as HTMLElement;
          if (trapsGrid) {
            trapsGrid.style.display = 'grid';
            trapsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            trapsGrid.style.gap = '30px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      pdf.save(`${t.pdfFileNamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      dashboard.setAttribute('style', originalStyle);
      dashboard.classList.remove('pdf-active');
      if (wasDark) document.documentElement.classList.add('dark');
      setIsGeneratingPdf(false);
    }
  };

  const safeHealthRating = Number(data.healthRating) || 0;

  return (
    <>
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center p-12 max-w-sm w-full flex flex-col items-center">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
               <div className="absolute inset-0 bg-orange-500 rounded-full animate-ripple opacity-30"></div>
               <div className="absolute inset-0 bg-orange-500 rounded-full animate-ripple opacity-20" style={{animationDelay: '0.6s'}}></div>
               <div className="absolute inset-0 bg-orange-500 rounded-full animate-ripple opacity-10" style={{animationDelay: '1.2s'}}></div>
               <div className="relative z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/20">
                 <span className="text-5xl animate-float-cute">📄</span>
               </div>
            </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{t.generating}</h3>
            <p className="text-slate-400 font-medium text-base">{t.generatingSub}</p>
          </div>
        </div>
      )}

      <div ref={dashboardRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 print-container bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] transition-colors duration-300">
        
        <div className="print-only print-only-header mb-10 border-b-4 border-orange-500 pb-8 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-4xl">🍲</span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">{t.reportTitle}</h1>
                <p className="text-base text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">By NutryScan India • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {hasFoodDetected && (
          <div className="daily-balance-card mx-2 bg-gradient-to-r from-slate-900 to-black dark:from-black dark:to-slate-900 rounded-[3rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl no-print">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 opacity-10 blur-[100px] rounded-full"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-orange-400 text-xs font-black uppercase tracking-[0.3em] mb-4">{t.dailyBalance}</p>
                {userProfile ? (
                  <div className="flex flex-col sm:flex-row gap-8 items-center">
                    <div>
                      <span className="block text-slate-500 text-[10px] font-black uppercase mb-1">{t.target}</span>
                      <span className="text-3xl font-black">{safeTarget} <span className="text-sm font-medium text-slate-500">kcal</span></span>
                    </div>
                    <div className="w-px h-10 bg-slate-800 hidden sm:block"></div>
                    <div>
                      <span className="block text-orange-400 text-[10px] font-black uppercase mb-1">{t.remaining}</span>
                      <span className="text-5xl font-black text-orange-500">{remainingCalories} <span className="text-lg font-medium text-slate-500">kcal</span></span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={onOpenProfile}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                  >
                    {t.personalize}
                  </button>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                   <div className="absolute inset-0 border-8 border-orange-500 rounded-full clip-path-active" style={{ clipPath: userProfile ? `inset(0 0 ${100 - (safeTotalCalories/safeTarget)*100}% 0)` : 'none' }}></div>
                   <span className="text-3xl">⚖️</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          <div className="md:col-span-1 no-print">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white dark:ring-slate-800 aspect-square bg-slate-100 dark:bg-slate-800 transition-colors">
              {imagePreview && <img src={imagePreview} alt="Dish" className="w-full h-full object-cover" />}
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
            <div>
              {hasFoodDetected ? (
                <div className="flex justify-between items-start mb-8 animate-in fade-in zoom-in-95 duration-500">
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{t.auditSummary}</p>
                    <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{safeTotalCalories} <span className="text-xl font-medium text-slate-300 dark:text-slate-600">kcal</span></h2>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{t.rating}</p>
                    <div className="flex items-center justify-end space-x-2">
                      <span className={`text-5xl font-black ${safeHealthRating > 7 ? 'text-green-500' : safeHealthRating > 4 ? 'text-orange-500' : 'text-red-500'}`}>{safeHealthRating}</span>
                      <span className="text-slate-200 dark:text-slate-700 font-bold text-2xl">/10</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
                   <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{t.invalidScan}</p>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.invalidScan}</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t.invalidScanSub}</p>
                </div>
              )}
              
              <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-[2rem] relative overflow-hidden ring-1 ring-white/10 shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-20 blur-[60px] rounded-full"></div>
                <p className="text-xs font-black text-orange-400 mb-3 uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                  Honest Feedback
                </p>
                <p className="relative z-10 text-slate-100 font-medium italic leading-relaxed text-lg break-words">"{getLocalized(data.advice)}"</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 no-print">
              <button onClick={onReset} className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-2xl transition-all active:scale-95">
                {t.btnScanNew}
              </button>
              <button 
                onClick={handleDownload} 
                disabled={isGeneratingPdf || !hasFoodDetected}
                className="flex-1 px-8 py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-orange-100 dark:shadow-orange-900/40 disabled:opacity-50 flex items-center justify-center"
              >
                {t.btnSavePdf}
              </button>
            </div>
          </div>
        </div>

        {hasFoodDetected && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 px-2">
              <div className="chart-card-container bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[450px]">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-widest flex items-center border-b border-slate-50 dark:border-slate-800 pb-4">
                  <span className="w-3 h-3 bg-orange-600 rounded-full mr-3 shadow-lg shadow-orange-100"></span>
                  Macronutrient Balance
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={105} paddingAngle={8} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip language={language} />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => (
                        <span className="text-sm text-slate-700 dark:text-slate-300">{String(value)}</span>
                      )} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="items-card-container bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-widest flex items-center border-b border-slate-50 dark:border-slate-800 pb-4">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-3 shadow-lg shadow-blue-100"></span>
                  {t.checklistTitle}
                </h3>
                <div ref={scrollContainerRef} className="space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                  {data.items.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-6 p-7 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-orange-200 transition-all group">
                      <div className="mt-1 flex-shrink-0">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${item.status === 'PASS' ? 'bg-green-100 text-green-600' : item.status === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                          {item.status === 'PASS' ? '✓' : item.status === 'WARNING' ? '!' : '×'}
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-3 gap-2">
                          <span className="font-black text-xl sm:text-2xl leading-tight text-slate-900 dark:text-white">{getLocalized(item.name)}</span>
                          <span className="text-sm font-black text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 whitespace-nowrap">{Number(item.calories) || 0} kcal</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="text-[11px] font-extrabold text-slate-500 uppercase bg-slate-200/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl tracking-widest">{getLocalized(item.portion)}</span>
                        </div>
                        {item.notes && (
                          <div className="bg-white/80 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200/40 shadow-inner">
                            <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">{getLocalized(item.notes)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/10 border-4 border-red-100 dark:border-red-900/30 rounded-[2.5rem] p-10 mx-2 shadow-inner">
              <div className="flex flex-col items-center mb-10 text-center">
                  <h4 className="text-red-900 dark:text-red-200 font-black flex items-center text-xl uppercase tracking-[0.2em] mb-4">
                    <span className="mr-4 text-3xl">⚠️</span> {t.rejectionTitle}
                  </h4>
              </div>
              <div className="traps-grid-fix grid grid-cols-1 md:grid-cols-3 gap-8">
                {t.rejections.map((r, i) => {
                  const [title, description] = String(r).split(': ');
                  return (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-red-50 dark:border-red-900/20 shadow-xl transition-all hover:scale-[1.02]">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6">
                         <span className="text-red-600 font-black text-lg">{i + 1}</span>
                      </div>
                      <h5 className="font-black text-red-800 dark:text-red-300 text-[11px] uppercase mb-3 tracking-widest bg-red-50 dark:bg-red-900/20 inline-block px-3 py-1.5 rounded-lg">{title}</h5>
                      <p className="text-sm text-red-700 dark:text-red-300 font-bold leading-relaxed">{description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="bg-slate-900 dark:bg-black text-white rounded-[4rem] p-14 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border-b-[20px] border-orange-600 no-print mx-2 mt-12 mb-8">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-orange-600 opacity-10 blur-[150px] rounded-full"></div>
          <div className="w-28 h-28 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl rotate-6 ring-8 ring-white/5">
            <span className="text-6xl">{hasFoodDetected ? '🍛' : '🔍'}</span>
          </div>
          <h3 className="text-5xl font-black mb-8 tracking-tighter">{hasFoodDetected ? String(t.ready) : String(t.invalidScan)}</h3>
          <p className="text-slate-400 mb-3 max-w-lg font-medium text-xl leading-relaxed">{hasFoodDetected ? String(t.zeroError) : String(t.invalidScanSub)}</p>
          <p className="text-orange-400 font-black mb-12 max-w-md text-sm uppercase tracking-[0.3em]">{String(t.nextStep)}</p>
          <button onClick={onReset} className="group relative bg-orange-600 hover:bg-orange-500 text-white px-20 py-7 rounded-[3rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-orange-900/60 border-b-8 border-orange-800">
            <span className="relative z-10">{String(t.btn)}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:btn:opacity-10 transition-opacity"></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default NutritionDashboard;