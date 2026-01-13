import React, { useRef, useState } from 'react';
import { Language } from '../types';

interface ScannerProps {
  onImageCaptured: (base64: string) => void;
  isLoading: boolean;
  language: Language;
}

const Scanner: React.FC<ScannerProps> = ({ onImageCaptured, isLoading, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (base64) onImageCaptured(base64);
    };
    reader.readAsDataURL(file);
  };

  const translations = {
    en: {
      snap: "Check Your Plate",
      sub: "Snap a photo to reveal hidden oils and carb imbalances with an Honest Health Check.",
      btn: "Start Real Scan",
      scanning: "Scanning...",
      dragText: "or drag your photo here"
    },
    bn: {
      snap: "আপনার থালি চেক করুন",
      sub: "আপনার খাবারের লুকানো তেল এবং কার্বোহাইড্রেটের ভারসাম্যহীনতা দেখতে একটি Honest Check শুরু করুন।",
      btn: "স্ক্যান শুরু করুন",
      scanning: "স্ক্যান চলছে...",
      dragText: "অথবা ছবি এখানে ড্র্যাগ করুন"
    },
    hi: {
      snap: "अपनी थाली चेक करें",
      sub: "अपने भोजन में छिपे हुए तेल और कार्ब असंतुलन का पता लगाने के लिए Honest Check शुरू करें।",
      btn: "स्कैन शुरू करें",
      scanning: "स्कैन हो रहा है...",
      dragText: "या अपनी फोटो यहां खींचें"
    }
  };

  const t = translations[language];

  return (
    <div className="w-full">
      <div 
        className={`relative border-4 border-dashed rounded-[3.5rem] p-16 text-center transition-all duration-500 overflow-hidden group ${
          dragActive 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[1.02] shadow-2xl' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-400 dark:hover:border-orange-500 shadow-2xl shadow-slate-100 dark:shadow-none'
        }`}
        onDragEnter={(e) => {e.preventDefault(); setDragActive(true);}}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-900/50 pointer-events-none"></div>
        
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
        
        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 bg-orange-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-200 dark:shadow-orange-900/50 group-hover:scale-110 transition-transform">
            <span className="text-5xl">📸</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">{t.snap}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm mx-auto text-lg font-medium leading-relaxed">{t.sub}</p>
          
          <div className="space-y-6 w-full">
            <button 
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className="group/btn relative inline-flex items-center justify-center px-14 py-6 font-black text-white transition-all duration-300 bg-orange-600 rounded-[2.5rem] shadow-2xl shadow-orange-900/30 active:scale-95 disabled:opacity-50 overflow-hidden border-b-8 border-orange-800"
            >
              <span className="relative z-10 text-xl uppercase tracking-widest">{isLoading ? t.scanning : t.btn}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
            </button>
            <p className="text-slate-300 dark:text-slate-600 text-xs font-black uppercase tracking-[0.2em]">{t.dragText}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scanner;