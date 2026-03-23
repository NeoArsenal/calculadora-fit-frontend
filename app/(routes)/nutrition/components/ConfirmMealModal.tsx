"use client";
import { Check, Flame, Trophy } from "lucide-react";

interface ConfirmMealModalProps {
  data: any;
  onConfirm: (meal: any) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ConfirmMealModal({ data, onConfirm, onCancel, loading }: ConfirmMealModalProps) {
  if (!data) return null;

  const results = data?.recognitionResults || data?.recognition_results || [];
  
  if (results.length === 0) {
    return (
      <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-[#0f0f11] border border-red-500/20 p-8 rounded-[2.5rem] text-center space-y-4">
          <p className="text-white font-black uppercase text-xs">⚠️ Error de Conexión con IA</p>
          <button onClick={onCancel} className="text-blue-500 text-[10px] font-bold uppercase underline">Cerrar</button>
        </div>
      </div>
    );
  }

  const meal = results[0] || {};
  const macros = meal?.nutritionalInfo || meal?.nutritional_info || {};

  const formatVal = (val: any) => {
    const num = parseFloat(val);
    return !isNaN(num) ? Math.round(num) : 0;
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f0f11] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-500 mb-2">
            <Trophy size={24} />
          </div>
          <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter text-center">IA Detected_</h2>
          <p className="text-blue-500 font-bold uppercase text-[10px] tracking-[0.4em] italic text-center">
            {meal.name || "Plato Desconocido"}
          </p>
        </div>

        {/* MACROS CARDS */}
        <div className="grid grid-cols-3 gap-3">
          <MacroCard label="Prot" value={`${formatVal(macros.protein)}g`} color="text-blue-500" />
          <MacroCard label="Carbs" value={`${formatVal(macros.carbs)}g`} color="text-pink-500" />
          <MacroCard label="Fats" value={`${formatVal(macros.fat)}g`} color="text-purple-500" />
        </div>

        {/* ENERGÍA TOTAL */}
        <div className="bg-white/5 p-5 rounded-[2rem] flex justify-between items-center border border-white/5">
          <div className="flex items-center gap-2 text-white">
            <Flame size={18} className="text-orange-500" />
            <span className="font-black italic uppercase text-xs tracking-widest">Energía Total</span>
          </div>
          <span className="text-2xl font-black text-white italic">
            {formatVal(macros.calories)} <span className="text-[10px] uppercase ml-1">kcal</span>
          </span>
        </div>

        {/* CONTROLES */}
        <div className="flex gap-4 pt-4">
          <button onClick={onCancel} className="flex-1 py-5 rounded-3xl border border-white/5 text-white/40 font-bold uppercase text-[10px] hover:bg-white/5 transition-all">
            Cancelar
          </button>
          
          <button 
            disabled={loading}
            onClick={() => onConfirm(meal)} 
            className="flex-[2] py-5 rounded-3xl bg-blue-600 text-white font-black uppercase text-[10px] shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Guardando..." : <><Check size={16} /> Confirmar Log</>}
          </button>
        </div>

      </div>
    </div>
  );
}

function MacroCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-4 rounded-[2rem] text-center">
      <p className="text-[8px] text-muted-foreground font-black uppercase mb-1 tracking-widest">{label}</p>
      <p className={`text-sm font-black italic ${color}`}>{value}</p>
    </div>
  );
}