
import React, { useState } from 'react';
import { UserProfile, Language, ActivityLevel } from '../types';

interface UserProfileFormProps {
  onSave: (profile: UserProfile) => void;
  language: Language;
  initialProfile?: UserProfile | null;
  onClose: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onSave, language, initialProfile, onClose }) => {
  const [age, setAge] = useState(initialProfile?.age || 25);
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [weight, setWeight] = useState(initialProfile?.weight || 65);
  const [height, setHeight] = useState(initialProfile?.height || 170);
  const [activity, setActivity] = useState<ActivityLevel>(initialProfile?.activityLevel || 'sedentary');

  const calculateTDEE = () => {
    // Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9,
    };

    return Math.round(bmr * activityMultipliers[activity]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tdee = calculateTDEE();
    onSave({ age, gender, weight, height, activityLevel: activity, tdee });
  };

  const translations = {
    en: {
      title: "Set Your Daily Goal",
      sub: "We need these details to tell you how many calories you have left for today.",
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      weight: "Weight (kg)",
      height: "Height (cm)",
      activity: "Activity Level",
      save: "Save My Profile",
      act_sedentary: "Sedentary (Office job, little exercise)",
      act_lightly: "Lightly Active (1-3 days exercise)",
      act_moderately: "Moderately Active (3-5 days exercise)",
      act_very: "Very Active (6-7 days hard exercise)",
      act_extra: "Extra Active (Physical job or 2x training)",
    },
    bn: {
      title: "দৈনিক লক্ষ্য নির্ধারণ করুন",
      sub: "আপনার আজকের জন্য কত ক্যালরি বাকি আছে তা বলতে আমাদের এই তথ্যগুলো প্রয়োজন।",
      age: "বয়স",
      gender: "লিঙ্গ",
      male: "পুরুষ",
      female: "মহিলা",
      weight: "ওজন (কেজি)",
      height: "উচ্চতা (সেমি)",
      activity: "শারীরিক পরিশ্রমের মাত্রা",
      save: "প্রোফাইল সেভ করুন",
      act_sedentary: "অল্প পরিশ্রম (অফিস কাজ, ব্যায়াম নেই)",
      act_lightly: "হালকা পরিশ্রম (সপ্তাহে ১-৩ দিন ব্যায়াম)",
      act_moderately: "মাঝারি পরিশ্রম (সপ্তাহে ৩-৫ দিন ব্যায়াম)",
      act_very: "বেশি পরিশ্রম (সপ্তাহে ৬-৭ দিন কঠোর ব্যায়াম)",
      act_extra: "অত্যধিক পরিশ্রম (শারীরিক শ্রমের কাজ)",
    },
    hi: {
      title: "दैनिक लक्ष्य निर्धारित करें",
      sub: "आज के लिए आपकी कितनी कैलोरी बची है, यह बताने के लिए हमें इन विवरणों की आवश्यकता है।",
      age: "उम्र",
      gender: "लिंग",
      male: "पुरुष",
      female: "महिला",
      weight: "वजन (किलोग्राम)",
      height: "लंबाई (सेमी)",
      activity: "गतिविधि का स्तर",
      save: "प्रोफाइल सहेजें",
      act_sedentary: "कम सक्रिय (ऑफिस का काम, कम व्यायाम)",
      act_lightly: "हल्का सक्रिय (1-3 दिन व्यायाम)",
      act_moderately: "मध्यम सक्रिय (3-5 दिन व्यायाम)",
      act_very: "बहुत सक्रिय (6-7 दिन कठिन व्यायाम)",
      act_extra: "अत्यधिक सक्रिय (शारीरिक श्रम वाला काम)",
    },
    as: {
      title: "দৈনিক লক্ষ্য স্থিৰ কৰক",
      sub: "আপোনাৰ আজিৰ বাবে কিমান কেলৰি বাকী আছে সেয়া জানিবলৈ আমাক এই তথ্যবোৰৰ প্ৰয়োজন।",
      age: "বয়স",
      gender: "লিংগ",
      male: "পুৰুষ",
      female: "মহিলা",
      weight: "ওজন (কেজি)",
      height: "উচ্চতা (চেমি)",
      activity: "গতিবিধিৰ স্তৰ",
      save: "প্ৰফাইল সংৰক্ষণ কৰক",
      act_sedentary: "কম সক্ৰিয় (অফিচৰ কাম, কম ব্যায়াম)",
      act_lightly: "সামান্য সক্ৰিয় (১-৩ দিন ব্যায়াম)",
      act_moderately: "মধ্যমীয়া সক্ৰিয় (৩-৫ দিন ব্যায়াম)",
      act_very: "অধিক সক্ৰিয় (৬-৭ দিন কঠিন ব্যায়াম)",
      act_extra: "অত্যধিক সক্ৰিয় (শাৰীৰিক শ্ৰমৰ কাম)",
    }
  };

  const t = translations[language];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-8 sm:p-12 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 pr-10">{t.title}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{t.sub}</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.age}</label>
              <input type="number" required value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.gender}</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 border-2 border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'male' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600' : 'text-slate-400'}`}>{t.male}</button>
                <button type="button" onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'female' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600' : 'text-slate-400'}`}>{t.female}</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.weight}</label>
              <input type="number" required value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.height}</label>
              <input type="number" required value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.activity}</label>
            <select value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-none appearance-none">
              <option value="sedentary">{t.act_sedentary}</option>
              <option value="lightly_active">{t.act_lightly}</option>
              <option value="moderately_active">{t.act_moderately}</option>
              <option value="very_active">{t.act_very}</option>
              <option value="extra_active">{t.act_extra}</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-orange-600 border-b-8 border-orange-800 text-white font-black py-6 rounded-[2rem] text-xl shadow-xl shadow-orange-900/20 active:scale-95 transition-all">
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;
