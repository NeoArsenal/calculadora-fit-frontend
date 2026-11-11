"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, 
  XAxis, YAxis, CartesianGrid 
} from "recharts";
import { ChevronDown, TrendingUp } from "lucide-react";

interface Props {
  sessions: any[];
}

export default function StrengthProgression({ sessions }: Props) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const exerciseOptions = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => s.exerciseLogs?.forEach((ex: any) => {
      if (ex.exerciseName) names.add(ex.exerciseName);
    }));
    return Array.from(names);
  }, [sessions]);

  // Auto-seleccionar el primer ejercicio registrado en español
  useEffect(() => {
    if (exerciseOptions.length > 0 && (!selectedExercise || !exerciseOptions.includes(selectedExercise))) {
      setSelectedExercise(exerciseOptions[0]);
    }
  }, [exerciseOptions, selectedExercise]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    return sessions
      .map(session => {
        const log = session.exerciseLogs?.find((ex: any) => ex.exerciseName === selectedExercise);
        return {
          date: new Date(session.workoutDate || session.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          weight: log ? log.weightUsed : null,
          reps: log ? log.repsDone : null,
          fullDate: session.workoutDate || session.date
        };
      })
      .filter(d => d.weight !== null)
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [sessions, selectedExercise]);

  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => Number(d.weight) || 0)) : 0;
  const lastWeight = chartData.length > 0 ? Number(chartData[chartData.length - 1].weight) || 0 : 0;
  const firstWeight = chartData.length > 0 ? Number(chartData[0].weight) || 0 : 0;
  const progressPercent = firstWeight > 0 ? (((lastWeight - firstWeight) / firstWeight) * 100).toFixed(1) : "0";
  const nextGoal = maxWeight > 0 ? maxWeight + 2.5 : 0;

  return (
    <div className="bg-white dark:bg-[#0f0f11] shadow-xl shadow-gray-200/40 dark:shadow-none border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 md:p-8 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4 mb-8">
        <div className="space-y-1.5 min-w-0">
          <h2 className="text-gray-900 dark:text-white text-xl md:text-2xl font-black uppercase tracking-tighter italic transition-colors">
            Progreso de Fuerza<span className="text-blue-500">_</span>
          </h2>
          
          <div className="relative">
            <div 
              onClick={() => exerciseOptions.length > 0 && setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group cursor-pointer bg-gray-100 dark:bg-white/5 w-fit max-w-full px-3.5 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-all"
            >
              <span className="bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 select-none truncate">
                {selectedExercise || "Sin ejercicios registrados"}
              </span>
              {exerciseOptions.length > 0 && (
                <ChevronDown size={14} className={`text-blue-600 dark:text-blue-400 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              )}
            </div>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-max min-w-[240px] max-w-[85vw] max-h-[250px] overflow-y-auto bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 py-2 custom-scrollbar">
                  {exerciseOptions.map(name => (
                    <div 
                      key={name}
                      onClick={() => {
                        setSelectedExercise(name);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors ${selectedExercise === name ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-l-2 border-blue-500' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border-l-2 border-transparent'}`}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-2xl md:text-3xl font-black italic text-gray-900 dark:text-white tracking-tighter transition-colors">
              {lastWeight} kg
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center justify-end gap-1">
            <TrendingUp size={12} /> {Number(progressPercent) >= 0 ? `+${progressPercent}%` : `${progressPercent}%`} <span className="text-muted-foreground ml-1">vs inicio</span>
          </p>
        </div>
      </div>

      {/* GRÁFICO TIPO AREA */}
      <div className="w-full h-[220px] -ml-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888815" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f0f11", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}
                formatter={(value: any) => [`${value} kg`, "Peso"]}
                cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#2563eb" 
                strokeWidth={3.5}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-gray-300 dark:border-white/10 rounded-3xl opacity-50 ml-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Registra una sesión para ver tu curva de fuerza
            </p>
          </div>
        )}
      </div>

      {/* STATS INFERIORES REALES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mt-6 pt-5 border-t border-gray-200/80 dark:border-white/5 gap-4">
        <StatCard label="Récord (PR)" value={`${maxWeight} kg`} />
        <StatCard label="Último Peso" value={`${lastWeight} kg`} />
        <StatCard label="Sesiones" value={`${chartData.length}`} isBlue />
        <StatCard label="Próx. Meta" value={`${nextGoal} kg`} />
      </div>
    </div>
  );
}

function StatCard({ label, value, isBlue = false }: { label: string, value: string, isBlue?: boolean }) {
  return (
    <div className="text-center space-y-1 bg-gray-50 dark:bg-white/[0.02] py-2.5 px-3 rounded-2xl border border-gray-200/60 dark:border-white/5">
      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.15em]">{label}</p>
      <p className={`text-sm font-black italic uppercase ${isBlue ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}