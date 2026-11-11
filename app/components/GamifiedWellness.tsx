"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/context/AppContext";
import { getGamification } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Target, Flame, Loader2, Star } from "lucide-react";

// ⚡️ MAPEO DE ICONOS: Convierte el texto que manda Spring Boot en componentes visuales
const iconMap: Record<string, any> = {
  Zap: Zap,
  Target: Target,
  Trophy: Trophy,
};

export default function GamifiedWellness() {
  const { CURRENT_USER_ID } = useApp();
  
  // ⚡️ ESTADOS DE REACT PARA GUARDAR LA DATA DE SPRING BOOT
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⚡️ EFECTO PARA TRAER LOS DATOS AL CARGAR LA PÁGINA
  useEffect(() => {
    if (!CURRENT_USER_ID) return;
    
    const fetchGamification = async () => {
      try {
        const jsonData = await getGamification(CURRENT_USER_ID);
        setData(jsonData);
      } catch (error) {
        console.error("Error al obtener gamificación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGamification();
  }, []);

  // 🔴 MIENTRAS CARGA, MOSTRAMOS UN SPINNER ELEGANTE
  if (loading || !data) {
    return (
      <Card className="bg-gray-900/40 backdrop-blur-md border-gray-800 shadow-2xl overflow-hidden h-full flex items-center justify-center min-h-[250px]">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={30} />
          <span className="text-xs font-bold uppercase tracking-widest">Calculando Rachas...</span>
        </div>
      </Card>
    );
  }

  // 🟢 CALCULAMOS PROGRESOS
  const streakPercentage = (data.currentStreak / data.streakGoal) * 100;
  const xpPercentage = (data.xp / data.nextLevelXp) * 100;
  const daysLeft = data.streakGoal - data.currentStreak;

  return (
    <Card className="glass-card border-white/10 dark:border-white/10 shadow-2xl overflow-hidden h-full flex flex-col relative group">
      <div className="pointer-events-none absolute -top-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/15 transition-all duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Flame className="text-orange-500 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]" size={20} />
          Gamified Wellness
        </CardTitle>
        <Badge variant="outline" className="text-orange-400 border-orange-500/30 bg-orange-500/10 font-bold px-2.5 py-0.5 rounded-full">
          Racha: {data.currentStreak} días
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col justify-between relative z-10">
        
        {/* 🌟 SECCIÓN 1: NIVEL Y XP */}
        <div className="space-y-3 bg-white/5 dark:bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 text-blue-400 font-black text-xs px-2.5 py-1 rounded-md border border-blue-500/30 shadow-inner">
                LVL {data.level}
              </div>
              <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                {data.rankName}
              </span>
            </div>
            <span className="text-xs font-bold text-muted-foreground">
              {data.xp} / {data.nextLevelXp} XP
            </span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-700" 
              style={{ width: `${Math.min(xpPercentage, 100)}%` }} 
            />
          </div>
        </div>

        {/* 🔥 SECCIÓN 2: RACHA DE CONSTANCIA */}
        <div className="space-y-2.5 px-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Target size={14} className="text-orange-400" /> Constancia Semanal
            </span>
            <span className="text-foreground font-bold">{data.currentStreak} / {data.streakGoal} días</span>
          </div>
          
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-700" 
              style={{ width: `${Math.min(streakPercentage, 100)}%` }} 
            />
          </div>
          
          <p className="text-[10px] text-muted-foreground italic text-right">
            {daysLeft > 0 
              ? `¡Faltan ${daysLeft} días para tu próxima recompensa!` 
              : "¡Felicidades, alcanzaste la meta semanal!"}
          </p>
        </div>

        {/* 🏆 SECCIÓN 3: LOGROS DESBLOQUEADOS */}
        <div className="pt-1 px-1">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
            <Star size={12} className="text-amber-400" /> Logros Obtenidos
          </h4>
          <div className="flex gap-4 justify-around">
            {data.badges.map((badge: any) => {
              const IconComponent = iconMap[badge.icon] || Trophy; 

              return (
                <div key={badge.id} className="flex flex-col items-center gap-2 group/badge cursor-pointer transition-transform hover:scale-110">
                  <div className={`p-3 rounded-2xl border transition-all duration-300 ${
                    badge.active 
                      ? `bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]` 
                      : "bg-white/5 border-white/5 opacity-40 grayscale"
                  }`}>
                    <IconComponent className={badge.active ? badge.color : "text-muted-foreground"} size={22} />
                  </div>
                  <span className={`text-[9px] font-bold ${badge.active ? "text-foreground" : "text-muted-foreground"}`}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}