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

export default function RecordForm({ onSuccess }: { onSuccess: () => void }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [errors, setErrors] = useState<any>({});
  // NUEVO ESTADO PARA UX PROFESIONAL
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // 1. Encapsulamos la llamada a Spring Boot en una promesa
    const savePromise = api.createRecord({
      userProfile: { id: 1 }, 
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
    <Card className="border border-gray-700 bg-gray-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-400">Nuevo Registro Diario</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CAMPO: PESO */}
          <div className="grid gap-2">
            <Label htmlFor="weight" className="text-sm text-gray-400">Peso Corporal (kg)</Label>
            <Input 
              id="weight"
              type="number" 
              step="0.1" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="bg-gray-700 border border-gray-600 outline-none focus:border-blue-500" 
              placeholder="Ej: 86.5"
              disabled={isSubmitting} // Bloquear durante carga
            />
            {errors.weightKg && <span className="text-red-400 text-[10px]">{errors.weightKg}</span>}
          </div>

          {/* CAMPO: CINTURA */}
          <div className="grid gap-2">
            <Label htmlFor="waist" className="text-sm text-gray-400">Circunferencia Cintura (cm)</Label>
            <Input 
              id="waist"
              type="number" 
              step="0.1" 
              value={waist} 
              onChange={(e) => setWaist(e.target.value)}
              className="bg-gray-700 border border-gray-600 outline-none focus:border-blue-500" 
              placeholder="Ej: 90"
              disabled={isSubmitting} // Bloquear durante carga
            />
            {errors.waistCircumferenceCm && <span className="text-red-400 text-[10px]">{errors.waistCircumferenceCm}</span>}
          </div>

          {/* BOTÓN CON ESTADO DE CARGA (UX PROFESIONAL) */}
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold"
            disabled={isSubmitting} // Bloquear clic múltiple
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Spinner giratorio */}
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