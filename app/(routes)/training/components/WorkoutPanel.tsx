"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { 
    Plus, CheckCircle2, Check, Dumbbell, Trash2, FastForward, 
    ChevronLeft, MoreVertical, Clock, Bookmark, Flame 
} from "lucide-react";
import { useExercises } from "../hooks/useExercises";
import { 
    Command, CommandDialog, CommandEmpty, CommandGroup, 
    CommandInput, CommandItem, CommandList 
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp } from "@/app/context/AppContext";
import { getAuthHeaders, saveRoutine } from "@/services/api";
import { playPop, playChime } from "@/app/utils/audio";

// 🧠 TIPO DE DATO: Estructura de cada serie
type WorkoutSet = {
    weight: string;
    reps: string;
    completed: boolean;
};

// ⚡ FILA DE SERIE DESLIZABLE (Swipe to Delete sin sangrado de borde rojo)
function SwipeableSetRow({
    set,
    setIdx,
    exId,
    previousRecord,
    isPR,
    isSaving,
    onUpdateSet,
    onRemoveSet,
}: {
    set: WorkoutSet;
    setIdx: number;
    exId: number;
    previousRecord: string;
    isPR: boolean;
    isSaving: boolean;
    onUpdateSet: (field: keyof WorkoutSet, value: string | boolean) => void;
    onRemoveSet: () => void;
}) {
    const x = useMotionValue(0);
    // En reposo (x entre 0 y -8px) la opacidad es estrictamente 0: jamás se verá un borde rojo
    const bgOpacity = useTransform(x, [0, -8, -50], [0, 0, 1]);
    const iconScale = useTransform(x, [-15, -75], [0.75, 1.05]);

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Capa roja trasera: invisible en reposo y con inset-[2px] para nunca sobresalir del borde */}
            <motion.div
                style={{ opacity: bgOpacity }}
                className="pointer-events-none absolute inset-[2px] bg-rose-600 rounded-xl flex items-center justify-end px-5 z-0"
            >
                <motion.div
                    style={{ scale: iconScale }}
                    className="flex items-center gap-1.5 text-white font-bold text-xs"
                >
                    <Trash2 size={16} />
                    <span>Eliminar</span>
                </motion.div>
            </motion.div>

            {/* Fila frontal con fondo sólido opaco para tapar por completo la capa trasera */}
            <motion.div
                style={{ x }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.65, right: 0 }}
                onDragEnd={(_, info) => {
                    if (info.offset.x < -75 || info.velocity.x < -400) {
                        onRemoveSet();
                    }
                }}
                className={`relative z-10 grid grid-cols-12 gap-2 items-center p-2 rounded-2xl border transition-colors ${
                    set.completed
                        ? 'bg-[#e8fbf3] dark:bg-[#0d221c] border-emerald-500/30'
                        : 'bg-[#f8fafc] dark:bg-[#18181b] border-border dark:border-white/5'
                }`}
            >
                {/* SERIE (Píldora) */}
                <div className="col-span-2 flex justify-center">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black border ${
                        set.completed 
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40' 
                            : setIdx === 0 
                                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400 border-blue-500/30' 
                                : 'bg-muted dark:bg-white/5 text-muted-foreground border-border dark:border-white/10'
                    }`}>
                        {setIdx + 1}
                    </span>
                </div>

                {/* ANTERIOR */}
                <div className="col-span-3 text-center text-xs font-semibold text-muted-foreground truncate">
                    {previousRecord}
                </div>

                {/* KG INPUT */}
                <div className="col-span-3 relative flex items-center justify-center">
                    <input 
                        type="number" 
                        step="0.5"
                        placeholder="-"
                        value={set.weight}
                        onChange={(e) => onUpdateSet('weight', e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={set.completed || isSaving}
                        className="w-full bg-background dark:bg-black/40 border border-border dark:border-white/10 rounded-xl text-center text-sm font-black text-foreground py-2 outline-none focus:border-blue-500 transition-all shadow-inner disabled:opacity-50" 
                    />
                    {isPR && (
                        <span className="absolute -top-2 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-lg pointer-events-none">
                            PR
                        </span>
                    )}
                </div>

                {/* REPS INPUT */}
                <div className="col-span-2 flex items-center justify-center">
                    <input 
                        type="number" 
                        placeholder="-"
                        value={set.reps}
                        onChange={(e) => onUpdateSet('reps', e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={set.completed || isSaving}
                        className="w-full bg-background dark:bg-black/40 border border-border dark:border-white/10 rounded-xl text-center text-sm font-black text-foreground py-2 outline-none focus:border-blue-500 transition-all shadow-inner disabled:opacity-50" 
                    />
                </div>

                {/* HECHO CHECKBOX */}
                <div className="col-span-2 flex justify-center">
                    <button 
                        onClick={() => onUpdateSet('completed', !set.completed)}
                        onPointerDown={(e) => e.stopPropagation()}
                        disabled={isSaving}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                            set.completed 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                                : 'bg-muted/60 dark:bg-black/40 border border-border dark:border-white/10 text-muted-foreground hover:border-blue-500/40 hover:text-foreground'
                        }`}
                        title="Marcar serie completada"
                    >
                        <Check size={18} strokeWidth={3} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function WorkoutPanel({ 
    onFinish, 
    onBack, 
    initialRoutine = null 
}: { 
    onFinish: () => void; 
    onBack?: () => void; 
    initialRoutine?: any;
}) {
    const { exercises } = useExercises();
    const { gainXp, refreshEcosystem, trainingSessions } = useApp();
    const [open, setOpen] = useState(false);
    const [activeExercises, setActiveExercises] = useState<any[]>([]);
    
    // 🧠 ESTADOS DE ENTRENAMIENTO
    const [workoutLogs, setWorkoutLogs] = useState<Record<number, WorkoutSet[]>>({});
    const [isSaving, setIsSaving] = useState(false); 
    const [isSavingTemplate, setIsSavingTemplate] = useState(false); 
    
    // Modal de plantilla
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");

    // Modal de tiempo de descanso
    const [isRestModalOpen, setIsRestModalOpen] = useState(false);

    // ⏱️ CRONÓMETRO DE SESIÓN ACTIVA (Cuenta progresiva)
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatElapsedTime = (totalSecs: number) => {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`;
    };

    // ⏲️ TEMPORIZADOR DE DESCANSO AUTOMÁTICO
    const [restTime, setRestTime] = useState<number | null>(null);
    const [maxRestTime, setMaxRestTime] = useState(90);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (restTime !== null && restTime > 0) {
            interval = setInterval(() => {
                setRestTime(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (restTime === 0) {
            setRestTime(null);
            playChime();
            toast.info("¡Descanso terminado! Es hora de la siguiente serie ⚡");
        }
        return () => clearInterval(interval);
    }, [restTime]);

    // 📱 GESTOS TÁCTILES (Swipe para volver atrás)
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

    // CARGAR EJERCICIOS INICIALES (Plantilla o vacíos)
    useEffect(() => {
        if (activeExercises.length === 0 && exercises.length > 0) {
            if (initialRoutine && initialRoutine.exercises) {
                const initialEx: any[] = [];
                const initialLogs: Record<number, WorkoutSet[]> = {};
                
                initialRoutine.exercises.forEach((rx: any) => {
                    const matchedEx = exercises.find(e => e.id === rx.exercise?.id || e.id === rx.exerciseId);
                    if (matchedEx) {
                        initialEx.push(matchedEx);
                        const sets: WorkoutSet[] = [];
                        for (let i = 0; i < (rx.targetSets || 1); i++) {
                            sets.push({ 
                                weight: "", 
                                reps: rx.targetReps ? String(rx.targetReps) : "", 
                                completed: false 
                            });
                        }
                        initialLogs[matchedEx.id] = sets;
                    }
                });
                setActiveExercises(initialEx);
                setWorkoutLogs(initialLogs);
            }
        }
    }, [exercises, initialRoutine, activeExercises.length]);

    // Agregar ejercicio
    const addAccessory = (ex: any) => {
        if (!activeExercises.find(e => e.id === ex.id)) {
            setActiveExercises(prev => [...prev, ex]);
            setWorkoutLogs(prev => ({
                ...prev,
                [ex.id]: [] 
            }));
        }
        setOpen(false);
    };

    // Eliminar ejercicio de la sesión
    const removeExercise = (exerciseId: number) => {
        setActiveExercises(prev => prev.filter(e => e.id !== exerciseId));
        setWorkoutLogs(prev => {
            const newLogs = { ...prev };
            delete newLogs[exerciseId];
            return newLogs;
        });
    };

    // OBTENER MARCA ANTERIOR (Columna ANTERIOR)
    const getPreviousRecord = (exerciseId: number): string => {
        if (!trainingSessions || trainingSessions.length === 0) return "—";
        
        const sorted = [...trainingSessions].sort((a: any, b: any) => 
            new Date(b.workoutDate || b.date || 0).getTime() - new Date(a.workoutDate || a.date || 0).getTime()
        );

        for (const session of sorted) {
            const logs = session.logs || session.exerciseLogs || [];
            const match = logs.find((l: any) => l.exerciseId === exerciseId || l.exercise?.id === exerciseId);
            if (match) {
                const w = match.weightUsed || match.weight || 0;
                const r = match.repsDone || match.reps || 0;
                if (w > 0 && r > 0) return `${w} kg × ${r}`;
                if (w > 0) return `${w} kg`;
                if (r > 0) return `${r} reps`;
            }
        }
        return "—";
    };

    // OBTENER PR MÁXIMO HISTÓRICO
    const getExercisePR = (exerciseId: number) => {
        let maxPR = 0;
        if (trainingSessions && trainingSessions.length > 0) {
            trainingSessions.forEach((session: any) => {
                const logs = session.logs || session.exerciseLogs || [];
                logs.forEach((log: any) => {
                    if ((log.exerciseId === exerciseId || log.exercise?.id === exerciseId) && log.weightUsed > maxPR) {
                        maxPR = log.weightUsed;
                    }
                });
            });
        }
        return maxPR;
    };

    // GESTIÓN DE SERIES
    const updateSet = (exerciseId: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
        setWorkoutLogs(prev => {
            const exerciseSets = [...(prev[exerciseId] || [])];
            exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: value };
            return { ...prev, [exerciseId]: exerciseSets };
        });

        // Al marcar como completada la serie -> Iniciar cronómetro de descanso
        if (field === "completed") {
            if (value === true) {
                setRestTime(maxRestTime);
                playPop();
            } else {
                setRestTime(null);
            }
        }
    };

    const addSet = (exerciseId: number) => {
        setWorkoutLogs(prev => {
            const currentSets = prev[exerciseId] || [];
            const lastSet = currentSets[currentSets.length - 1];
            return {
                ...prev,
                [exerciseId]: [
                    ...currentSets, 
                    { 
                        weight: lastSet ? lastSet.weight : "", 
                        reps: lastSet ? lastSet.reps : "", 
                        completed: false 
                    }
                ]
            };
        });
    };

    const removeSet = (exerciseId: number, setIndex: number) => {
        setWorkoutLogs(prev => {
            const exerciseSets = [...(prev[exerciseId] || [])];
            exerciseSets.splice(setIndex, 1);
            return { ...prev, [exerciseId]: exerciseSets };
        });
    };

    // GUARDAR COMO PLANTILLA
    const promptSaveTemplate = () => {
        if (activeExercises.length === 0) {
            toast.error("Agrega al menos un ejercicio antes de guardar como plantilla.");
            return;
        }
        setTemplateName(initialRoutine ? initialRoutine.name : "");
        setIsTemplateModalOpen(true);
    };

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
            await refreshEcosystem();
            toast.success("¡Plantilla guardada exitosamente! 💾");
            setIsTemplateModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la plantilla.");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // FINALIZAR ENTRENAMIENTO
    const handleFinishWorkout = async () => {
        const finalData = activeExercises.map(ex => {
            const sets = workoutLogs[ex.id] || [];
            const completedSets = sets.filter(s => 
                s.completed || (String(s.weight).trim() !== "" && String(s.reps).trim() !== "")
            );
            
            const maxWeight = Math.max(...completedSets.map(s => parseFloat(String(s.weight)) || 0), 0);
            const bestReps = completedSets.length > 0 ? parseInt(String(completedSets[0].reps), 10) || 0 : 0;

            return {
                exerciseId: ex.id,
                exerciseName: ex.name,
                setsDone: completedSets.length,
                repsDone: bestReps > 0 ? bestReps : 10,
                weightUsed: maxWeight,
                sets: completedSets.map((s, idx) => ({
                    setNumber: idx + 1,
                    weightKg: parseFloat(String(s.weight)) || 0,
                    reps: parseInt(String(s.reps), 10) || 0,
                    completed: true
                }))
            };
        }).filter(ex => ex.setsDone > 0);

        if (finalData.length === 0) {
            toast.error("No has completado ninguna serie de ejercicio.");
            return;
        }

        setIsSaving(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const payload = {
                workoutDate: new Date().toISOString().slice(0, 19),
                routineId: initialRoutine?.id || null,
                exerciseLogs: finalData
            };

            const response = await fetch(`${baseUrl}/workout-sessions`, {
                method: "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                playChime();
                gainXp(20);
                toast.success("¡Entrenamiento guardado con éxito! 🏆");
                await refreshEcosystem();
                onFinish();
            } else {
                toast.error("Error al registrar la sesión en la nube.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error de conexión con el servidor.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="min-h-screen bg-background text-foreground p-3 md:p-6 pb-32 transition-colors relative"
        >
            {/* 🔴 HEADER SUPERIOR FLOTANTE CON CRONÓMETRO */}
            <header className="sticky top-0 z-40 bg-background/90 dark:bg-[#0a0a0b]/90 backdrop-blur-2xl border-b border-border dark:border-white/10 -mx-3 md:-mx-6 px-4 py-3 mb-5 flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-muted/60 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-muted dark:hover:bg-white/10 text-foreground flex items-center justify-center transition-all active:scale-95"
                    title="Volver"
                >
                    <ChevronLeft size={22} />
                </button>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5">
                        <h2 className="text-sm md:text-base font-black text-foreground tracking-tight">
                            {initialRoutine ? initialRoutine.name : "Rutina libre"}
                        </h2>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 px-3 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                        <Clock size={12} />
                        <span>{formatElapsedTime(elapsedSeconds)}</span>
                    </div>
                </div>

                <button 
                    onClick={promptSaveTemplate}
                    className="w-10 h-10 rounded-full bg-muted/60 dark:bg-white/5 border border-border dark:border-white/10 hover:bg-muted dark:hover:bg-white/10 text-foreground flex items-center justify-center transition-all active:scale-95"
                    title="Opciones"
                >
                    <MoreVertical size={18} />
                </button>
            </header>

            {/* 🔴 LISTA DE TARJETAS DE EJERCICIOS */}
            <div className="space-y-6 max-w-2xl mx-auto">
                {activeExercises.map((ex, exIndex) => {
                    const sets = workoutLogs[ex.id] || [];
                    const previousRecord = getPreviousRecord(ex.id);
                    const category = ex.bodyPart ? ex.bodyPart.charAt(0).toUpperCase() + ex.bodyPart.slice(1) : "General";
                    const equipment = ex.equipment ? ex.equipment.charAt(0).toUpperCase() + ex.equipment.slice(1) : "Barra";
                    
                    // Extraer músculos principales para píldoras
                    const muscleTags = [
                        ex.target,
                        ex.bodyPart,
                        ...(Array.isArray(ex.secondaryMuscles) ? ex.secondaryMuscles : [])
                    ].filter(Boolean).slice(0, 3);

                    return (
                        <div 
                            key={`${ex.id}-${exIndex}`}
                            className="bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-[2rem] p-4 md:p-5 shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors"
                        >
                            {/* 1. CABECERA DEL EJERCICIO */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-500/10 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                        {exIndex + 1} DE {activeExercises.length}
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {category} • {equipment}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeExercise(ex.id)}
                                    className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                                    title="Quitar ejercicio"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* 2. TÍTULO Y MÚSCULOS */}
                            <h3 className="text-lg md:text-xl font-black text-foreground tracking-tight mb-2">
                                {ex.name}
                            </h3>

                            {muscleTags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3.5">
                                    {muscleTags.map((muscle: string, mIdx: number) => (
                                        <span 
                                            key={mIdx}
                                            className="bg-muted dark:bg-white/5 border border-border dark:border-white/10 text-muted-foreground text-[10px] font-medium px-2.5 py-0.5 rounded-full capitalize"
                                        >
                                            {muscle}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* 3. IMAGEN / GIF TÉCNICO */}
                            <div className="bg-white rounded-2xl w-full h-[140px] md:h-[160px] mb-3.5 border border-border dark:border-white/10 overflow-hidden flex items-center justify-center relative shadow-inner">
                                {ex.gifUrl ? (
                                    <img 
                                        src={ex.gifUrl} 
                                        alt={ex.name}
                                        loading="lazy" 
                                        className="w-full h-full object-contain mix-blend-multiply opacity-95" 
                                    />
                                ) : (
                                    <Dumbbell className="w-12 h-12 text-gray-300" />
                                )}
                            </div>

                            {/* 4. BARRA DE DESCANSO AUTOMÁTICO */}
                            <div className="bg-muted/60 dark:bg-white/[0.03] border border-border dark:border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <Clock size={14} className="text-blue-500 dark:text-blue-400" />
                                    <span>Descanso automático: <strong className="text-foreground font-bold">{maxRestTime} seg</strong></span>
                                </div>
                                <button
                                    onClick={() => setIsRestModalOpen(true)}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                                >
                                    Cambiar
                                </button>
                            </div>

                            {/* 5. TABLA DE SERIES */}
                            {sets.length > 0 ? (
                                <div className="space-y-2">
                                    {/* Cabecera de columnas */}
                                    <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-wider px-2 pb-1">
                                        <span className="col-span-2 text-center">Serie</span>
                                        <span className="col-span-3 text-center">Anterior</span>
                                        <span className="col-span-3 text-center">KG</span>
                                        <span className="col-span-2 text-center">Reps</span>
                                        <span className="col-span-2 text-center">Hecho</span>
                                    </div>

                                    {/* Filas de series */}
                                    {sets.map((set, setIdx) => {
                                        const currentPR = getExercisePR(ex.id);
                                        const currentWeight = parseFloat(set.weight) || 0;
                                        const isPR = currentWeight > 0 && (currentPR === 0 || currentWeight >= currentPR);

                                        return (
                                            <SwipeableSetRow
                                                key={setIdx}
                                                set={set}
                                                setIdx={setIdx}
                                                exId={ex.id}
                                                previousRecord={previousRecord}
                                                isPR={isPR}
                                                isSaving={isSaving}
                                                onUpdateSet={(field, value) => updateSet(ex.id, setIdx, field, value)}
                                                onRemoveSet={() => removeSet(ex.id, setIdx)}
                                            />
                                        );
                                    })}

                                    {/* Botón para añadir serie extra */}
                                    <button 
                                        onClick={() => addSet(ex.id)}
                                        disabled={isSaving}
                                        className="w-full py-3 mt-2 border border-dashed border-border dark:border-white/15 hover:border-blue-500/40 hover:bg-blue-500/5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5 active:scale-[0.99]"
                                    >
                                        <Plus size={14} /> Añadir serie
                                    </button>
                                </div>
                            ) : (
                                /* ✨ ESTADO VACÍO: Cuando no hay series aún */
                                <div className="py-7 px-4 border border-dashed border-border dark:border-white/10 rounded-2xl text-center bg-muted/20 dark:bg-white/[0.01] space-y-3">
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Aún no has registrado series para este ejercicio
                                    </p>
                                    <button 
                                        onClick={() => addSet(ex.id)}
                                        disabled={isSaving}
                                        className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                                    >
                                        <Plus size={14} /> Iniciar primera serie
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* ✨ EMPTY STATE GLOBAL: Cuando no hay ningún ejercicio en la rutina */}
                {activeExercises.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-border dark:border-white/10 rounded-[2.5rem] bg-card dark:bg-[#121214]">
                        <div className="w-16 h-16 bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                            <Dumbbell size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">
                            Rutina Vacía
                        </h3>
                        <p className="text-xs text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
                            Aún no tienes ejercicios en este entrenamiento. Haz clic en "Agregar ejercicio" para comenzar.
                        </p>
                    </div>
                )}

                {/* 🔴 BOTÓN AGREGAR EJERCICIO */}
                <button
                    onClick={() => setOpen(true)}
                    disabled={isSaving}
                    className="w-full py-4 bg-card dark:bg-[#121214] hover:bg-muted/60 dark:hover:bg-white/5 border border-border dark:border-white/10 text-foreground rounded-2xl flex items-center justify-center gap-2 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98]"
                >
                    <div className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Plus size={14} strokeWidth={3} />
                    </div>
                    Agregar ejercicio
                </button>
            </div>

            {/* 🔴 BARRA INFERIOR FIJA (Guardar Plantilla + Finalizar Entrenamiento) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-background/95 dark:bg-[#0a0a0b]/95 backdrop-blur-2xl border-t border-border dark:border-white/10 z-[110] flex items-center gap-3">
                <button 
                    onClick={promptSaveTemplate}
                    disabled={isSaving || isSavingTemplate}
                    className="py-3.5 px-4 bg-muted/60 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 border border-border dark:border-white/10 text-muted-foreground hover:text-foreground rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 shrink-0"
                >
                    <Bookmark size={16} />
                    <span className="hidden sm:inline">Guardar plantilla</span>
                </button>

                <button 
                    onClick={handleFinishWorkout}
                    disabled={isSaving || isSavingTemplate}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#ff0055] via-[#f43f5e] to-[#e11d48] hover:opacity-95 text-white font-bold text-xs tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-[0.98]"
                >
                    {isSaving ? (
                        <span className="animate-pulse">Guardando...</span>
                    ) : (
                        <>
                            <CheckCircle2 size={18} strokeWidth={2.5} /> Finalizar entrenamiento
                        </>
                    )}
                </button>
            </div>

            {/* 🔴 BUSCADOR DE EJERCICIOS */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command className="bg-card dark:bg-[#121214] text-foreground border-border dark:border-white/10">
                    <CommandInput placeholder="Buscar ejercicio en Kallp..." className="text-foreground" />
                    <CommandList className="bg-card dark:bg-[#121214]">
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup heading="Ejercicios Disponibles" className="text-muted-foreground">
                            {exercises.map((ex) => (
                                <CommandItem 
                                    key={ex.id} 
                                    onSelect={() => addAccessory(ex)} 
                                    className="cursor-pointer flex items-center gap-4 p-3 aria-selected:bg-accent dark:aria-selected:bg-blue-600/20 rounded-xl mb-1 transition-colors"
                                >
                                    <div className="w-20 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 relative border border-border dark:border-white/10 shadow-sm flex items-center justify-center">
                                        {ex.gifUrl ? (
                                            <img src={ex.gifUrl} alt={ex.name} loading="lazy" className="w-full h-full object-contain mix-blend-multiply" />
                                        ) : (
                                            <Dumbbell className="w-6 h-6 text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-grow">
                                        <span className="uppercase text-xs font-black text-foreground">{ex.name}</span>
                                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">{ex.target || ex.bodyPart}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* 🔴 MODAL PARA GUARDAR PLANTILLA */}
            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className="sm:max-w-md bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-[2rem] p-6 shadow-2xl text-foreground">
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-foreground">
                            Guardar Plantilla
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs font-medium">
                            Ponle un nombre a tu rutina para volver a entrenarla después (ej: Pecho y Tríceps, Día de Pierna).
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <Input 
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Nombre de la plantilla..."
                            className="bg-background dark:bg-white/5 border-border dark:border-white/10 rounded-xl focus-visible:ring-blue-500 font-bold text-foreground h-12 px-4"
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
                            className="rounded-xl text-xs font-bold tracking-wider uppercase text-muted-foreground hover:text-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate}
                            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-xs tracking-wider shadow-lg shadow-blue-500/20 active:scale-95"
                        >
                            {isSavingTemplate ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 🔴 MODAL DE CAMBIO DE TIEMPO DE DESCANSO */}
            <Dialog open={isRestModalOpen} onOpenChange={setIsRestModalOpen}>
                <DialogContent className="sm:max-w-xs bg-card dark:bg-[#121214] border border-border dark:border-white/10 rounded-[2rem] p-6 shadow-2xl text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground text-center">
                            Descanso entre Series
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs text-center">
                            Selecciona el tiempo de recuperación automático al completar cada serie.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-2.5 py-4">
                        {[30, 60, 90, 120, 180].map((seconds) => (
                            <button
                                key={seconds}
                                onClick={() => {
                                    setMaxRestTime(seconds);
                                    setIsRestModalOpen(false);
                                    toast.success(`Descanso configurado en ${seconds} seg`);
                                }}
                                className={`py-3 rounded-xl text-xs font-black transition-all border ${
                                    maxRestTime === seconds 
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30' 
                                        : 'bg-muted/60 dark:bg-white/5 text-muted-foreground border-border dark:border-white/10 hover:border-blue-500/40 hover:text-foreground'
                                }`}
                            >
                                {seconds} seg
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* ⏱️ TEMPORIZADOR INTELIGENTE FLOTANTE (Al descansar) */}
            {restTime !== null && (
                <div className="fixed top-18 right-4 md:top-24 md:right-8 bg-card/95 dark:bg-[#0a0a0b]/95 backdrop-blur-2xl border border-border dark:border-white/20 p-3.5 rounded-3xl shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-6 duration-300">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" className="stroke-muted dark:stroke-white/10" strokeWidth="8" fill="none" />
                            <circle 
                                cx="50" cy="50" r="45" 
                                className={`transition-all duration-1000 ease-linear ${
                                    restTime <= 10 
                                        ? 'stroke-rose-500' 
                                        : restTime <= maxRestTime / 2 
                                            ? 'stroke-amber-400' 
                                            : 'stroke-blue-500'
                                }`} 
                                strokeWidth="8" 
                                fill="none" 
                                strokeLinecap="round"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * restTime) / Math.max(maxRestTime, 1)}
                            />
                        </svg>
                        <span className="absolute text-foreground font-black text-sm tabular-nums">
                            {Math.floor(restTime / 60)}:{(restTime % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <div className="flex gap-1.5">
                            <button 
                                onClick={() => setRestTime(prev => Math.max(0, prev! - 15))}
                                className="bg-muted hover:bg-accent dark:bg-white/10 dark:hover:bg-white/20 text-foreground rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors"
                            >
                                -15s
                            </button>
                            <button 
                                onClick={() => {
                                    setRestTime(prev => {
                                        const newTime = Math.min(300, prev! + 30);
                                        if (newTime > maxRestTime) setMaxRestTime(newTime);
                                        return newTime;
                                    });
                                }}
                                className="bg-muted hover:bg-accent dark:bg-white/10 dark:hover:bg-white/20 text-foreground rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors"
                            >
                                +30s
                            </button>
                        </div>
                        <button 
                            onClick={() => setRestTime(null)}
                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 dark:text-rose-400 border border-rose-500/30 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors"
                        >
                            <FastForward size={11} strokeWidth={3} /> Saltar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
