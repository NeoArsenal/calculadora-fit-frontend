"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Check } from "lucide-react";
import { useExercises } from "../hooks/useExercises";
import ProtocolCard from "./ProtocolCard";
import { 
    Command, CommandDialog, CommandEmpty, CommandGroup, 
    CommandInput, CommandItem, CommandList 
} from "@/components/ui/command";

// 🧠 TIPO DE DATO: Así se estructura una serie
type WorkoutSet = {
    weight: string;
    reps: string;
    completed: boolean;
};

export default function WorkoutPanel({ onFinish }: { onFinish: () => void }) {
    const { exercises, loading } = useExercises();
    const [open, setOpen] = useState(false);
    const [activeExercises, setActiveExercises] = useState<any[]>([]);
    
    // 🧠 ESTADOS CRÍTICOS
    const [workoutLogs, setWorkoutLogs] = useState<Record<number, WorkoutSet[]>>({});
    const [isSaving, setIsSaving] = useState(false); // Bloquea UI mientras guarda

    // Cargar iniciales y generar 4 series vacías por cada ejercicio nuevo
    // Modifica esta parte dentro de tu useEffect
    useEffect(() => {
        if (activeExercises.length === 0 && exercises.length > 0) {
            const initialEx = exercises.slice(0, 3);
            setActiveExercises(initialEx);
            
            const initialLogs: Record<number, WorkoutSet[]> = {};
            initialEx.forEach(ex => {
                // 🔥 CAMBIO: Antes era Array(4).fill(...), ahora es []
                initialLogs[ex.id] = []; 
            });
            setWorkoutLogs(initialLogs);
        }
    }, [exercises, activeExercises.length]);

    // Función para agregar un accesorio y sus 4 series por defecto
    const addAccessory = (ex: any) => {
        setActiveExercises((prev) => [...prev, ex]);
        setWorkoutLogs((prev) => ({
            ...prev,
            [ex.id]: [] // 🔥 CAMBIO: Inicia vacío para que el usuario agregue su primer set
        }));
        setOpen(false);
    };

    // ⚙️ FUNCIONES DE CONTROL DE SERIES
    const updateSet = (exerciseId: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
        setWorkoutLogs(prev => {
            const exerciseSets = [...prev[exerciseId]];
            exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: exerciseSets };
        });
    };

    const addSet = (exerciseId: number) => {
        setWorkoutLogs(prev => ({
            ...prev,
            [exerciseId]: [...prev[exerciseId], { weight: "", reps: "", completed: false }]
        }));
    };

    // 🚀 EL CIERRE DEL ENTRENAMIENTO (Adaptado a tu Spring Boot actual)
    const handleFinishWorkout = async () => {
        // 1. Resumimos las series para que encajen con tu base de datos
        const finalData = activeExercises.map(ex => {
            const completedSets = workoutLogs[ex.id].filter(s => s.completed);
            
            // Tomamos el peso mayor y las reps de tu mejor serie para el resumen
            const maxWeight = Math.max(...completedSets.map(s => parseFloat(s.weight) || 0), 0);
            const bestReps = completedSets.length > 0 ? parseInt(completedSets[0].reps, 10) || 0 : 0;

            return {
                exerciseId: ex.id,
                exerciseName: ex.name,
                setsDone: completedSets.length, // Mandamos el total de series hechas
                repsDone: bestReps,             // Mandamos las reps
                weightUsed: maxWeight           // Mandamos el peso
            };
        }).filter(ex => ex.setsDone > 0); 

        // Validación
        if (finalData.length === 0) {
            alert("No has completado ninguna serie. ¡Anota tus pesos y dale al check verde! 🏋️‍♂️");
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                workoutDate: new Date().toISOString(),
                exerciseLogs: finalData // 👈 Spring Boot ama este nombre
            };

            console.log("📦 Payload listo para viajar:", payload);

            const response = await fetch('http://localhost:8080/api/workout-sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            alert("¡Protocolo guardado exitosamente! 🏆");
            onFinish(); 
            
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            alert("Hubo un problema al guardar.");
        } finally {
            setIsSaving(false); 
        }
    };

