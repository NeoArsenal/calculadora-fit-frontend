"use client";

import { useState, useEffect, useMemo } from "react";
import { ClipboardList, Dumbbell, Calendar as CalendarIcon, Target } from "lucide-react";

const daysOfWeek = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

interface Props {
  sessions: any[]; 
}

export default function RoutinePlanner({ sessions }: Props) {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Ajustar para que Lunes sea 0 y Domingo sea 6
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  // 🧠 Lógica para obtener TODAS las sesiones de un día
  const getSessionsForDay = (dayNumber: number) => {
    return sessions.filter(session => {
      const sDate = new Date(session.workoutDate || session.date); 
      return sDate.getDate() === dayNumber && 
             sDate.getMonth() === month &&
             sDate.getFullYear() === year;
    }).sort((a, b) => a.id - b.id);
  };

  // Auto-seleccionar el último día con entrenamiento del mes (o el día de hoy)
  useEffect(() => {
    if (!sessions || sessions.length === 0) return;
    const trainedDaysThisMonth = sessions
      .map(s => new Date(s.workoutDate || s.date))
      .filter(d => d.getMonth() === month && d.getFullYear() === year)
      .map(d => d.getDate())
      .sort((a, b) => b - a);

    if (trainedDaysThisMonth.length > 0) {
      setSelectedDay(trainedDaysThisMonth[0]);
    }
  }, [sessions, month, year]);

  const selectedSessions = useMemo(
    () => getSessionsForDay(selectedDay),
    [sessions, selectedDay, month, year]
  );

  const handleDayClick = (dayNumber: number) => {
    setSelectedDay(dayNumber);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8">
      
      {/* --- COLUMNA CALENDARIO (7/12) --- */}
      <div className="lg:col-span-7 bg-white dark:bg-[#0f0f11] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2rem] p-5 md:p-7 transition-colors duration-300">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <CalendarIcon className="text-blue-500" size={18} />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-lg md:text-xl font-bold tracking-tight transition-colors">
                Logbook Kallp<span className="text-blue-500">_</span>
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                Historial de entrenamientos
              </p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase bg-gray-100 dark:bg-secondary/20 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/5 transition-colors">
            {currentDate.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Cabecera Días */}
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-muted-foreground text-[10px] font-black tracking-widest">
              {day}
            </span>
          ))}
        </div>

        {/* Grilla de Días Compacta y Alineada al Mes Real */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOffset }).map((_, emptyIdx) => (
            <div key={`empty-${emptyIdx}`} className="h-11 sm:h-13 rounded-xl opacity-0 pointer-events-none" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNumber = i + 1;
            const daySessions = getSessionsForDay(dayNumber);
            const hasWorkout = daySessions.length > 0;
            const isToday = dayNumber === currentDate.getDate();
            const isSelected = dayNumber === selectedDay;

            return (
              <button
                key={dayNumber}
                onClick={() => handleDayClick(dayNumber)}
                className={`group relative h-11 sm:h-13 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5
                  ${hasWorkout 
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.35)] border border-blue-400/50" 
                    : "bg-gray-100/80 dark:bg-secondary/20 text-gray-600 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-secondary/40 border border-gray-200/80 dark:border-white/5"}
                  ${isToday && !hasWorkout ? "border-2 border-blue-500/60 bg-blue-50 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400" : ""}
                  ${isSelected ? "ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-[#0f0f11] scale-[1.03]" : ""}
                `}
              >
                <span className="z-10 leading-none">{dayNumber}</span>
                {hasWorkout && (
                  <div className="w-1 h-1 bg-white rounded-full mt-0.5" />
                )}
                {daySessions.length > 1 && (
                  <span className="absolute -top-1.5 -right-1 text-[8px] bg-white text-blue-600 font-black px-1.5 py-0.2 rounded-full shadow-md">
                    {daySessions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- COLUMNA DETALLES DEL DÍA SELECCIONADO (5/12) --- */}
      <div className="lg:col-span-5">
        <div className="bg-white dark:bg-[#0f0f11] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2rem] p-5 md:p-6 h-full flex flex-col justify-start min-h-[220px] transition-colors duration-300">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-white/5 pb-3 transition-colors">
            <div className="flex items-center gap-2 text-blue-500">
              <ClipboardList size={18} />
              <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white transition-colors">
                Resumen • {selectedDay} de {currentDate.toLocaleDateString('es-PE', { month: 'long' })}
              </h3>
            </div>
            {selectedSessions.length > 0 && (
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                {selectedSessions.length} {selectedSessions.length === 1 ? "sesión" : "sesiones"}
              </span>
            )}
          </div>

          {selectedSessions.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-[320px] custom-scrollbar pr-1 animate-in fade-in duration-300">
              {selectedSessions.map((session, sIdx) => (
                <div key={session.id || sIdx} className="space-y-3 relative">
                  {selectedSessions.length > 1 && (
                    <div className="sticky top-0 bg-white/95 dark:bg-[#0f0f11]/95 backdrop-blur-sm py-1 z-10 border-b border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                      Sesión #{sIdx + 1}
                    </div>
                  )}

                  {session.exerciseLogs?.map((ex: any, exIdx: number) => (
                    <div key={exIdx} className="bg-gray-50 dark:bg-white/[0.03] p-3.5 rounded-2xl border border-gray-200/70 dark:border-white/5 border-l-4 border-l-blue-500 transition-colors">
                      <p className="text-xs font-black uppercase text-gray-900 dark:text-white mb-2 transition-colors">
                        {ex.exerciseName}
                      </p>
                      
                      <div className="flex justify-between text-[10px] font-bold text-gray-600 dark:text-muted-foreground uppercase bg-white dark:bg-black/30 px-3 py-2 rounded-xl border border-gray-200/80 dark:border-white/5 transition-colors">
                        <span className="flex items-center gap-1.5">
                          <Target size={12} className="text-blue-500" />
                          {ex.setsDone} Series
                        </span>
                        <span className="text-gray-900 dark:text-white font-black">{ex.weightUsed} KG</span>
                        <span className="text-blue-600 dark:text-blue-400 font-black">{ex.repsDone} Reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center space-y-2.5 opacity-50 flex-1 flex flex-col items-center justify-center py-8">
              <Dumbbell size={40} className="mx-auto text-muted-foreground" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Sin entrenamientos registrados este día
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}