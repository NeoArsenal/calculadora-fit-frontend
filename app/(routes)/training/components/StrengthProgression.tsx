"use client";

import { useState, useMemo } from "react";
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip, 
  XAxis, YAxis, CartesianGrid 
} from "recharts";
import { ChevronDown, TrendingUp } from "lucide-react";

interface Props {
  sessions: any[];
}

export default function StrengthProgression({ sessions }: Props) {
  const [selectedExercise, setSelectedExercise] = useState("Bench Press");

  const exerciseOptions = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach(s => s.exerciseLogs?.forEach((ex: any) => names.add(ex.exerciseName)));
    return Array.from(names);
  }, [sessions]);

  const chartData = useMemo(() => {
    return sessions
      .map(session => {
        const log = session.exerciseLogs?.find((ex: any) => ex.exerciseName === selectedExercise);
        return {
          date: new Date(session.workoutDate || session.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
          weight: log ? log.weightUsed : null,
          fullDate: session.workoutDate || session.date
        };
      })
      .filter(d => d.weight !== null)
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [sessions, selectedExercise]);

  const maxWeight = chartData.length > 0 ? Math.max(...chartData.map(d => d.weight || 0)) : 0;
  const lastWeight = chartData.length > 0 ? chartData[chartData.length - 1].weight || 0 : 0;
  const firstWeight = chartData.length > 0 ? chartData[0].weight || 0 : 0;
  const progressPercent = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight * 100).toFixed(1) : "0";

  return (
    <div className="bg-[#0a0a0b]/60 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-1">
          <h2 className="text-white text-2xl font-black uppercase tracking-tighter italic">
            Strength Progression
          </h2>
          <div className="flex items-center gap-2 group cursor-pointer bg-white/5 w-fit px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-all">
            <select 
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 outline-none appearance-none cursor-pointer"
            >
              {exerciseOptions.map(name => <option key={name} value={name} className="bg-[#0a0a0b]">{name}</option>)}
            </select>
            <ChevronDown size={12} className="text-blue-400" />
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
             <span className="text-3xl font-black italic text-white tracking-tighter">{lastWeight}kg</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400 flex items-center justify-end gap-1">
            <TrendingUp size={12} /> +{progressPercent}% <span className="text-muted-foreground ml-1">vs start</span>
          </p>
        </div>
      </div>

      {/* GRÁFICO TIPO AREA (IGUAL AL DE LA FOTO) */}
      <div className="w-full h-[240px] -ml-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#000", border: "none", borderRadius: "12px", fontSize: "10px", fontWeight: "bold" }}
                cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#2563eb" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-3xl opacity-30">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Waiting for data...</p>
          </div>
        )}
      </div>

      {/* STATS INFERIORES */}
      <div className="grid grid-cols-4 mt-10 gap-4">
        <StatCard label="Max Rep" value={`${maxWeight}kg`} />
        <StatCard label="Volume" value="3.2t" />
        <StatCard label="Rank" value="Elite" isBlue />
        <StatCard label="Next Goal" value="110kg" />
      </div>
    </div>
  );
}

function StatCard({ label, value, isBlue = false }: { label: string, value: string, isBlue?: boolean }) {
  return (
    <div className="text-center space-y-1">
      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{label}</p>
      <p className={`text-sm font-black italic uppercase ${isBlue ? 'text-blue-500' : 'text-white'}`}>{value}</p>
    </div>
  );
}