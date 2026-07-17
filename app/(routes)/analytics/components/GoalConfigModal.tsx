"use client";

import React, { useState, useEffect } from "react";
import { X, Target, Save, Loader2 } from "lucide-react";

interface GoalConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeight?: number;
  initialCalories?: number;
  onSave: (targetWeightKg: number, targetCalories: number) => Promise<void>;
}

export default function GoalConfigModal({
  isOpen,
  onClose,
  initialWeight = 0,
  initialCalories = 0,
  onSave
}: GoalConfigModalProps) {
  const [targetWeight, setTargetWeight] = useState<string>(initialWeight ? initialWeight.toString() : "");
  const [targetCalories, setTargetCalories] = useState<string>(initialCalories ? initialCalories.toString() : "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTargetWeight(initialWeight ? initialWeight.toString() : "");
      setTargetCalories(initialCalories ? initialCalories.toString() : "");
    }
  }, [isOpen, initialWeight, initialCalories]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(targetWeight);
    const calories = parseInt(targetCalories, 10);
    
    if (isNaN(weight) || isNaN(calories) || weight <= 0 || calories <= 0) {
      return; // Basic validation
    }

    try {
      setIsSaving(true);
      await onSave(weight, calories);
      onClose();
    } catch (error) {
      console.error("Failed to save goals", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card dark:bg-[#111827] border border-border/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Glow de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-border/50 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-500">
              <Target size={16} />
            </div>
            <h2 className="text-xl font-bold text-foreground">Configurar Meta</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSave} className="p-6 space-y-6 relative z-10">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Peso Objetivo (KG)
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="200"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="Ej. 75.0"
                required
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Calorías Diarias (Kcal)
              </label>
              <input
                type="number"
                step="50"
                min="1000"
                max="5000"
                value={targetCalories}
                onChange={(e) => setTargetCalories(e.target.value)}
                placeholder="Ej. 2000"
                required
                className="w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
              />
              <p className="text-[10px] text-muted-foreground mt-2">
                Usaremos esto y tu TDEE (Gasto Energético Total) para predecir cuándo llegarás a tu meta.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save size={18} /> Guardar Meta
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
