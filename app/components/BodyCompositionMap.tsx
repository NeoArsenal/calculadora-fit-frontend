"use client";

import { useState } from "react"; // ⚡️ Importamos useState
import { Card, CardContent } from "@/components/ui/card";
import { User, Target, Loader2 } from "lucide-react"; // ⚡️ Importamos Loader2 para el spinner animado
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

// 1. Definimos el "contrato" para que acepte la función
interface BodyCompositionMapProps {
  records: any[];
  onSelectPart: (part: string | null) => void;
  onRefresh?: () => void | Promise<void>; // ⚡️ Nueva prop opcional para recargar datos
}

// ⚡️ ARQUITECTURA CLAVE: Lo sacamos fuera del componente para evitar re-renders del 3D
const BodyScanner3D = dynamic(() => import("./BodyScanner3D"), {
  ssr: false,
});

export default function BodyCompositionMap({ records, onSelectPart, onRefresh }: BodyCompositionMapProps) {
  const { userProfile } = useApp();

  // Datos dinámicos desde el backend
  const currentRecord = records?.[0];
  const weight = currentRecord?.weightKg || 86.6;
  const waist = currentRecord?.waistCircumferenceCm || 90;
  const bodyFat = currentRecord?.bodyFatPercentage || 15.5;
  const height = userProfile?.heightCm || 180;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  // ⚡️ SOLUCIÓN ERROR 1: Estado declarado correctamente
  const [isScanning, setIsScanning] = useState(false);

  // ⚡️ SOLUCIÓN ERROR 2: Lógica del botón con Promesa pura para TypeScript
  const handleScan = async () => {
    setIsScanning(true);

    // Envolvemos la lógica en una función async para forzar que sea una Promesa
    const performRefresh = async () => {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };

    // Guardamos la promesa ejecutándose
    const refreshPromise = performRefresh();

    // Le pasamos la promesa a Sonner para que haga la magia visual
    toast.promise(refreshPromise, {
      loading: 'Sincronizando biometría espacial...',
      success: 'Escaneo 3D actualizado correctamente.',
      error: 'Error de conexión con la base de datos.',
    });

    // Esperamos a que termine todo para desbloquear el botón
    try {
      await refreshPromise;
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="glass-card border-white/10 dark:border-white/10 shadow-2xl p-6 col-span-1 lg:col-span-2 relative overflow-hidden group">
      <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/15 transition-all duration-500" />
      
      <CardContent className="p-0 flex flex-col items-center relative z-10">
        {/* Header con Estado */}
        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2.5 tracking-tight">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shadow-inner">
              <User size={18} />
            </div>
            Mapa de Composición Corporal
          </h3>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Escaneo: Online
          </div>
        </div>

        {/* --- EL MODELO SIMULADO --- */}
        <div className="relative w-full h-[480px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group/scanner">
          
          {/* Fondo Espacial Deep Space con Grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1d] via-[#060810] to-[#020307] z-0" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)] z-0" />

          {/* 🔥 CANVAS 3D */}
          <div className="relative z-10 w-full h-full">
            <BodyScanner3D records={records} onSelectPart={onSelectPart} />
          </div>

          {/* Efectos de escaneo en los bordes */}
          <div className="absolute inset-0 pointer-events-none border border-blue-500/20 rounded-3xl z-20" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover/scanner:opacity-100 transition-opacity duration-1000 z-20 pointer-events-none" />

          {/* UI encima: PESO ACTUAL (Glassmorphism) */}
          <div className="absolute top-3 md:top-6 right-3 md:right-6 z-30 bg-black/50 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-3 md:p-4 shadow-[0_0_25px_rgba(59,130,246,0.2)] flex flex-col items-end transform transition-all hover:scale-105">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
              <p className="text-[9px] md:text-[10px] font-black tracking-widest text-blue-400 uppercase">Peso Actual</p>
            </div>
            <p className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter">
              {weight} <span className="text-xs md:text-sm font-medium text-muted-foreground">kg</span>
            </p>
          </div>

          {/* UI encima: GRASA CORPORAL (Glassmorphism) */}
          <div className="absolute top-3 md:top-6 left-3 md:left-6 z-30 bg-black/50 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-3 md:p-4 shadow-[0_0_25px_rgba(249,115,22,0.2)] flex flex-col items-start transform transition-all hover:scale-105">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
              <p className="text-[9px] md:text-[10px] font-black tracking-widest text-orange-400 uppercase">Grasa Corporal</p>
            </div>
            <p className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter">
              {bodyFat} <span className="text-xs md:text-sm font-medium text-muted-foreground">%</span>
            </p>
          </div>

          {/* UI encima: CINTURA (Glassmorphism) */}
          <div className="absolute bottom-3 md:bottom-8 left-3 md:left-6 z-30 bg-black/50 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3 md:p-4 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex flex-col items-start transform transition-all hover:scale-105">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <p className="text-[9px] md:text-[10px] font-black tracking-widest text-emerald-400 uppercase">Cintura</p>
            </div>
            <p className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter">
              {waist} <span className="text-xs md:text-sm font-medium text-muted-foreground">cm</span>
            </p>
          </div>

          {/* UI encima: ÍNDICE IMC (Glassmorphism) */}
          <div className="absolute bottom-3 md:bottom-8 right-3 md:right-6 z-30 bg-black/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 md:p-4 shadow-[0_0_25px_rgba(168,85,247,0.2)] flex flex-col items-end transform transition-all hover:scale-105">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
              <p className="text-[9px] md:text-[10px] font-black tracking-widest text-purple-400 uppercase">Índice IMC</p>
            </div>
            <p className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter">
              {bmi} <span className="text-xs md:text-sm font-medium text-muted-foreground">pts</span>
            </p>
          </div>
        </div>

        {/* ⚡️ BOTÓN DE ACCIÓN INTELIGENTE */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full mt-6 font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] ${
            isScanning
              ? 'bg-white/5 text-muted-foreground cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.35)] border border-blue-400/30'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sincronizando Biometría...
            </>
          ) : (
            <>
              <Target size={16} />
              Refrescar Escaneo Biométrico
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}