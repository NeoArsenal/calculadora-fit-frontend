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
import { ThemeToggle } from './components/ThemeToggle';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from "@/components/ui/dialog";
import { 
  User, TrendingUp, History, Flame 
} from "lucide-react";

export default function DashboardPage() {
  const [activeFocus, setActiveFocus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'chart' | 'history'>('scanner');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const { userProfile, records, nutrition, trainingSessions, loading, refreshEcosystem } = useApp();

  const profileToUse = userProfile || { heightCm: 179, age: 25 };
  const heightMeters = (profileToUse.heightCm || 179) / 100;
  const safeRecords = records || [];

  if (loading && safeRecords.length === 0 && !userProfile) return <DashboardSkeleton />;

  const userName = (userProfile as any)?.name || (userProfile as any)?.username || "Atleta";
  const currentWeight = safeRecords[0]?.weightKg || (profileToUse as any)?.currentWeightKg || (profileToUse as any)?.targetWeightKg || 0;
  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  const targetKcal = nutrition?.targetCalories || 2890;
  const totalWorkouts = trainingSessions?.length || 0;

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 selection:bg-blue-500/30">

      {/* 1. CABECERA LIMPIA DE CENTRO DE MANDO */}
      <header className="flex items-center justify-between border-b border-border dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Hola, {userName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 dark:text-orange-400 text-[11px] font-bold">
              <Flame size={12} className="fill-current" /> {totalWorkouts} sesiones
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1 capitalize">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div>
          <ThemeToggle />
        </div>
      </header>

      {/* 2. BENTO GRID DE 3 TARJETAS ESENCIALES */}
      <SummaryCards
        nutrition={nutrition}
        records={records}
        userProfile={profileToUse}
        onOpenRecordModal={() => setIsRecordModalOpen(true)}
      />

      {/* 3. PANEL BIOMÉTRICO UNIFICADO CON PESTAÑAS (ESCÁNER 3D | EVOLUCIÓN | HISTORIAL) */}
      <section className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-3xl p-4 md:p-6 shadow-sm">
        {/* Selector de Pestañas (Segmented Control) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-border dark:border-white/10">
          <div className="grid grid-cols-3 sm:flex items-center bg-muted dark:bg-black/40 p-1 rounded-2xl border border-border dark:border-white/5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-card dark:bg-[#1c1c20] text-blue-600 dark:text-blue-400 shadow-sm border border-border/60 dark:border-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <User size={14} />
              <span>Escáner 3D</span>
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'chart'
                  ? 'bg-card dark:bg-[#1c1c20] text-blue-600 dark:text-blue-400 shadow-sm border border-border/60 dark:border-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp size={14} />
              <span>Evolución</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-card dark:bg-[#1c1c20] text-blue-600 dark:text-blue-400 shadow-sm border border-border/60 dark:border-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <History size={14} />
              <span>Historial</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-medium text-muted-foreground">
            {activeTab === 'scanner' && "Modelo interactivo en tiempo real"}
            {activeTab === 'chart' && "Tendencia histórica de peso y cintura"}
            {activeTab === 'history' && `${safeRecords.length} mediciones registradas`}
          </span>
        </div>

        {/* Contenido dinámico de la pestaña activa */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'scanner' && (
            <BodyCompositionMap
              records={records}
              onSelectPart={setActiveFocus}
              onRefresh={refreshEcosystem}
            />
          )}

          {activeTab === 'chart' && (
            <ProgressChart 
              records={records} 
              onOpenRecordModal={() => setIsRecordModalOpen(true)}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTable
              records={records}
              onDeleteSuccess={refreshEcosystem}
              onOpenRecordModal={() => setIsRecordModalOpen(true)}
            />
          )}
        </div>
      </section>

      {/* 4. MODAL PARA REGISTRAR PESO Y CINTURA BAJO DEMANDA */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="sm:max-w-md bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-3xl p-6 text-foreground shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground">
              Nuevo Registro Biométrico
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Actualiza tu peso corporal y cintura para recalibrar tus calorías, IMC y progreso.
            </DialogDescription>
          </DialogHeader>
          <RecordForm 
            onSuccess={() => {
              setIsRecordModalOpen(false);
              refreshEcosystem();
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* 5. ASISTENTE IA FLOTANTE (Al tocar una parte del cuerpo en 3D) */}
      <FitAICoach
        activeFocus={activeFocus}
        records={records}
        currentImc={bmiValue}
        kcalGoal={targetKcal}
        onClose={() => setActiveFocus(null)}
      />

    </div>
  );
}
