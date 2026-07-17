import { getAuthHeaders } from '@/services/api';

const BASE_URL = "http://localhost:8080/api/nutrition";

export interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function scanMeal(imageBlob: Blob) {
    const formData = new FormData();
    formData.append("image", imageBlob, "capture.jpg");
    
    const headers = getAuthHeaders(false);
    // Don't set content-type for formData, fetch does it automatically with boundaries

    const res = await fetch(`${BASE_URL}/ai/scan`, {
        method: "POST",
        headers: headers,
        body: formData,
    });

    if (!res.ok) {
        const errorText = await res.text(); 
        throw new Error(errorText || "Error desconocido en el servidor");
    }

    return res.json();
}

export async function saveMeal(userId: number, mealData: MealData) {
    const res = await fetch(`${BASE_URL}/meals/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(mealData),
    });

    if (!res.ok) throw new Error("Error al guardar la comida");
    return res.json();
}

export async function getDashboardSummary(userId: number) {
    const res = await fetch(`${BASE_URL}/dashboard-summary/${userId}`, { headers: getAuthHeaders(false) });
    if (!res.ok) throw new Error("Error al cargar dashboard");
    return res.json();
}