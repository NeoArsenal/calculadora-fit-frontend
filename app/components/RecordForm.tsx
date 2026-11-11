"use client";

import { useState } from 'react';
import { Loader2, Scale, Ruler } from "lucide-react";
import * as api from '../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useApp } from '@/app/context/AppContext';

export default function RecordForm({ onSuccess }: { onSuccess: () => void }) {
  const { CURRENT_USER_ID } = useApp();
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !waist) {
      toast.error("Por favor completa tu peso y circunferencia de cintura.");
      return;
    }

    setIsSubmitting(true);

    const savePromise = api.createRecord({
      userProfile: { id: CURRENT_USER_ID }, 
      weightKg: parseFloat(weight),
      waistCircumferenceCm: parseFloat(waist),
    });

    toast.promise(savePromise, {
      loading: 'Guardando registro biométrico...',
      success: '¡Progreso actualizado correctamente!',
      error: 'Error de conexión. No se pudo guardar.',
    });

    try {
      await savePromise;
      setWeight("");
      setWaist("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error en la API:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* CAMPO: PESO */}
      <div className="space-y-2">
        <Label htmlFor="weight" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Scale size={14} className="text-blue-500" />
          Peso Corporal (kg)
        </Label>
        <Input 
          id="weight"
          type="number" 
          step="0.1" 
          value={weight} 
          onChange={(e) => setWeight(e.target.value)}
          className="bg-background dark:bg-black/40 border border-border dark:border-white/10 text-foreground placeholder:text-muted-foreground/50 rounded-2xl h-12 px-4 font-bold text-base focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all" 
          placeholder="Ej: 86.5"
          disabled={isSubmitting}
          autoFocus
        />
      </div>

      {/* CAMPO: CINTURA */}
      <div className="space-y-2">
        <Label htmlFor="waist" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Ruler size={14} className="text-emerald-500" />
          Circunferencia de Cintura (cm)
        </Label>
        <Input 
          id="waist"
          type="number" 
          step="0.1" 
          value={waist} 
          onChange={(e) => setWaist(e.target.value)}
          className="bg-background dark:bg-black/40 border border-border dark:border-white/10 text-foreground placeholder:text-muted-foreground/50 rounded-2xl h-12 px-4 font-bold text-base focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all" 
          placeholder="Ej: 90"
          disabled={isSubmitting}
        />
      </div>

      {/* BOTÓN GUARDAR */}
      <Button 
        type="submit" 
        className="w-full h-12 mt-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-wide shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar Medición"
        )}
      </Button>
    </form>
  );
}
