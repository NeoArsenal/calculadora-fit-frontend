// training/services/exerciseService.ts

const BASE_URL = "http://localhost:8080/api";

export async function getExercises() {
  const res = await fetch(`${BASE_URL}/exercises`);
  if (!res.ok) throw new Error("Error al cargar ejercicios");
  return res.json();
}

// 🆕 Añade esto:
export async function saveRoutine(routineData: any) {
  const res = await fetch(`${BASE_URL}/routines`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routineData),
  });
  if (!res.ok) throw new Error("Error al guardar la rutina");
  return res.json();
}