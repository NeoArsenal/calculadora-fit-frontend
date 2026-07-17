"use client";

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useApp } from "@/app/context/AppContext";

export default function BodyCompositionChart({ range = "6M" }: { range?: string }) {
  const { records } = useApp();

  const chartData = React.useMemo(() => {
    if (!records || records.length === 0) {
      return [{ month: 'NO DATA', weight: 0, fat: 0, muscle: 0 }];
    }
    
    const now = new Date();
    // 1. Filter by range
    let cutoffDate = new Date();
    if (range === "1W") cutoffDate.setDate(now.getDate() - 7);
    else if (range === "1M") cutoffDate.setMonth(now.getMonth() - 1);
    else if (range === "3M") cutoffDate.setMonth(now.getMonth() - 3);
    else if (range === "6M") cutoffDate.setMonth(now.getMonth() - 6);

    const filtered = records.filter((r: any) => new Date(r.date) >= cutoffDate);

    // Sort records by date ascending
    const sorted = [...filtered].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Group by month or day
    const grouped = new Map();
    sorted.forEach(record => {
      if (record.date) {
        const d = new Date(record.date);
        let labelStr = "";
        if (range === "1W" || range === "1M") {
            labelStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).toUpperCase().replace('.', '');
        } else {
            labelStr = d.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
        }

        if (!grouped.has(labelStr)) {
          grouped.set(labelStr, { month: labelStr, weight: 0, count: 0 });
        }
        const g = grouped.get(labelStr);
        g.weight += record.weightKg;
        g.count += 1;
      }
    });

    const result = Array.from(grouped.values()).map(g => {
      const avgWeight = g.weight / g.count;
      return {
        month: g.month,
        weight: Number(avgWeight.toFixed(1)),
        fat: Number((avgWeight * 0.2).toFixed(1)), // Mock fat as 20%
        muscle: Number((avgWeight * 0.4).toFixed(1)) // Mock muscle as 40%
      };
    });
    
    return result;
  }, [records, range]);

  if (chartData.length === 0 || (chartData.length === 1 && chartData[0].month === 'NO DATA')) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-60">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sin Datos de Peso</p>
        <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Registra tu peso corporal para ver tu evolución en el tiempo.</p>
      </div>
    );
  }

  return (
    // ResponsiveContainer hace que el gráfico se adapte al 100% del div padre
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5}/>
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
          </linearGradient>
        </defs>

        {/* Líneas de fondo súper sutiles */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
        
        {/* Eje X (Meses) */}
        <XAxis 
          dataKey="month" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} 
          dy={10}
        />
        
        {/* Eje Y oculto para un look más limpio, pero escalado a los datos */}
        <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={false} />
        
        {/* Tooltip personalizado al pasar el mouse */}
        <Tooltip 
          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', color: '#fff', boxShadow: '0 10px 30px -10px rgba(59,130,246,0.3)' }}
          itemStyle={{ fontWeight: 'bold' }}
        />

        {/* ⚡️ LÍNEA 1: Peso (Azul - Suave) */}
        <Area 
          type="monotone" 
          dataKey="weight" 
          name="Weight (kg)"
          stroke="#3b82f6" 
          strokeWidth={4} 
          fillOpacity={1}
          fill="url(#colorWeight)"
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 5px rgba(59,130,246,0.8))' } }} 
        />
        
        {/* ⚡️ LÍNEA 2: Porcentaje de Grasa (Rosa - Punteada) */}
        <Area 
          type="monotone" 
          dataKey="fat" 
          name="Fat %"
          stroke="#f472b6" 
          strokeWidth={3} 
          strokeDasharray="7 7" // Aquí está la magia de la línea punteada
          fillOpacity={0} // Sin relleno, solo la línea
          activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 5px rgba(244,114,182,0.8))' } }}
        />

        {/* ⚡️ LÍNEA 3: Músculo (Morado/Índigo - Suave) */}
        <Area 
          type="monotone" 
          dataKey="muscle" 
          name="Muscle (kg)"
          stroke="#818cf8" 
          strokeWidth={4} 
          fillOpacity={1}
          fill="url(#colorMuscle)"
          activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0px 0px 5px rgba(129,140,248,0.8))' } }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}