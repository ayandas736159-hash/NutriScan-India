
import React, { useRef, useState } from 'react';

interface ScannerProps {
  onImageCaptured: (base64: string) => void;
  isLoading: boolean;
}

const Scanner: React.FC<ScannerProps> = ({ onImageCaptured, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result?.toString().split(',')[1];
      if (base64) {
        onImageCaptured(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          dragActive ? 'border-orange-500 bg-orange-50 scale-[1.01]' : 'border-slate-300 bg-white hover:border-orange-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          capture="environment"
          className="hidden" 
          onChange={onFileChange}
        />

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Snap your meal</h2>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">
            Take a photo or upload an image of your Bengali/Indian thali to start the "Zero-Error" audit.
          </p>

          <button 
            disabled={isLoading}
            onClick={() => fileInputRef.current?.click()}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-orange-600 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-600 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI is Scanning...
              </span>
            ) : (
              "Open Camera / Gallery"
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs font-medium text-slate-400">
        <span className="flex items-center px-3 py-1 bg-white rounded-full border border-slate-200">✅ Luchi & Alur Dom</span>
        <span className="flex items-center px-3 py-1 bg-white rounded-full border border-slate-200">✅ Macher Jhol</span>
        <span className="flex items-center px-3 py-1 bg-white rounded-full border border-slate-200">✅ Biryani & Chaap</span>
        <span className="flex items-center px-3 py-1 bg-white rounded-full border border-slate-200">✅ Shukto</span>
      </div>
    </div>
  );
};

export default Scanner;
