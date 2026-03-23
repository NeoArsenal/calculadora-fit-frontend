"use client";

import React from "react";
import { Download } from "lucide-react";
import WorkoutHeatmap from "./components/WorkoutHeatmap"; // ⚡️ IMPORTACIÓN
import BodyCompositionChart from "./components/BodyCompositionChart";
export default function AnalyticsPage() {
  return (
    <div className="w-full animate-in fade-in duration-700 space-y-8">
      
      {/* HEADER */}
      <header className="flex justify-between items-end border-b border-border pb-6">
        <div>
          <p className="text-[10px] text-blue-500 font-bold tracking-[0.2em] uppercase mb-1">
            Performance Insights
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">
            Analytics<span className="text-blue-500">:</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-bold rounded-md transition-colors uppercase tracking-wider">
            <Download size={14} /> Export Data
          </button>
          {/* Avatar del usuario (Puedes reemplazarlo por el componente de Avatar de Shadcn) */}
          <div className="w-10 h-10 rounded-md bg-gray-800 border border-gray-700 overflow-hidden">
            <img src="/api/placeholder/40/40" alt="Alonso" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* SECCIÓN SUPERIOR: Gráfico (8 cols) y Proyección (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* GRÁFICO DE TENDENCIAS (8/12) */}
        <section className="xl:col-span-8 bg-card border border-border rounded-xl p-6 shadow-sm min-h-[350px] flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Body Composition Trends</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">6-Month Delta Comparison</p>
            </div>
            {/* Leyenda manual */}
            <div className="flex gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Weight</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-400"></div> Fat %</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-400"></div> Muscle</span>
            </div>
          </div>
          
          {/* Contenedor del gráfico sin bordes raros y con altura fija para que Recharts lo llene */}
          <div className="flex-1 w-full h-full min-h-[250px] mt-4">
            <BodyCompositionChart />
          </div>
        </section>

        {/* PROYECCIÓN DE META (4/12) - Estilo Tarjeta Azul Fuerte */}
        <section className="xl:col-span-4 bg-blue-600 text-white rounded-xl p-6 shadow-xl shadow-blue-500/20 flex flex-col justify-between min-h-[350px] relative overflow-hidden">
          {/* Elemento decorativo de fondo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Goal Projection:</h2>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Kinetic velocity based on current deficit & training.
            </p>
          </div>

          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Target Date</p>
            <h3 className="text-5xl font-black tracking-tighter">12 OCT</h3>
            <p className="text-xs font-medium text-blue-200 flex items-center gap-1 mt-2">
              <span className="text-white">↗</span> 87% Accuracy Confidence
            </p>
          </div>

          <div className="relative z-10 mt-8">
            <div className="w-full bg-blue-800/50 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-white h-1.5 rounded-full" style={{ width: '64%' }}></div>
            </div>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">
              Current Progress: 6.4kg / 10kg
            </p>
          </div>
        </section>
      </div>

      {/* SECCIÓN INTERMEDIA: 3 Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Best Lift */}
        <div className="bg-card border-y border-r border-border border-l-4 border-l-pink-500 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Best Lift</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-foreground">145</span>
            <span className="text-xs text-muted-foreground font-bold mb-1">KG</span>
          </div>
          <p className="text-xs text-pink-500 font-medium mt-1">DEADLIFT <br/><span className="text-muted-foreground">(CONVENTIONAL)</span></p>
        </div>

        {/* KPI 2: Current Streak (¡Aquí va la data de tu backend!) */}
        <div className="bg-card border-y border-r border-border border-l-4 border-l-blue-500 rounded-xl p-5 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Current Streak</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-foreground">14</span>
            <span className="text-xs text-muted-foreground font-bold mb-1">DAYS</span>
          </div>
          <p className="text-xs text-blue-500 font-medium mt-1 uppercase">Active Consistency</p>
        </div>

        {/* KPI 3: Total Volume */}
        <div className="bg-card border-y border-r border-border border-l-4 border-l-indigo-400 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Volume</p>
          <div className="flex items-end gap-1 relative z-10">
            <span className="text-3xl font-black text-foreground">28,450</span>
            <span className="text-xs text-muted-foreground font-bold mb-1">KG</span>
          </div>
          <p className="text-xs text-indigo-400 font-medium mt-1 uppercase relative z-10">Total Lifted Last 30 Days</p>
          
          {/* Mini gráfico de barras decorativo */}
          <div className="absolute right-4 bottom-4 flex items-end gap-1 opacity-50">
            <div className="w-1.5 h-3 bg-indigo-500 rounded-t-sm"></div>
            <div className="w-1.5 h-5 bg-indigo-500 rounded-t-sm"></div>
            <div className="w-1.5 h-4 bg-indigo-500 rounded-t-sm"></div>
            <div className="w-1.5 h-8 bg-indigo-500 rounded-t-sm"></div>
            <div className="w-1.5 h-6 bg-indigo-500 rounded-t-sm"></div>
            <div className="w-1.5 h-10 bg-indigo-400 rounded-t-sm"></div>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: Workout Consistency (Heatmap) */}
      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-bold text-foreground">Workout Consistency</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Session Frequency Per Week</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            Intensity: 
            <div className="flex gap-1 ml-2">
              <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-900/50"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-600/60"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
            </div>
          </div>
        </div>
        
        <div className="w-full mt-6">
          <WorkoutHeatmap />
        </div>
      </section>

    </div>
  );
}