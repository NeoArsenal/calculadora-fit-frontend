export default function ProtocolCard({ ex }: any) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 backdrop-blur-md">
      
      <img
        src={ex.gifUrl}
        alt={ex.name}
        className="rounded-lg w-full h-[140px] object-cover mb-3"
      />

      <h3 className="text-white font-bold text-sm capitalize">
        {ex.name}
      </h3>

      <p className="text-xs text-gray-400">
        {ex.target} • {ex.bodyPart}
      </p>

      <div className="flex justify-between mt-3 text-xs">
        <span className="text-blue-400 font-bold">4 sets</span>
        <span className="text-gray-500">8-12 reps</span>
      </div>
    </div>
  );
}