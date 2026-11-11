"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
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
    heightCm: number;
    age: number;
  }
}

export default function SummaryCards({ nutrition, records, userProfile }: SummaryCardsProps) {
  const [goal, setGoal] = useState<'maintenance' | 'deficit' | 'bulk'>('maintenance');

  // --- LÓGICA DINÁMICA ---
  const heightCm = userProfile?.heightCm || 170;
  const heightMeters = heightCm / 100;
  const age = userProfile?.age || 25;

  const currentWeight = records?.[0]?.weightKg || (userProfile as any)?.currentWeightKg || (userProfile as any)?.targetWeightKg || 0;
  const previousWeight = records?.[1]?.weightKg; 
  const weightDiff = previousWeight !== undefined ? currentWeight - previousWeight : 0;

  const bmiValue = currentWeight > 0 ? (currentWeight / Math.pow(heightMeters, 2)) : 0;
  
  const getBmiStatus = (val: number) => {
    if (val < 18.5) return { label: "Bajo peso", color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/10" };
    if (val < 25) return { label: "Normal", color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/10" };
    if (val < 30) return { label: "Sobrepeso", color: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/10" };
    return { label: "Obesidad", color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/10" };
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

  const cards = [
    { 
      title: "PROTEÍNA", 
      value: `${nutrition?.targetProteinGrams || 0}g`, 
      icon: Activity, 
      color: "text-blue-400", 
      iconBg: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
      glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      footer: "Meta diaria",
      trend: { value: "Estable", color: "text-blue-400", bg: "bg-blue-500/10", isNeutral: true }
    },
    { 
      title: "CREATINA", 
      value: `${nutrition?.targetCreatineGrams || 0}g`, 
      icon: Beaker, 
      color: "text-purple-400", 
      iconBg: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
      glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
      footer: "Suplemento",
      trend: { value: "Carga", color: "text-purple-400", bg: "bg-purple-500/10", isNeutral: true }
    },
    { 
      title: "ÚLTIMO PESO", 
      value: `${currentWeight} kg`, 
      icon: Weight, 
      color: "text-emerald-400",
      iconBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
      glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      footer: "Pesaje actual",
      trend: previousWeight !== undefined ? {
        value: weightDiff === 0 ? "Sin cambios" : `${Math.abs(weightDiff).toFixed(1)} kg`,
        isUp: weightDiff > 0,
        isDown: weightDiff < 0,
        isNeutral: weightDiff === 0,
        color: weightDiff > 0 ? "text-rose-400" : weightDiff < 0 ? "text-emerald-400" : "text-muted-foreground",
        bg: weightDiff > 0 ? "bg-rose-500/10" : weightDiff < 0 ? "bg-emerald-500/10" : "bg-white/5"
      } : null
    },
    { 
      title: "IMC ACTUAL", 
      value: bmiValue.toFixed(1), 
      icon: Scale, 
      color: bmiStatus.color,
      iconBg: `${bmiStatus.bg} ${bmiStatus.color} border ${bmiStatus.border}`,
      glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      footer: bmiStatus.label,
      trend: { value: "Nivel", color: bmiStatus.color, bg: bmiStatus.bg, isNeutral: true }
    },
    { 
      title: "META DIARIA", 
      value: `${getTargetCalories()} kcal`, 
      icon: Flame, 
      color: goal === 'deficit' ? "text-emerald-400" : goal === 'bulk' ? "text-blue-400" : "text-orange-400",
      iconBg: goal === 'deficit' 
        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" 
        : goal === 'bulk' 
          ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" 
          : "bg-orange-500/15 text-orange-400 border border-orange-500/20",
      glow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]",
      footer: goal === 'deficit' ? "Déficit calórico" : goal === 'bulk' ? "Volumen muscular" : "Mantenimiento",
      trend: { 
        value: "Objetivo", 
        color: goal === 'deficit' ? "text-emerald-400" : goal === 'bulk' ? "text-blue-400" : "text-orange-400", 
        bg: goal === 'deficit' ? "bg-emerald-500/10" : goal === 'bulk' ? "bg-blue-500/10" : "bg-orange-500/10",
        isNeutral: true 
      }
    },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex justify-end">
        <Tabs defaultValue="maintenance" onValueChange={(v: string) => setGoal(v as any)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3 bg-card/60 backdrop-blur-xl border border-white/10 p-1 rounded-xl shadow-lg">
            <TabsTrigger value="deficit" className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Déficit
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="bulk" className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              Volumen
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex overflow-x-auto pb-6 -mx-4 px-4 snap-x snap-mandatory gap-4 md:grid md:grid-cols-2 lg:grid-cols-5 md:overflow-visible md:pb-0 md:px-0 md:mx-0 no-scrollbar" data-swipe-ignore="true">
        {cards.map((card: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="min-w-[85vw] md:min-w-0 snap-center shrink-0"
          >
            <Card className={`h-full glass-card border-white/10 dark:border-white/10 ${card.glow} transition-all duration-300 relative overflow-hidden group`}>
              {/* Resplandor decorativo sutil en la esquina */}
              <div className="pointer-events-none absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors duration-500" />

              <CardContent className="p-5 flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${card.iconBg} shadow-inner`}>
                    <card.icon size={20} />
                  </div>
                  
                  {card.trend && (
                    <div className={`flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/5 ${card.trend.bg} ${card.trend.color}`}>
                      {card.trend.isUp && <ArrowUpRight size={12} className="mr-1" />}
                      {card.trend.isDown && <ArrowDownRight size={12} className="mr-1" />}
                      {card.trend.isNeutral && <Minus size={12} className="mr-1" />}
                      {card.trend.value}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em] mb-1">{card.title}</h3>
                  <p className="text-2xl font-black text-foreground tracking-tight">{card.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                    {card.footer}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}