"use client";

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import SummaryCards from './components/SummaryCards';
import HistoryTable from './components/HistoryTable';
import BodyCompositionMap from './components/BodyCompositionMap';
import RecordForm from './components/RecordForm';
import FitAICoach from './components/FitAICoach';
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import GamifiedWellness from './components/GamifiedWellness';
import MiniHydrationWidget from './components/MiniHydrationWidget';
import { ThemeToggle } from './components/ThemeToggle';

export default function DashboardPage() {
  // 🎯 ESTADO DE INTEGRACIÓN: Controla qué parte del cuerpo está bajo la lupa
  const [activeFocus, setActiveFocus] = useState<'chest' | 'waist' | null>(null);

  // Consumimos la lógica desde tu Contexto Global
  const { userProfile, records, nutrition, loading, refreshEcosystem } = useApp();

  // Perfil por defecto en caso de que aún no exista en el backend
  const profileToUse = userProfile || { heightCm: 179, age: 25 };
  const heightMeters = (profileToUse.heightCm || 179) / 100;

  if (loading && records.length === 0) return <DashboardSkeleton />;

  // 🛡️ EMPTY STATE: Si el historial está vacío
  if (!records || records.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md animate-in zoom-in duration-500">
          <h1 className="text-4xl font-black italic uppercase text-gray-900 dark:text-white">
            Kallp<span className="text-blue-500">:</span>
          </h1>
          <div className="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md transition-colors duration-300">
            <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">¡Bienvenido al sistema!</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Tu base de datos está limpia. Registra tu primer entrenamiento para activar el panel de análisis biopsicológico.
            </p>
            <RecordForm onSuccess={refreshEcosystem} />
          </div>
        </div>
      </main>
    );
  }

  // CÁLCULOS PARA LA IA
  const currentWeight = records[0]?.weightKg || 0;
  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  const targetKcal = nutrition?.targetCalories || 2890;
  const hydrationTarget = nutrition?.hydrationTargetMl || 3000;

  // RENDERIZADO DEL DASHBOARD COMPLETO
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 selection:bg-blue-500/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

        {/* HEADER: Kallp: Brand */}
        <header className="flex justify-between items-end border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">
              Kallp<span className="text-blue-500">:</span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-[0.3em] uppercase mt-1">
              SISTEMA DE OPTIMIZACIÓN BIOPSICOLÓGICA | ALONSO_V1
            </p>
          </div>
          
          <div className="text-right hidden md:flex flex-col items-end gap-2">
            <p className="text-xs text-muted-foreground font-medium italic">Chorrillos, Lima</p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-blue-500 font-bold tracking-widest uppercase">
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

        {/* 3. HISTORIAL */}
        <section className="pt-4">
          <HistoryTable
            records={records}
            onDeleteSuccess={refreshEcosystem}
          />
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
          <p className="text-[9px] text-muted-foreground font-bold tracking-[0.5em] uppercase">
            Desarrollado por Alonso - Ingeniería de Sistemas UPN 2026
          </p>
        </footer>

      </div>
    </main>
  );
}