"use client";

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import SummaryCards from './components/SummaryCards';
import HistoryTable from './components/HistoryTable';
import ProgressChart from './components/ProgressChart';
import BodyCompositionMap from './components/BodyCompositionMap';
import RecordForm from './components/RecordForm';
import FitAICoach from './components/FitAICoach';
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import GamifiedWellness from './components/GamifiedWellness';
import MiniHydrationWidget from './components/MiniHydrationWidget';
import { ThemeToggle } from './components/ThemeToggle';

export default function DashboardPage() {
  // 🎯 ESTADO DE INTEGRACIÓN: Controla qué parte del cuerpo está bajo la lupa
  const [activeFocus, setActiveFocus] = useState<string | null>(null);

  // Consumimos la lógica desde tu Contexto Global
  const { userProfile, records, nutrition, loading, refreshEcosystem } = useApp();

  // Perfil por defecto en caso de que aún no exista en el backend
  const profileToUse = userProfile || { heightCm: 179, age: 25 };
  const heightMeters = (profileToUse.heightCm || 179) / 100;

  const safeRecords = records || [];

  if (loading && safeRecords.length === 0 && !userProfile) return <DashboardSkeleton />;

  // CÁLCULOS PARA LA IA
  const currentWeight = safeRecords[0]?.weightKg || (profileToUse as any)?.currentWeightKg || (profileToUse as any)?.targetWeightKg || 0;
  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  const targetKcal = nutrition?.targetCalories || 2890;
  const hydrationTarget = nutrition?.hydrationTargetMl || 3000;

  // RENDERIZADO DEL DASHBOARD COMPLETO
  return (
    <div className="space-y-8 animate-in fade-in duration-700 selection:bg-blue-500/30">

      {/* HEADER: Kallp: Brand */}
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-black text-xl">K</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
              Kallp<span className="text-blue-500">:</span>
            </h1>
          </div>
          <p className="text-[10px] text-muted-foreground font-bold tracking-[0.25em] uppercase mt-2">
            SISTEMA DE OPTIMIZACIÓN BIOPSICOLÓGICA | KALLP UI 2.0
          </p>
        </div>
        
        <div className="text-right hidden md:flex flex-col items-end gap-2">
          <p className="text-xs text-muted-foreground font-medium italic">Chorrillos, Lima</p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-blue-400 font-bold tracking-widest uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 1. MÉTRICAS SUPERIORES */}
      <SummaryCards
        nutrition={nutrition}
        records={records}
        userProfile={profileToUse}
      />

      {/* 2. PANEL CENTRAL: Grid 12 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA DE CONTROL */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          <GamifiedWellness />
          <MiniHydrationWidget dailyGoalMl={hydrationTarget} />
          <RecordForm onSuccess={refreshEcosystem} />
        </div>

        {/* COLUMNA DEL MAPA 3D */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <BodyCompositionMap
            records={records}
            onSelectPart={setActiveFocus}
            onRefresh={refreshEcosystem}
          />
        </div>
        
      </div>

      {/* 3. ANÁLISIS EVOLUTIVO & HISTORIAL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-start">
        <div className="lg:col-span-7">
          <ProgressChart records={records} />
        </div>
        <div className="lg:col-span-5">
          <HistoryTable
            records={records}
            onDeleteSuccess={refreshEcosystem}
          />
        </div>
      </section>

      {/* 4. ASISTENTE FLOTANTE */}
      <FitAICoach
        activeFocus={activeFocus}
        records={records}
        currentImc={bmiValue}
        kcalGoal={targetKcal}
        onClose={() => setActiveFocus(null)}
      />

      <footer className="pt-10 pb-4 text-center">
        <p className="text-[9px] text-muted-foreground font-bold tracking-[0.4em] uppercase">
          Desarrollado por Alonso - Ingeniería de Sistemas UPN 2026
        </p>
      </footer>

    </div>
  );
}