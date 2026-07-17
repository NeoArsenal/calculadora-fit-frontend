"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Check, Dumbbell, Trash2, FastForward, ChevronLeft } from "lucide-react";
import { useExercises } from "../hooks/useExercises";
import ProtocolCard from "./ProtocolCard";
import { 
    Command, CommandDialog, CommandEmpty, CommandGroup, 
    CommandInput, CommandItem, CommandList 
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";

// 🧠 TIPO DE DATO: Así se estructura una serie
type WorkoutSet = {
    weight: string;
    reps: string;
    completed: boolean;
};

import { getAuthHeaders, saveRoutine } from "@/services/api";
import { playPop, playChime } from "@/app/utils/audio";

export default function WorkoutPanel({ onFinish, onBack, initialRoutine = null }: { onFinish: () => void, onBack?: () => void, initialRoutine?: any }) {
    const { exercises, loading } = useExercises();
    const { gainXp, refreshEcosystem, trainingSessions } = useApp();
    const [open, setOpen] = useState(false);
    const [activeExercises, setActiveExercises] = useState<any[]>([]);
    
    // 🧠 ESTADOS CRÍTICOS
    const [workoutLogs, setWorkoutLogs] = useState<Record<number, WorkoutSet[]>>({});
    const [isSaving, setIsSaving] = useState(false); 
    const [isSavingTemplate, setIsSavingTemplate] = useState(false); 
    
    // Modal de plantilla
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");

    // ⏲️ TEMPORIZADOR INTELIGENTE
    const [restTime, setRestTime] = useState<number | null>(null);
    const [maxRestTime, setMaxRestTime] = useState(90);

    // Efecto de Temporizador
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (restTime !== null && restTime > 0) {
            interval = setInterval(() => {
                setRestTime(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (restTime === 0) {
            setRestTime(null);
            playChime(); // 🔊 Sonido de finalización
        }
        return () => clearInterval(interval);
    }, [restTime]);

    // 📱 GESTOS TÁCTILES (Swipe)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 100;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchEnd - touchStart;
        const isRightSwipe = distance > minSwipeDistance;
        
        if (isRightSwipe && touchStart < 50) {
            if (onBack) onBack();
        }
    };

    // Cargar iniciales y generar series
    useEffect(() => {
        if (activeExercises.length === 0 && exercises.length > 0) {
            if (initialRoutine && initialRoutine.exercises) {
                // CARGAR DESDE PLANTILLA
                const initialEx: any[] = [];
                const initialLogs: Record<number, WorkoutSet[]> = {};
                
                initialRoutine.exercises.forEach((rx: any) => {
                    const matchedEx = exercises.find(e => e.id === rx.exercise.id);
                    if (matchedEx) {
                        initialEx.push(matchedEx);
                        // Crear las series indicadas en la plantilla
                        const sets = [];
                        for (let i = 0; i < (rx.targetSets || 1); i++) {
                            sets.push({ weight: "", reps: rx.targetReps ? String(rx.targetReps) : "", completed: false });
                        }
                        initialLogs[matchedEx.id] = sets;
                    }
                });
                setActiveExercises(initialEx);
                setWorkoutLogs(initialLogs);
            } else {
                // DEFAULT VACÍO
                setActiveExercises([]);
                setWorkoutLogs({});
            }
        }
    }, [exercises, initialRoutine, activeExercises.length]);

    // Función para agregar un accesorio y sus series por defecto
    const addAccessory = (ex: any) => {
        if (!activeExercises.find(e => e.id === ex.id)) {
            setActiveExercises((prev) => [...prev, ex]);
            setWorkoutLogs((prev) => ({
                ...prev,
                [ex.id]: [] 
            }));
        }
        setOpen(false);
    };

    // Función para eliminar un ejercicio entero de la rutina actual
    const removeExercise = (exerciseId: number) => {
        setActiveExercises(prev => prev.filter(e => e.id !== exerciseId));
        setWorkoutLogs(prev => {
            const newLogs = { ...prev };
            delete newLogs[exerciseId];
            return newLogs;
        });
    };

    // ⚙️ FUNCIONES DE CONTROL DE SERIES
    const getExercisePR = (exerciseId: number) => {
        let maxPR = 0;
        if (trainingSessions && trainingSessions.length > 0) {
            trainingSessions.forEach((session: any) => {
                if (session.logs) {
                    session.logs.forEach((log: any) => {
                        if (log.exerciseId === exerciseId && log.weightUsed > maxPR) {
                            maxPR = log.weightUsed;
                        }
                    });
                }
            });
        }
        return maxPR;
    };

    const updateSet = (exerciseId: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
        setWorkoutLogs(prev => {
            const exerciseSets = [...prev[exerciseId]];
            exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: exerciseSets };
        });

        // Activar temporizador al marcar como completado
        if (field === "completed") {
            if (value === true) {
                setRestTime(maxRestTime);
                playPop(); // 🔊 Sonido de serie completada
            } else {
                setRestTime(null); // 🛑 Desaparecer el reloj si desmarca la serie
            }
        }
    };

    const addSet = (exerciseId: number) => {
        setWorkoutLogs(prev => ({
            ...prev,
            [exerciseId]: [...prev[exerciseId], { weight: "", reps: "", completed: false }]
        }));
    };

    // ABRIR EL MODAL DE GUARDAR PLANTILLA
    const promptSaveTemplate = () => {
        if (activeExercises.length === 0) {
            toast.error("Agrega al menos un ejercicio.");
            return;
        }
        setTemplateName("");
        setIsTemplateModalOpen(true);
    };

    // GUARDAR COMO PLANTILLA (Confirmación desde el Modal)
    const handleSaveTemplate = async () => {
        if (!templateName.trim()) {
            toast.error("Por favor, ingresa un nombre para la plantilla.");
            return;
        }

        setIsSavingTemplate(true);
        try {
            const templateData = {
                name: templateName,
                exercises: activeExercises.map(ex => {
                    const sets = workoutLogs[ex.id] || [];
                    return {
                        exerciseId: ex.id,
                        targetSets: Math.max(1, sets.length),
                        targetReps: sets.length > 0 ? parseInt(sets[0].reps, 10) || 10 : 10
                    };
                })
            };

            await saveRoutine(templateData);
            await refreshEcosystem(); // Recargar rutinas globalmente
            toast.success("¡Plantilla guardada exitosamente!");
            setIsTemplateModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la plantilla.");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // 🚀 EL CIERRE DEL ENTRENAMIENTO 
    const handleFinishWorkout = async () => {
        const finalData = activeExercises.map(ex => {
            // UX MEJORA: Si escribieron peso y reps pero olvidaron darle al check, lo tomamos como completado igual.
            const completedSets = workoutLogs[ex.id].filter(s => 
                s.completed || (String(s.weight).trim() !== "" && String(s.reps).trim() !== "")
            );
            
            const maxWeight = Math.max(...completedSets.map(s => parseFloat(String(s.weight)) || 0), 0);
            const bestReps = completedSets.length > 0 ? parseInt(String(completedSets[0].reps), 10) || 0 : 0;

            return {
                exerciseId: ex.id,
                exerciseName: ex.name,
                setsDone: completedSets.length, 
                repsDone: bestReps,             
                weightUsed: maxWeight           
            };
        }).filter(ex => ex.setsDone > 0); 

        if (finalData.length === 0) {
            toast.error("Rutina vacía. Escribe tus pesos y repeticiones antes de finalizar.", {
                description: "Debes llenar al menos una serie para poder guardar el entrenamiento."
            });
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                workoutDate: new Date().toISOString(),
                exerciseLogs: finalData
            };

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
            const response = await fetch(`${apiUrl}/workout-sessions`, {
                method: 'POST',
                headers: getAuthHeaders(true),
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            toast.success("¡Protocolo guardado exitosamente! 🏆");
            gainXp(20);
            onFinish(); 
            
        } catch (error) {
            console.error("❌ Error de conexión:", error);
            toast.error("Hubo un problema al guardar.");
        } finally {
            setIsSaving(false); 
        }
    };

return (
        <div 
            className="space-y-6 flex flex-col h-full touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="flex justify-between items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="bg-gray-100 dark:bg-secondary/30 hover:bg-gray-200 dark:hover:bg-secondary/50 text-gray-700 dark:text-gray-300 p-2 rounded-xl transition-colors active:scale-95"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <h2 className="text-gray-900 dark:text-white font-black italic uppercase text-3xl md:text-4xl tracking-tighter transition-colors">
                        {initialRoutine ? initialRoutine.name : "RUTINA LIBRE"}<span className="text-blue-500">_</span>
                    </h2>
                </div>
            </div>

            {/* 1. LISTA DE EJERCICIOS Y SUS SERIES */}
            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar max-h-[60vh] pb-10">
                {activeExercises.map((ex, index) => (
                    <div key={`${ex.id}-${index}`} className="bg-gray-50/50 dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-4 space-y-6 shadow-sm transition-colors duration-300">
                        
                        <ProtocolCard ex={ex} onRemove={() => removeExercise(ex.id)} />

                        {/* 📊 TABLA DE SERIES */}
                        <div className="space-y-2">
                            {/* Solo mostrar cabecera si hay series */}
                            {workoutLogs[ex.id]?.length > 0 && (
                                <div className="flex text-[10px] font-black uppercase text-gray-400 dark:text-muted-foreground px-2 tracking-widest">
                                    <span className="w-1/5 text-center">Set</span>
                                    <span className="w-2/5 text-center">KG</span>
                                    <span className="w-2/5 text-center">Reps</span>
                                    <span className="w-1/5 text-center flex justify-center"><Check size={14}/></span>
                                </div>
                            )}

                            {/* Filas Dinámicas o Estado Vacío */}
                            {workoutLogs[ex.id]?.length > 0 ? (
                                workoutLogs[ex.id].map((set, idx) => {
                                    const currentPR = getExercisePR(ex.id);
                                    const currentWeight = parseFloat(set.weight) || 0;
                                    const isPR = currentWeight > 0 && (currentPR === 0 || currentWeight >= currentPR);

                                    return (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center gap-3 px-2 py-2 rounded-xl transition-all ${set.completed ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20' : 'bg-transparent'}`}
                                        >
                                            <span className="w-1/5 text-center text-xs font-bold text-gray-500 dark:text-muted-foreground">
                                                {idx + 1}
                                            </span>
                                            
                                            <div className="w-2/5 relative flex items-center justify-center">
                                                <input 
                                                    type="number" 
                                                    placeholder="-"
                                                    value={set.weight}
                                                    onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                                                    disabled={set.completed || isSaving}
                                                    className="w-full bg-white dark:bg-secondary/30 border border-gray-200 dark:border-transparent rounded-lg text-center text-xs font-black text-gray-900 dark:text-white py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm" 
                                                />
                                                {isPR && (
                                                    <span className="absolute -top-2.5 -right-2 bg-gradient-to-br from-orange-400 to-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-lg shadow-orange-500/50 animate-bounce pointer-events-none">
                                                        🔥 PR
                                                    </span>
                                                )}
                                            </div>

                                        <input 
                                            type="number" 
                                            placeholder="-"
                                            value={set.reps}
                                            onChange={(e) => updateSet(ex.id, idx, 'reps', e.target.value)}
                                            disabled={set.completed || isSaving}
                                            className="w-2/5 bg-white dark:bg-secondary/30 border border-gray-200 dark:border-transparent rounded-lg text-center text-xs font-black text-gray-900 dark:text-white py-2 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm" 
                                        />
                                        <button 
                                            onClick={() => updateSet(ex.id, idx, 'completed', !set.completed)}
                                            disabled={isSaving}
                                            className={`w-1/5 flex justify-center transition-all ${set.completed ? 'text-blue-500 scale-110' : 'text-gray-300 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white'} disabled:opacity-50`}
                                        >
                                            <CheckCircle2 size={20} />
                                        </button>
                                    </div>
                                    );
                                })
                            ) : (
                                /* ✨ ESTADO VACÍO: Cuando el ejercicio no tiene sets */
                                <div className="py-8 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-center bg-white dark:bg-black/10 transition-colors shadow-sm">
                                    <p className="text-[10px] text-gray-500 dark:text-muted-foreground uppercase font-black tracking-widest mb-4">
                                        No hay series registradas
                                    </p>
                                    <button 
                                        onClick={() => addSet(ex.id)}
                                        disabled={isSaving}
                                        className="text-[10px] bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-6 py-2.5 rounded-xl font-black uppercase hover:bg-blue-100 dark:hover:bg-blue-600/20 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
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
                
                {/* ✨ EMPTY STATE GLOBAL: CUANDO NO HAY NINGÚN EJERCICIO EN LA RUTINA */}
                {activeExercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Dumbbell size={32} />
                        </div>
                        <h3 className="text-lg font-black italic uppercase text-gray-900 dark:text-white mb-2 tracking-widest">
                            Rutina Vacía
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-muted-foreground max-w-[250px] mx-auto leading-relaxed font-medium">
                            Aún no tienes ejercicios en este protocolo. Haz clic en "Agregar Accesorio" para empezar a construir tu entrenamiento de hoy.
                        </p>
                    </div>
                )}
            </div>

            {/* 2. BOTÓN AGREGAR ACCESORIO */}
            <button
                onClick={() => setOpen(true)}
                disabled={isSaving}
                className="w-full bg-white dark:bg-secondary/20 hover:bg-gray-50 dark:hover:bg-secondary/40 border border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground py-4 rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-sm disabled:opacity-50"
            >
                <Plus size={16} /> Agregar Accesorio
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
                                    <div className="w-24 h-14 bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                                        {ex.gifUrl ? (
                                            <img src={ex.gifUrl} alt={ex.name} loading="lazy" className="w-full h-full object-cover mix-blend-multiply" />
                                        ) : (
                                            <Dumbbell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="uppercase text-xs font-black text-gray-900 dark:text-white">{ex.name}</span>
                                        <span className="text-[9px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider">{ex.target || ex.bodyPart}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* 4. BOTONES FINALES */}
            <div className="flex gap-3 mt-4">
                <button 
                    onClick={promptSaveTemplate}
                    disabled={isSaving || isSavingTemplate}
                    className={`w-[35%] bg-gray-100 dark:bg-[#111113] hover:bg-gray-200 dark:hover:bg-[#1a1a1d] border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-400 py-4 px-2 rounded-[1.2rem] flex flex-col items-center justify-center gap-1 font-black text-[9px] uppercase tracking-[0.15em] leading-tight transition-all shadow-sm
                        ${isSavingTemplate ? 'cursor-not-allowed opacity-70' : 'active:scale-95'}`}
                >
                    {isSavingTemplate ? "..." : (
                        <>
                            <span>Guardar</span>
                            <span>Plantilla</span>
                        </>
                    )}
                </button>

                <button 
                    onClick={handleFinishWorkout}
                    disabled={isSaving || isSavingTemplate}
                    className={`flex-1 text-white py-4 px-4 rounded-[1.2rem] flex items-center justify-center gap-2 font-black italic uppercase text-xs tracking-[0.15em] shadow-lg transition-all
                        ${isSaving || isSavingTemplate 
                            ? 'bg-blue-800 cursor-not-allowed opacity-70' 
                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 active:scale-95'
                        }`}
                >
                    {isSaving ? (
                        <span className="animate-pulse">Guardando...</span>
                    ) : (
                        <>
                            <CheckCircle2 size={16} className="text-white/80" /> Finalizar Protocolo
                        </>
                    )}
                </button>
            </div>

            {/* MODAL PARA GUARDAR PLANTILLA */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">Guardar Plantilla</DialogTitle>
                        <DialogDescription className="text-gray-500 dark:text-muted-foreground text-xs font-medium">
                            Ponle un nombre épico a tu rutina para volver a usarla después. (ej: Día de Pierna, Pecho Pesado)
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Input 
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Nombre de la plantilla..."
                            className="bg-gray-50 dark:bg-secondary/30 border-gray-200 dark:border-white/10 rounded-xl focus-visible:ring-blue-500 font-bold text-gray-900 dark:text-white h-12 px-4"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTemplate();
                            }}
                            autoFocus
                        />
                    </div>
                    
                    <DialogFooter className="sm:justify-end gap-3 mt-4">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => setIsTemplateModalOpen(false)}
                            className="rounded-xl text-xs font-black tracking-widest uppercase hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate}
                            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all h-10 px-6"
                        >
                            {isSavingTemplate ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ⏱️ TEMPORIZADOR INTELIGENTE UI */}
            {restTime !== null && (
                <div className="fixed top-20 right-4 md:top-24 md:right-12 bg-gray-900/90 dark:bg-[#0a0a0b]/95 backdrop-blur-xl border border-white/20 dark:border-white/10 p-3 rounded-3xl shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-8 duration-500">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" className="stroke-white/10 dark:stroke-white/5" strokeWidth="8" fill="none" />
                            <circle 
                                cx="50" cy="50" r="45" 
                                className={`transition-all duration-1000 ease-linear ${restTime <= 10 ? 'stroke-red-500' : restTime <= maxRestTime / 2 ? 'stroke-orange-500' : 'stroke-blue-500'}`} 
                                strokeWidth="8" fill="none" strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * restTime) / Math.max(maxRestTime, 1)}
                            />
                        </svg>
                        <span className="absolute text-white font-black text-lg tabular-nums">
                            {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setRestTime(prev => Math.max(0, prev! - 30))}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 text-xs font-black transition-colors"
                            >
                                -30s
                            </button>
                            <button 
                                onClick={() => {
                                    setRestTime(prev => {
                                        const newTime = Math.min(180, prev! + 30);
                                        if (newTime > maxRestTime) setMaxRestTime(newTime);
                                        return newTime;
                                    });
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 text-xs font-black transition-colors"
                            >
                                +30s
                            </button>
                        </div>
                        <button 
                            onClick={() => setRestTime(null)}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-500 border border-red-500/50 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
                        >
                            <FastForward size={12} strokeWidth={3} /> Saltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}