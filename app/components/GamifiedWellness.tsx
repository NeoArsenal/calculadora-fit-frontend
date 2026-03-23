"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Target, Flame, Loader2 } from "lucide-react";

// ⚡️ MAPEO DE ICONOS: Convierte el texto que manda Spring Boot en componentes visuales
const iconMap: Record<string, any> = {
  Zap: Zap,
  Target: Target,
  Trophy: Trophy,
};

export default function GamifiedWellness() {
  // ⚡️ ESTADOS DE REACT PARA GUARDAR LA DATA DE SPRING BOOT
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ⚡️ EFECTO PARA TRAER LOS DATOS AL CARGAR LA PÁGINA
  useEffect(() => {
    const fetchGamification = async () => {
      try {
        // Hacemos la petición a tu backend (Ajusta el puerto si no es 8080)
        const response = await fetch("http://localhost:8080/api/users/1/gamification");
        if (!response.ok) throw new Error("Error en la red");
        
        const jsonData = await response.json();
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

  // 🟢 CUANDO YA TENEMOS LOS DATOS, CALCULAMOS EL PROGRESO
  const progressPercentage = (data.currentStreak / data.streakGoal) * 100;
  const daysLeft = data.streakGoal - data.currentStreak;

return (
    // ⚡️ LA MAGIA: bg-white para claro, dark:bg-gray-900/40 para tu estilo original oscuro
    <Card className="bg-white dark:bg-gray-900/40 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Flame className="text-orange-500 animate-pulse" size={20} />
          Gamified Wellness
        </CardTitle>
        <Badge variant="outline" className="text-orange-600 dark:text-orange-500 border-orange-500/30 bg-orange-500/10">
          Racha: {data.currentStreak} días
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-gray-500 dark:text-gray-400">Progreso para recompensa</span>
            <span className="text-gray-900 dark:text-white">{data.currentStreak}/{data.streakGoal} días</span>
          </div>
          
          {/* ⚡️ Fondo de la barra: Gris clarito en día, gris muy oscuro en noche */}
          <Progress value={progressPercentage} className="h-2 bg-gray-100 dark:bg-gray-800" />
          
          <p className="text-[10px] text-gray-500 dark:text-gray-400 italic text-right">
            {daysLeft > 0 
              ? `¡Faltan ${daysLeft} días para tu nueva medalla!` 
              : "¡Felicidades, alcanzaste la meta semanal!"}
          </p>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            Logros Desbloqueados
          </h4>
          <div className="flex gap-4 justify-around">
            {data.badges.map((badge: any) => {
              const IconComponent = iconMap[badge.icon] || Trophy; 

              return (
                <div key={badge.id} className="flex flex-col items-center gap-2 group cursor-help">
                  <div className={`p-3 rounded-full border transition-all duration-300 ${
                    badge.active 
                      ? `bg-white dark:bg-gray-800/50 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]` 
                      : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 grayscale"
                  }`}>
                    <IconComponent className={badge.active ? badge.color : "text-gray-400 dark:text-gray-700"} size={24} />
                  </div>
                  <span className={`text-[9px] font-bold ${badge.active ? "text-gray-900 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}>
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