"use client";

import { Droplet, Plus } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

export default function MiniHydrationWidget({ dailyGoalMl = 3000 }: { dailyGoalMl?: number }) {
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
      <div className="bg-card dark:bg-[#0a0a0b] border border-border p-4 rounded-2xl flex items-center gap-4 animate-pulse shadow-sm">
        <div className="w-8 h-8 bg-muted rounded-full"></div>
        <div className="flex-1 h-2 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="glass-card border-white/10 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl gap-4 relative overflow-hidden group">
      <div className="pointer-events-none absolute -right-6 -bottom-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/15 transition-all duration-500" />
      
      {/* Icon & Progress */}
      <div className="flex flex-col flex-1 gap-2.5 relative z-10">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 rounded-xl shadow-inner">
              <Droplet size={16} className="fill-cyan-400/30 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Agua Hoy</p>
              <p className="text-sm font-black italic tracking-tighter leading-none mt-1.5 text-foreground">
                {currentMl} <span className="text-[10px] text-muted-foreground font-medium">/ {dailyGoalMl}ml</span>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-cyan-400">{Math.round(percentage)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)] transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => handleAddWater(250)}
        className="w-10 h-10 shrink-0 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)] relative z-10"
        title="Añadir un vaso (250ml)"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
