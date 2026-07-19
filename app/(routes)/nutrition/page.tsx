"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Droplets, Check, Zap, Brain, Utensils, Trophy } from "lucide-react";
import MealScanner from "./components/MealScanner";
import ConfirmMealModal from "./components/ConfirmMealModal"; 
import { saveMeal, getDashboardSummary, MealData } from "./services/nutritionService"; 
import HydrationWidget from "@/app/components/HydrationWidget";
import { consumeSupplement, deleteSupplement } from "@/services/api";
import SupplementManagerModal from "./components/SupplementManagerModal";
import { Settings, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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

import { useApp } from "@/app/context/AppContext";

export default function NutritionDashboard() {
  const { nutritionSummary, nutrition, refreshEcosystem, gainXp, CURRENT_USER_ID } = useApp();

  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [dailyMacros, setDailyMacros] = useState<DailyMacros>({
    calories: 0,
    target: nutrition?.targetCalories || 2450, 
    protein: 0,
    carbs: 0,
    fats: 0
  });

  const [meals, setMeals] = useState<MealItemData[]>([]);

  useEffect(() => {
    if (nutritionSummary) {
      setDailyMacros(prev => ({
        ...prev,
        calories: nutritionSummary.totals.calories,
        protein: nutritionSummary.totals.protein,
        carbs: nutritionSummary.totals.carbs,
        fats: nutritionSummary.totals.fats,
        target: nutrition?.targetCalories || 2450
      }));

      setMeals(nutritionSummary.meals.map((m: any) => ({
        id: m.id,
        name: m.name,
        kcal: m.calories,
        p: m.protein,
        time: new Date(m.createdAt.endsWith('Z') ? m.createdAt : m.createdAt + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
      })));
    }
  }, [nutritionSummary, nutrition]);

  const proteinTarget = nutrition?.targetProteinGrams || 150;
  const fatTarget = Math.round((dailyMacros.target * 0.25) / 9) || 70;
  const carbTarget = Math.max(0, Math.round((dailyMacros.target - (proteinTarget * 4) - (fatTarget * 9)) / 4)) || 200;

  const macroData = [
    { name: "Consumed", value: dailyMacros.calories, color: "#3b82f6" }, // bg-blue-500
    { name: "Remaining", value: Math.max(0, dailyMacros.target - dailyMacros.calories), color: "currentColor" }, // Adapts dynamically using css
  ];

  const handleScanResult = (result: any) => {
    setScannedData(result);
    setShowScanner(false);
  };

  const handleConfirmMeal = async (mealFromAI: any) => {
    setIsSaving(true);

    const newMeal = {
      name: mealFromAI?.name || "Plato Proteico",
      calories: Math.round(mealFromAI?.calories || 0),
      protein: Math.round(mealFromAI?.protein || 0),
      carbs: Math.round(mealFromAI?.carbs || 0),
      fat: Math.round(mealFromAI?.fat || 0)
    };

    try {
      await saveMeal(CURRENT_USER_ID, newMeal);
      await refreshEcosystem();
      await gainXp(15, "Comida Registrada");
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
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors">
            Ingesta Diaria<span className="text-blue-500">.</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Rendimiento Nutricional Élite</p>
        </div>
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <Zap size={14} fill="currentColor" /> Escanear Comida
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* BALANCE CARD */}
          <div className="bg-white dark:bg-[#0f0f11] border border-gray-200 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-none rounded-[2.5rem] p-8 backdrop-blur-md transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-gray-900 dark:text-white font-black italic uppercase text-lg tracking-tight transition-colors">Balance Macros_</h3>
                <div className="text-right">
                    <p className="text-3xl font-black italic text-gray-900 dark:text-white tracking-tighter transition-colors">
                        {Math.max(0, dailyMacros.target - dailyMacros.calories).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Kcal Restantes</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-64 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={macroData} 
                      innerRadius={80} 
                      outerRadius={100} 
                      dataKey="value" 
                      startAngle={90} 
                      endAngle={450}
                      className="fill-gray-100 dark:fill-[#1e1e20] transition-colors"
                    >
                      {macroData.map((entry, index) => <Cell key={index} fill={index === 0 ? entry.color : undefined} className={index === 1 ? 'fill-gray-100 dark:fill-[#1e1e20] transition-colors' : ''} stroke="none" />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black italic text-gray-900 dark:text-white transition-colors">{Math.round(dailyMacros.calories)}</span>
                  <span className="text-[10px] text-blue-500 font-bold uppercase">Consumidas</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <MacroProgressBar label="Proteína" current={dailyMacros.protein} target={proteinTarget} color="bg-blue-500" />
                <MacroProgressBar label="Carbohidratos" current={dailyMacros.carbs} target={carbTarget} color="bg-pink-500" />
                <MacroProgressBar label="Grasas" current={dailyMacros.fats} target={fatTarget} color="bg-purple-500" />
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="space-y-6">
            <h3 className="text-gray-900 dark:text-white font-black italic uppercase text-sm tracking-[0.2em] transition-colors">Registro del Día_</h3>
            <div className="space-y-4">
              {meals.length > 0 ? (
                meals.map(meal => <MealItem key={meal.id} {...meal} />)
              ) : (
                <div className="py-20 bg-white/50 dark:bg-transparent border border-dashed border-gray-300 dark:border-white/5 rounded-[2.5rem] flex flex-col items-center gap-4 transition-colors">
                    <Utensils className="text-gray-400 dark:text-white/20" size={40} />
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Sin registros para hoy_</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <HydrationWidget dailyGoalMl={nutrition?.hydrationTargetMl || 3000} />
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
                <span className="text-gray-900 dark:text-white italic transition-colors">{Math.round(current)}g / {target}g</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden transition-colors">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${Math.min(100, progress)}%` }} />
            </div>
        </div>
    );
}

function MealItem({ name, kcal, p, time, color }: MealItemData) {
    return (
        <div className="flex items-center gap-6 group">
            <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${color} bg-white dark:bg-black transition-colors`} />
                <div className="w-[1px] h-14 bg-gray-200 dark:bg-white/5 transition-colors" />
            </div>
            <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 p-5 rounded-[2rem] hover:bg-gray-50 dark:hover:bg-white/10 transition-all flex justify-between items-center shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                <div className="space-y-1">
                    <span className="text-[8px] text-blue-500 font-black uppercase tracking-widest">{time}</span>
                    <p className="text-sm font-black italic uppercase text-gray-900 dark:text-white tracking-tight transition-colors">{name}</p>
                    <p className="text-[9px] text-muted-foreground">{kcal} kcal • {Math.round(p)}g Proteína</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 flex items-center justify-center transition-colors">
                    <Utensils size={16} className="text-gray-400 dark:text-white/20"/>
                </div>
            </div>
        </div>
    );
}



function PerformanceStack() {
  const { supplements, refreshEcosystem, refreshSupplements, gainXp, CURRENT_USER_ID } = useApp() as any;
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleConsume = async (sup: any) => {
    try {
      setLoadingId(sup.id);
      await consumeSupplement(sup.id);
      
      if (sup.calories && sup.calories > 0 && CURRENT_USER_ID) {
          const mealData: MealData = {
              name: `${sup.name} (${sup.doseDescription || 'Suplemento'})`,
              calories: sup.calories,
              protein: sup.protein || 0,
              carbs: sup.carbs || 0,
              fat: sup.fats || 0
          };
          await saveMeal(CURRENT_USER_ID, mealData);
      }

      await gainXp(5, "Suplemento Consumido");
      await refreshEcosystem();
      toast.success(`✅ ${sup.name} registrado correctamente`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo registrar el suplemento. Intenta de nuevo.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteRequest = (id: number, completed: boolean) => {
    if (completed) {
      toast.warning(
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm">Ya contabilizado hoy</span>
          <span className="text-xs opacity-80">Este suplemento ya fue consumido hoy. Puedes eliminarlo mañana cuando se reinicie el ciclo.</span>
        </div>,
        { duration: 4000 }
      );
      return;
    }
    setDeleteConfirm(id);
  };

  const handleDeleteConfirmed = async () => {
    if (deleteConfirm === null) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);
    try {
        await deleteSupplement(id);
        await refreshSupplements();
        toast.success("🗑️ Suplemento eliminado del Stack");
    } catch (e) {
        console.error(e);
        toast.error("No se pudo eliminar. Si fue consumido hoy, intenta mañana.");
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="bg-white dark:bg-[#0f0f11] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-gray-900 dark:text-white font-black italic uppercase text-sm tracking-widest transition-colors">Performance Stack_</h3>
           <button onClick={() => setIsModalOpen(true)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <Settings size={14} className="text-gray-600 dark:text-gray-400" />
           </button>
        </div>
        <div className="space-y-3">
            {supplements && supplements.filter((s: any) => s.servingSizeGrams != null).length > 0 ? (
                supplements.filter((s: any) => s.servingSizeGrams != null).sort((a: any, b: any) => a.id - b.id).map((sup: any) => {
                    const isCompletedToday = sup.lastConsumedDate === todayStr;
                    return (
                        <StackItem 
                            key={sup.id}
                            name={sup.name} 
                            dose={sup.doseDescription || `${sup.servingSizeGrams}G`} 
                            completed={isCompletedToday} 
                            loading={loadingId === sup.id}
                            onClick={() => !isCompletedToday && handleConsume(sup)}
                            onDelete={() => handleDeleteRequest(sup.id, isCompletedToday)}
                        />
                    )
                })
            ) : (
                <div className="text-center py-6">
                    <p className="text-xs text-muted-foreground italic mb-3">Sin suplementos configurados.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-blue-500/20 transition-colors">
                       Configurar Stack
                    </button>
                </div>
            )}
        </div>
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-600/5 border border-blue-200 dark:border-blue-500/10 rounded-3xl transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <Brain size={14} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Análisis Inteligente</span>
            </div>
            <p className="text-[10px] text-muted-foreground italic leading-relaxed">Objetivos de proteína en camino. Umbral de leucina alcanzado.</p>
        </div>

        <SupplementManagerModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={async () => { await refreshSupplements(); }} 
        />

        {/* Diálogo de confirmación de borrado */}
        {deleteConfirm !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-500/15 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={18} className="text-red-500" />
                        </div>
                        <div>
                            <p className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Eliminar Suplemento</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Esta acción no se puede deshacer</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors uppercase tracking-widest">
                            Cancelar
                        </button>
                        <button
                            onClick={handleDeleteConfirmed}
                            className="flex-1 py-3 px-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors uppercase tracking-widest">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

interface StackItemProps {
  name: string;
  dose: string;
  completed: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

function StackItem({ name, dose, completed, onClick, onDelete, loading }: StackItemProps) {
    return (
        <div className="flex items-center gap-2">
            <div 
              onClick={!completed ? onClick : undefined}
              className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all 
                ${completed 
                  ? 'bg-blue-50 dark:bg-blue-600/5 border-blue-200 dark:border-blue-500/20' 
                  : 'bg-transparent border-gray-200 dark:border-white/5 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'
                }`}>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-xs font-black italic uppercase transition-colors ${
                    completed ? 'text-blue-500 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>{name}</span>
                  <span className={`text-[8px] uppercase tracking-widest ${
                    completed ? 'text-blue-400/60' : 'text-muted-foreground'
                  }`}>{dose}</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  completed ? 'bg-blue-600 text-white' : 'border border-gray-300 dark:border-white/20'
                }`}>
                  {loading ? (
                    <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : completed ? (
                    <Check size={12}/>
                  ) : (
                    <span className="text-[8px] text-gray-400">▶</span>
                  )}
                </div>
            </div>
            {/* Botón borrar - siempre visible */}
            <button 
              onClick={onDelete} 
              title="Eliminar del stack"
              className="p-2 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all flex-shrink-0">
                <Trash2 size={14} />
            </button>
        </div>
    );
}