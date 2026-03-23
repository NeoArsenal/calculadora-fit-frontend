import { useEffect, useState } from "react";
import { getExercises } from "../services/exerciseService";

export function useExercises() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading };
}