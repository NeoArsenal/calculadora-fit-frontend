export default function FitAICoach({ activeFocus, records, onClose }: any) {
  if (!activeFocus) return null; // Solo aparece si Alonso toca un Hotspot

  const currentWeight = records[0]?.weightKg;
  const waist = records[0]?.waistCircumferenceCm;

  const getMessage = () => {
    if (activeFocus === 'waist') {
      return `Alonso, tu medida de cintura actual es de ${waist}cm. Para tu 8vo ciclo, estamos buscando definición. ¿Has mantenido el cardio esta semana?`;
    }
    if (activeFocus === 'chest') {
      return `Con ${currentWeight}kg, el enfoque en el torso es clave. El volumen está funcionando, pero no descuides la técnica en el press banca.`;
    }
    return "Analizando datos biométricos...";
  };

  return (
    <div className="fixed bottom-10 right-10 w-80 bg-gray-900/90 border border-blue-500/30 backdrop-blur-xl p-6 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-black text-blue-400 text-sm uppercase tracking-widest italic">Kallp: AI Analysis</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
      </div>
      <p className="text-gray-200 text-sm leading-relaxed mb-4">{getMessage()}</p>
      <div className="flex gap-2">
        <button className="text-[10px] bg-blue-600/20 border border-blue-500/50 px-3 py-1 rounded-full text-blue-300">Ver dieta</button>
        <button className="text-[10px] bg-emerald-600/20 border border-emerald-500/50 px-3 py-1 rounded-full text-emerald-300">Ajustar rutina</button>
      </div>
    </div>
  );
}