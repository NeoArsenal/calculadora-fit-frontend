"use client";

import { Droplet, Plus, GlassWater } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

export default function HydrationWidget({ dailyGoalMl = 3000 }: { dailyGoalMl?: number }) {
  const { hydration, logWater, loading } = useApp();
  
  const currentMl = hydration?.amountMl || 0;

  const handleAddWater = async (amount: number) => {
    const promise = logWater(amount);

    toast.promise(promise, {
      loading: 'Registrando hidratación...',
      success: () => `+${amount}ml registrados correctamente 💧`,
      error: () => 'No se pudo registrar el agua'
    });
  };

  const percentage = Math.min((currentMl / dailyGoalMl) * 100, 100);

  if (loading) {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center justify-center h-64 animate-pulse">
        <Droplet className="w-8 h-8 text-muted-foreground mb-4" />
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
      {/* Elemento de fondo decorativo */}
      <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
        <Droplet className="w-40 h-40 text-blue-500" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
        
        {/* Info y Botones */}
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Droplet className="w-5 h-5 text-blue-500 fill-blue-500/20" />
              <h3 className="font-bold text-lg tracking-tight">Hidratación</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              Meta diaria: {dailyGoalMl / 1000}L
            </p>
          </div>

          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-black text-foreground tracking-tighter">
              {currentMl}
            </span>
            <span className="text-lg font-bold text-muted-foreground">ml</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button 
              onClick={() => handleAddWater(250)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-colors font-bold text-sm"
            >
              <GlassWater className="w-4 h-4" />
              +250ml
            </button>
            <button 
              onClick={() => handleAddWater(500)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl transition-colors font-bold text-sm"
            >
              <Droplet className="w-4 h-4" />
              +500ml
            </button>
          </div>
        </div>

        {/* Cilindro Animado */}
        <div className="relative w-16 h-48 bg-muted/50 rounded-full border-[3px] border-border overflow-hidden shrink-0 shadow-inner">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-in-out"
            style={{ height: `${percentage}%` }}
          >
            {/* Olas decorativas usando pseudo-elementos o simples bordes redondeados */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-white/20 rounded-full blur-[1px]"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
