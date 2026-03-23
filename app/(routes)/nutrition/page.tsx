"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Droplets, Check, Zap, Brain, Utensils, Trophy } from "lucide-react";
import MealScanner from "./components/MealScanner";
import ConfirmMealModal from "./components/ConfirmMealModal"; 
import { saveMeal, getDashboardSummary, MealData } from "./services/nutritionService"; 

interface DailyMacros {
  calories: number;
  target: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface MealItemData {
  id: number | string;
  name: string;
  kcal: number;
  p: number;
  time: string;
  color: string;
}

export default function NutritionDashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [dailyMacros, setDailyMacros] = useState<DailyMacros>({
    calories: 0,
    target: 2450, 
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const [meals, setMeals] = useState<MealItemData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getDashboardSummary();
        
        // Actualizamos las barras y el gráfico circular
        setDailyMacros(prev => ({
          ...prev,
          calories: data.totals.calories,
          protein: data.totals.protein,
          carbs: data.totals.carbs,
          fats: data.totals.fats
        }));

        // Poblamos el Timeline con datos reales
        setMeals(data.meals.map((m: any) => ({
          id: m.id,
          name: m.name,
          kcal: m.calories,
          p: m.protein,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: "border-blue-500"
        })));
      } catch (error) {
        console.error("Dashboard out of sync:", error);
      }
    };

