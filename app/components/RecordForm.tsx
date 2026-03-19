// src/app/components/RecordForm.tsx
"use client";
import { useState } from 'react';
import * as api from '../../services/api';

export default function RecordForm({ onSuccess }: { onSuccess: () => void }) {
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await api.createRecord({
        userProfile: { id: 1 },
        weightKg: parseFloat(weight),
        waistCircumferenceCm: parseFloat(waist)
      });
      setWeight(""); setWaist("");
      onSuccess(); // Esto refresca los datos en la página principal
    } catch (err: any) {
      setErrors(err);
    }
  };

  return (
    <section className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-blue-300">Nuevo Registro Diario</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <input 
            type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:border-blue-500" placeholder="Peso (kg)"
          />
          {errors.weightKg && <span className="text-red-400 text-[10px]">{errors.weightKg}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <input 
            type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:border-blue-500" placeholder="Cintura (cm)"
          />
          {errors.waistCircumferenceCm && <span className="text-red-400 text-[10px]">{errors.waistCircumferenceCm}</span>}
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-bold transition">Guardar</button>
      </form>
    </section>
  );
}