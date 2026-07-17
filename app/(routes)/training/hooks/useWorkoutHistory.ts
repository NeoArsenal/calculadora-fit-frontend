import { useEffect, useState } from "react";

export function useWorkoutHistory(userId: number) {
  const [sessions, setSessions] = useState<any[]>([]);

  const loadSessions = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const res = await fetch(`${apiUrl}/workout-sessions`);
    const data = await res.json();
    setSessions(data);
  };

  useEffect(() => { loadSessions(); }, []);

  return { sessions, loadSessions };
}