import { getAuthHeaders } from '@/services/api';

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/nutrition`;

export interface MealIngredientItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  isPeruvian?: boolean;
  confidence?: number;
  totalGrams?: number;
  tip?: string;
  items?: MealIngredientItem[];
}

// Catálogo instantáneo calibrado con CENAN / INS Perú (Tablas Peruanas de Composición de Alimentos)
export const PERUVIAN_DISH_PRESETS: MealData[] = [
  {
    name: "Lomo Saltado Clásico",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 98,
    totalGrams: 520,
    calories: 845,
    protein: 42,
    carbs: 86,
    fat: 36,
    tip: "Excelente proteína de res. Si estás en definición, reduce 1/3 de las papas fritas o del arroz (-160 kcal).",
    items: [
      { name: "Arroz blanco graneado", grams: 180, calories: 234, protein: 4.8, carbs: 50.4, fat: 0.5 },
      { name: "Lomo de res salteado al wok (cebolla, tomate, sillao)", grams: 190, calories: 325, protein: 33.5, carbs: 5.5, fat: 18.0 },
      { name: "Papas amarillas fritas", grams: 150, calories: 286, protein: 3.7, carbs: 30.1, fat: 17.5 }
    ]
  },
  {
    name: "1/4 Pollo a la Brasa (Pecho) c/ Papas y Ensalada",
    category: "Brasas",
    isPeruvian: true,
    confidence: 98,
    totalGrams: 510,
    calories: 860,
    protein: 54,
    carbs: 62,
    fat: 43,
    tip: "La parte pecho aporta altísima proteína. Retirar parte de la piel y moderar la mayonesa ahorra ~180 kcal.",
    items: [
      { name: "1/4 Pollo a la brasa (parte pecho con piel)", grams: 220, calories: 410, protein: 48.0, carbs: 1.0, fat: 23.0 },
      { name: "Papas fritas pollería", grams: 160, calories: 330, protein: 4.5, carbs: 52.0, fat: 11.5 },
      { name: "Ensalada fresca (lechuga, tomate, pepino, zanahoria)", grams: 110, calories: 35, protein: 1.2, carbs: 7.0, fat: 0.3 },
      { name: "Ají pollero / Vinagreta", grams: 20, calories: 85, protein: 0.3, carbs: 2.0, fat: 8.2 }
    ]
  },
  {
    name: "Ceviche de Pescado Clásico",
    category: "Marina",
    isPeruvian: true,
    confidence: 99,
    totalGrams: 460,
    calories: 495,
    protein: 44,
    carbs: 64,
    fat: 6,
    tip: "Uno de los mejores platos peruanos para definición: proteína magra y carbohidratos complejos (camote y choclo).",
    items: [
      { name: "Pescado blanco fresco en leche de tigre y cebolla", grams: 220, calories: 215, protein: 39.0, carbs: 5.0, fat: 3.5 },
      { name: "Camote amarillo glaseado", grams: 110, calories: 125, protein: 1.6, carbs: 29.0, fat: 0.2 },
      { name: "Choclo peruano desgranado", grams: 90, calories: 95, protein: 3.2, carbs: 20.0, fat: 1.0 },
      { name: "Cancha serrana tostada", grams: 40, calories: 60, protein: 1.2, carbs: 10.0, fat: 1.3 }
    ]
  },
  {
    name: "Ají de Gallina Tradicional",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 97,
    totalGrams: 490,
    calories: 790,
    protein: 38,
    carbs: 82,
    fat: 34,
    tip: "La crema contiene leche evaporada, pan/galleta y pecanas. Controlar la porción de arroz equilibra los macros.",
    items: [
      { name: "Pechuga deshilachada en crema de ají amarillo y pecanas", grams: 230, calories: 440, protein: 31.0, carbs: 18.0, fat: 27.0 },
      { name: "Arroz blanco graneado", grams: 160, calories: 208, protein: 4.3, carbs: 44.8, fat: 0.4 },
      { name: "Papa blanca sancochada", grams: 70, calories: 62, protein: 1.4, carbs: 14.2, fat: 0.1 },
      { name: "Medio huevo duro y aceituna", grams: 30, calories: 80, protein: 3.3, carbs: 5.0, fat: 6.5 }
    ]
  },
  {
    name: "Arroz Chaufa de Pollo",
    category: "Chifa / Fusión",
    isPeruvian: true,
    confidence: 97,
    totalGrams: 450,
    calories: 760,
    protein: 36,
    carbs: 88,
    fat: 28,
    tip: "Salteado al wok con huevo y pollo. Puedes pedirlo bajo en aceite o agregar extra pollo para mejorar el ratio proteico.",
    items: [
      { name: "Arroz salteado al wok con sillao, cebolla china y aceite", grams: 290, calories: 450, protein: 8.0, carbs: 85.0, fat: 8.5 },
      { name: "Trozos de pechuga de pollo al wok", grams: 110, calories: 195, protein: 22.0, carbs: 1.5, fat: 11.0 },
      { name: "Tortilla de huevo picada", grams: 50, calories: 115, protein: 6.0, carbs: 1.5, fat: 8.5 }
    ]
  },
  {
    name: "Arroz con Pollo + Papa a la Huancaína",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 97,
    totalGrams: 540,
    calories: 880,
    protein: 43,
    carbs: 92,
    fat: 37,
    tip: "Clásico combinado peruano. La crema huancaína aporta energía densa por el queso y aceite.",
    items: [
      { name: "Arroz verde al culantro con arvejas y choclo", grams: 220, calories: 330, protein: 7.0, carbs: 64.0, fat: 5.0 },
      { name: "Presa de pollo guisada (pierna/muslo)", grams: 160, calories: 290, protein: 31.0, carbs: 1.0, fat: 17.5 },
      { name: "Papa con Crema Huancaína", grams: 160, calories: 260, protein: 5.0, carbs: 27.0, fat: 14.5 }
    ]
  },
  {
    name: "Seco de Res con Frejoles y Arroz",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 97,
    totalGrams: 530,
    calories: 810,
    protein: 45,
    carbs: 94,
    fat: 27,
    tip: "Ideal para etapa de volumen muscular: combina proteína de res, hierro y carbohidratos de absorción lenta (frejol canario).",
    items: [
      { name: "Seco de res al culantro con zanahoria y papa", grams: 200, calories: 350, protein: 32.0, carbs: 10.0, fat: 20.0 },
      { name: "Frejol canario guisado", grams: 170, calories: 252, protein: 8.7, carbs: 39.2, fat: 6.6 },
      { name: "Arroz blanco graneado", grams: 160, calories: 208, protein: 4.3, carbs: 44.8, fat: 0.4 }
    ]
  },
  {
    name: "Tallarines Verdes con Bistec Apanado",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 96,
    totalGrams: 480,
    calories: 920,
    protein: 46,
    carbs: 85,
    fat: 43,
    tip: "Alto aporte energético para días de pierna o fuerza. Cambiar bistec apanado por pechuga a la plancha ahorra ~190 kcal.",
    items: [
      { name: "Tallarines en salsa de albahaca, espinaca, queso fresco y pecanas", grams: 290, calories: 530, protein: 16.0, carbs: 68.0, fat: 21.0 },
      { name: "Bistec de res apanado", grams: 190, calories: 390, protein: 30.0, carbs: 17.0, fat: 22.0 }
    ]
  },
  {
    name: "Pan con Chicharrón y Camote Frito",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 98,
    totalGrams: 310,
    calories: 690,
    protein: 32,
    carbs: 62,
    fat: 34,
    tip: "Desayuno clásico peruano alto en proteínas y energía.",
    items: [
      { name: "Pan francés / ciabatta grande", grams: 80, calories: 220, protein: 7.0, carbs: 44.0, fat: 1.5 },
      { name: "Chicharrón de cerdo", grams: 120, calories: 330, protein: 24.0, carbs: 0.0, fat: 26.0 },
      { name: "Rodajas de camote frito y sarza criolla", grams: 110, calories: 140, protein: 1.0, carbs: 18.0, fat: 6.5 }
    ]
  },
  {
    name: "Causa Rellena de Pollo",
    category: "Cocina Peruana",
    isPeruvian: true,
    confidence: 97,
    totalGrams: 340,
    calories: 480,
    protein: 24,
    carbs: 46,
    fat: 22,
    tip: "Excelente opción moderada en calorías gracias a la papa amarilla y pechuga de pollo con palta.",
    items: [
      { name: "Masa de papa amarilla con ají amarillo y limón", grams: 190, calories: 210, protein: 3.5, carbs: 42.0, fat: 3.0 },
      { name: "Relleno de pollo deshilachado con mayonesa ligera", grams: 100, calories: 185, protein: 19.5, carbs: 1.5, fat: 11.0 },
      { name: "Palta y medio huevo duro", grams: 50, calories: 85, protein: 1.0, carbs: 2.5, fat: 8.0 }
    ]
  }
];

export async function scanMeal(imageBlob: Blob, contextHint?: string) {
    const formData = new FormData();
    formData.append("image", imageBlob, "capture.jpg");
    if (contextHint && contextHint.trim()) {
        formData.append("context", contextHint.trim());
    }
    
    const headers = getAuthHeaders(false);

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

export async function analyzeMealText(description: string) {
    const res = await fetch(`${BASE_URL}/ai/analyze-text`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ description }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al analizar la descripción con IA");
    }

    return res.json();
}

export async function saveMeal(userId: number, mealData: MealData) {
    const res = await fetch(`${BASE_URL}/meals/${userId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: mealData.name,
            calories: Math.round(mealData.calories),
            protein: Math.round(mealData.protein),
            carbs: Math.round(mealData.carbs),
            fat: Math.round(mealData.fat),
        }),
    });

    if (!res.ok) throw new Error("Error al guardar la comida");
    return res.json();
}

export async function getDashboardSummary(userId: number) {
    const res = await fetch(`${BASE_URL}/dashboard-summary/${userId}`, { headers: getAuthHeaders(false) });
    if (!res.ok) throw new Error("Error al cargar dashboard");
    return res.json();
}