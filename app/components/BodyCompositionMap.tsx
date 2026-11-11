"use client";

import { useState } from "react";
import { User, Target, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

interface BodyCompositionMapProps {
  records: any[];
  onSelectPart: (part: string | null) => void;
  onRefresh?: () => void | Promise<void>;
}

const BodyScanner3D = dynamic(() => import("./BodyScanner3D"), {
  ssr: false,
});

export default function BodyCompositionMap({ records, onSelectPart, onRefresh }: BodyCompositionMapProps) {
  const { userProfile } = useApp();

  const currentRecord = records?.[0];
  const weight = currentRecord?.weightKg || (userProfile as any)?.currentWeightKg || 86.6;
  const waist = currentRecord?.waistCircumferenceCm || 90;
  const bodyFat = currentRecord?.bodyFatPercentage || 15.5;
  const height = userProfile?.heightCm || 180;
  const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);

  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);

    const performRefresh = async () => {
      if (onRefresh) {
        await onRefresh();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    };

    const refreshPromise = performRefresh();

    toast.promise(refreshPromise, {
      loading: 'Sincronizando biometría espacial...',
      success: 'Escaneo 3D actualizado correctamente.',
      error: 'Error de conexión con la base de datos.',
    });

    try {
      await refreshPromise;
    } catch (error) {
      console.error("Error al refrescar:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Cabecera compacta */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <User size={16} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-foreground tracking-tight">
              Escáner Biométrico 3D
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Toca una zona muscular para consultar análisis de IA
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Target size={13} />
              Sincronizar
            </>
          )}
        </button>
      </div>

      {/* Visor 3D */}
      <div className="relative w-full h-[420px] md:h-[460px] rounded-3xl overflow-hidden border border-border dark:border-white/10 group/scanner shadow-inner">
        {/* Fondo oscuro técnico para resaltar el modelo 3D en ambos temas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d13] via-[#07080c] to-[#040507] z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)] z-0" />

        {/* Canvas 3D */}
        <div className="relative z-10 w-full h-full">
          <BodyScanner3D records={records} onSelectPart={onSelectPart} />
        </div>

        {/* Píldoras flotantes minimalistas */}
        <div className="absolute top-3 left-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col">
          <span className="text-[9px] font-bold tracking-wider text-orange-400 uppercase">Grasa est.</span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {bodyFat}<span className="text-[10px] font-medium text-gray-400 ml-0.5">%</span>
          </span>
        </div>

        <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col items-end">
          <span className="text-[9px] font-bold tracking-wider text-blue-400 uppercase">Peso</span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {weight}<span className="text-[10px] font-medium text-gray-400 ml-0.5">kg</span>
          </span>
        </div>

        <div className="absolute bottom-3 left-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col">
          <span className="text-[9px] font-bold tracking-wider text-emerald-400 uppercase">Cintura</span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {waist}<span className="text-[10px] font-medium text-gray-400 ml-0.5">cm</span>
          </span>
        </div>

        <div className="absolute bottom-3 right-3 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl px-3 py-2 flex flex-col items-end">
          <span className="text-[9px] font-bold tracking-wider text-purple-400 uppercase">IMC</span>
          <span className="text-base md:text-lg font-black text-white tabular-nums">
            {bmi}<span className="text-[10px] font-medium text-gray-400 ml-0.5">pts</span>
          </span>
        </div>
      </div>
    </div>
  );
}
