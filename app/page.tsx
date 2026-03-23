"use client";

import { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import SummaryCards from './components/SummaryCards';
import HistoryTable from './components/HistoryTable';
import BodyCompositionMap from './components/BodyCompositionMap';
import RecordForm from './components/RecordForm';
import FitAICoach from './components/FitAICoach';
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import GamifiedWellness from './components/GamifiedWellness';
import { ThemeToggle } from './components/ThemeToggle';

export default function DashboardPage() {
  const CURRENT_USER_ID = 1;
  const userProfile = { height: 1.79, age: 25 };

  // 🎯 ESTADO DE INTEGRACIÓN: Controla qué parte del cuerpo está bajo la lupa
  const [activeFocus, setActiveFocus] = useState<'chest' | 'waist' | null>(null);

  // Consumimos la lógica desde tu Custom Hook
  const { records, nutrition, loading, error, loadData } = useDashboard(CURRENT_USER_ID);

  if (loading) return <DashboardSkeleton />;

  // 1. MANEJO DE ERRORES REALES (Si el backend está apagado o falla gravemente)
  if (error) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-10">
      <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-center max-w-md">
        <p className="text-red-400 font-mono text-sm mb-4">[SISTEMA_OFFLINE]: {error}</p>
        <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-red-500">
          Reintentar Conexión
        </button>
      </div>
    </div>
  );

  // 🛡️ 2. EL ESCUDO (EMPTY STATE): Si no hay error, pero el historial está vacío
  if (!records || records.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md animate-in zoom-in duration-500">
          <h1 className="text-4xl font-black italic uppercase">
            Kallp<span className="text-blue-500">:</span>
          </h1>
          <div className="bg-card border border-border p-8 rounded-2xl shadow-lg">
            <p className="text-xl font-bold mb-2">¡Bienvenido al sistema!</p>
            <p className="text-muted-foreground text-sm mb-6">
              Tu base de datos está limpia. Registra tu primer entrenamiento para activar el panel de análisis biopsicológico.
            </p>
            {/* Reutilizamos tu formulario para que puedan agregar el primer dato y salir del Empty State */}
            <RecordForm onSuccess={loadData} />
          </div>
        </div>
      </main>
    );
  }

  // 3. CÁLCULOS PARA LA IA (Ahora son 100% seguros porque records tiene al menos 1 elemento)
  const currentWeight = records[0]?.weightKg || 0;
  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(userProfile.height, 2)) : 0;
  const targetKcal = nutrition?.targetCalories || 2890;

  // 4. RENDERIZADO DEL DASHBOARD COMPLETO
  return (
    // ⚡️ CAMBIO 1: bg-background y text-foreground permiten que Shadcn controle el color
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
          
          {/* ⚡️ CAMBIO 2: Contenedor flex para alinear la fecha y el botón del sol/luna */}
          <div className="text-right hidden md:flex flex-col items-end gap-2">
            <p className="text-xs text-muted-foreground font-medium italic">Chorrillos, Lima</p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-blue-500 font-bold tracking-widest uppercase">
                {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              
              {/* ⚡️ AQUÍ ESTÁ TU BOTÓN DE TEMA */}
              <ThemeToggle />
              
            </div>
          </div>
        </header>

        {/* 1. MÉTRICAS SUPERIORES */}
        <SummaryCards
          nutrition={nutrition}
          records={records}
          userProfile={userProfile}
        />

        {/* 2. PANEL CENTRAL: Tu Grid 12 columnas perfecto */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA DE CONTROL (Izquierda en desktop, abajo en mobile) */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <GamifiedWellness />
            <RecordForm onSuccess={loadData} />
          </div>

          {/* COLUMNA DEL MAPA 3D (Ocupa 2/3 de la pantalla) */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <BodyCompositionMap
              records={records}
              onSelectPart={setActiveFocus}
              onRefresh={loadData}
            />
          </div>
          
        </div>

        {/* 3. HISTORIAL */}
        <section className="pt-4">
          <HistoryTable
            records={records}
            onDeleteSuccess={loadData}
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

        {/* ⚡️ CAMBIO 3: text-muted-foreground para que se lea en ambos temas */}
        <footer className="pt-10 pb-4 text-center">
          <p className="text-[9px] text-muted-foreground font-bold tracking-[0.5em] uppercase">
            Desarrollado por Alonso - Ingeniería de Sistemas UPN 2026
          </p>
        </footer>

      </div>
    </main>
  );
}