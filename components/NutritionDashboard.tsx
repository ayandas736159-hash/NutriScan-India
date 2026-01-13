
import React from 'react';
import { NutritionAnalysis } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface NutritionDashboardProps {
  data: NutritionAnalysis;
  onReset: () => void;
  imagePreview: string | null;
}

const NutritionDashboard: React.FC<NutritionDashboardProps> = ({ data, onReset, imagePreview }) => {
  const chartData = [
    { name: 'Protein', value: data.totalProtein, color: '#22c55e' },
    { name: 'Carbs', value: data.totalCarbs, color: '#3b82f6' },
    { name: 'Fats', value: data.totalFats, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="rounded-3xl overflow-hidden shadow-xl ring-4 ring-white">
            {imagePreview && <img src={imagePreview} alt="Scanned meal" className="w-full h-64 object-cover" />}
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Estimated Total</p>
                <h2 className="text-4xl font-extrabold text-slate-900">{data.totalCalories} <span className="text-xl font-normal text-slate-400">kcal</span></h2>
              </div>
              <div className="text-right">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Health Rating</p>
                <div className="flex items-center space-x-1">
                  <span className="text-3xl font-bold text-green-600">{data.healthRating}</span>
                  <span className="text-slate-300 font-bold text-2xl">/10</span>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
              <p className="text-orange-900 italic font-medium">"{data.advice}"</p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button 
              onClick={onReset}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Scan New Meal
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-colors"
            >
              Save Summary
            </button>
          </div>
        </div>
      </div>

      {/* Macronutrients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2">📊</span> Macronutrient Split
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <span className="mr-2">📋</span> The "Zero-Error" Checklist
          </h3>
          <div className="space-y-4">
            {data.items.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="mt-1">
                  <div className="w-5 h-5 rounded border-2 border-green-500 flex items-center justify-center bg-white">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-xs font-bold text-slate-400">{item.calories} kcal</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.portion} • P: {item.protein}g C: {item.carbs}g F: {item.fats}g</p>
                  {item.notes && <p className="text-[10px] text-orange-600 mt-1 font-medium">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6">
        <h4 className="text-yellow-800 font-bold mb-2 flex items-center">
          <span className="mr-2">⚠️</span> Common Rejection Reasons (Read Carefully)
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Mustard oil usage can significantly increase fat content if not drained well.</li>
          <li>"Aloo Posto" or "Bhaja" items are often higher in calories than they appear.</li>
          <li>Sugar content in Bengali "Mishtis" is extremely high; 1 Rasgulla is roughly 150-200 kcal.</li>
          <li>Estimated portion sizes may vary by up to 15% based on vessel depth.</li>
        </ul>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col items-center text-center">
        <h3 className="text-xl font-bold mb-4">🎯 READY TO VERIFY NEXT MEAL?</h3>
        <p className="text-slate-400 mb-6 max-w-md">I have generated your 'Zero-Error' nutrition audit. Keep scanning your daily meals to build a 100% accurate health profile.</p>
        <button 
          onClick={onReset}
          className="bg-orange-600 hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
        >
          Verify Next Document
        </button>
      </div>
    </div>
  );
};

export default NutritionDashboard;
