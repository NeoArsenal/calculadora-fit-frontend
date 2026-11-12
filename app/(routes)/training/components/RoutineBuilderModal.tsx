"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Search,
    Check,
    Plus,
    Minus,
    Trash2,
    Dumbbell,
    Sparkles,
    ArrowUp,
    ArrowDown,
    BookmarkCheck,
    Layers,
} from "lucide-react";
import { useExercises } from "../hooks/useExercises";
import { saveRoutine, updateRoutineTemplate } from "@/services/api";
import { toast } from "sonner";

type SelectedExerciseItem = {
    exercise: any;
    targetSets: number;
    targetReps: number;
};

const BODY_PART_FILTERS = [
    { id: "ALL", label: "Todos" },
    { id: "Chest", label: "Pecho" },
    { id: "Back", label: "Espalda" },
    { id: "Legs", label: "Piernas" },
    { id: "Shoulders", label: "Hombros" },
    { id: "Arms", label: "Brazos" },
    { id: "Core", label: "Core" },
    { id: "Cardio", label: "Cardio" },
];

const EQUIPMENT_FILTERS = [
    { id: "ALL", label: "Todo Equipo" },
    { id: "Barbell", label: "Barra" },
    { id: "Dumbbell", label: "Mancuerna" },
    { id: "Cable", label: "Polea" },
    { id: "Machine", label: "Máquina" },
    { id: "Bodyweight", label: "Peso Corporal" },
];

const EQUIPMENT_LABELS: Record<string, string> = {
    Barbell: "Barra",
    Dumbbell: "Mancuerna",
    Cable: "Polea",
    Machine: "Máquina",
    Bodyweight: "Peso Corporal",
};

const QUICK_SPLITS = [
    {
        id: "push",
        label: "⚡ Push (Pecho/Hombro/Tríceps)",
        defaultName: "Día de Empuje (Push)",
        keywords: [
            "Press de Banca (Barra)",
            "Press Inclinado (Mancuernas)",
            "Cruce de Poleas",
            "Elevaciones Laterales",
            "Extensión de Tríceps (Cuerda)",
        ],
    },
    {
        id: "pull",
        label: "🔥 Pull (Espalda/Bíceps)",
        defaultName: "Día de Tirón (Pull)",
        keywords: [
            "Jalón al Pecho",
            "Remo con Barra",
            "Remo en Máquina/Polea",
            "Face Pull",
            "Curl de Bíceps (Barra)",
            "Curl Martillo",
        ],
    },
    {
        id: "legs",
        label: "🦵 Pierna Completa",
        defaultName: "Día de Pierna (Legs)",
        keywords: [
            "Sentadilla Libre (Barra)",
            "Prensa de Piernas",
            "Peso Muerto Rumano",
            "Extensión de Cuádriceps",
            "Curl Femoral Tumbado",
            "Elevación de Talones (Máquina)",
        ],
    },
    {
        id: "upper",
        label: "💪 Torso Superior",
        defaultName: "Torso Completo (Upper)",
        keywords: [
            "Press de Banca (Barra)",
            "Jalón al Pecho",
            "Press de Hombros (Mancuernas)",
            "Remo con Mancuerna Unilateral",
            "Curl de Bíceps en Polea Baja",
            "Extensión de Tríceps (Cuerda)",
        ],
    },
];

