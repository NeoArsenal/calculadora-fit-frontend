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
    <div className="bg-card dark:bg-[#0f0f11] border border-border dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-emerald-500/20 transition-all duration-500"></div>

      <div className="flex items-center justify-between mb-2 relative z-10">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate pr-1">
          Suplementos
        </p>
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
          <Pill size={13} className="text-emerald-500" />
        </div>
      </div>

      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-2xl md:text-3xl font-black text-foreground">{data.percentage}</span>
        <span className="text-[10px] text-muted-foreground font-bold">% (30D)</span>
      </div>

      <div className="mt-2.5 w-full relative z-10">
        <div className="flex gap-[2px] justify-between items-end h-3.5">
          {data.days.map((day) => (
            <div 
              key={day.dateString}
              className={`flex-1 rounded-[2px] transition-all duration-300 ${
                day.active 
                  ? "bg-emerald-500 h-3.5" 
                  : "bg-gray-200 dark:bg-white/10 h-1.5"
              }`}
              title={day.dateString}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
