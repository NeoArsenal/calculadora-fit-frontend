"use client";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ProgressChartProps {
  records: any[];
}

export default function ProgressChart({ records }: ProgressChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  // 1. Invertimos el orden para que el tiempo fluya de izquierda (pasado) a derecha (presente)
  // Usamos el spread [...] para no alterar la lista original de la tabla
  const data = [...records].reverse().map(record => ({
    name: record.recordDate, 
    weight: record.weightKg,
    waist: record.waistCircumferenceCm
  }));

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30 shadow-2xl">
      <h2 className="text-xl font-semibold mb-6 text-gray-200 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
        Análisis de Composición Corporal
      </h2>
      
      <div className="h-[350px] w-full">
        {isMounted && <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af" 
              fontSize={12}
              tickMargin={10}
            />

            {/* --- EJE PESO (AZUL) --- */}
            {/* El domain ['dataMin - 5', 'dataMax + 5'] hace el "zoom" automático */}
            <YAxis 
              yAxisId="left"
              orientation="left" 
              stroke="#60a5fa" 
              fontSize={12}
              unit="kg"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickLine={false}
              axisLine={false}
            />

            {/* --- EJE CINTURA (VERDE) --- */}
            <YAxis 
              yAxisId="right"
              orientation="right" 
              stroke="#34d399" 
              fontSize={12}
              unit="cm"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #4b5563', 
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
              }}
              itemStyle={{ fontSize: '14px' }}
              labelStyle={{ color: '#9ca3af', fontWeight: 'bold', marginBottom: '4px' }}
              cursor={{ stroke: '#4b5563', strokeWidth: 2 }}
            />

            <Legend 
              verticalAlign="top" 
              align="right" 
              height={36}
              iconType="circle"
            />

            {/* Línea de Peso */}
            <Line 
              yAxisId="left"
              name="Peso Corporal"
              type="monotone" 
              dataKey="weight" 
              stroke="#60a5fa" 
              strokeWidth={4}
              dot={{ r: 4, fill: '#60a5fa', strokeWidth: 2, stroke: '#1f2937' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={1500}
            />

            {/* Línea de Cintura */}
            <Line 
              yAxisId="right"
              name="Cintura"
              type="monotone" 
              dataKey="waist" 
              stroke="#34d399" 
              strokeWidth={4}
              dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#1f2937' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>}
      </div>
    </div>
  );
}