import { Dumbbell, Trash2 } from "lucide-react";

export default function ProtocolCard({ ex, onRemove }: any) {
  return (
    <div className="bg-white dark:bg-[#0f0f11] border border-gray-200 dark:border-white/5 rounded-[1.5rem] p-4 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors duration-300">
      
      {/* Contenedor de la Imagen con fondo blanco estricto para que mix-blend funcione perfecto */}
      <div className="bg-white rounded-xl w-full h-[140px] mb-4 border border-gray-100 dark:border-white/10 overflow-hidden flex items-center justify-center shadow-inner relative">
        {ex.gifUrl ? (
          <img
            src={ex.gifUrl}
            alt={ex.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply opacity-90 scale-110"
          />
        ) : (
          <Dumbbell className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-transparent to-transparent pointer-events-none" />
      </div>

      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 overflow-hidden pr-2">
          <h3 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tight truncate transition-colors">
            {ex.name}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400 truncate">
            {ex.target} <span className="text-gray-300 dark:text-gray-600 mx-1">•</span> {ex.bodyPart}
          </p>
        </div>
        {onRemove && (
          <button 
              onClick={onRemove}
              className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-500 transition-colors p-1"
              title="Quitar ejercicio"
          >
              <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
        <span className="text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md">
          4 Sets
        </span>
        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          8-12 Reps
        </span>
      </div>
    </div>
  );
}