    loadData();
  }, []);

  const macroData = [
    { name: "Consumed", value: dailyMacros.calories, color: "#2563eb" },
    { name: "Remaining", value: Math.max(0, dailyMacros.target - dailyMacros.calories), color: "#1e1e20" },
  ];

  const handleScanResult = (result: any) => {
    setScannedData(result);
    setShowScanner(false);
  };

  const handleConfirmMeal = async (mealFromAI: any) => {
    setIsSaving(true);
    
    const results = mealFromAI?.recognition_results || mealFromAI?.recognitionResults || [];
    const dish = results[0] || {};
    const info = dish?.nutritional_info || dish?.nutritionalInfo || {};

    const newMeal = {
      name: dish?.name || "Plato Proteico",
      calories: Math.round(info.calories || 0),
      protein: Math.round(info.protein || 0),
      carbs: Math.round(info.carbs || 0),
      fat: Math.round(info.fat || 0)
    };

    try {
      await saveMeal(newMeal);

      // Update Optimista: Refrescamos la UI sin recargar página
      setDailyMacros(prev => ({
        ...prev,
        calories: prev.calories + newMeal.calories,
        protein: prev.protein + newMeal.protein,
        carbs: prev.carbs + newMeal.carbs,
        fats: prev.fats + newMeal.fat
      }));

      setMeals(prev => [
        { 
          id: Date.now(), 
          ...newMeal, 
          kcal: newMeal.calories, 
          p: newMeal.protein, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          color: "border-green-500" 
        },
        ...prev
      ]);

      setScannedData(null);
    } catch (error) {
      alert("Error al persistir datos en Kallp Elite Server");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">
            Daily Intake<span className="text-blue-500">.</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Fueling Performance Elite</p>
        </div>
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Zap size={14} fill="currentColor" /> Scan Meal
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* BALANCE CARD */}
          <div className="bg-[#0f0f11] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md">
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-white font-black italic uppercase text-lg tracking-tight">Macro Balance_</h3>
                <div className="text-right">
                    <p className="text-3xl font-black italic text-white tracking-tighter">
                        {Math.max(0, dailyMacros.target - dailyMacros.calories)}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Kcal Remaining</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macroData} innerRadius={80} outerRadius={100} dataKey="value" startAngle={90} endAngle={450}>
                      {macroData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black italic text-white">{Math.round(dailyMacros.calories)}</span>
                  <span className="text-[10px] text-blue-500 font-bold uppercase">Consumed</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <MacroProgressBar label="Protein" current={dailyMacros.protein} target={210} color="bg-blue-500" />
                <MacroProgressBar label="Carbohydrates" current={dailyMacros.carbs} target={350} color="bg-pink-500" />
                <MacroProgressBar label="Fats" current={dailyMacros.fats} target={85} color="bg-purple-500" />
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="space-y-6">
            <h3 className="text-white font-black italic uppercase text-sm tracking-[0.2em]">Timeline Log_</h3>
            <div className="space-y-4">
              {meals.length > 0 ? (
                meals.map(meal => <MealItem key={meal.id} {...meal} />)
              ) : (
                <div className="py-20 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4">
                    <Utensils className="text-white/5" size={40} />
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">No intake records for today_</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <HydrationCard />
          <PerformanceStack />
        </div>
      </div>

      {showScanner && (
        <MealScanner onScanResult={handleScanResult} onClose={() => setShowScanner(false)} />
      )}

      {scannedData && (
        <ConfirmMealModal 
          data={scannedData} 
          onConfirm={handleConfirmMeal} 
          onCancel={() => setScannedData(null)}
          loading={isSaving}
        />
      )}
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

function MacroProgressBar({ label, current, target, color }: MacroProgressBarProps) {
    const progress = (current / target) * 100;
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-white italic">{Math.round(current)}g / {target}g</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
        </div>
    );
}

function MealItem({ name, kcal, p, time, color }: MealItemData) {
    return (
        <div className="flex items-center gap-6 group">
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${color} bg-black`} />
                <div className="w-[1px] h-14 bg-white/5" />
            </div>
            <div className="flex-1 bg-white/5 border border-white/5 p-5 rounded-[2rem] hover:bg-white/10 transition-all flex justify-between items-center shadow-lg shadow-black/20">
                <div className="space-y-1">
                    <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">{time}</span>
                    <p className="text-sm font-black italic uppercase text-white tracking-tight">{name}</p>
                    <p className="text-[9px] text-muted-foreground">{kcal} kcal • {Math.round(p)}g Protein</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <Utensils size={16} className="text-white/20"/>
                </div>
            </div>
        </div>
    );
}

function HydrationCard() {
  return (
    <div className="bg-[#0f0f11] border border-white/5 rounded-[2.5rem] p-8">
        <h3 className="text-white font-black italic uppercase text-sm mb-6 tracking-widest">Hydration_</h3>
        <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-40 bg-blue-500/10 border border-blue-500/20 rounded-3xl relative overflow-hidden">
                <div className="absolute bottom-0 w-full bg-blue-600/40 h-[60%] transition-all duration-1000" />
                <div className="absolute inset-0 flex items-center justify-center font-black italic text-2xl text-white">2.8L</div>
            </div>
            <div className="flex gap-2">
                {[1,2,3,4].map(i => <button key={i} className="p-3 bg-white/5 rounded-xl hover:bg-blue-500/20 transition-colors"><Droplets size={16} className="text-blue-500" /></button>)}
            </div>
        </div>
    </div>
  );
}

function PerformanceStack() {
  return (
    <div className="bg-[#0f0f11] border border-white/5 rounded-[2.5rem] p-8">
        <h3 className="text-white font-black italic uppercase text-sm mb-6 tracking-widest">Performance Stack_</h3>
        <div className="space-y-3">
            <StackItem name="Creatine Monohydrate" dose="5G • POST" completed={true} />
            <StackItem name="Omega 3 Fish Oil" dose="2G • DINNER" completed={false} />
        </div>
        <div className="mt-8 p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
            <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Architect's Insight</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">Protein targets are on track. Leucine threshold reached.</p>
        </div>
    </div>
  );
}

interface StackItemProps {
  name: string;
  dose: string;
  completed: boolean;
}

function StackItem({ name, dose, completed }: StackItemProps) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${completed ? 'bg-blue-600/5 border-blue-500/20' : 'bg-transparent border-white/5 opacity-40'}`}>
            <div className="flex flex-col">
              <span className="text-xs font-black italic uppercase text-white">{name}</span>
              <span className="text-[8px] text-muted-foreground uppercase">{dose}</span>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completed ? 'bg-blue-600 text-white' : 'border border-white/20'}`}>
              {completed && <Check size={12}/>}
            </div>
        </div>
    );
}