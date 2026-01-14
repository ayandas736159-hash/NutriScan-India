import React, { useRef, useState, useEffect } from 'react';
import { Language } from '../types';

interface ScannerProps {
  onImageCaptured: (base64: string) => void;
  isLoading: boolean;
  language: Language;
}

const Scanner: React.FC<ScannerProps> = ({ onImageCaptured, isLoading, language }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const checkPermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'denied') {
          setPermissionError(true);
          return false;
        }
        
        result.onchange = () => {
          if (result.state !== 'denied') setPermissionError(false);
        };
      }
      return true;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

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
      sub: "Reveal hidden oils and carb imbalances with an Honest Health Check.",
      btnCamera: "Snap Photo",
      btnGallery: "Upload Photo",
      scanning: "Scanning...",
      dragText: "or drag your photo here",
      permissionDenied: "Camera Access Blocked",
      permissionInstruction: "Please click the lock icon in your browser address bar and enable 'Camera' to scan your food."
    },
    bn: {
      snap: "আপনার থালি চেক করুন",
      sub: "আপনার খাবারের লুকানো তেল এবং কার্বোহাইড্রেটের ভারসাম্যহীনতা দেখতে একটি Honest Check শুরু করুন।",
      btnCamera: "ছবি তুলুন",
      btnGallery: "গ্যালারি থেকে নিন",
      scanning: "স্ক্যান চলছে...",
      dragText: "অথবা ছবি এখানে ড্র্যাগ করুন",
      permissionDenied: "ক্যামেরা অ্যাক্সেস বন্ধ",
      permissionInstruction: "অনুগ্রহ করে আপনার ব্রাউজারের অ্যাড্রেস বারের লক আইকনে ক্লিক করুন এবং খাবার স্ক্যান করার জন্য 'Camera' চালু করুন।"
    },
    hi: {
      snap: "अपनी थाली चेक करें",
      sub: "अपने भोजन में छिपे हुए तेल और कार्ब असंतुलन का पता लगाने के लिए Honest Check शुरू करें।",
      btnCamera: "फोटो लें",
      btnGallery: "गैलरी से अपलोड",
      scanning: "স্ক্যান হচ্ছে...",
      dragText: "या अपनी फोटो यहां खींचें",
      permissionDenied: "कैमरा एक्सेस ब्लॉक है",
      permissionInstruction: "कृपया अपने ब्राउज़र के एड्रेस बार में लॉक आइकन पर क्लिक करें और भोजन स्कैन करने के लिए 'Camera' सक्षम करें।"
    }
  };

  const t = translations[language];

  return (
    <div className="w-full">
      <div 
        className={`relative border-4 border-dashed rounded-[3.5rem] p-10 sm:p-16 text-center transition-all duration-500 overflow-hidden group ${
          dragActive 
            ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 scale-[1.02] shadow-2xl' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-orange-400 dark:hover:border-orange-500 shadow-2xl shadow-slate-100 dark:shadow-none'
        } ${permissionError ? 'border-red-300 dark:border-red-900' : ''}`}
        onDragEnter={(e) => {e.preventDefault(); setDragActive(true);}}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);}}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-900/50 pointer-events-none"></div>
        
        {/* Hidden inputs for Camera and Gallery */}
        <input 
          ref={cameraInputRef} 
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        />
        <input 
          ref={galleryInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
        />
        
        <div className="flex flex-col items-center relative z-10">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mb-6 sm:mb-8 shadow-2xl transition-transform group-hover:scale-110 ${permissionError ? 'bg-red-600 shadow-red-200 dark:shadow-red-900/50' : 'bg-orange-600 shadow-orange-200 dark:shadow-orange-900/50'}`}>
            <span className="text-4xl sm:text-5xl">{permissionError ? '🔒' : '📸'}</span>
          </div>

          {permissionError ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400 mb-3 tracking-tighter">{t.permissionDenied}</h2>
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 p-6 rounded-3xl mb-8">
                <p className="text-red-800 dark:text-red-300 text-base sm:text-lg font-bold leading-relaxed">{t.permissionInstruction}</p>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">{t.snap}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 max-w-xs sm:max-w-sm mx-auto text-base sm:text-lg font-medium leading-relaxed">{t.sub}</p>
            </>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <button 
              disabled={isLoading || permissionError}
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 group/btn relative inline-flex items-center justify-center px-6 py-5 font-black text-white transition-all duration-300 rounded-3xl shadow-xl active:scale-95 disabled:opacity-50 overflow-hidden border-b-8 bg-orange-600 border-orange-800 shadow-orange-900/30"
            >
              <span className="relative z-10 text-lg uppercase tracking-wider">{isLoading ? t.scanning : t.btnCamera}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
            </button>

            <button 
              disabled={isLoading}
              onClick={() => galleryInputRef.current?.click()}
              className="flex-1 group/btn relative inline-flex items-center justify-center px-6 py-5 font-black text-slate-700 dark:text-white transition-all duration-300 rounded-3xl shadow-xl active:scale-95 disabled:opacity-50 overflow-hidden border-b-8 bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            >
              <span className="relative z-10 text-lg uppercase tracking-wider">{isLoading ? t.scanning : t.btnGallery}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity"></div>
            </button>
          </div>
          
          {!permissionError && <p className="mt-8 text-slate-300 dark:text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{t.dragText}</p>}
        </div>
      </div>
    </div>
  );
};

export default Scanner;