import { useState, useEffect, useCallback } from 'react';
import * as api from '@/services/api';

export interface PhysicalRecord {
  id: number;
  recordDate: string;
  weightKg: number;
  waistCircumferenceCm: number;
  bodyFatPercentage?: number;
}

// Recibimos el userId como parámetro para que no esté pegado al código
export function useDashboard(userId: number | null) {
  const [records, setRecords] = useState<PhysicalRecord[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 🛡️ EL PARCHE: Agregamos .catch() a cada petición por separado.
      // Si el backend lanza 400 o 404 porque la BD está vacía, lo atrapamos aquí
      // y devolvemos valores por defecto ([], null) sin romper la aplicación.
      const [recordsData, nutritionData] = await Promise.all([
        api.getRecords(userId).catch((err) => {
          console.warn("Aviso: No se pudo cargar el historial (posiblemente base vacía).", err);
          return []; // Devuelve lista vacía para activar tu Escudo Empty State
        }),
        api.getNutrition(userId).catch((err) => {
          console.warn("Aviso: No se pudo calcular la nutrición (faltan datos del usuario).", err);
          return null; // Devuelve null para no romper el Dashboard
        })
      ]);
      
      setRecords(recordsData);
      setNutrition(nutritionData);

    } catch (e) {
      // Este catch AHORA SOLO saltará si el servidor de Spring Boot está 100% apagado 
      // o hay un error catastrófico de red (CORS, servidor caído, etc.)
      console.error("Error crítico de conexión con Kallp:", e);
      setError("No se pudo conectar con el servidor de Spring Boot.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { records, nutrition, loading, error, loadData };
}