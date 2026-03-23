"use client";

import { useState } from "react"; // ⚡️ Importamos useState
import { Card, CardContent } from "@/components/ui/card";
import { User, Target, Loader2 } from "lucide-react"; // ⚡️ Importamos Loader2 para el spinner animado
import dynamic from "next/dynamic";
import { toast } from "sonner";

// 1. Definimos el "contrato" para que acepte la función
interface BodyCompositionMapProps {
  records: any[];
  onSelectPart: (part: 'chest' | 'waist' | null) => void;
  onRefresh?: () => void | Promise<void>; // ⚡️ Nueva prop opcional para recargar datos
}

// ⚡️ ARQUITECTURA CLAVE: Lo sacamos fuera del componente para evitar re-renders del 3D
const BodyScanner3D = dynamic(() => import("./BodyScanner3D"), {
  ssr: false,
});

export default function BodyCompositionMap({ records, onSelectPart, onRefresh }: BodyCompositionMapProps) {
  // Datos dinámicos desde el backend
  const currentRecord = records[0];
  const weight = currentRecord?.weightKg || 86.6;
  const waist = currentRecord?.waistCircumferenceCm || 90;

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
        <div className="relative w-full h-[480px] lg:h-[500px] 
          bg-gradient-to-br from-[#0a0f1c] via-[#0d1b2a] to-[#050505]
          rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-center overflow-hidden shadow-inner">

          {/* 🔥 CANVAS 3D */}
          <BodyScanner3D records={records} onSelectPart={onSelectPart} />

          {/* UI encima */}
          <div className="absolute top-10 right-10 text-right z-10">
            <p className="text-xs font-bold text-gray-400">PESO ACTUAL</p>
            <p className="text-3xl font-black text-white">
              {weight} <span className="text-sm text-gray-500">kg</span>
            </p>
          </div>

          <div className="absolute top-1/2 left-5 -translate-y-1/2 z-10">
            <p className="text-xs font-bold text-emerald-500">CINTURA</p>
            <p className="text-3xl font-black text-emerald-400">
              {waist} <span className="text-sm text-gray-500">cm</span>
            </p>
          </div>
        </div>

        {/* ⚡️ BOTÓN DE ACCIÓN INTELIGENTE */}
        <button
          onClick={handleScan}
          disabled={isScanning}
          className={`w-full mt-6 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isScanning
              ? 'bg-blue-800/50 text-blue-300 cursor-not-allowed' // Look cuando está cargando
              : 'bg-blue-600 hover:bg-blue-700 text-white' // Look normal
            }`}
        >
          {isScanning ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Sincronizando Biometría...
            </>
          ) : (
            <>
              <Target size={18} />
              Refrescar Escaneo Biométrico
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}