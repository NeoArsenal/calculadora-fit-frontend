// src/app/page.tsx
"use client";
import { useEffect, useState, useCallback } from 'react';
import * as api from '../services/api';
import SummaryCards from './components/SummaryCards';
import RecordForm from './components/RecordForm';
import ProgressChart from './components/ProgressChart';
import HistoryTable from './components/HistoryTable';

interface PhysicalRecord {
  id?: number;
  weightKg: number;
  bodyFatPercent?: number;
  date?: string;
  [key: string]: unknown;
}

export default function Dashboard() {
  const [records, setRecords] = useState<PhysicalRecord[]>([]);
  const [nutrition, setNutrition] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [recordsData, nutritionData] = await Promise.all([
        api.getRecords(1),
        api.getNutrition(1)
      ]);
      setRecords(recordsData);
      setNutrition(nutritionData);
    } catch (e) { console.error(e); }
  }, []); // sin deps porque api y el userId son constantes

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 lg:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Dashboard <span className="text-blue-500">Fit</span></h1>
        <p className="text-gray-400 mt-2">Bienvenido Alonso, monitorea tu transformación.</p>
      </header>

      <SummaryCards nutrition={nutrition} lastWeight={records[0]?.weightKg} />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <ProgressChart records={records} />
          <HistoryTable records={records} />
        </div>
        
        <aside>
          <RecordForm onSuccess={loadData} />
          {/* Aquí podrías poner el componente de inventario de suplementos luego */}
        </aside>
      </div>
    </main>
  );
}