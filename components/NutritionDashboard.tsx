import React, { useRef, useState } from 'react';
import { NutritionAnalysis, Language, LocalizedText } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface NutritionDashboardProps {
  data: NutritionAnalysis;
  onReset: () => void;
  imagePreview: string | null;
  language: Language;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ data, onReset, imagePreview, language }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get localized text safely
  const getLocalized = (content: LocalizedText): string => {
    return content[language] || content['en'];
  };

  const chartData = [
    { name: language === 'bn' ? 'প্রোটিন' : language === 'hi' ? 'प्रोटीन' : 'Protein', value: data.totalProtein, color: '#22c55e' },
    { name: language === 'bn' ? 'কার্বোহাইড্রেট' : language === 'hi' ? 'कार्ब्स' : 'Carbs', value: data.totalCarbs, color: '#3b82f6' },
    { name: language === 'bn' ? 'ফ্যাট' : language === 'hi' ? 'फैट' : 'Fats', color: '#f59e0b', value: data.totalFats },
  ];

  const translations = {
    en: {
      nextStep: "What's next? Keep tracking to spot patterns and improve your health naturally.",
      ready: "THE TRUTH IS OUT!",
      zeroError: "Your honest meal scan is ready below.",
      btn: "Check Another Meal",
      rejectionTitle: "⚠️ Household Traps I Spotted",
      rejections: [
        "Oil Soak: That 'Bhaja' or curry is hiding extra fat that blocks weight loss.",
        "Rice Overload: Your rice-to-protein ratio is likely causing energy crashes.",
        "Hidden Sugar: Check your tea or condiments for sneaky calories."
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
      pdfFileNamePrefix: "NutryScan_Honest_Report"
    },
    bn: {
      nextStep: "পরবর্তী ধাপ? আপনার খাবারের অভ্যাসের আসল প্যাটার্ন বুঝতে সাহায্য করবে এই ট্র্যাক।",
      ready: "আসল সত্যিটা দেখুন!",
      zeroError: "আপনার খাবারের Honest Check নিচে দেওয়া হলো।",
      btn: "অন্য খাবার চেক করুন",
      rejectionTitle: "⚠️ যেসব বিপদ আমি খুঁজে পেয়েছি",
      rejections: [
        "তেল সোক: ভাজা বা তরকারিতে থাকা তেল আপনার ওজন কমানোর পথে বাধা হতে পারে।",
        "ভাতের আধিক্য: ভাতের পরিমাণ অনেক বেশি, যা শরীরে ক্লান্তি ডেকে আনে।",
        "লুকানো চিনি: চা বা মিষ্টান্ন খাবারে লুকানো ক্যালরি চেক করুন।"
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
      pdfFileNamePrefix: "NutryScan_Honest_Report"
    },
    hi: {
      nextStep: "आगे क्या? अपनी सेहत सुधारने के लिए अपने खान-पान को ट्रैक करते रहें।",
      ready: "सच्चाई आपके सामने है!",
      zeroError: "आपका Honest Check नीचे दिया गया है।",
      btn: "दूसरा भोजन चेक करें",
      rejectionTitle: "⚠️ घरेलू खान-पान की कमियां",
      rejections: [
        "ऑयल सोक: भुना हुआ खाना या करी में छिपा हुआ तेल वजन घटाने में बाधक है।",
        "चावल की अधिकता: चावल की ज्यादा मात्रा से शुगर और सुस्ती बढ़ सकती है।",
        "छिपी हुई चीनी: चाय या किसी अन्य मीठी चीज़ में कैलोरी जांचें।"
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
      pdfFileNamePrefix: "NutryScan_Honest_Report"
    }
  };

  const t = translations[language];

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    
    setIsGeneratingPdf(true);
    const dashboard = dashboardRef.current;
    
    // Store original styles to revert later
    const originalStyle = dashboard.getAttribute('style') || '';
    const originalClass = dashboard.className;

    // Check if dark mode is active
    const wasDark = document.documentElement.classList.contains('dark');

    try {
      // 1. Force Light Mode for PDF generation
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }

      // 2. Prepare the DOM for capture
      // Increased width and padding for better spacing in the generated image
      dashboard.style.width = '1200px'; 
      dashboard.style.padding = '60px';
      dashboard.style.backgroundColor = '#ffffff';
      dashboard.style.borderRadius = '0px';
      dashboard.style.boxShadow = 'none';
      dashboard.style.margin = '0';
      
      // Add the class that makes print-only elements visible via CSS
      dashboard.classList.add('pdf-active');

      // 3. Wait for layout paints and theme switch
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Capture with html2canvas
      const canvas = await html2canvas(dashboard, {
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, 
        onclone: (clonedDoc) => {
          // Disable animations
          const clonedDashboard = clonedDoc.querySelector('.print-container') as HTMLElement;
          if (clonedDashboard) {
            clonedDashboard.style.animation = 'none';
            clonedDashboard.style.transition = 'none';
          }

          // Ensure cloned document is light mode
          clonedDoc.documentElement.classList.remove('dark');

          // --- SECTION A: Image Handling ---
          const printImageContainer = clonedDoc.querySelector('.print-only-image-top') as HTMLElement;
          if (printImageContainer) {
            printImageContainer.style.cssText = `
              display: flex !important;
              justify-content: center !important;
              align-items: center !important;
              margin-bottom: 40px !important;
              opacity: 1 !important;
              visibility: visible !important;
            `;
            
            const img = printImageContainer.querySelector('img') as HTMLElement;
            if (img) {
              img.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                max-width: 500px !important;
                max-height: 400px !important;
                width: auto !important;
                height: auto !important;
                object-fit: contain !important;
                border-radius: 20px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
              `;
            }
          }

          // --- SECTION B: Header Visibility ---
          const printHeader = clonedDoc.querySelector('.print-only-header') as HTMLElement;
          if (printHeader) {
            printHeader.style.display = 'block';
            printHeader.style.marginBottom = '50px';
          }

          // --- SECTION C: Fix Food List Spacing ---
          const scrollContainer = clonedDoc.querySelector('.scroll-container-fix') as HTMLElement;
          if (scrollContainer) {
            // Unbound height
            scrollContainer.style.maxHeight = 'none';
            scrollContainer.style.overflow = 'visible';
            
            // Convert to flex column to enforce gap and remove space-y side effects
            scrollContainer.style.display = 'flex';
            scrollContainer.style.flexDirection = 'column';
            scrollContainer.style.gap = '30px';
            
            // Clean up children margins
            const children = scrollContainer.children;
            for (let i = 0; i < children.length; i++) {
              const child = children[i] as HTMLElement;
              child.style.marginTop = '0';
              child.style.marginBottom = '0';
              // Add internal breathing room
              child.style.padding = '32px';
            }
          }

          // --- SECTION D: Fix Traps Section Grid ---
          const trapsGrid = clonedDoc.querySelector('.traps-grid-fix') as HTMLElement;
          if (trapsGrid) {
            // Force 3-column grid layout for PDF width
            trapsGrid.style.display = 'grid';
            trapsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            trapsGrid.style.gap = '40px';
            trapsGrid.style.alignItems = 'stretch';
          }

          // --- SECTION E: Text & Layout Adjustments ---
          const nameSpans = clonedDoc.querySelectorAll('.truncate-name-fix');
          nameSpans.forEach(span => {
            const el = span as HTMLElement;
            el.style.whiteSpace = 'normal';
            el.style.overflow = 'visible';
            el.style.textOverflow = 'clip';
            el.style.maxWidth = 'none';
          });
          
          // Boost readability for all text
          const allText = clonedDoc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
          allText.forEach((el) => {
              // Ensure no text is dangerously tight
              const style = window.getComputedStyle(el as Element);
              if (parseFloat(style.lineHeight) < 1.4) {
                 (el as HTMLElement).style.lineHeight = '1.5';
              }
          });
        }
      });

      // 5. Generate PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${t.pdfFileNamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      // 6. Cleanup & Restore Theme
      dashboard.setAttribute('style', originalStyle);
      dashboard.className = originalClass;
      
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
      
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      {/* Full-screen Overlay for PDF Generation Feedback */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center p-8 max-w-sm w-full">
            <div className="relative mb-8 inline-block">
              {/* Pulsating Ring Effect */}
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse-ring"></div>
              <div className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-4xl">📄</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-2">{t.generating}</h3>
            <p className="text-slate-400 font-medium mb-8 text-sm">{t.generatingSub}</p>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 w-full animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={dashboardRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 print-container bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] transition-colors duration-300">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 10px;
            border: 1px solid #f8fafc;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
            border-color: #1e293b;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #cbd5e1;
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
        
        {/* 1. Print-Only Image Header Section */}
        <div className="print-only print-only-image-top mb-10 text-center">
          <div className="inline-block bg-white p-4 rounded-[2.5rem] shadow-xl border-4 border-orange-500 overflow-hidden mb-6">
             <p className="text-xs font-black text-orange-600 uppercase mb-3 tracking-widest">{t.mealPhoto}</p>
             {imagePreview && (
               <img 
                 src={imagePreview} 
                 alt="Dish" 
                 className="block mx-auto rounded-[1.5rem]" 
                 style={{ width: '300px', height: '300px', objectFit: 'cover' }} 
               />
             )}
          </div>
        </div>

        {/* 2. Main Print Header */}
        <div className="print-only print-only-header mb-10 border-b-4 border-orange-500 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
               <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100">
                <span className="text-white text-4xl">🍲</span>
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 leading-tight">{t.reportTitle}</h1>
                <p className="text-base text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">By NutryScan India • {t.pdfGeneratedPrefix} {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="px-6 py-3 bg-orange-50 rounded-2xl border-2 border-orange-100">
                 <span className="text-orange-600 font-black text-lg uppercase">Official Honest Check</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          <div className="md:col-span-1 no-print">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white dark:ring-slate-800 aspect-square bg-slate-100 dark:bg-slate-800 transition-colors">
              {imagePreview && <img src={imagePreview} alt="Dish" className="w-full h-full object-cover" />}
            </div>
          </div>
          
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{t.auditSummary}</p>
                  <h2 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{data.totalCalories} <span className="text-xl font-medium text-slate-300 dark:text-slate-600">kcal</span></h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1">{t.rating}</p>
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-5xl font-black ${data.healthRating > 7 ? 'text-green-500' : data.healthRating > 4 ? 'text-orange-500' : 'text-red-500'}`}>{data.healthRating}</span>
                    <span className="text-slate-200 dark:text-slate-700 font-bold text-2xl">/10</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900 dark:bg-black text-white p-8 rounded-[2rem] relative overflow-hidden ring-1 ring-white/10 shadow-inner">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600 opacity-20 blur-[60px] rounded-full"></div>
                <p className="text-xs font-black text-orange-400 mb-3 uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></span>
                  Honest Feedback
                </p>
                <p className="relative z-10 text-slate-100 font-medium italic leading-relaxed text-lg break-words leading-tight">"{getLocalized(data.advice)}"</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 no-print">
              <button 
                onClick={onReset} 
                disabled={isGeneratingPdf}
                className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black rounded-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {t.btnScanNew}
              </button>
              <button 
                onClick={handleDownload} 
                disabled={isGeneratingPdf}
                className="flex-1 px-8 py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl transition-all active:scale-95 shadow-xl shadow-orange-100 dark:shadow-orange-900/40 disabled:opacity-50 flex items-center justify-center"
              >
                {t.btnSavePdf}
              </button>
            </div>
          </div>
        </div>

        {/* Layout optimized for wide screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 px-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 min-h-[450px] transition-colors">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-widest flex items-center border-b border-slate-50 dark:border-slate-800 pb-4">
              <span className="w-3 h-3 bg-orange-600 rounded-full mr-3 shadow-lg shadow-orange-100 dark:shadow-none"></span>
              Macronutrient Balance
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={80} 
                    outerRadius={105} 
                    paddingAngle={8} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px', backgroundColor: '#ffffff', color: '#0f172a' }} 
                    itemStyle={{ fontWeight: '800', fontSize: '12px', color: '#0f172a' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col transition-colors">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-10 uppercase tracking-widest flex items-center border-b border-slate-50 dark:border-slate-800 pb-4">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-3 shadow-lg shadow-blue-100 dark:shadow-none"></span>
              {t.checklistTitle}
            </h3>
            <div ref={scrollContainerRef} className="space-y-6 max-h-[700px] overflow-y-auto pr-4 scroll-container-fix custom-scrollbar">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-6 p-7 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-orange-200 dark:hover:border-orange-900 transition-all group relative overflow-hidden">
                  <div className="mt-1 flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${item.status === 'PASS' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' : item.status === 'WARNING' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'}`}>
                      {item.status === 'PASS' ? '✓' : item.status === 'WARNING' ? '!' : '×'}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start mb-3 gap-2 sm:gap-4">
                      <span className="font-black text-xl sm:text-2xl leading-tight truncate-name-fix break-words whitespace-normal block text-slate-900 dark:text-white">{getLocalized(item.name)}</span>
                      <span className="text-sm sm:text-base font-black text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700 whitespace-nowrap shrink-0 shadow-sm">{item.calories} kcal</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase bg-slate-200/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl tracking-widest">{getLocalized(item.portion)}</span>
                      <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-4 flex gap-4">
                        <span>P: <span className="text-green-600 dark:text-green-400 font-black">{item.protein}g</span></span>
                        <span>C: <span className="text-blue-600 dark:text-blue-400 font-black">{item.carbs}g</span></span>
                        <span>F: <span className="text-orange-600 dark:text-orange-400 font-black">{item.fats}g</span></span>
                      </span>
                    </div>
                    {item.notes && (
                      <div className="bg-white/80 dark:bg-slate-900/50 p-5 rounded-3xl border border-slate-200/40 dark:border-slate-700/40 shadow-inner">
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-semibold leading-relaxed break-words">{getLocalized(item.notes)}</p>
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
              <div className="h-1 w-24 bg-red-200 dark:bg-red-800 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 traps-grid-fix">
            {t.rejections.map((r, i) => {
              const [title, description] = r.split(': ');
              return (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border-2 border-red-50 dark:border-red-900/20 shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                     <span className="text-red-600 dark:text-red-400 font-black text-lg">{i + 1}</span>
                  </div>
                  <h5 className="font-black text-red-800 dark:text-red-300 text-[11px] uppercase mb-3 tracking-widest bg-red-50 dark:bg-red-900/20 inline-block px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/10">{title}</h5>
                  <p className="text-sm text-red-700 dark:text-red-300 font-bold leading-relaxed">{description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-black text-white rounded-[4rem] p-14 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border-b-[20px] border-orange-600 no-print mx-2 mt-12 mb-8">
          <div className="absolute -top-10 -left-10 w-80 h-80 bg-orange-600 opacity-10 blur-[150px] rounded-full"></div>
          <div className="w-28 h-28 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl rotate-6 ring-8 ring-white/5">
            <span className="text-6xl">🍛</span>
          </div>
          <h3 className="text-5xl font-black mb-8 tracking-tighter">{t.ready}</h3>
          <p className="text-slate-400 mb-3 max-w-lg font-medium text-xl leading-relaxed">{t.zeroError}</p>
          <p className="text-orange-400 font-black mb-12 max-w-md text-sm uppercase tracking-[0.3em]">{t.nextStep}</p>
          <button onClick={onReset} className="group relative bg-orange-600 hover:bg-orange-500 text-white px-20 py-7 rounded-[3rem] font-black text-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-orange-900/60 border-b-8 border-orange-800">
            <span className="relative z-10">{t.btn}</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default NutritionDashboard;