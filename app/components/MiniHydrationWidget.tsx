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
    <div className="bg-card dark:bg-[#0a0a0b] border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm gap-4">
      {/* Icon & Progress */}
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <Droplet size={16} className="fill-blue-500/20" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Agua Hoy</p>
              <p className="text-sm font-black italic tracking-tighter leading-none mt-1">
                {currentMl} <span className="text-[10px] text-muted-foreground font-medium">/ {dailyGoalMl}ml</span>
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-500">{Math.round(percentage)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-blue-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        onClick={() => handleAddWater(250)}
        className="w-10 h-10 shrink-0 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-blue-100 dark:border-blue-800/30"
        title="Añadir un vaso (250ml)"
      >
        <Plus size={18} strokeWidth={3} />
      </button>
    </div>
  );
}
