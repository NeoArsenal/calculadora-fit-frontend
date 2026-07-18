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
    <Card className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-2xl p-5 col-span-1 lg:col-span-2">
      <CardContent className="p-0 flex flex-col items-center">
        {/* Header con Estado */}
        <div className="w-full flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 tracking-tight">
            <User className="text-blue-500" size={22} />
            Mapa de Composición Corporal
          </h3>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
            Escaneo: OK
          </p>
        </div>

        {/* --- EL MODELO SIMULADO --- */}
        <div className="relative w-full h-[480px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 group">
          
          {/* Fondo Espacial/Cyberpunk con Grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#000000] z-0" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] z-0" />

          {/* 🔥 CANVAS 3D */}
          <div className="relative z-10 w-full h-full">
            <BodyScanner3D records={records} onSelectPart={onSelectPart} />
          </div>

          {/* Efectos de escaneo en los bordes */}
          <div className="absolute inset-0 pointer-events-none border border-blue-500/20 rounded-3xl z-20" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-20 pointer-events-none" />

          {/* UI encima: PESO ACTUAL (Glassmorphism) */}
          <div className="absolute top-2 md:top-6 right-2 md:right-6 z-30 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex flex-col items-end transform transition-transform hover:scale-105">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <p className="text-[8px] md:text-[10px] font-black tracking-widest text-blue-300 uppercase">Peso Actual</p>
            </div>
            <p className="text-xl md:text-4xl font-black italic text-white tracking-tighter">
              {weight} <span className="text-xs md:text-sm font-medium text-gray-400">kg</span>
            </p>
          </div>

          {/* UI encima: GRASA CORPORAL (Glassmorphism) */}
          <div className="absolute top-2 md:top-6 left-2 md:left-6 z-30 bg-white/5 backdrop-blur-md border border-orange-500/20 rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col items-start transform transition-transform hover:scale-105">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <p className="text-[8px] md:text-[10px] font-black tracking-widest text-orange-400 uppercase">Grasa Corporal</p>
            </div>
            <p className="text-xl md:text-4xl font-black italic text-white tracking-tighter">
              {bodyFat} <span className="text-xs md:text-sm font-medium text-gray-400">%</span>
            </p>
          </div>

          {/* UI encima: CINTURA (Glassmorphism) */}
          <div className="absolute bottom-2 md:bottom-10 left-2 md:left-6 z-30 bg-white/5 backdrop-blur-md border border-emerald-500/20 rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col items-start transform transition-transform hover:scale-105">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[8px] md:text-[10px] font-black tracking-widest text-emerald-400 uppercase">Cintura</p>
            </div>
            <p className="text-xl md:text-4xl font-black italic text-white tracking-tighter">
              {waist} <span className="text-xs md:text-sm font-medium text-gray-400">cm</span>
            </p>
          </div>

          {/* UI encima: IMC (Glassmorphism) */}
          <div className="absolute bottom-2 md:bottom-10 right-2 md:right-6 z-30 bg-white/5 backdrop-blur-md border border-purple-500/20 rounded-xl md:rounded-2xl p-2 md:p-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col items-end transform transition-transform hover:scale-105">
            <div className="flex items-center gap-1 md:gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <p className="text-[8px] md:text-[10px] font-black tracking-widest text-purple-400 uppercase">Índice IMC</p>
            </div>
            <p className="text-xl md:text-4xl font-black italic text-white tracking-tighter">
              {bmi} <span className="text-xs md:text-sm font-medium text-gray-400">pts</span>
            </p>
          </div>
        </div>

        {/* ⚡️ BOTÓN DE ACCIÓN INTELIGENTE */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full mt-6 font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95 ${isScanning
              ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-muted-foreground cursor-not-allowed shadow-none'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 border border-blue-500/50'
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