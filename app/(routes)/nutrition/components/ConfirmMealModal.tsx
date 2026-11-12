"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Check,
  Flame,
  Sparkles,
  Plus,
  Minus,
  Scale,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { MealIngredientItem } from "../services/nutritionService";

interface ConfirmMealModalProps {
  data: any;
  onConfirm: (meal: any) => void;
  onCancel: () => void;
  loading: boolean;
}

interface EditableIngredient extends MealIngredientItem {
  id: string;
  included: boolean;
  baseGrams: number;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
}

const PORTION_MULTIPLIERS = [
  { value: 0.5, label: "0.5x", desc: "Media" },
  { value: 0.75, label: "0.75x", desc: "3/4" },
  { value: 1, label: "1x", desc: "Normal" },
  { value: 1.25, label: "1.25x", desc: "Generosa" },
  { value: 1.5, label: "1.5x", desc: "Doble" },
];

export default function ConfirmMealModal({
  data,
  onConfirm,
  onCancel,
  loading,
}: ConfirmMealModalProps) {
  const [dishName, setDishName] = useState<string>(data?.name || "Plato Detectado");
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);

  useEffect(() => {
    setDishName(data?.name || "Plato Detectado");
    setPortionMultiplier(1);

    if (Array.isArray(data?.items) && data.items.length > 0) {
      setIngredients(
        data.items.map((item: any, idx: number) => {
          const g = Math.max(5, Number(item.grams) || 100);
          const cal = Math.max(0, Number(item.calories) || 0);
          const p = Math.max(0, Number(item.protein) || 0);
          const c = Math.max(0, Number(item.carbs) || 0);
          const f = Math.max(0, Number(item.fat) || 0);
          return {
            id: `${idx}-${item.name}`,
            name: item.name || `Ingrediente ${idx + 1}`,
            grams: g,
            calories: cal,
            protein: p,
            carbs: c,
            fat: f,
            included: true,
            baseGrams: g,
            baseCalories: cal,
            baseProtein: p,
            baseCarbs: c,
            baseFat: f,
          };
        })
      );
    } else {
      setIngredients([]);
    }
  }, [data]);

  const hasData =
    data?.name &&
    data.name !== "No se detectó comida" &&
    !data.error;

  const toggleIngredient = (id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, included: !ing.included } : ing
      )
    );
  };

  const adjustIngredientGrams = (id: string, deltaGrams: number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const newGrams = Math.max(10, ing.grams + deltaGrams);
        const ratio = ing.baseGrams > 0 ? newGrams / ing.baseGrams : 1;
        return {
          ...ing,
          included: true,
          grams: newGrams,
          calories: Math.round(ing.baseCalories * ratio),
          protein: Number((ing.baseProtein * ratio).toFixed(1)),
          carbs: Number((ing.baseCarbs * ratio).toFixed(1)),
          fat: Number((ing.baseFat * ratio).toFixed(1)),
        };
      })
    );
  };

  const resetAdjustments = () => {
    setPortionMultiplier(1);
    setIngredients((prev) =>
      prev.map((ing) => ({
        ...ing,
        included: true,
        grams: ing.baseGrams,
        calories: ing.baseCalories,
        protein: ing.baseProtein,
        carbs: ing.baseCarbs,
        fat: ing.baseFat,
      }))
    );
  };

  const computedTotals = useMemo(() => {
    if (ingredients.length > 0) {
      const active = ingredients.filter((i) => i.included);
      const rawCal = active.reduce((acc, i) => acc + i.calories, 0);
      const rawP = active.reduce((acc, i) => acc + i.protein, 0);
      const rawC = active.reduce((acc, i) => acc + i.carbs, 0);
      const rawF = active.reduce((acc, i) => acc + i.fat, 0);
      const rawG = active.reduce((acc, i) => acc + i.grams, 0);

      return {
        calories: Math.round(rawCal * portionMultiplier),
        protein: Math.round(rawP * portionMultiplier),
        carbs: Math.round(rawC * portionMultiplier),
        fat: Math.round(rawF * portionMultiplier),
        totalGrams: Math.round(rawG * portionMultiplier),
      };
    }

    return {
      calories: Math.round((Number(data?.calories) || 0) * portionMultiplier),
      protein: Math.round((Number(data?.protein) || 0) * portionMultiplier),
      carbs: Math.round((Number(data?.carbs) || 0) * portionMultiplier),
      fat: Math.round((Number(data?.fat) || 0) * portionMultiplier),
      totalGrams: Math.round((Number(data?.totalGrams) || 350) * portionMultiplier),
    };
  }, [ingredients, portionMultiplier, data]);

  if (!data) return null;

  if (!hasData) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0f0f11] border border-red-500/20 p-8 rounded-[2.5rem] text-center space-y-4 max-w-sm">
          <p className="text-white font-black uppercase text-xs">
            ⚠️ {data?.error || data?.name || "No se pudo analizar la imagen"}
          </p>
          <p className="text-muted-foreground text-[11px]">
            Intenta tomar una foto más iluminada o usa el buscador de Platos Peruanos / Describir con IA.
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider"
          >
            Volver al Escáner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0f0f13] border border-white/10 w-full max-w-lg rounded-[2.2rem] p-5 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER: CATEGORÍA, CONFIANZA Y NOMBRE DEL PLATO */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-black uppercase tracking-wider">
                <Sparkles size={11} />
                {data.isPeruvian ? "🇵🇪 " : ""}
                {data.category || "Análisis Nutricional IA"}
              </span>
              {data.confidence && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase">
                  {data.confidence}% Precisión
                </span>
              )}
            </div>

            <span className="text-[10px] font-black text-white/50 flex items-center gap-1">
              <Scale size={12} className="text-blue-400" /> ~{computedTotals.totalGrams}g
            </span>
          </div>

          <input
            type="text"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            className="w-full bg-transparent text-lg sm:text-xl font-black italic uppercase text-white tracking-tight focus:outline-none focus:border-b focus:border-blue-500 pb-0.5"
          />
        </div>

        {/* MACROS RESUMEN + ENERGÍA TOTAL */}
        <div className="grid grid-cols-4 gap-2 shrink-0">
          <div className="bg-orange-500/10 border border-orange-500/25 p-3 rounded-2xl text-center">
            <p className="text-[8px] text-orange-300/80 font-black uppercase tracking-widest flex items-center justify-center gap-0.5">
              <Flame size={10} /> Kcal
            </p>
            <p className="text-base font-black italic text-orange-400 mt-0.5">
              {computedTotals.calories}
            </p>
          </div>
          <MacroCard
            label="Proteína"
            value={`${computedTotals.protein}g`}
            color="text-blue-400"
          />
          <MacroCard
            label="Carbos"
            value={`${computedTotals.carbs}g`}
            color="text-pink-400"
          />
          <MacroCard
            label="Grasas"
            value={`${computedTotals.fat}g`}
            color="text-purple-400"
          />
        </div>

        {/* MULTIPLICADOR RÁPIDO DE PORCIÓN (ESTILO FITIA / KALIA) */}
        <div className="space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/50">
              Tamaño de Porción Consumida
            </span>
            <button
              type="button"
              onClick={resetAdjustments}
              className="text-[9px] font-bold text-blue-400 hover:underline flex items-center gap-1"
            >
              <RotateCcw size={10} /> Restaurar original
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {PORTION_MULTIPLIERS.map((p) => {
              const active = portionMultiplier === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPortionMultiplier(p.value)}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    active
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/25"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  <div className="text-[11px] font-black">{p.label}</div>
                  <div className="text-[8px] uppercase opacity-75">{p.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESGLOSE INTERACTIVO POR INGREDIENTE (QUITAR O AJUSTAR GRAMOS) */}
        {ingredients.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col space-y-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">
                Desglose del Plato (Toca ✓ para incluir/quitar o ajusta gramos)
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {ingredients.map((ing) => {
                const scaledGrams = Math.round(ing.grams * portionMultiplier);
                const scaledCal = Math.round(ing.calories * portionMultiplier);
                const scaledP = Math.round(ing.protein * portionMultiplier);
                const scaledC = Math.round(ing.carbs * portionMultiplier);
                const scaledF = Math.round(ing.fat * portionMultiplier);

                return (
                  <div
                    key={ing.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                      ing.included
                        ? "bg-white/[0.04] border-white/10"
                        : "bg-white/[0.01] border-white/5 opacity-40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleIngredient(ing.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          ing.included
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-transparent border border-white/20"
                        }`}
                      >
                        <Check size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-bold truncate ${
                            ing.included ? "text-white" : "line-through text-white/50"
                          }`}
                        >
                          {ing.name}
                        </p>
                        <p className="text-[10px] text-white/45 font-semibold">
                          <span className="text-orange-400 font-bold">
                            {scaledCal} kcal
                          </span>{" "}
                          • P:{scaledP}g C:{scaledC}g G:{scaledF}g
                        </p>
                      </div>
                    </button>

                    {/* Control de gramos por ingrediente */}
                    <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-xl px-2 py-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustIngredientGrams(ing.id, -20)}
                        className="w-5 h-5 rounded-md bg-white/10 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                        title="-20g"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-[11px] font-black text-white min-w-[40px] text-center">
                        {scaledGrams}g
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustIngredientGrams(ing.id, 20)}
                        className="w-5 h-5 rounded-md bg-white/10 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                        title="+20g"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIP DEL NUTRICIONISTA IA */}
        {data.tip && (
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 shrink-0">
            <Lightbulb size={15} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200/90 leading-snug">{data.tip}</p>
          </div>
        )}

        {/* CONTROLES DE CONFIRMACIÓN */}
        <div className="flex gap-3 pt-1 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-white/60 font-bold uppercase text-[10px] hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              onConfirm({
                name: dishName.trim() || data.name,
                calories: computedTotals.calories,
                protein: computedTotals.protein,
                carbs: computedTotals.carbs,
                fat: computedTotals.fat,
              })
            }
            className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-[11px] tracking-wider shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Guardando..."
            ) : (
              <>
                <Check size={16} /> Registrar ({computedTotals.calories} kcal)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
      <p className="text-[8px] text-white/50 font-black uppercase tracking-widest">
        {label}
      </p>
      <p className={`text-base font-black italic mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}
