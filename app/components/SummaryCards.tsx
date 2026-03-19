// src/app/components/SummaryCards.tsx
import { Activity, Beaker, Weight } from 'lucide-react';

export default function SummaryCards({ nutrition, lastWeight }: { nutrition: any, lastWeight: number }) {
  const cards = [
    { title: "Proteína Diaria", value: `${nutrition?.targetProteinGrams || 0}g`, icon: Activity, color: "text-blue-400", border: "border-blue-500/30" },
    { title: "Creatina", value: `${nutrition?.targetCreatineGrams || 0}g`, icon: Beaker, color: "text-purple-400", border: "border-purple-500/30" },
    { title: "Último Peso", value: `${lastWeight || 0} kg`, icon: Weight, color: "text-green-400", border: "border-green-500/30" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card, i) => (
        <div key={i} className={`bg-gray-800 p-6 rounded-xl border ${card.border}`}>
          <div className="flex items-center gap-4 mb-2">
            <card.icon className={card.color} />
            <h3 className="text-gray-400 uppercase text-xs font-bold">{card.title}</h3>
          </div>
          <p className="text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}