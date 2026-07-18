"use client";

import { useState } from "react";
import { ClipboardList, Dumbbell, Calendar as CalendarIcon, Target } from "lucide-react";

const daysOfWeek = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];

// 🔥 Nueva Interfaz de Props: Recibe las sesiones desde el padre
interface Props {
  sessions: any[]; 
}

export default function RoutinePlanner({ sessions }: Props) {
  // Ya no hay 'useState(sessions)' ni 'useEffect(getWorkoutSessions)' 🎉

  const [selectedSessions, setSelectedSessions] = useState<any[]>([]);
  const [currentDate] = useState(new Date());

  // 🧠 Lógica para obtener TODAS las sesiones de un día
  const getSessionsForDay = (dayNumber: number) => {
    return sessions.filter(session => {
      const sDate = new Date(session.workoutDate || session.date); 
      return sDate.getDate() === dayNumber && 
             sDate.getMonth() === currentDate.getMonth() &&
             sDate.getFullYear() === currentDate.getFullYear();
    }).sort((a, b) => a.id - b.id);
  };

  const handleDayClick = (dayNumber: number) => {
    const daySessions = getSessionsForDay(dayNumber);
    setSelectedSessions(daySessions);
  };

  // --- RENDERIZADO (Se mantiene igual pero más limpio) ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* --- COLUMNA CALENDARIO (8/12) --- */}
      <div className="lg:col-span-8 bg-white dark:bg-[#0f0f11] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <CalendarIcon className="text-blue-500" size={20} />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight transition-colors">
                Logbook Kallp<span className="text-blue-500">_</span>
              </h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Historial de entrenamientos</p>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase bg-gray-100 dark:bg-secondary/20 px-4 py-2 rounded-full border border-gray-200 dark:border-white/5 transition-colors">
            {currentDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Cabecera Días */}
        <div className="grid grid-cols-7 gap-3 text-center mb-6">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-muted-foreground text-[10px] font-black tracking-widest">
              {day}
            </span>
          ))}
        </div>

        {/* Grilla de Días */}
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNumber = i + 1;
            const daySessions = getSessionsForDay(dayNumber);
            const hasWorkout = daySessions.length > 0;
            const isToday = dayNumber === currentDate.getDate();

            return (
              <button
                key={i}
                onClick={() => handleDayClick(dayNumber)}
                className={`group relative h-16 rounded-2xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1
                  ${hasWorkout 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-100 hover:scale-105 border border-blue-500/50" 
                    : "bg-gray-100 dark:bg-secondary/20 text-gray-500 dark:text-muted-foreground hover:bg-gray-200 dark:hover:bg-secondary/40 border border-gray-200 dark:border-white/5"}
                  ${isToday && !hasWorkout ? "border-2 border-blue-500/50 animate-pulse bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" : ""}
                `}
              >
                <span className="z-10">{dayNumber}</span>
                {hasWorkout && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                )}
                {daySessions.length > 1 && (
                  <span className="absolute -top-2 -right-1 text-[9px] bg-white text-blue-600 font-black px-1.5 py-0.5 rounded-full shadow-xl">
                    {daySessions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- COLUMNA DETALLES (4/12) --- */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white dark:bg-[#0f0f11] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-6 h-full flex flex-col justify-start min-h-[300px] transition-colors duration-300">
          {selectedSessions.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <div className="flex items-center gap-2 mb-6 text-blue-500 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
                <ClipboardList size={20} />
                <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white transition-colors">Resumen de Sesión</h3>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                {selectedSessions.map((session, sIdx) => (
                  <div key={session.id || sIdx} className="space-y-5 relative">
                    {selectedSessions.length > 1 && (
                      <div className="sticky top-0 bg-white/90 dark:bg-[#0f0f11]/90 backdrop-blur-sm py-1.5 z-10 border-b border-gray-200 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3 transition-colors">
                        Entrenamiento {sIdx + 1}
                      </div>
                    )}

                    {session.exerciseLogs?.map((ex: any, exIdx: number) => (
                      <div key={exIdx} className="bg-gray-50 dark:bg-secondary/10 p-4 rounded-2xl border-l-4 border-blue-500 transition-colors">
                        <p className="text-xs font-black uppercase text-gray-900 dark:text-white mb-3 transition-colors">{ex.exerciseName}</p>
                        
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-muted-foreground uppercase bg-white dark:bg-black/20 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 transition-colors">
                          <span className="flex items-center gap-1.5"><Target size={12}/>{ex.setsDone} Sets</span>
                          <span>{ex.weightUsed} KG</span>
                          <span className="text-blue-400">{ex.repsDone} Reps</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-40 h-full flex flex-col items-center justify-center pt-10">
              <Dumbbell size={64} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                Selecciona un día <br/> para ver tu progreso
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}