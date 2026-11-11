"use client";

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ProgressChartProps {
  records: any[];
  onOpenRecordModal?: () => void;
}

export default function ProgressChart({ records, onOpenRecordModal }: ProgressChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const safeRecords = records || [];
  const data = [...safeRecords].reverse().map(record => ({
    name: record.recordDate, 
    weight: record.weightKg,
    waist: record.waistCircumferenceCm
  }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-foreground tracking-tight">
              Curva de Evolución Corporal
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Comparativa histórica de peso (kg) y cintura (cm)
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted dark:bg-white/5 border border-border dark:border-white/10 px-3 py-1 rounded-full">
          {data.length} registros
        </span>
      </div>
      
      <div className="h-[360px] md:h-[400px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-border dark:border-white/10 rounded-3xl bg-muted/20 dark:bg-white/[0.01]">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mb-3">
              <TrendingUp size={22} />
            </div>
            <p className="text-sm font-bold text-foreground">Comienza tu gráfica evolutiva</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mb-4">
              Registra tu primer pesaje para visualizar tu tendencia de peso y cintura.
            </p>
            {onOpenRecordModal && (
              <button
                onClick={onOpenRecordModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all active:scale-95"
              >
                + Registrar primer pesaje
              </button>
            )}
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

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
              
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={12}
              />

              <YAxis 
                yAxisId="left"
                orientation="left" 
                stroke="#3b82f6" 
                fontSize={11}
                unit="kg"
                domain={['dataMin - 3', 'dataMax + 3']}
                tickLine={false}
                axisLine={false}
              />

              <YAxis 
                yAxisId="right"
                orientation="right" 
                stroke="#10b981" 
                fontSize={11}
                unit="cm"
                domain={['dataMin - 3', 'dataMax + 3']}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(18, 18, 20, 0.92)', 
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  borderRadius: '14px',
                  padding: '10px 14px',
                  color: '#fff'
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                labelStyle={{ color: '#94a3b8', fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}
              />

              <Legend 
                verticalAlign="top" 
                align="right" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
              />

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
                activeDot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800}
              />

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
                activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
