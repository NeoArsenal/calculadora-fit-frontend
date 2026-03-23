const BASE_URL = "http://localhost:8080/api/nutrition";

// ✅ Escáner de IA
export async function scanMeal(imageBlob: Blob) {
    const formData = new FormData();
    formData.append("image", imageBlob, "capture.jpg");

    const res = await fetch(`http://localhost:8080/api/nutrition/ai/scan`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        // 🔍 Intentamos obtener el mensaje de error que enviamos desde Spring Boot
        const errorText = await res.text(); 
        throw new Error(errorText || "Error desconocido en el servidor");
    }

    return res.json();
}

// ✅ ESTA ES LA QUE TE FALTA EXPORTAR
export async function saveMeal(mealData: any) {
    const res = await fetch(`${BASE_URL}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mealData),
    });

    if (!res.ok) throw new Error("Error al guardar la comida");
    return res.json();
}

export async function getDashboardSummary() {
    const res = await fetch(`${BASE_URL}/dashboard-summary`);
    if (!res.ok) throw new Error("Error al cargar dashboard");
    return res.json();
}