"use client";

import { useState } from 'react';
import { 
  Activity, Beaker, Weight, Scale, Flame, Droplet, Plus,
  ArrowUpRight, ArrowDownRight, Minus, Sparkles
} from 'lucide-react';
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

interface SummaryCardsProps {
  nutrition: any;
  records: any[];
  userProfile?: {
    heightCm: number;
    age: number;
    level?: number;
    xp?: number;
  };
  onOpenRecordModal?: () => void;
}

export default function SummaryCards({ 
  nutrition, 
  records, 
  userProfile,
  onOpenRecordModal 
}: SummaryCardsProps) {
  const [goal, setGoal] = useState<'maintenance' | 'deficit' | 'bulk'>('maintenance');
  const { hydration, logWater } = useApp();

  // --- CÁLCULOS BIOMÉTRICOS ---
  const heightCm = userProfile?.heightCm || 170;
  const heightMeters = heightCm / 100;
  const age = userProfile?.age || 25;

  const currentWeight = records?.[0]?.weightKg || (userProfile as any)?.currentWeightKg || (userProfile as any)?.targetWeightKg || 0;
  const currentWaist = records?.[0]?.waistCircumferenceCm || "—";
  const previousWeight = records?.[1]?.weightKg; 
  const weightDiff = previousWeight !== undefined ? currentWeight - previousWeight : 0;

  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  
  const getBmiStatus = (val: number) => {
    if (val === 0) return { label: "Sin datos", color: "text-muted-foreground", bg: "bg-muted" };
    if (val < 18.5) return { label: "Bajo peso", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10" };
    if (val < 25) return { label: "Normal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" };
    if (val < 30) return { label: "Sobrepeso", color: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500/10" };
    return { label: "Obesidad", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10" };
  };
  const bmiStatus = getBmiStatus(bmiValue);

  // --- CÁLCULOS CALÓRICOS ---
  const bmr = currentWeight > 0 
    ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + 5 
    : 0;
  const maintenanceCalories = Math.round(bmr * 1.55);
  
  const getTargetCalories = () => {
    if (goal === 'deficit') return Math.max(1200, maintenanceCalories - 500);
    if (goal === 'bulk') return maintenanceCalories + 300;
    return maintenanceCalories;
  };

  // --- HIDRATACIÓN ---
  const dailyGoalMl = nutrition?.hydrationTargetMl || 3000;
  const currentMl = hydration?.amountMl || 0;
  const waterPercentage = Math.min((currentMl / dailyGoalMl) * 100, 100);

  const handleQuickWater = async () => {
    const promise = logWater(250);
    toast.promise(promise, {
      loading: 'Registrando hidratación...',
      success: '+250ml registrados 💧',
      error: 'No se pudo registrar el agua'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      
      {/* 1. TARJETA BIOMETRÍA & PESO */}
      <div className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:border-blue-500/30">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Weight size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Biometría Actual
              </span>
            </div>

            {previousWeight !== undefined && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                weightDiff > 0 
                  ? "bg-rose-500/10 text-rose-500 dark:text-rose-400" 
                  : weightDiff < 0 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                    : "bg-muted text-muted-foreground"
              }`}>
                {weightDiff > 0 && <ArrowUpRight size={12} />}
                {weightDiff < 0 && <ArrowDownRight size={12} />}
                {weightDiff === 0 && <Minus size={12} />}
                {weightDiff === 0 ? "Estable" : `${Math.abs(weightDiff).toFixed(1)} kg`}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight text-foreground tabular-nums">
                {currentWeight}
              </span>
              <span className="text-sm font-bold text-muted-foreground">kg</span>
            </div>

            {onOpenRecordModal && (
              <button
                onClick={onOpenRecordModal}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                + Actualizar
              </button>
            )}
          </div>
        </div>

        {/* Sub-métricas compactas: IMC + Cintura */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border dark:border-white/5">
          <div className="bg-muted/50 dark:bg-white/[0.03] rounded-2xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">IMC</p>
              <p className="text-sm font-black text-foreground tabular-nums">{bmiValue.toFixed(1)}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmiStatus.bg} ${bmiStatus.color}`}>
              {bmiStatus.label}
            </span>
          </div>

          <div className="bg-muted/50 dark:bg-white/[0.03] rounded-2xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Cintura</p>
              <p className="text-sm font-black text-foreground tabular-nums">
                {currentWaist} <span className="text-[10px] font-normal text-muted-foreground">cm</span>
              </p>
            </div>
            <Scale size={14} className="text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* 2. TARJETA COMBUSTIBLE DIARIO (KCAL + PROTEÍNA + CREATINA) */}
      <div className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:border-blue-500/30">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/20 flex items-center justify-center">
                <Flame size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Meta Energética
              </span>
            </div>

            {/* Selector rápido compacto */}
            <div className="flex items-center bg-muted dark:bg-white/5 p-0.5 rounded-xl border border-border dark:border-white/5">
              {([
                { id: 'deficit', label: 'Déficit' },
                { id: 'maintenance', label: 'Mant.' },
                { id: 'bulk', label: 'Volumen' }
              ] as const).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGoal(item.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    goal === item.id 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-black tracking-tight text-foreground tabular-nums">
              {getTargetCalories()}
            </span>
            <span className="text-sm font-bold text-muted-foreground">kcal / día</span>
          </div>
        </div>

        {/* Píldoras de Proteína y Creatina */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-border dark:border-white/5">
          <div className="bg-muted/50 dark:bg-white/[0.03] rounded-2xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Proteína</p>
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {nutrition?.targetProteinGrams || 0}g
              </p>
            </div>
            <Activity size={14} className="text-blue-500/70" />
          </div>

          <div className="bg-muted/50 dark:bg-white/[0.03] rounded-2xl px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Creatina</p>
              <p className="text-sm font-black text-purple-600 dark:text-purple-400 tabular-nums">
                {nutrition?.targetCreatineGrams || 0}g
              </p>
            </div>
            <Beaker size={14} className="text-purple-500/70" />
          </div>
        </div>
      </div>

      {/* 3. TARJETA HIDRATACIÓN & PROGRESO RÁPIDO */}
      <div className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-3xl p-5 shadow-sm flex flex-col justify-between transition-all hover:border-blue-500/30">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <Droplet size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Hidratación Hoy
              </span>
            </div>

            <button
              onClick={handleQuickWater}
              className="inline-flex items-center gap-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Plus size={13} strokeWidth={3} /> 250ml
            </button>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black tracking-tight text-foreground tabular-nums">
                {currentMl}
              </span>
              <span className="text-xs font-bold text-muted-foreground">/ {dailyGoalMl} ml</span>
            </div>
            <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">
              {Math.round(waterPercentage)}%
            </span>
          </div>
        </div>

        {/* Barra de agua + Nivel del usuario */}
        <div className="mt-4 pt-3 border-t border-border dark:border-white/5 space-y-2.5">
          <div className="h-2.5 w-full bg-muted dark:bg-white/5 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${waterPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <Sparkles size={12} className="text-amber-400" /> Nivel Atleta
            </span>
            <span className="font-bold text-foreground">
              LVL {(userProfile as any)?.level || 1} • {(userProfile as any)?.xp || 0} XP
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