export default function RoutineBuilderModal({
    isOpen,
    onClose,
    onSaved,
    editingRoutine = null,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingRoutine?: any | null;
}) {
    const { exercises } = useExercises();
    const [routineName, setRoutineName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedBodyPart, setSelectedBodyPart] = useState("ALL");
    const [selectedEquipment, setSelectedEquipment] = useState("ALL");
    const [selectedItems, setSelectedItems] = useState<SelectedExerciseItem[]>([]);
    const [mobileView, setMobileView] = useState<"catalog" | "selected">("catalog");
    const [isSaving, setIsSaving] = useState(false);

    // Cargar datos si estamos editando una plantilla existente
    useEffect(() => {
        if (!isOpen) return;
        setSearchQuery("");
        setSelectedBodyPart("ALL");
        setSelectedEquipment("ALL");
        setMobileView("catalog");

        if (editingRoutine) {
            setRoutineName(editingRoutine.name || "");
            const initial: SelectedExerciseItem[] = (editingRoutine.exercises || [])
                .map((rx: any) => {
                    const exObj =
                        rx.exercise ||
                        exercises.find((e) => e.id === rx.exerciseId) || {
                            id: rx.exerciseId,
                            name: rx.exerciseName || "Ejercicio",
                        };
                    return {
                        exercise: exObj,
                        targetSets: rx.targetSets || 3,
                        targetReps: rx.targetReps || 10,
                    };
                })
                .filter((item: SelectedExerciseItem) => item.exercise?.id);
            setSelectedItems(initial);
        } else {
            setRoutineName("");
            setSelectedItems([]);
        }
    }, [isOpen, editingRoutine, exercises]);

    // Filtrado multicriterio instantáneo (Texto + Músculo + Equipamiento)
    const filteredExercises = useMemo(() => {
        return exercises.filter((ex) => {
            const matchesBodyPart =
                selectedBodyPart === "ALL" ||
                ex.bodyPart?.toLowerCase() === selectedBodyPart.toLowerCase();
            const matchesEquipment =
                selectedEquipment === "ALL" ||
                ex.equipment?.toLowerCase() === selectedEquipment.toLowerCase();

            if (!matchesBodyPart || !matchesEquipment) return false;

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            const equipEs = (EQUIPMENT_LABELS[ex.equipment] || ex.equipment || "").toLowerCase();
            return (
                ex.name?.toLowerCase().includes(q) ||
                ex.target?.toLowerCase().includes(q) ||
                ex.bodyPart?.toLowerCase().includes(q) ||
                equipEs.includes(q)
            );
        });
    }, [exercises, selectedBodyPart, selectedEquipment, searchQuery]);

    const isSelected = (exerciseId: number) =>
        selectedItems.some((item) => item.exercise.id === exerciseId);

    // Alternar selección múltiple con 1 toque (sin cerrar el buscador)
    const toggleExercise = (ex: any) => {
        setSelectedItems((prev) => {
            const exists = prev.some((item) => item.exercise.id === ex.id);
            if (exists) {
                return prev.filter((item) => item.exercise.id !== ex.id);
            }
            return [
                ...prev,
                {
                    exercise: ex,
                    targetSets: 3,
                    targetReps: 10,
                },
            ];
        });
    };

    // Aplicar un Split pre-armado con 1 clic
    const applyQuickSplit = (split: (typeof QUICK_SPLITS)[number]) => {
        if (!routineName.trim()) {
            setRoutineName(split.defaultName);
        }
        const matched: SelectedExerciseItem[] = [];
        split.keywords.forEach((kw) => {
            const found = exercises.find((e) => e.name?.toLowerCase() === kw.toLowerCase());
            if (found) {
                matched.push({
                    exercise: found,
                    targetSets: 3,
                    targetReps: 10,
                });
            }
        });
        if (matched.length > 0) {
            setSelectedItems(matched);
            toast.success(`Plantilla base "${split.defaultName}" cargada (${matched.length} ejercicios)`);
        }
    };

    const updateItemField = (
        exerciseId: number,
        field: "targetSets" | "targetReps",
        delta: number
    ) => {
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.exercise.id !== exerciseId) return item;
                const nextVal = Math.max(1, Math.min(30, item[field] + delta));
                return { ...item, [field]: nextVal };
            })
        );
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= selectedItems.length) return;
        setSelectedItems((prev) => {
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
    };

    const handleSave = async () => {
        if (!routineName.trim()) {
            toast.error("Ponle un nombre a tu plantilla (ej: Pecho y Tríceps).");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Selecciona al menos 1 ejercicio para tu plantilla.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: routineName.trim(),
                exercises: selectedItems.map((item) => ({
                    exerciseId: item.exercise.id,
                    targetSets: item.targetSets,
                    targetReps: item.targetReps,
                })),
            };

            if (editingRoutine?.id) {
                await updateRoutineTemplate(editingRoutine.id, payload);
                toast.success("¡Plantilla actualizada con éxito! ✨");
            } else {
                await saveRoutine(payload);
                toast.success("¡Nueva plantilla creada y lista para entrenar! 🔥");
            }

            onSaved();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("No se pudo guardar la plantilla.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl bg-card dark:bg-[#0b0b0e] border border-border dark:border-white/10 rounded-[2rem] p-0 overflow-hidden shadow-2xl text-foreground max-h-[92vh] flex flex-col">
                {/* CABECERA + INPUT DE NOMBRE + PRESETS DE SPLITS */}
                <div className="p-5 pb-4 border-b border-border dark:border-white/10 bg-muted/20 dark:bg-white/[0.02] space-y-3.5 shrink-0">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-6">
                            <div>
                                <DialogTitle className="text-xl sm:text-2xl font-black italic uppercase tracking-tight text-foreground">
                                    {editingRoutine ? "Editar Plantilla" : "Constructor de Plantilla"}
                                    <span className="text-blue-500">_</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground font-medium mt-0.5">
                                    Selecciona varios ejercicios de un toque, filtra por equipo/músculo o usa un preset rápido.
                                </DialogDescription>
                            </div>
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase">
                                <Layers size={13} /> {selectedItems.length} seleccionados
                            </span>
                        </div>
                    </DialogHeader>

                    {/* Input Nombre + Presets Rápidos */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                        <input
                            type="text"
                            value={routineName}
                            onChange={(e) => setRoutineName(e.target.value)}
                            placeholder="Nombre de la rutina (ej: Pechito Pesado, Pierna Hipertrofia)..."
                            className="flex-1 bg-background dark:bg-[#121216] border border-border dark:border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm font-bold text-foreground outline-none transition-colors"
                        />
                    </div>

                    {/* Chips de Auto-Relleno Inteligente (Presets de Splits) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
                            <Sparkles size={11} className="text-blue-500" /> Auto-Armar:
                        </span>
                        {QUICK_SPLITS.map((split) => (
                            <button
                                key={split.id}
                                type="button"
                                onClick={() => applyQuickSplit(split)}
                                className="px-2.5 py-1 rounded-lg bg-background dark:bg-white/5 hover:bg-blue-500/10 border border-border dark:border-white/10 hover:border-blue-500/40 text-[10px] font-bold text-muted-foreground hover:text-blue-500 whitespace-nowrap transition-all shrink-0"
                            >
                                {split.label}
                            </button>
                        ))}
                    </div>

                    {/* Selector de vista en móvil (Catálogo vs Seleccionados) */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-muted dark:bg-black/40 border border-border dark:border-white/10 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileView("catalog")}
                            className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                                mobileView === "catalog"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-muted-foreground"
                            }`}
                        >
                            1. Buscar Ejercicios ({filteredExercises.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileView("selected")}
                            className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                                mobileView === "selected"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-muted-foreground"
                            }`}
                        >
                            2. Tu Rutina ({selectedItems.length})
                        </button>
                    </div>
                </div>

                {/* CUERPO PRINCIPAL: 2 COLUMNAS EN DESKTOP (CATÁLOGO MULTI-SELECT + CONFIGURADOR DE SERIES) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
                    {/* COLUMNA IZQUIERDA (7/12): BUSCADOR AVANZADO CON SELECCIÓN MÚLTIPLE */}
                    <div
                        className={`lg:col-span-7 flex flex-col min-h-0 border-r border-border dark:border-white/10 ${
                            mobileView === "selected" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Buscador y Filtros Dobles (Músculo + Equipo) */}
                        <div className="p-3.5 space-y-2.5 border-b border-border dark:border-white/10 bg-card dark:bg-[#0b0b0e] shrink-0">
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por nombre, músculo o equipo (ej: press, polea, glutes)..."
                                    className="w-full bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-foreground outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            {/* Filtro 1: Grupo Muscular */}
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {BODY_PART_FILTERS.map((cat) => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setSelectedBodyPart(cat.id)}
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                                            selectedBodyPart === cat.id
                                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                                                : "bg-muted/60 dark:bg-white/5 text-muted-foreground hover:text-foreground border border-border dark:border-white/10"
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Filtro 2: Equipamiento (Barra, Mancuerna, Polea, Máquina...) */}
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                {EQUIPMENT_FILTERS.map((eq) => (
                                    <button
                                        key={eq.id}
                                        type="button"
                                        onClick={() => setSelectedEquipment(eq.id)}
                                        className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                            selectedEquipment === eq.id
                                                ? "bg-indigo-600/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/40"
                                                : "bg-transparent text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                                        }`}
                                    >
                                        {eq.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lista de Ejercicios con Checkboxes Multi-Selección */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                            {filteredExercises.map((ex) => {
                                const active = isSelected(ex.id);
                                const equipLabel = EQUIPMENT_LABELS[ex.equipment] || ex.equipment;

                                return (
                                    <div
                                        key={ex.id}
                                        onClick={() => toggleExercise(ex)}
                                        className={`flex items-center justify-between gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all select-none ${
                                            active
                                                ? "bg-blue-600/10 border-blue-500/50 shadow-sm"
                                                : "bg-card dark:bg-white/[0.02] hover:bg-muted/60 dark:hover:bg-white/[0.05] border-border dark:border-white/5"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-14 h-11 rounded-xl bg-white border border-border dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                                {ex.gifUrl ? (
                                                    <img
                                                        src={ex.gifUrl}
                                                        alt={ex.name}
                                                        loading="lazy"
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                ) : (
                                                    <Dumbbell className="w-5 h-5 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-black uppercase text-foreground truncate">
                                                    {ex.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                                                        {ex.target || ex.bodyPart}
                                                    </span>
                                                    {equipLabel && (
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-muted dark:bg-white/10 text-muted-foreground font-bold uppercase">
                                                            {equipLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                                active
                                                    ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                                                    : "bg-muted/50 dark:bg-white/5 border-border dark:border-white/15 text-muted-foreground"
                                            }`}
                                        >
                                            {active ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredExercises.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                    No se encontraron ejercicios con ese filtro.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (5/12): EJERCICIOS SELECCIONADOS + SERIES Y REPS */}
                    <div
                        className={`lg:col-span-5 flex flex-col min-h-0 bg-muted/15 dark:bg-black/20 ${
                            mobileView === "catalog" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        <div className="p-3.5 border-b border-border dark:border-white/10 flex items-center justify-between shrink-0">
                            <span className="text-xs font-black uppercase tracking-wider text-foreground">
                                Orden y Series ({selectedItems.length})
                            </span>
                            {selectedItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedItems([])}
                                    className="text-[10px] font-bold text-rose-500 hover:underline uppercase"
                                >
                                    Vaciar todo
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((item, idx) => (
                                    <div
                                        key={item.exercise.id}
                                        className="p-3 rounded-2xl bg-card dark:bg-[#121216] border border-border dark:border-white/10 space-y-2.5 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xs font-black uppercase text-foreground truncate">
                                                    {item.exercise.name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(idx, -1)}
                                                    disabled={idx === 0}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                    title="Subir"
                                                >
                                                    <ArrowUp size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveItem(idx, 1)}
                                                    disabled={idx === selectedItems.length - 1}
                                                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                    title="Bajar"
                                                >
                                                    <ArrowDown size={13} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExercise(item.exercise)}
                                                    className="p-1 text-muted-foreground hover:text-rose-500"
                                                    title="Quitar"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Controles rápidos de Series × Reps */}
                                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60 dark:border-white/5">
                                            <div className="flex items-center justify-between bg-muted/50 dark:bg-white/5 rounded-xl px-2.5 py-1.5">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground">
                                                    Series
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateItemField(item.exercise.id, "targetSets", -1)
                                                        }
                                                        className="w-5 h-5 rounded-md bg-card dark:bg-white/10 flex items-center justify-center text-foreground hover:bg-blue-500 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-xs font-black text-foreground w-4 text-center">
                                                        {item.targetSets}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateItemField(item.exercise.id, "targetSets", 1)
                                                        }
                                                        className="w-5 h-5 rounded-md bg-card dark:bg-white/10 flex items-center justify-center text-foreground hover:bg-blue-500 hover:text-white transition-colors"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between bg-muted/50 dark:bg-white/5 rounded-xl px-2.5 py-1.5">
                                                <span className="text-[9px] font-black uppercase text-muted-foreground">
                                                    Reps
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateItemField(item.exercise.id, "targetReps", -2)
                                                        }
                                                        className="w-5 h-5 rounded-md bg-card dark:bg-white/10 flex items-center justify-center text-foreground hover:bg-blue-500 hover:text-white transition-colors"
                                                    >
                                                        <Minus size={11} />
                                                    </button>
                                                    <span className="text-xs font-black text-foreground w-5 text-center">
                                                        {item.targetReps}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateItemField(item.exercise.id, "targetReps", 2)
                                                        }
                                                        className="w-5 h-5 rounded-md bg-card dark:bg-white/10 flex items-center justify-center text-foreground hover:bg-blue-500 hover:text-white transition-colors"
                                                    >
                                                        <Plus size={11} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 opacity-50">
                                    <Dumbbell size={32} className="text-muted-foreground mb-2" />
                                    <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                        Tu plantilla está vacía
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1">
                                        Toca los ejercicios de la izquierda o usa un botón de Auto-Armar arriba.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER DE ACCIONES */}
                <div className="p-4 border-t border-border dark:border-white/10 bg-card dark:bg-[#0b0b0e] flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <BookmarkCheck size={16} />
                        {isSaving
                            ? "Guardando..."
                            : editingRoutine
                            ? `Guardar Cambios (${selectedItems.length})`
                            : `Crear Plantilla (${selectedItems.length})`}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
