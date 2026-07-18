"use client";

import React, { useState, useEffect } from "react";
import { Download, Trophy, Flame, Dumbbell, Target, Settings } from "lucide-react";
import WorkoutHeatmap from "./components/WorkoutHeatmap";
import MuscleScanner3D from "./components/MuscleScanner3D"; 
import BodyCompositionChart from "./components/BodyCompositionChart";
import SupplementAdherence from "./components/SupplementAdherence";
import GoalConfigModal from "./components/GoalConfigModal";
import { useApp } from "@/app/context/AppContext";
import { calculateAge, calculateTDEE, calculateGoalProjection } from "@/app/utils/calculations";
import { updateUserProfile } from "@/services/api";

export default function AnalyticsPage() {
  const { analytics: globalAnalytics, loading, userProfile, records, refreshEcosystem, CURRENT_USER_ID, trainingSessions, nutritionSummary } = useApp();
  const currentStreak = globalAnalytics?.currentStreak;
  const totalVolume = globalAnalytics?.totalVolume;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bodyChartRange, setBodyChartRange] = useState("6M");

  // -- GOAL PROJECTION LOGIC --
  const currentWeight = records?.[0]?.weightKg || 0;
  const targetWeight = userProfile?.targetWeightKg || 0;
  const targetCalories = userProfile?.targetCalories || 0;
  
  let projection = { isPossible: false, message: "Configura tu meta en el perfil", projectedDate: null as Date | null, weeksRemaining: 0 };
  
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
  const startWeight = records?.[records.length - 1]?.weightKg || currentWeight; // Simplification
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
    <div className="w-full animate-in fade-in duration-700 space-y-8">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mb-1">
            Análisis de Rendimiento
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">
            Analytics<span className="text-blue-500">:</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-md transition-colors uppercase tracking-wider">
            <Download size={14} /> Exportar Datos
          </button>
          {/* Avatar del usuario */}
          <div className="w-10 h-10 rounded-md bg-gray-800 border border-gray-700 overflow-hidden">
            <img src="/api/placeholder/40/40" alt="Alonso" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* SECCIÓN SUPERIOR: Gráfico (8 cols) y Proyección (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* GRÁFICO DE TENDENCIAS (8/12) */}
        <section className="xl:col-span-8 bg-card border border-border rounded-xl p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Tendencia Corporal</h2>
              <div className="flex gap-2 mt-2">
                {['1W', '1M', '3M', '6M'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setBodyChartRange(r)}
                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${bodyChartRange === r ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                  >
                    {r === '1W' ? '1 SEM' : r === '1M' ? '1 MES' : r === '3M' ? '3 MES' : '6 MES'}
                  </button>
                ))}
              </div>
            </div>
            {/* Leyenda manual */}
            <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-black/10 dark:bg-white/5 py-1.5 px-3 rounded-full border border-border/50">
              <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Peso</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Grasa %</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Músculo</span>
            </div>
          </div>
          
          <div className="flex-1 w-full h-full min-h-[250px] mt-4">
            <BodyCompositionChart range={bodyChartRange} />
          </div>
        </section>

        {/* PROYECCIÓN DE META (4/12) - Estilo Tarjeta Azul Fuerte */}
        <section className="xl:col-span-4 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-2xl p-6 shadow-2xl shadow-blue-500/20 flex flex-col justify-between min-h-[350px] relative overflow-hidden group">
          {/* Elemento decorativo de fondo animado */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 animate-[pulse_4s_ease-in-out_infinite]"></div>
          
          {/* Textura de puntitos sutil (noise) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Target size={20} className="text-blue-200" />
                Proyección de Meta
              </h2>
              <p className="text-sm text-blue-100/80 leading-relaxed">
                Velocidad calculada según tu déficit calórico y TDEE.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/10"
              title="Configurar Meta"
            >
              <Settings size={16} className="text-white" />
            </button>
          </div>

          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Fecha Objetivo</p>
            <h3 className="text-5xl font-black tracking-tighter drop-shadow-md">
              {targetWeight > 0 ? projectedDateStr : "SIN META"}
            </h3>
            <p className={`text-xs font-medium flex items-center gap-1 mt-2 bg-black/20 w-fit px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm shadow-sm ${projection.isPossible ? 'text-emerald-300' : 'text-amber-300'}`}>
              <span>{projection.isPossible ? '↗' : '⚠️'}</span> {projection.message}
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <div className="w-full bg-blue-900/50 rounded-full h-2 mb-2 overflow-hidden shadow-inner border border-blue-400/20">
              <div className="bg-gradient-to-r from-blue-400 to-white h-2 rounded-full relative" style={{ width: `${progressPercent}%` }}>
                {/* Brillo dinámico en la barra de progreso */}
                {progressPercent > 0 && <div className="absolute inset-0 bg-white/40 blur-sm rounded-full"></div>}
              </div>
            </div>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">
              {targetWeight > 0 
                ? `Progreso Actual: ${currentWeight}kg / ${targetWeight}kg`
                : "Añade targetWeightKg en backend"}
            </p>
          </div>
        </section>
      </div>

      {/* SECCIÓN INTERMEDIA: Resumen de Hoy */}
      <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6 items-center justify-between">
         <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-blue-500">
                <Flame size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-foreground tracking-tight">Tu Progreso de Hoy</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">Calorías y Entrenamientos en tiempo real</p>
             </div>
         </div>
         <div className="flex justify-between md:gap-8 w-full md:w-auto bg-black/10 dark:bg-black/30 p-4 rounded-xl border border-white/5">
             <div className="flex flex-col items-center">
                 <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Calorías</span>
                 <span className="text-xl font-black text-foreground">{nutritionSummary?.totals?.calories || 0} <span className="text-[10px] text-muted-foreground font-bold">/ {targetCalories > 0 ? targetCalories : 2000}</span></span>
             </div>
             <div className="w-[1px] bg-border/50 hidden md:block"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Proteína</span>
                 <span className="text-xl font-black text-blue-500">{nutritionSummary?.totals?.protein || 0}g</span>
             </div>
             <div className="w-[1px] bg-border/50 hidden md:block"></div>
             <div className="flex flex-col items-center">
                 <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Rutina</span>
                 <span className={`text-xl font-black ${trainingSessions?.some((s: any) => new Date(s.endTime || s.startTime).toDateString() === new Date().toDateString()) ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {trainingSessions?.some((s: any) => new Date(s.endTime || s.startTime).toDateString() === new Date().toDateString()) ? "✅" : "⏳"}
                 </span>
             </div>
         </div>
      </div>

      {/* SECCIÓN INFERIOR: 4 Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Best Lift */}
        <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-pink-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-pink-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mejor Levantamiento</p>
            <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
              <Trophy size={14} className="text-pink-500" />
            </div>
          </div>
          
          <div className="flex items-end gap-1 relative z-10">
            <span className="text-3xl font-black text-foreground">
              {loading ? "..." : bestLiftWeight}
            </span>
            <span className="text-xs text-muted-foreground font-bold mb-1">KG</span>
          </div>
          <p className="text-xs text-pink-500 font-medium mt-1 relative z-10 uppercase truncate">{bestLiftName}</p>
        </div>

        {/* ⚡️ KPI 2: Current Streak (¡CONECTADO AL BACKEND!) */}
        <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Racha Actual</p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
              <Flame size={14} className="text-blue-500" />
            </div>
          </div>
          
          <div className="flex items-end gap-1 relative z-10">
            {/* ⚡️ Mostramos '...' mientras carga, y luego la racha real */}
            <span className="text-3xl font-black text-foreground">
              {currentStreak !== null ? currentStreak : "..."}
            </span>
            <span className="text-xs text-muted-foreground font-bold mb-1">DÍAS</span>
          </div>
          <p className="text-xs text-blue-500 font-medium mt-1 uppercase relative z-10">Consistencia Activa</p>
        </div>

        {/* KPI 3: Total Volume */}
        <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volumen Total</p>
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <Dumbbell size={14} className="text-indigo-500" />
            </div>
          </div>
          
          <div className="flex items-end gap-1 relative z-10">
            {/* ⚡️ Mostramos '...' mientras carga, y luego el volumen real formateado (, para miles) */}
            <span className="text-3xl font-black text-foreground">
              {totalVolume !== null ? totalVolume.toLocaleString('en-US') : "..."}
            </span>
            <span className="text-xs text-muted-foreground font-bold mb-1">KG</span>
          </div>
          <p className="text-xs text-indigo-400 font-medium mt-1 uppercase relative z-10">Levantado Últimos 30 Días</p>
          
          {/* Mini gráfico de barras decorativo */}
          <div className="absolute right-4 bottom-4 flex items-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-3 bg-indigo-500 rounded-t-sm animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-5 bg-indigo-500 rounded-t-sm animate-pulse" style={{ animationDelay: '100ms' }}></div>
            <div className="w-1.5 h-4 bg-indigo-500 rounded-t-sm animate-pulse" style={{ animationDelay: '200ms' }}></div>
            <div className="w-1.5 h-8 bg-indigo-500 rounded-t-sm animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1.5 h-6 bg-indigo-500 rounded-t-sm animate-pulse" style={{ animationDelay: '400ms' }}></div>
            <div className="w-1.5 h-10 bg-indigo-400 rounded-t-sm animate-pulse" style={{ animationDelay: '500ms' }}></div>
          </div>
        </div>

        {/* KPI 4: Supplement Adherence */}
        <SupplementAdherence />
        
      </div>

      {/* SECCIÓN INTERMEDIA: Radar Muscular Holográfico */}
      <section className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col mb-4">
          <h2 className="text-lg font-bold text-foreground">Equilibrio Muscular</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Volumen por grupo muscular (Últimos 30 días)
          </p>
        </div>
        <div className="w-full relative rounded-xl overflow-hidden border border-border/20">
          <MuscleScanner3D />
        </div>
      </section>

      {/* SECCIÓN INFERIOR: Workout Consistency (Heatmap) */}
      <section className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Consistencia de Entrenamiento</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Frecuencia de Sesiones por Semana</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
            Intensidad: 
            <div className="flex gap-1 ml-2">
              <div className="w-[14px] h-[14px] rounded-[4px] bg-gray-200 dark:bg-white/5"></div>
              <div className="w-[14px] h-[14px] rounded-[4px] bg-blue-500/20 shadow-[inset_0_0_2px_rgba(59,130,246,0.3)]"></div>
              <div className="w-[14px] h-[14px] rounded-[4px] bg-blue-500/50 shadow-[0_0_5px_rgba(59,130,246,0.4)]"></div>
              <div className="w-[14px] h-[14px] rounded-[4px] bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></div>
              <div className="w-[14px] h-[14px] rounded-[4px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-6">
          <WorkoutHeatmap />
        </div>
      </section>

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