"use client";

import React, { useMemo } from "react";

// ⚡️ Función para generar datos simulados de 6 meses (24 semanas aprox)
const generateMockData = () => {
  const data = [];
  const weeks = 26; // 6 meses
  const daysInWeek = 7;

  for (let i = 0; i < weeks * daysInWeek; i++) {
    // Simulamos que el usuario entrena el 60% de los días
    const isTrainingDay = Math.random() > 0.4;
    // Si entrena, le damos una intensidad del 1 al 4
    const intensity = isTrainingDay ? Math.floor(Math.random() * 4) + 1 : 0;
    data.push({ id: i, intensity });
  }
  return data;
};

export default function WorkoutHeatmap() {
  // Memorizamos los datos para que no cambien en cada renderizado de React
  const days = useMemo(() => generateMockData(), []);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // ⚡️ Diccionario de colores basado en tu mockup (Soporta Dark/Light Mode)
  const getColor = (intensity: number) => {
    switch (intensity) {
      case 1: return "bg-blue-200 dark:bg-blue-900/50";
      case 2: return "bg-blue-300 dark:bg-blue-600/60";
      case 3: return "bg-blue-500";
      case 4: return "bg-blue-400";
      default: return "bg-gray-100 dark:bg-gray-800/50"; // Día de descanso (Vacío)
    }
  };

return (
    // ⚡️ FIX 1: justify-center para que todo el bloque se vaya al medio de la pantalla
    <div className="w-full flex justify-center overflow-x-auto pb-2">
      
      <div className="flex">
        {/* 1. ETIQUETAS DE DÍAS (Izquierda) */}
        <div className="flex flex-col justify-between text-[9px] font-bold text-muted-foreground mr-4 py-[2px] h-[140px] uppercase">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>

        {/* 2. CONTENEDOR PRINCIPAL */}
        <div className="flex flex-col gap-2 min-w-max">
          
          {/* ETIQUETAS DE MESES (Arriba) */}
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            {months.map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>

          {/* ⚡️ EL GRID MÁGICO */}
          {/* FIX 2: gap-1 para más aire, w-[16px] h-[16px] para que sean más grandes */}
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {days.map((day) => (
              <div
                key={day.id}
                className={`w-[16px] h-[16px] rounded-[3px] transition-all duration-300 hover:ring-2 hover:ring-ring cursor-pointer hover:scale-110 ${getColor(day.intensity)}`}
                title={`Nivel de intensidad: ${day.intensity}`}
              ></div>
            ))}
          </div>
          
        </div>
      </div>
      
    </div>
  );
}