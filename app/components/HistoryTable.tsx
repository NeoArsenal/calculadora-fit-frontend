// src/app/components/HistoryTable.tsx
export default function HistoryTable({ records }: { records: any[] }) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      <table className="w-full text-left">
        <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase">
          <tr>
            <th className="p-4">Fecha</th>
            <th className="p-4">Peso</th>
            <th className="p-4">Cintura</th>
            <th className="p-4">% Grasa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-gray-700/30 transition">
              <td className="p-4 text-sm">{r.recordDate}</td>
              <td className="p-4 font-bold text-blue-400">{r.weightKg}kg</td>
              <td className="p-4 text-green-400">{r.waistCircumferenceCm}cm</td>
              <td className="p-4 text-gray-400">{r.bodyFatPercentage || '-'}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}