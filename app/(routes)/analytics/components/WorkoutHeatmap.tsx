"use client";

import React, { useMemo } from "react";
import { useApp } from "@/app/context/AppContext";

export default function WorkoutHeatmap() {
  const { trainingSessions } = useApp();

  const days = useMemo(() => {
    const data = [];
    const weeks = 20; // Últimos ~5 meses compactos sin scroll excesivo
    const daysInWeek = 7;
    const totalDays = weeks * daysInWeek;
    
    const trainingDates = new Map<string, number>();
    if (trainingSessions) {
      trainingSessions.forEach((session: any) => {
        const rawDate = session.workoutDate || session.date || session.startTime;
        if (rawDate) {
          const dateStr = new Date(rawDate).toDateString();
          trainingDates.set(dateStr, (trainingDates.get(dateStr) || 0) + 1);
        }
      });
    }

    const today = new Date();
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const sessionsCount = trainingDates.get(dateStr) || 0;
      
      let intensity = 0;
      if (sessionsCount > 0) {
        intensity = Math.min(4, sessionsCount + 1);
      }
      
      const formattedDate = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
      data.push({ id: i, intensity, date: d, sessionsCount, formattedDate });
    }
    return data;
  }, [trainingSessions]);
  
  const months = useMemo(() => {
    if (days.length === 0) return [];
    const uniqueMonths = new Set<string>();
    days.forEach(day => {
      const monthName = day.date.toLocaleDateString('es-ES', { month: 'short' });
      uniqueMonths.add(monthName.charAt(0).toUpperCase() + monthName.slice(1));
    });
    return Array.from(uniqueMonths);
  }, [days]);

  const getColor = (intensity: number) => {
    switch (intensity) {
      case 1: return "bg-blue-500/25 shadow-[inset_0_0_2px_rgba(59,130,246,0.3)]";
      case 2: return "bg-blue-500/60 shadow-[0_0_5px_rgba(59,130,246,0.4)]";
      case 3: return "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]";
      case 4: return "bg-blue-300 dark:bg-white shadow-[0_0_12px_rgba(59,130,246,0.8)]";
      default: return "bg-gray-200/80 dark:bg-white/5"; 
    }
  };

  return (
    <div className="w-full flex justify-center overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center">
        {/* 1. ETIQUETAS DE DÍAS */}
        <div className="flex flex-col justify-between text-[9px] font-bold text-muted-foreground mr-3 py-[2px] h-[116px] uppercase">
          <span>Lun</span>
          <span>Mié</span>
          <span>Vie</span>
          <span>Dom</span>
        </div>

        {/* 2. CONTENEDOR PRINCIPAL */}
        <div className="flex flex-col gap-2 min-w-max">
          {/* ETIQUETAS DE MESES */}
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            {months.map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>

          {/* GRID COMPACTO */}
          <div className="grid grid-rows-7 grid-flow-col gap-[4px]">
            {days.map((day) => (
              <div
                key={day.id}
                className={`w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] rounded-[4px] transition-all duration-200 hover:ring-2 hover:ring-blue-400 cursor-pointer hover:scale-125 z-0 hover:z-10 ${getColor(day.intensity)}`}
                title={`${day.formattedDate}: ${day.sessionsCount === 0 ? 'Sin entrenamiento' : day.sessionsCount + ' sesión(es)'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}