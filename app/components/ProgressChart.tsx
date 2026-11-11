"use client";
import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface ProgressChartProps {
  records: any[];
}

export default function ProgressChart({ records }: ProgressChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const safeRecords = records || [];
  const data = [...safeRecords].reverse().map(record => ({
    name: record.recordDate, 
    weight: record.weightKg,
    waist: record.waistCircumferenceCm
  }));

  return (
    <div className="glass-card p-6 rounded-2xl border-white/10 dark:border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Luz ambiental sutil */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          Análisis de Composición Corporal
        </h2>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
          Historial biométrico
        </span>
      </div>
      
      <div className="h-[350px] w-full relative z-10">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <span className="text-blue-400 text-xl font-bold">📈</span>
            </div>
            <p className="text-sm font-bold text-foreground">Comienza tu gráfica evolutiva</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Ingresa tu primer pesaje en el panel de registro diario para activar el análisis continuo.
            </p>
          </div>
        ) : isMounted && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="progressWeightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="progressWaistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />

              {/* --- EJE PESO (AZUL) --- */}
              <YAxis 
                yAxisId="left"
                orientation="left" 
                stroke="#60a5fa" 
                fontSize={11}
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
                fontSize={11}
                unit="cm"
                domain={['dataMin - 5', 'dataMax + 5']}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 20, 32, 0.85)', 
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.6), 0 0 15px rgba(59, 130, 246, 0.2)',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ color: '#94a3b8', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}
                cursor={{ stroke: 'rgba(255, 255, 255, 0.15)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />

              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
              />

              {/* Área de Peso */}
              <Area 
                yAxisId="left"
                name="Peso Corporal (kg)"
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#progressWeightGradient)"
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 7, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.8))' } }}
                animationDuration={1200}
              />

              {/* Área de Cintura */}
              <Area 
                yAxisId="right"
                name="Cintura (cm)"
                type="monotone" 
                dataKey="waist" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#progressWaistGradient)"
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 7, fill: '#34d399', stroke: '#fff', strokeWidth: 2, style: { filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' } }}
                animationDuration={1200}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}