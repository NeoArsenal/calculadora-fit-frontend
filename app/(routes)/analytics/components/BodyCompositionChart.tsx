"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// ⚡️ Datos simulados de los últimos 6 meses (Delta Comparison)
const data = [
  { month: 'JAN', weight: 88.5, fat: 24.2, muscle: 42.1 },
  { month: 'FEB', weight: 87.8, fat: 23.5, muscle: 42.5 },
  { month: 'MAR', weight: 87.0, fat: 22.8, muscle: 43.0 },
  { month: 'APR', weight: 86.6, fat: 21.5, muscle: 43.8 },
  { month: 'MAY', weight: 85.2, fat: 20.1, muscle: 44.5 },
  { month: 'JUN', weight: 84.0, fat: 18.5, muscle: 45.8 },
];

export default function BodyCompositionChart() {
  return (
    // ResponsiveContainer hace que el gráfico se adapte al 100% del div padre
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
      >
        {/* Líneas de fondo súper sutiles */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
        
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
          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
          itemStyle={{ fontWeight: 'bold' }}
        />

        {/* ⚡️ LÍNEA 1: Peso (Azul - Suave) */}
        <Line 
          type="monotone" 
          dataKey="weight" 
          name="Weight (kg)"
          stroke="#3b82f6" 
          strokeWidth={4} 
          dot={false}
          activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} 
        />
        
        {/* ⚡️ LÍNEA 2: Porcentaje de Grasa (Rosa - Punteada) */}
        <Line 
          type="monotone" 
          dataKey="fat" 
          name="Fat %"
          stroke="#f472b6" 
          strokeWidth={3} 
          strokeDasharray="7 7" // Aquí está la magia de la línea punteada
          dot={false} 
        />

        {/* ⚡️ LÍNEA 3: Músculo (Morado/Índigo - Suave) */}
        <Line 
          type="monotone" 
          dataKey="muscle" 
          name="Muscle (kg)"
          stroke="#818cf8" 
          strokeWidth={4} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}