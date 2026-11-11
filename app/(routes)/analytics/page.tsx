"use client";

import React, { useState } from "react";
import { Trophy, Flame, Dumbbell, Target, Settings, TrendingUp, Calendar } from "lucide-react";
import WorkoutHeatmap from "./components/WorkoutHeatmap";
import BodyCompositionChart from "./components/BodyCompositionChart";
import SupplementAdherence from "./components/SupplementAdherence";
import GoalConfigModal from "./components/GoalConfigModal";
import { useApp } from "@/app/context/AppContext";
import { calculateAge, calculateTDEE, calculateGoalProjection } from "@/app/utils/calculations";
import { updateUserProfile } from "@/services/api";

export default function AnalyticsPage() {
  const { analytics: globalAnalytics, loading, userProfile, records, refreshEcosystem, CURRENT_USER_ID, trainingSessions } = useApp();
  const currentStreak = globalAnalytics?.currentStreak;
  const totalVolume = globalAnalytics?.totalVolume;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyChartRange, setBodyChartRange] = useState("6M");
  const [activeView, setActiveView] = useState<"trends" | "consistency">("trends");

  // -- GOAL PROJECTION LOGIC --
  const currentWeight = records?.[0]?.weightKg || 0;
  const targetWeight = userProfile?.targetWeightKg || 0;
  const targetCalories = userProfile?.targetCalories || 0;
  
  let projection = { isPossible: false, message: "Configura tu meta en el botón de ajustes", projectedDate: null as Date | null, weeksRemaining: 0 };
  
  if (userProfile && currentWeight > 0 && targetWeight > 0 && targetCalories > 0) {
    const age = calculateAge(userProfile.dateOfBirth);
    const tdee = calculateTDEE(currentWeight, userProfile.heightCm || 170, age, userProfile.gender || "M", userProfile.activityLevel || "sedentary");
    projection = calculateGoalProjection(currentWeight, targetWeight, tdee, targetCalories);
  }

  const projectedDateStr = projection.projectedDate 
    ? projection.projectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase().replace('.', '')
    : "-- ---";
    
  // Calculate progress percentage
  let progressPercent = 0;
  const startWeight = records?.[records.length - 1]?.weightKg || currentWeight;
  if (startWeight !== targetWeight && targetWeight > 0) {
    const totalDiff = Math.abs(startWeight - targetWeight);
    const currentDiff = Math.abs(currentWeight - targetWeight);
    progressPercent = totalDiff > 0 ? Math.max(0, Math.min(100, ((totalDiff - currentDiff) / totalDiff) * 100)) : 0;
  }

  // -- BEST LIFT LOGIC --
  let bestLiftWeight = 0;
  let bestLiftName = "SIN DATOS";

  if (trainingSessions && trainingSessions.length > 0) {
    trainingSessions.forEach((session: any) => {
      if (session.exerciseLogs) {
        session.exerciseLogs.forEach((log: any) => {
          if (log.weightUsed > bestLiftWeight) {
            bestLiftWeight = log.weightUsed;
            bestLiftName = log.exerciseName;
          }
        });
      }
    });
  }

  return (
    <div className="w-full animate-in fade-in duration-500 space-y-5 pb-20">
      
      {/* HEADER COMPACTO */}
      <header className="flex justify-between items-end pt-2 md:pt-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
            Analytics<span className="text-blue-500">_</span>
          </h1>
          <p className="text-[10px] text-muted-foreground font-bold tracking-[0.2em] uppercase mt-0.5">
            Análisis de Rendimiento y Proyección
          </p>
        </div>
      </header>

      {/* 1. BENTO GRID 2x2 COMPACTO DE KPIs (Sin ocupar toda la pantalla en móvil) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 1: Best Lift */}
        <div className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-pink-500/50 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate pr-1">Mejor PR</p>
            <div className="w-7 h-7 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shrink-0">
              <Trophy size={13} className="text-pink-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {loading ? "..." : bestLiftWeight}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">KG</span>
          </div>
          <p className="text-[10px] text-pink-500 font-bold mt-1 relative z-10 uppercase truncate">{bestLiftName}</p>
        </div>

        {/* KPI 2: Current Streak */}
        <div className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate pr-1">Racha Activa</p>
            <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Flame size={13} className="text-blue-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {currentStreak !== null && currentStreak !== undefined ? currentStreak : 0}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">DÍAS</span>
          </div>
          <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase relative z-10 truncate">Consistencia</p>
        </div>

        {/* KPI 3: Total Volume */}
        <div className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate pr-1">Volumen (30d)</p>
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <Dumbbell size={13} className="text-indigo-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 relative z-10">
            <span className="text-2xl md:text-3xl font-black text-foreground">
              {totalVolume !== null && totalVolume !== undefined ? totalVolume.toLocaleString('en-US') : 0}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold">KG</span>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase relative z-10 truncate">Carga Acumulada</p>
        </div>

        {/* KPI 4: Supplement Adherence */}
        <SupplementAdherence />
      </div>

      {/* 2. BANNER COMPACTO DE PROYECCIÓN DE META */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-lg shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 bg-white/15 rounded-xl border border-white/20 backdrop-blur-sm shrink-0">
              <Target size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-black tracking-tight">Proyección de Meta</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15 bg-black/20 ${projection.isPossible ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {projection.isPossible ? '↗ En ruta' : '⚠️ Ajustar'}
                </span>
              </div>
              <p className="text-xs text-blue-100/90 mt-0.5">{projection.message}</p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 border-white/15 pt-3 md:pt-0">
            <div>
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Fecha Estimada</p>
              <p className="text-2xl md:text-3xl font-black tracking-tighter leading-none mt-0.5">
                {targetWeight > 0 ? projectedDateStr : "SIN META"}
              </p>
            </div>

            <div className="w-28 sm:w-36">
              <div className="flex justify-between text-[9px] font-bold text-blue-100 uppercase mb-1">
                <span>{currentWeight} kg</span>
                <span>{targetWeight > 0 ? `${targetWeight} kg` : "--"}</span>
              </div>
              <div className="w-full bg-blue-950/60 rounded-full h-2 overflow-hidden border border-white/15">
                <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 bg-white/15 hover:bg-white/25 rounded-xl transition-colors border border-white/20 shrink-0"
              title="Configurar Meta"
            >
              <Settings size={16} className="text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. HUB INTERACTIVO EN PESTAÑAS (Tendencia Corporal vs Consistencia) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex p-1 rounded-2xl bg-gray-100 dark:bg-[#0f0f11] border border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveView("trends")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeView === "trends"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp size={14} />
              Tendencia Corporal
            </button>
            <button
              type="button"
              onClick={() => setActiveView("consistency")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                activeView === "consistency"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar size={14} />
              Mapa de Consistencia
            </button>
          </div>

          {activeView === "trends" && (
            <div className="flex gap-1.5 bg-gray-100 dark:bg-[#0f0f11] p-1 rounded-xl border border-gray-200 dark:border-white/10">
              {['1W', '1M', '3M', '6M'].map(r => (
                <button 
                  key={r}
                  onClick={() => setBodyChartRange(r)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors ${bodyChartRange === r ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {r === '1W' ? '1S' : r === '1M' ? '1M' : r === '3M' ? '3M' : '6M'}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeView === "trends" ? (
          <section className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-[2rem] p-5 md:p-6 shadow-sm flex flex-col animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground">Evolución Biométrica</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Peso, Grasa y Masa Muscular</p>
              </div>
              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 dark:bg-white/5 py-1.5 px-3 rounded-full border border-border/50">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Peso</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Grasa %</span>
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Músculo</span>
              </div>
            </div>
            
            <div className="w-full h-[240px] mt-2">
              <BodyCompositionChart range={bodyChartRange} />
            </div>
          </section>
        ) : (
          <section className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-[2rem] p-5 md:p-6 shadow-sm animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground">Consistencia de Entrenamiento</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Frecuencia de Sesiones por Semana</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
                Intensidad: 
                <div className="flex gap-1 ml-1.5">
                  <div className="w-[12px] h-[12px] rounded-[3px] bg-gray-200 dark:bg-white/5"></div>
                  <div className="w-[12px] h-[12px] rounded-[3px] bg-blue-500/25"></div>
                  <div className="w-[12px] h-[12px] rounded-[3px] bg-blue-500/60"></div>
                  <div className="w-[12px] h-[12px] rounded-[3px] bg-blue-400"></div>
                  <div className="w-[12px] h-[12px] rounded-[3px] bg-blue-300 dark:bg-white"></div>
                </div>
              </div>
            </div>
            
            <WorkoutHeatmap />
          </section>
        )}
      </div>

      <GoalConfigModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialWeight={targetWeight}
        initialCalories={targetCalories}
        onSave={async (weight, calories) => {
          await updateUserProfile(CURRENT_USER_ID, {
            targetWeightKg: weight,
            targetCalories: calories
          });
          await refreshEcosystem();
        }}
      />
    </div>
  );
}