"use client";

import { useState } from "react";
import RoutinePlanner from "./components/RoutinePlanner";
import WorkoutPanel from "./components/WorkoutPanel";
import StrengthProgression from "./components/StrengthProgression";
import { Play, Loader2, Bookmark, Pencil, Trash2, Check, X } from "lucide-react";

import { useApp } from "@/app/context/AppContext";
import { updateRoutineName, deleteRoutineTemplate } from "@/services/api";

export default function TrainingPage() {
    // 🧠 ESTADOS MAESTROS
    const { trainingSessions: sessions, routines, loading, refreshEcosystem } = useApp();
    const [isTrainingActive, setIsTrainingActive] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);

    // 📱 GESTOS TIPO iOS (Swipe to go back)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        // Solo activamos si el gesto empieza desde el borde izquierdo (hasta 40px)
        if (e.targetTouches[0].clientX > 40) return; 
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isRightSwipe = distance < -50; // Se movió más de 50px a la derecha
        
        if (isRightSwipe) {
            handleFinish(); // Retrocede
        }
        
        setTouchStart(null);
        setTouchEnd(null);
    };

    const handleEditClick = (e: React.MouseEvent, routine: any) => {
        e.stopPropagation();
        setEditingRoutineId(routine.id);
        setEditName(routine.name);
    };

    const handleSaveEdit = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!editName.trim()) return;
        try {
            await updateRoutineName(id, editName.trim());
            await refreshEcosystem();
            setEditingRoutineId(null);
        } catch (error) {
            console.error("Error editing routine", error);
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingRoutineId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setRoutineToDelete(id);
    };

    const confirmDelete = async () => {
        if (routineToDelete !== null) {
            try {
                await deleteRoutineTemplate(routineToDelete);
                await refreshEcosystem();
                setRoutineToDelete(null);
            } catch (error) {
                console.error("Error deleting routine", error);
            }
        }
    };

    // 2. Función que se ejecuta al presionar "Finalizar Protocolo"
    const handleFinish = async () => {
        setIsTrainingActive(false); 
        setSelectedRoutine(null);
        await refreshEcosystem(); 
    };

    const startRoutine = (routine: any = null) => {
        setSelectedRoutine(routine);
        setIsTrainingActive(true);
    };

    return (
        <div 
            className="min-h-screen bg-background space-y-8 pb-20 animate-in fade-in duration-500"
            onTouchStart={isTrainingActive ? handleTouchStart : undefined}
            onTouchMove={isTrainingActive ? handleTouchMove : undefined}
            onTouchEnd={isTrainingActive ? handleTouchEnd : undefined}
        >
            {/* Cabecera Global del Módulo de Entrenamiento */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 md:pt-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors">
                        Entrenamiento<span className="text-blue-500">_</span>
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                        Control de Sesiones y Progreso
                    </p>
                </div>
                
                {!isTrainingActive && (
                    <button 
                        onClick={() => startRoutine()}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-black italic uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 flex-shrink-0"
                    >
                        <Play size={18} fill="currentColor" /> Rutina Libre
                    </button>
                )}
            </div>

            {/* --- RENDERIZADO MODO ENFOQUE --- */}
            {isTrainingActive ? (
                <div className="animate-in slide-in-from-bottom-10 duration-500">
                    <WorkoutPanel onFinish={handleFinish} onBack={() => setIsTrainingActive(false)} initialRoutine={selectedRoutine} />
                </div>
            ) : (
                <div className="space-y-12 animate-in fade-in duration-500">
                    {/* --- RENDERIZADO DASHBOARD --- */}

                    {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando con Kallp Cloud...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* 🔥 TUS PLANTILLAS GUARDADAS */}
                    <div className="md:col-span-12">
                        <div className="flex items-center gap-2 mb-4">
                            <Bookmark className="text-blue-500" size={20} />
                            <h2 className="text-lg font-black uppercase tracking-widest text-gray-900 dark:text-white transition-colors">Tus Plantillas</h2>
                        </div>
                        
                        {routines && routines.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {routines.map((routine: any) => (
                                    <button 
                                        key={routine.id}
                                        onClick={() => startRoutine(routine)}
                                        className="bg-white dark:bg-[#0a0a0b] hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-blue-500/30 p-5 rounded-[2rem] text-left transition-all shadow-xl shadow-gray-200/50 dark:shadow-none group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        
                                        {editingRoutineId === routine.id ? (
                                            <div className="w-full relative z-10" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="text" 
                                                    value={editName} 
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-black italic uppercase text-xl mb-1 px-3 py-1 rounded-lg outline-none border border-blue-500/50"
                                                    autoFocus
                                                />
                                                <div className="flex items-center gap-2 mt-3">
                                                    <div 
                                                        onClick={(e) => handleSaveEdit(e, routine.id)}
                                                        className="bg-green-500/20 text-green-600 dark:text-green-400 p-2 rounded-full cursor-pointer hover:bg-green-500/40 transition-colors"
                                                    >
                                                        <Check size={16} />
                                                    </div>
                                                    <div 
                                                        onClick={handleCancelEdit}
                                                        className="bg-red-500/20 text-red-600 dark:text-red-400 p-2 rounded-full cursor-pointer hover:bg-red-500/40 transition-colors"
                                                    >
                                                        <X size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full relative z-10">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-gray-900 dark:text-white font-black italic uppercase text-xl mb-1 transition-colors pr-8 leading-tight">{routine.name}</h3>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-0">
                                                        <div 
                                                            onClick={(e) => handleEditClick(e, routine)}
                                                            className="text-gray-400 hover:text-blue-500 p-1 cursor-pointer transition-colors"
                                                        >
                                                            <Pencil size={16} />
                                                        </div>
                                                        <div 
                                                            onClick={(e) => handleDeleteClick(e, routine.id)}
                                                            className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-bold tracking-widest mt-2">
                                                    {routine.exercises?.length || 0} Ejercicios
                                                </p>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem] text-center shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors">
                                <p className="text-sm text-muted-foreground">Aún no has guardado ninguna plantilla. Crea una rutina libre y presiona "Guardar Plantilla".</p>
                            </div>
                        )}
                    </div>

                    {/* 📅 CALENDARIO Y DETALLES */}
                    <div className="md:col-span-12">
                        <RoutinePlanner sessions={sessions} /> 
                    </div>

                    {/* 📊 GRÁFICO DE PROGRESO */}
                    <div className="md:col-span-12 lg:col-span-8 mx-auto w-full">
                        <StrengthProgression sessions={sessions} />
                    </div>

                </div>
            )}

            {/* 🔥 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN 🔥 */}
            {routineToDelete !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#0a0a0b] border border-gray-200 dark:border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase text-gray-900 dark:text-white mb-2">¿Eliminar Plantilla?</h2>
                        <p className="text-muted-foreground mb-8 text-sm">Esta acción no se puede deshacer. Perderás esta configuración de ejercicios para siempre.</p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setRoutineToDelete(null)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-xs"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] text-xs"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
                </div>
            )} {/* Cierra isTrainingActive ternary */}
        </div>
    );
}