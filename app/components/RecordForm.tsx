"use client";
import { useState } from 'react';
import { Loader2 } from "lucide-react"; // Icono de carga
import * as api from '../../services/api';
// --- IMPORTS DE SHADCN/UI (NUEVOS) ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import { useApp } from '@/app/context/AppContext';

export default function RecordForm({ onSuccess }: { onSuccess: () => void }) {
  const { CURRENT_USER_ID } = useApp();
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const savePromise = api.createRecord({
      userProfile: { id: CURRENT_USER_ID }, 
      weightKg: parseFloat(weight),
      waistCircumferenceCm: parseFloat(waist),
    });

    // 2. Le pasamos la promesa a Sonner para que maneje la UX visual
    toast.promise(savePromise, {
      loading: 'Guardando registro biométrico...',
      success: '¡Progreso actualizado correctamente!',
      error: 'Error de conexión. No se pudo guardar.',
    });

    // 3. Ejecutamos la lógica que debe ocurrir al terminar
    try {
      await savePromise;
      
      // Si la promesa se cumple (Status 200 OK):
      setWeight("");
      setWaist("");
      if (onSuccess) onSuccess(); // Esto recargará tu tabla e historial
      
    } catch (err) {
      console.error("Error en la API:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass-card border-white/10 dark:border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/15 transition-all duration-500" />
      
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
          Nuevo Registro Diario
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* CAMPO: PESO */}
          <div className="grid gap-2">
            <Label htmlFor="weight" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Peso Corporal (kg)
            </Label>
            <Input 
              id="weight"
              type="number" 
              step="0.1" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="bg-white/5 dark:bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all shadow-inner" 
              placeholder="Ej: 86.5"
              disabled={isSubmitting}
            />
            {errors.weightKg && <span className="text-rose-400 text-[10px] font-semibold">{errors.weightKg}</span>}
          </div>

          {/* CAMPO: CINTURA */}
          <div className="grid gap-2">
            <Label htmlFor="waist" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Circunferencia Cintura (cm)
            </Label>
            <Input 
              id="waist"
              type="number" 
              step="0.1" 
              value={waist} 
              onChange={(e) => setWaist(e.target.value)}
              className="bg-white/5 dark:bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground/60 rounded-xl h-11 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all shadow-inner" 
              placeholder="Ej: 90"
              disabled={isSubmitting}
            />
            {errors.waistCircumferenceCm && <span className="text-rose-400 text-[10px] font-semibold">{errors.waistCircumferenceCm}</span>}
          </div>

          {/* BOTÓN CON ESTADO DE CARGA */}
          <Button 
            type="submit" 
            className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all duration-200 active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Registro"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}