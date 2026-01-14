
import React, { useState } from 'react';

interface InfoModalProps {
  onClose: () => void;
}

type ModalView = 'info' | 'terms' | 'privacy';

// Define ModalContainer outside to avoid re-mounting and fix TS children error
const ModalContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
      {children}
    </div>
  </div>
);

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const [view, setView] = useState<ModalView>('info');

  if (view === 'terms') {
    return (
      <ModalContainer>
        <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <button onClick={() => setView('info')} className="text-orange-500 font-black text-xs uppercase tracking-widest flex items-center hover:opacity-70 transition-all">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              Back to Info
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 text-2xl">⚖️</div>
            <h2 className="text-3xl font-black text-white tracking-tight">Terms of Service</h2>
          </div>

          <p className="text-slate-400 mb-8 font-medium leading-relaxed">Please read these terms carefully to ensure you understand how NutryScan India works:</p>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                1. AI Estimation Disclaimer
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">NutryScan India uses the gemini-flash-latest model for analysis. While we strive for 100% accuracy, these are estimates. Calorie counts can vary based on lighting, depth, and specific ingredients used.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                2. Not Medical Advice
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">This app is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Consult a nutritionist or doctor before making significant dietary changes.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                3. User Responsibility
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">The user assumes full responsibility for their dietary choices. The developer is not liable for any health issues arising from reliance on the data provided by this tool.</p>
            </div>
          </div>

          <button onClick={() => setView('info')} className="w-full mt-10 bg-white text-slate-950 font-black py-5 rounded-3xl hover:bg-slate-200 transition-all active:scale-95">
            I Accept
          </button>
        </div>
      </ModalContainer>
    );
  }

  if (view === 'privacy') {
    return (
      <ModalContainer>
        <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <button onClick={() => setView('info')} className="text-orange-500 font-black text-xs uppercase tracking-widest flex items-center hover:opacity-70 transition-all">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              Back to Info
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 text-2xl">🛡️</div>
            <h2 className="text-3xl font-black text-white tracking-tight">Privacy Policy</h2>
          </div>

          <p className="text-slate-400 mb-8 font-medium leading-relaxed">At NutryScan India, your food privacy is our top priority. Here is how we handle your data:</p>

          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2">1. Local Processing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Most operations, including PDF generation and dashboard rendering, happen locally on your device.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2">2. Image Analysis (Gemini API)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">When you scan a meal, the image is processed via the Google Gemini API to identify nutritional content. We do not store these images on our own servers.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <h3 className="text-white font-black mb-2">3. No Personal Data Harvesting</h3>
              <p className="text-slate-400 text-sm leading-relaxed">We do not collect names, phone numbers, or emails. Your health profile is stored only in your browser's local storage.</p>
            </div>
          </div>

          <button onClick={() => setView('info')} className="w-full mt-10 bg-orange-600 text-white font-black py-5 rounded-3xl hover:bg-orange-500 transition-all active:scale-95 shadow-xl shadow-orange-900/40">
            Got it
          </button>
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600/20 to-transparent p-12 border-b border-slate-800 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        
        {/* Unified Icon Styling to match main header */}
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl border border-orange-600 ring-4 ring-orange-500/10 transition-transform hover:scale-105 duration-500">
          <span className="text-white text-4xl">🍲</span>
        </div>
        
        <h2 className="text-4xl font-black text-white tracking-tighter mb-1">NutryScan India</h2>
        <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">Reveal the Truth</p>
      </div>

      <div className="p-8 sm:p-12 overflow-y-auto flex-grow custom-scrollbar">
        {/* Mission */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-orange-500">🎯</span>
            <h3 className="text-orange-500 font-black text-xs uppercase tracking-widest">Our Mission</h3>
          </div>
          <p className="text-slate-400 font-bold text-lg leading-relaxed">
            "Homemade ≠ Healthy." NutryScan India was built to expose the hidden calories and carb bombs in traditional Indian household meals. Our goal is to provide honest, data-driven nutrition insights so you can take control of your health.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-orange-500/50 transition-all group">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 text-orange-500 text-xl group-hover:scale-110 transition-transform">⚙️</div>
            <h4 className="text-white font-black mb-2">AI-Powered Analysis</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-bold">
              We use advanced gemini-flash-latest vision models to estimate portion sizes, oil absorption, and macronutrients.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-orange-500/50 transition-all group">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 text-orange-500 text-xl group-hover:scale-110 transition-transform">🍱</div>
            <h4 className="text-white font-black mb-2">Localized Food Intelligence</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-bold">
              Specialized identification for Bengali, Assamese, and Pan-Indian cuisine including street foods and household recipes.
            </p>
          </div>
        </div>

        {/* Creator Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-green-500">👨‍💻</span>
            <h3 className="text-green-500 font-black text-xs uppercase tracking-widest">The Creator</h3>
          </div>
          <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-[2rem] flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner border border-slate-700 shrink-0">
               <span className="text-4xl">👨‍💻</span>
            </div>
            <div>
              <h4 className="text-2xl font-black text-white mb-1">Padmanava Das</h4>
              <p className="text-slate-500 font-bold text-sm mb-6">Lead Developer & Visionary</p>
              <a 
                href="https://www.linkedin.com/in/padmanavadas/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center bg-[#0077b5] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[#0077b5]/20"
              >
                <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col items-center space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-6">
            <button onClick={() => setView('privacy')} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</button>
            <span className="text-slate-800">•</span>
            <button onClick={() => setView('terms')} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">Terms of Service</button>
          </div>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-tight">Provided "AS-IS" without warranty of any kind.</p>
        </div>
      </div>
    </ModalContainer>
  );
};

export default InfoModal;