return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-white font-black italic uppercase text-xl tracking-tighter">
                    Protocolo_Hoy<span className="text-blue-500">:</span>
                </h2>
            </div>

            {/* 1. LISTA DE EJERCICIOS Y SUS SERIES */}
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                {activeExercises.map((ex, index) => (
                    <div key={`${ex.id}-${index}`} className="bg-secondary/10 border border-white/5 rounded-2xl p-3 space-y-4">
                        <ProtocolCard ex={ex} />

                        {/* 📊 TABLA DE SERIES */}
                        <div className="space-y-2">
                            {/* Solo mostrar cabecera si hay series */}
                            {workoutLogs[ex.id]?.length > 0 && (
                                <div className="flex text-[10px] font-black uppercase text-muted-foreground px-2">
                                    <span className="w-1/5 text-center">Set</span>
                                    <span className="w-2/5 text-center">KG</span>
                                    <span className="w-2/5 text-center">Reps</span>
                                    <span className="w-1/5 text-center flex justify-center"><Check size={14}/></span>
                                </div>
                            )}

                            {/* Filas Dinámicas o Estado Vacío */}
                            {workoutLogs[ex.id]?.length > 0 ? (
                                workoutLogs[ex.id].map((set, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${set.completed ? 'bg-blue-600/10 border border-blue-500/20' : 'bg-transparent'}`}
                                    >
                                        <span className="w-1/5 text-center text-xs font-bold text-muted-foreground">
                                            {idx + 1}
                                        </span>
                                        <input 
                                            type="number" 
                                            placeholder="-"
                                            value={set.weight}
                                            onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                                            disabled={set.completed || isSaving}
                                            className="w-2/5 bg-secondary/30 rounded-lg text-center text-xs text-white py-1.5 outline-none focus:ring-1 ring-blue-500 disabled:opacity-50" 
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="-"
                                            value={set.reps}
                                            onChange={(e) => updateSet(ex.id, idx, 'reps', e.target.value)}
                                            disabled={set.completed || isSaving}
                                            className="w-2/5 bg-secondary/30 rounded-lg text-center text-xs text-white py-1.5 outline-none focus:ring-1 ring-blue-500 disabled:opacity-50" 
                                        />
                                        <button 
                                            onClick={() => updateSet(ex.id, idx, 'completed', !set.completed)}
                                            disabled={isSaving}
                                            className={`w-1/5 flex justify-center transition-all ${set.completed ? 'text-blue-500 scale-110' : 'text-muted-foreground hover:text-white'} disabled:opacity-50`}
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                /* ✨ ESTADO VACÍO: Cuando el ejercicio no tiene sets */
                                <div className="py-6 border-2 border-dashed border-white/5 rounded-2xl text-center bg-black/10">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3">
                                        No hay series registradas
                                    </p>
                                    <button 
                                        onClick={() => addSet(ex.id)}
                                        disabled={isSaving}
                                        className="text-[10px] bg-blue-600/10 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-xl font-black uppercase hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        + Iniciar primera serie
                                    </button>
                                </div>
                            )}

                            {/* Botón para añadir serie extra (solo si ya existe al menos una) */}
                            {workoutLogs[ex.id]?.length > 0 && (
                                <button 
                                    onClick={() => addSet(ex.id)}
                                    disabled={isSaving}
                                    className="text-[10px] text-blue-500 font-bold uppercase w-full text-center pt-2 hover:text-blue-400 disabled:opacity-50"
                                >
                                    + Agregar Serie
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. BOTÓN AGREGAR ACCESORIO */}
            <button
                onClick={() => setOpen(true)}
                disabled={isSaving}
                className="w-full bg-secondary/20 hover:bg-secondary/40 border border-border text-muted-foreground py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all disabled:opacity-50"
            >
                <Plus size={14} /> Agregar Accesorio
            </button>

            {/* 3. EL BUSCADOR (Igual que antes) */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput placeholder="Buscar ejercicio en Kallp..." />
                    <CommandList className="bg-background">
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup heading="Ejercicios Disponibles">
                            {exercises.map((ex) => (
                                <CommandItem key={ex.id} onSelect={() => addAccessory(ex)} className="cursor-pointer flex items-center gap-4 p-3 aria-selected:bg-blue-600/20 data-[selected=true]:bg-secondary/40 transition-colors rounded-xl mb-1">
                                    <div className="w-24 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 relative border border-white/10 shadow-sm">
                                        <img src={ex.gifUrl} alt={ex.name} loading="lazy" className="w-full h-full object-cover mix-blend-multiply" />
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="uppercase text-xs font-black text-white">{ex.name}</span>
                                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">{ex.target || ex.bodyPart}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* 4. BOTÓN FINALIZAR */}
            <button 
                onClick={handleFinishWorkout}
                disabled={isSaving}
                className={`w-full text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-black italic uppercase tracking-widest shadow-lg transition-all mt-auto
                    ${isSaving 
                        ? 'bg-blue-800 cursor-not-allowed opacity-70' 
                        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 active:scale-95'
                    }`}
            >
                {isSaving ? (
                    <span className="animate-pulse">Guardando Protocolo...</span>
                ) : (
                    <>
                        <CheckCircle2 size={20} /> Finalizar Protocolo
                    </>
                )}
            </button>
        </div>
    );
}