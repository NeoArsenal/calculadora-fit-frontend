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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [records, setRecords] = useState<PhysicalRecord[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const [profileData, recordsData, nutritionData] = await Promise.all([
        api.getUserProfile(userId).catch((err) => {
          console.warn("Aviso: No se pudo cargar el perfil.", err);
          return null;
        }),
        api.getRecords(userId).catch((err) => {
          console.warn("Aviso: No se pudo cargar el historial.", err);
          return []; 
        }),
        api.getNutrition(userId).catch((err) => {
          console.warn("Aviso: No se pudo calcular la nutrición.", err);
          return null; 
        })
      ]);
      
      setUserProfile(profileData);
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

  return { userProfile, records, nutrition, loading, error, loadData };
}