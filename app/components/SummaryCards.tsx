"use client";
import { useState } from 'react';
import { 
  Activity, Beaker, Weight, Scale, Flame, 
  ArrowUpRight, ArrowDownRight, Minus 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SummaryCardsProps {
  nutrition: any;
  records: any[];
  userProfile?: {
    height: number;
    age: number;
  }
}

export default function SummaryCards({ nutrition, records, userProfile }: SummaryCardsProps) {
  const [goal, setGoal] = useState<'maintenance' | 'deficit' | 'bulk'>('maintenance');

  // --- LÓGICA DINÁMICA ---
  const heightMeters = userProfile?.height || 1.79;
  const age = userProfile?.age || 25;
  const heightCm = heightMeters * 100;

  const currentWeight = records[0]?.weightKg || 0;
  const previousWeight = records[1]?.weightKg; 
  const weightDiff = previousWeight !== undefined ? currentWeight - previousWeight : 0;

  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  
  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: "Bajo peso", color: "text-yellow-400", border: "border-yellow-500/20" };
    if (val < 25) return { label: "Normal", color: "text-green-400", border: "border-green-500/20" };
    if (val < 30) return { label: "Sobrepeso", color: "text-orange-400", border: "border-orange-500/20" };
    return { label: "Obesidad", color: "text-red-400", border: "border-red-500/20" };
  };
  const bmiStatus = getBmiStatus(bmiValue);

  const bmr = currentWeight > 0 
    ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + 5 
    : 0;

  const maintenanceCalories = Math.round(bmr * 1.55);
  
  const getTargetCalories = () => {
    if (goal === 'deficit') return maintenanceCalories - 500;
    if (goal === 'bulk') return maintenanceCalories + 300;
    return maintenanceCalories;
  };

  // --- DEFINICIÓN DEL ARREGLO 'cards' (Esto es lo que faltaba) ---
  const cards = [
    { 
      title: "PROTEÍNA", 
      value: `${nutrition?.targetProteinGrams || 0}g`, 
      icon: Activity, 
      color: "text-blue-400", 
      border: "border-blue-500/20",
      footer: "Meta diaria",
      trend: { value: "Estable", color: "text-blue-400", isNeutral: true }
    },
    { 
      title: "CREATINA", 
      value: `${nutrition?.targetCreatineGrams || 0}g`, 
      icon: Beaker, 
      color: "text-purple-400", 
      border: "border-purple-500/20",
      footer: "Suplemento",
      trend: { value: "Carga", color: "text-purple-400", isNeutral: true }
    },
    { 
      title: "ÚLTIMO PESO", 
      value: `${currentWeight} kg`, 
      icon: Weight, 
      color: "text-emerald-400",
      border: "border-emerald-500/20",
      footer: "Pesaje actual",
      trend: previousWeight !== undefined ? {
        value: weightDiff === 0 ? "Sin cambios" : `${Math.abs(weightDiff).toFixed(1)} kg`,
        isUp: weightDiff > 0,
        isDown: weightDiff < 0,
        isNeutral: weightDiff === 0,
        color: weightDiff > 0 ? "text-red-400" : weightDiff < 0 ? "text-emerald-400" : "text-gray-400"
      } : null
    },
    { 
      title: "IMC ACTUAL", 
      value: bmiValue.toFixed(1), 
      icon: Scale, 
      color: bmiStatus.color,
      border: bmiStatus.border,
      footer: bmiStatus.label,
      trend: { value: "Nivel", color: bmiStatus.color, isNeutral: true }
    },
    { 
      title: "META DIARIA", 
      value: `${getTargetCalories()} kcal`, 
      icon: Flame, 
      color: goal === 'deficit' ? "text-emerald-400" : goal === 'bulk' ? "text-blue-400" : "text-red-400",
      border: "border-gray-500/20",
      footer: goal === 'deficit' ? "Déficit" : goal === 'bulk' ? "Volumen" : "Mantenimiento",
      trend: { value: "Objetivo", color: "text-gray-400", isNeutral: true }
    },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex justify-end">
        <Tabs defaultValue="maintenance" onValueChange={(v: string) => setGoal(v as any)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/60 border border-gray-800 p-1 rounded-xl backdrop-blur-md">
            <TabsTrigger value="deficit" className="rounded-lg text-xs transition-all data-[state=active]:bg-emerald-600">Déficit</TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg text-xs transition-all data-[state=active]:bg-gray-700">Mantenimiento</TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg text-xs transition-all data-[state=active]:bg-blue-600">Volumen</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Aquí solucionamos los errores de tipos en el .map */}
        {cards.map((card: any, i: number) => (
          <Card key={i} className={`bg-gray-900/40 backdrop-blur-md border ${card.border} shadow-2xl transition-all hover:scale-105 group`}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 bg-gray-800/50 rounded-lg ${card.color}`}>
                  <card.icon size={18} />
                </div>
                
                {card.trend && (
                  <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full bg-gray-900/50 ${card.trend.color}`}>
                    {card.trend.isUp && <ArrowUpRight size={12} className="mr-1" />}
                    {card.trend.isDown && <ArrowDownRight size={12} className="mr-1" />}
                    {card.trend.isNeutral && <Minus size={12} className="mr-1" />}
                    {card.trend.value}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-gray-500 uppercase text-[10px] font-bold tracking-[0.2em] mb-1">{card.title}</h3>
                <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
                <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 italic">
                  • {card.footer}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}