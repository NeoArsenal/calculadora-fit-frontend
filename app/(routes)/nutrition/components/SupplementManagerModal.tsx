"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, FlaskConical, Dumbbell, Zap, Bone, Check, Loader2 } from "lucide-react";
import { addSupplement } from "@/services/api";
import { toast } from "sonner";

const MASTER_LIST = [
  { id: "m1", name: "Creatina Monohidratada", brand: "Genérica", icon: <FlaskConical className="text-blue-500" />, defaultDose: "5G • POST", defaultServing: 5, totalGrams: 300, macros: { cal: 0, p: 0, c: 0, f: 0 } },
  { id: "m2", name: "Proteína Whey", brand: "Genérica", icon: <Dumbbell className="text-amber-500" />, defaultDose: "1 SCOOP", defaultServing: 30, totalGrams: 900, macros: { cal: 120, p: 25, c: 3, f: 1 } },
  { id: "m3", name: "Pre-Entreno", brand: "Genérica", icon: <Zap className="text-pink-500" />, defaultDose: "1 SCOOP", defaultServing: 15, totalGrams: 300, macros: { cal: 10, p: 0, c: 2, f: 0 } },
  { id: "m4", name: "Omega 3", brand: "Genérica", icon: <Bone className="text-indigo-500" />, defaultDose: "2 CAPS", defaultServing: 2, totalGrams: 120, macros: { cal: 20, p: 0, c: 0, f: 2 } },
];

export default function SupplementManagerModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSup, setSelectedSup] = useState<any>(null);
  
  // Form State
  const [doseDesc, setDoseDesc] = useState("");
  const [serving, setServing] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = MASTER_LIST.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (sup: any) => {
    setSelectedSup(sup);
    setDoseDesc(sup.defaultDose);
    setServing(sup.defaultServing.toString());
  };

  const handleSave = async () => {
    if (!selectedSup) return;
    try {
      setLoading(true);
      const payload = {
        name: selectedSup.name,
        brand: selectedSup.brand,
        totalGrams: selectedSup.totalGrams,
        servingSizeGrams: parseFloat(serving) || selectedSup.defaultServing,
        currentStockGrams: selectedSup.totalGrams,
        doseDescription: doseDesc,
        calories: selectedSup.macros.cal,
        protein: selectedSup.macros.p,
        carbs: selectedSup.macros.c,
        fats: selectedSup.macros.f
      };
      await addSupplement(payload);
      toast.success(`${selectedSup.name} añadido al stack ✅`);
      await onSuccess();
      onClose();
      setSelectedSup(null);
    } catch (e: any) {
      console.error(e);
      toast.error(`Error: ${e?.message || 'No se pudo añadir el suplemento'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Configurar Performance Stack
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona y personaliza los suplementos de tu stack diario.
          </DialogDescription>
        </DialogHeader>

        {!selectedSup ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar suplemento (ej. Creatina)..." 
                className="pl-10 bg-gray-50 dark:bg-[#25262b] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" 
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {filtered.map(sup => (
                <div 
                  key={sup.id}
                  onClick={() => handleSelect(sup)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#25262b] hover:bg-gray-100 dark:hover:bg-[#2c2d33] cursor-pointer transition-colors border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-black/30 flex items-center justify-center">
                      {sup.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{sup.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Por defecto: {sup.defaultDose}</p>
                    </div>
                  </div>
                  <Plus size={18} className="text-blue-500" />
                </div>
              ))}
              
              {filtered.length === 0 && (
                <div className="text-center p-6 text-gray-500 text-sm">
                  No se encontraron resultados
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
               <div className="w-12 h-12 rounded-full bg-white dark:bg-black/50 flex items-center justify-center border border-blue-100 dark:border-transparent">
                  {selectedSup.icon}
               </div>
               <div>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{selectedSup.name}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 font-bold uppercase tracking-widest">Personalizar Dosis</p>
               </div>
             </div>

             <div className="space-y-4">
                <div className="space-y-1">
                   <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-widest">Descripción de la toma</Label>
                   <Input 
                     value={doseDesc}
                     onChange={(e) => setDoseDesc(e.target.value)}
                     className="bg-gray-50 dark:bg-[#25262b] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold"
                     placeholder="Ej: 5G • POST"
                   />
                </div>
                <div className="space-y-1">
                   <Label className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-widest">Gramos por toma</Label>
                   <Input 
                     type="number"
                     value={serving}
                     onChange={(e) => setServing(e.target.value)}
                     className="bg-gray-50 dark:bg-[#25262b] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-bold"
                     placeholder="Ej: 5"
                   />
                </div>
                
                {selectedSup.macros.cal > 0 && (
                   <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                     <p className="text-xs text-amber-500 font-bold mb-1">⚡️ Integración con Nutrición</p>
                     <p className="text-xs text-gray-400">
                       Al tomar este suplemento, se inyectarán <b>{selectedSup.macros.p}g de proteína</b> y <b>{selectedSup.macros.cal}kcal</b> a tu timeline del día.
                     </p>
                   </div>
                )}
             </div>

             <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-transparent" onClick={() => setSelectedSup(null)}>
                  Volver
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleSave} disabled={loading}>
                  {loading ? "Añadiendo..." : "Añadir al Stack"}
                </Button>
             </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
