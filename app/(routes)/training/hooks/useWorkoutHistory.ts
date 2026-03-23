import { useEffect, useState } from "react";

export function useWorkoutHistory(userId: number) {
  const [sessions, setSessions] = useState<any[]>([]);

  const loadSessions = async () => {
    const res = await fetch(`http://localhost:8080/api/workout-sessions`);
    const data = await res.json();
    setSessions(data);
  };

  useEffect(() => { loadSessions(); }, []);

  return { sessions, loadSessions };
}