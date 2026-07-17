"use client";

import React, { useMemo } from "react";
import { useApp } from "@/app/context/AppContext";
import { Pill } from "lucide-react";

export default function SupplementAdherence() {
  const { supplementLogs } = useApp() as any;

  // Compute adherence over the last 30 days
  const data = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // We'll calculate total possible vs total taken
    // A day is "adherent" if at least 1 supplement was taken (or we could calculate per supplement, but global is easier for now)
    let adherentDays = 0;

    // Create array of last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      // Check if any log exists for this date
      const hasLog = supplementLogs?.some((log: any) => log.consumedDate === dateString);
      if (hasLog) adherentDays++;

      days.push({
        date: d,
        dateString,
        active: hasLog
      });
    }

    const percentage = days.length > 0 ? Math.round((adherentDays / days.length) * 100) : 0;

    return { days, percentage };
  }, [supplementLogs]);

  return (
    <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-500"></div>

      <div className="flex items-start justify-between mb-2 relative z-10">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Adherencia Suplementos
          </p>
          <p className="text-[10px] text-emerald-500 font-medium uppercase">Últimos 30 Días</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] flex-shrink-0">
          <Pill size={14} className="text-emerald-500" />
        </div>
      </div>

      <div className="flex items-end gap-1 relative z-10 mb-2 mt-auto">
        <span className="text-3xl font-black text-foreground">{data.percentage}</span>
        <span className="text-xs text-muted-foreground font-bold mb-1">% CPL</span>
      </div>

      <div className="mt-2 w-full relative z-10">
        <div className="flex gap-[2px] justify-between items-end h-5">
          {data.days.map((day, idx) => (
            <div 
              key={day.dateString}
              className={`flex-1 rounded-[2px] transition-all duration-300 ${
                day.active 
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] h-5" 
                  : "bg-gray-200 dark:bg-white/5 h-2"
              }`}
              title={day.dateString}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
