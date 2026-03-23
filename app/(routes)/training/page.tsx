"use client";

import { useState, useEffect, useCallback } from "react";
import RoutinePlanner from "./components/RoutinePlanner";
import WorkoutPanel from "./components/WorkoutPanel";
import StrengthProgression from "./components/StrengthProgression";
import { Play, Loader2 } from "lucide-react";

// 📡 Función interna para obtener las sesiones (Centralizada aquí)
async function getWorkoutSessions() {
    const res = await fetch("http://localhost:8080/api/workout-sessions");
    if (!res.ok) throw new Error("Error al cargar historial");
    return res.json();
}

export default function TrainingPage() {
    // 🧠 ESTADOS MAESTROS
    const [isTrainingActive, setIsTrainingActive] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]); // 🔥 Aquí guardamos TODA la data
    const [loading, setLoading] = useState(true); // Estado de carga inicial

    // 🔄 Función para cargar/recargar datos (Envuelta en useCallback para eficiencia)
    const loadSessions = useCallback(() => {
        setLoading(true);
        getWorkoutSessions()
            .then(setSessions)
            .catch(err => console.error("❌ Error en Kallp Dashboard:", err))
            .finally(() => setLoading(false));
    }, []);

    // 1. Cargar datos al montar la página
    useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    // 2. Función que se ejecuta al presionar "Finalizar Protocolo"
    const handleFinish = () => {
        setIsTrainingActive(false); // Volvemos al Dashboard
        loadSessions(); // 🔄 ¡RECARGA AUTOMÁTICA! Sin F5, pedimos los datos nuevos a Spring Boot
    };

    // --- RENDERIZADO MODO ENFOQUE ---
    if (isTrainingActive) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 animate-in slide-in-from-bottom-10 duration-500">
                <WorkoutPanel onFinish={handleFinish} />
            </div>
        );
    }

// --- RENDERIZADO DASHBOARD ---
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Cabecera del Dashboard */}
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                        Kallp: Dashboard<span className="text-blue-500">_</span>
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                        Control de Sesiones y Progreso
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsTrainingActive(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-black italic uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex-shrink-0"
                >
                    <Play size={18} fill="currentColor" /> Iniciar Protocolo
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando con Kallp Cloud...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* 📅 CALENDARIO Y DETALLES (Ocupa todo el ancho superior) */}
                    <div className="md:col-span-12">
                        <RoutinePlanner sessions={sessions} /> 
                    </div>

                    {/* 📊 GRÁFICO DE PROGRESO (Ahora lo centramos o le damos más peso) */}
                    {/* Lo ponemos en col-span-12 si quieres que sea gigante y detallado, 
                        o col-span-8 si planeas poner algo pequeño al lado luego */}
                    <div className="md:col-span-12 lg:col-span-8 mx-auto w-full">
                        <StrengthProgression sessions={sessions} />
                    </div>

                </div>
            )}
        </div>
    );
}