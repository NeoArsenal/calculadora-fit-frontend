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

// ============================================================================
// 🧠 MOTOR NLP NUTRICIONAL PERUANO (CENAN / FITIA) PARA DESCRIPCIONES DE TEXTO
// ============================================================================
interface FoodLexiconEntry {
  keywords: RegExp;
  item: MealIngredientItem;
  isPeruvian?: boolean;
  category?: string;
}

const FOOD_LEXICON: FoodLexiconEntry[] = [
  // Platos compuestos y bases peruanas
  {
    keywords: /tallarines?\s+verdes?/i,
    item: { name: "Tallarines en salsa verde (albahaca, espinaca, queso y pecanas)", grams: 280, calories: 510, protein: 15.5, carbs: 66.0, fat: 20.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /tallarines?\s+rojos?/i,
    item: { name: "Tallarines en salsa roja peruana", grams: 280, calories: 420, protein: 12.0, carbs: 72.0, fat: 9.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /tallar[ií]n(es)?\s+saltados?/i,
    item: { name: "Tallarín saltado al wok con verduras", grams: 320, calories: 490, protein: 14.0, carbs: 74.0, fat: 15.0 },
    isPeruvian: true,
    category: "Chifa / Fusión",
  },
  {
    keywords: /papa\s+(a\s+la\s+)?huanca[ií]na|huanca[ií]na/i,
    item: { name: "Papa con crema Huancaína", grams: 160, calories: 260, protein: 5.5, carbs: 27.0, fat: 14.5 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /mostrito/i,
    item: { name: "Mostrito (Arroz chaufa + 1/4 Pollo a la brasa + Papas fritas)", grams: 580, calories: 1080, protein: 58.0, carbs: 105.0, fat: 48.0 },
    isPeruvian: true,
    category: "Brasas / Chifa",
  },
  {
    keywords: /aeropuerto/i,
    item: { name: "Aeropuerto Chifa (Chaufa + Tallarín chino + Frejolito)", grams: 520, calories: 920, protein: 42.0, carbs: 112.0, fat: 33.0 },
    isPeruvian: true,
    category: "Chifa / Fusión",
  },
  {
    keywords: /caldo\s+de\s+gallina/i,
    item: { name: "Caldo de gallina completo (presa, fideos, papa y huevo)", grams: 550, calories: 640, protein: 42.0, carbs: 58.0, fat: 26.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /arroz\s+a\s+la\s+cubana/i,
    item: { name: "Arroz a la cubana (arroz, plátano frito y 2 huevos fritos)", grams: 410, calories: 670, protein: 19.0, carbs: 84.0, fat: 28.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /tacu\s+tacu/i,
    item: { name: "Tacu tacu de frejol canario y arroz dorado", grams: 300, calories: 490, protein: 15.0, carbs: 74.0, fat: 15.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /carapulcra/i,
    item: { name: "Carapulcra chinchana con maní y cerdo/pollo", grams: 280, calories: 480, protein: 24.0, carbs: 48.0, fat: 21.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /sopa\s+seca/i,
    item: { name: "Sopa seca al albahaca y achiote", grams: 220, calories: 350, protein: 9.0, carbs: 56.0, fat: 10.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /anticuchos?/i,
    item: { name: "Anticuchos de corazón (2 palitos) con papa y choclo", grams: 320, calories: 460, protein: 38.0, carbs: 36.0, fat: 18.0 },
    isPeruvian: true,
    category: "Brasas",
  },
  {
    keywords: /salchipapas?|salchibroster/i,
    item: { name: "Salchipapa clásica (papas fritas y hot dog)", grams: 380, calories: 780, protein: 21.0, carbs: 68.0, fat: 47.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /lentejas?|lentejitas?/i,
    item: { name: "Lentejas guisadas caseras", grams: 200, calories: 240, protein: 14.0, carbs: 38.0, fat: 3.5 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /frejol(es)?|frijol(es)?|menestra/i,
    item: { name: "Frejol canario guisado", grams: 180, calories: 255, protein: 9.5, carbs: 40.0, fat: 6.5 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },

  // Proteínas individuales
  {
    keywords: /pechuga\s+(de\s+pollo\s+)?(a\s+la\s+plancha|sancochada|asada)?|pollo\s+a\s+la\s+plancha|filete\s+de\s+pollo/i,
    item: { name: "Pechuga de pollo a la plancha", grams: 160, calories: 264, protein: 49.0, carbs: 0.0, fat: 5.8 },
    category: "Fitness / Casero",
  },
  {
    keywords: /bistec\s+apanado|milanesa/i,
    item: { name: "Bistec / Milanesa apanada", grams: 180, calories: 375, protein: 30.0, carbs: 16.0, fat: 21.0 },
    isPeruvian: true,
    category: "Cocina Peruana",
  },
  {
    keywords: /bistec|carne\s+de\s+res|lomo\s+fino|asado/i,
    item: { name: "Corte de res a la plancha / guisado", grams: 160, calories: 295, protein: 38.0, carbs: 0.0, fat: 15.0 },
  },
  {
    keywords: /at[uú]n|lata\s+de\s+at[uú]n/i,
    item: { name: "Filete de atún al agua/aceite escurrido", grams: 120, calories: 155, protein: 31.0, carbs: 0.0, fat: 3.0 },
  },
  {
    keywords: /pescado\s+frito|chicharr[oó]n\s+de\s+pescado|jalea/i,
    item: { name: "Pescado frito / Jalea crujiente", grams: 180, calories: 340, protein: 32.0, carbs: 14.0, fat: 17.0 },
    isPeruvian: true,
  },
  {
    keywords: /pescado\s+(a\s+la\s+plancha|al\s+vapor|sudado)|filete\s+de\s+pescado/i,
    item: { name: "Filete de pescado blanco a la plancha", grams: 180, calories: 195, protein: 38.0, carbs: 0.0, fat: 4.0 },
  },
  {
    keywords: /huevos?\s+fritos?/i,
    item: { name: "Huevo frito", grams: 60, calories: 110, protein: 6.5, carbs: 0.5, fat: 9.0 },
  },
  {
    keywords: /huevos?\s+(revueltos?|sancochados?|duros?)|huevos?/i,
    item: { name: "Huevo entero cocido / revuelto", grams: 60, calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  },
  {
    keywords: /claras?\s+de\s+huevo/i,
    item: { name: "Claras de huevo", grams: 100, calories: 52, protein: 11.0, carbs: 0.7, fat: 0.2 },
  },
  {
    keywords: /scoop\s+(de\s+)?(prote[ií]na|whey)|whey\s+protein|batido\s+de\s+prote[ií]na/i,
    item: { name: "1 Scoop Whey Protein Isolate", grams: 32, calories: 120, protein: 25.0, carbs: 2.0, fat: 1.5 },
  },

  // Carbohidratos y acompañamientos
  {
    keywords: /arroz\s+integral/i,
    item: { name: "Arroz integral cocido", grams: 160, calories: 180, protein: 4.2, carbs: 37.5, fat: 1.5 },
  },
  {
    keywords: /arroz(\s+blanco)?/i,
    item: { name: "Arroz blanco graneado", grams: 170, calories: 221, protein: 4.6, carbs: 47.6, fat: 0.5 },
    isPeruvian: true,
  },
  {
    keywords: /papas?\s+fritas?/i,
    item: { name: "Papas fritas", grams: 140, calories: 290, protein: 4.0, carbs: 42.0, fat: 12.0 },
  },
  {
    keywords: /papas?\s+(sancochadas?|amarillas?|blancas?|doradas?)|pur[eé]\s+de\s+papas?/i,
    item: { name: "Papa peruana sancochada / puré", grams: 150, calories: 145, protein: 3.0, carbs: 32.0, fat: 0.5 },
    isPeruvian: true,
  },
  {
    keywords: /camotes?\s+fritos?/i,
    item: { name: "Camote frito en rodajas", grams: 120, calories: 195, protein: 1.8, carbs: 33.0, fat: 6.5 },
    isPeruvian: true,
  },
  {
    keywords: /camotes?(\s+sancochados?|\s+glaseados?)?/i,
    item: { name: "Camote amarillo sancochado", grams: 140, calories: 150, protein: 2.0, carbs: 35.0, fat: 0.3 },
    isPeruvian: true,
  },
  {
    keywords: /choclo/i,
    item: { name: "Choclo peruano cocido", grams: 120, calories: 130, protein: 4.2, carbs: 27.0, fat: 1.2 },
    isPeruvian: true,
  },
  {
    keywords: /yuca/i,
    item: { name: "Yuca cocida / dorada", grams: 130, calories: 205, protein: 1.8, carbs: 48.0, fat: 0.5 },
    isPeruvian: true,
  },
  {
    keywords: /pan(es)?(\s+franc[eé]s|\s+ciabatta|\s+integral)?/i,
    item: { name: "Pan francés / integral peruano", grams: 45, calories: 125, protein: 4.2, carbs: 25.0, fat: 0.8 },
    isPeruvian: true,
  },
  {
    keywords: /avena/i,
    item: { name: "Avena cocida", grams: 60, calories: 225, protein: 8.0, carbs: 39.0, fat: 4.0 },
  },
  {
    keywords: /quinua/i,
    item: { name: "Quinua peruana (bebida o graneada)", grams: 250, calories: 175, protein: 6.5, carbs: 32.0, fat: 2.5 },
    isPeruvian: true,
  },
  {
    keywords: /tamal(es)?/i,
    item: { name: "Tamal peruano de maíz con pollo/cerdo", grams: 220, calories: 430, protein: 14.0, carbs: 52.0, fat: 18.5 },
    isPeruvian: true,
  },

  // Grasas saludables, lácteos, frutas y vegetales
  {
    keywords: /palta|aguacate/i,
    item: { name: "Palta fuerte peruana", grams: 80, calories: 128, protein: 1.6, carbs: 6.8, fat: 11.8 },
    isPeruvian: true,
  },
  {
    keywords: /queso(\s+fresco)?/i,
    item: { name: "Queso fresco pasteurizado", grams: 60, calories: 155, protein: 11.0, carbs: 2.0, fat: 11.5 },
  },
  {
    keywords: /yogurt(\s+griego)?/i,
    item: { name: "Yogurt griego / natural", grams: 170, calories: 135, protein: 15.0, carbs: 9.0, fat: 4.0 },
  },
  {
    keywords: /leche/i,
    item: { name: "Vaso de leche", grams: 240, calories: 130, protein: 8.0, carbs: 12.0, fat: 5.0 },
  },
  {
    keywords: /pl[aá]tanos?\s+fritos?|maduros?\s+fritos?/i,
    item: { name: "Plátano bellaco/de la isla frito", grams: 110, calories: 215, protein: 1.5, carbs: 38.0, fat: 7.0 },
    isPeruvian: true,
  },
  {
    keywords: /pl[aá]tanos?|bananas?/i,
    item: { name: "Plátano de seda / isla", grams: 120, calories: 108, protein: 1.3, carbs: 27.0, fat: 0.3 },
  },
  {
    keywords: /ensalada/i,
    item: { name: "Ensalada fresca de vegetales", grams: 130, calories: 45, protein: 1.5, carbs: 8.0, fat: 0.8 },
  },
];

export function analyzeMealByPeruvianNLP(description: string): MealData {
  const clean = description.trim();
  const lower = clean.toLowerCase();

  // 1. Verificar si coincide directamente con un plato completo del catálogo CENAN
  const directPreset = PERUVIAN_DISH_PRESETS.find((preset) => {
    const pLower = preset.name.toLowerCase();
    if (lower.includes("lomo saltado") && pLower.includes("lomo saltado")) return true;
    if (lower.includes("pollo a la brasa") && pLower.includes("pollo a la brasa")) return true;
    if (lower.includes("ceviche") && pLower.includes("ceviche")) return true;
    if ((lower.includes("aji de gallina") || lower.includes("ají de gallina")) && pLower.includes("ají de gallina")) return true;
    if (lower.includes("chaufa") && pLower.includes("chaufa")) return true;
    if (lower.includes("arroz con pollo") && pLower.includes("arroz con pollo")) return true;
    if (lower.includes("seco") && pLower.includes("seco")) return true;
    if (lower.includes("pan con chicharr") && pLower.includes("pan con chicharr")) return true;
    if (lower.includes("causa") && pLower.includes("causa")) return true;
    return false;
  });

  // Modificadores globales de preparación ("casero", "poca papa", "sin cremas", "media porción")
  const isHomemade = /casero|poco aceite|sin aceite|fit|ligero/i.test(lower);
  const isHalfPortion = /^medio\s+plato|^media\s+porci[oó]n/i.test(lower);

  if (directPreset && !/tallarines?\s+verdes?.*pechuga/i.test(lower)) {
    const scale = isHalfPortion ? 0.6 : 1.0;
    const fatFactor = isHomemade ? 0.75 : 1.0;
    const clonedItems: MealIngredientItem[] = (directPreset.items || []).map((it) => {
      const f = Number((it.fat * scale * fatFactor).toFixed(1));
      const p = Number((it.protein * scale).toFixed(1));
      const c = Number((it.carbs * scale).toFixed(1));
      const cal = Math.round(p * 4 + c * 4 + f * 9);
      return {
        name: it.name,
        grams: Math.round(it.grams * scale),
        calories: cal,
        protein: p,
        carbs: c,
        fat: f,
      };
    });

    // Si además mencionó algún extra (ej. "arroz con pollo + gaseosa/huevo/palta")
    FOOD_LEXICON.forEach((entry) => {
      if (entry.keywords.test(lower)) {
        const alreadyInPreset = clonedItems.some((ci) =>
          entry.keywords.test(ci.name.toLowerCase())
        );
        if (!alreadyInPreset) {
          clonedItems.push({ ...entry.item });
        }
      }
    });

    const totalCalories = clonedItems.reduce((s, i) => s + i.calories, 0);
    const totalProtein = Math.round(clonedItems.reduce((s, i) => s + i.protein, 0));
    const totalCarbs = Math.round(clonedItems.reduce((s, i) => s + i.carbs, 0));
    const totalFat = Math.round(clonedItems.reduce((s, i) => s + i.fat, 0));
    const totalGrams = clonedItems.reduce((s, i) => s + i.grams, 0);

    return {
      ...directPreset,
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      totalGrams,
      items: clonedItems,
    };
  }

  // 2. Descomposición multi-ingrediente con detección de cantidades ("2 panes", "3 huevos", "media pechuga", "200g de arroz")
  const matchedItems: MealIngredientItem[] = [];
  let detectedPeruvian = false;

  FOOD_LEXICON.forEach((entry) => {
    const match = lower.match(entry.keywords);
    if (!match || match.index === undefined) return;

    if (entry.isPeruvian) detectedPeruvian = true;

    // Mirar las 25 letras previas al ingrediente para detectar cantidad ("2 ", "tres ", "media ", "150g ")
    const prefix = lower.slice(Math.max(0, match.index - 22), match.index);
    let multiplier = 1.0;

    const gramsMatch = prefix.match(/(\d{2,3})\s*(g|gr|gramos)\b/i);
    if (gramsMatch) {
      const explicitGrams = parseInt(gramsMatch[1], 10);
      multiplier = explicitGrams / entry.item.grams;
    } else if (/\b(medio|media|1\/2|mitad)\b/i.test(prefix)) {
      multiplier = 0.5;
    } else if (/\b(un\s+cuarto|1\/4|peque[ñn][oa]|poca|poco)\b/i.test(prefix)) {
      multiplier = 0.65;
    } else if (/\b(doble|dos|2)\b/i.test(prefix)) {
      multiplier = 2.0;
    } else if (/\b(tres|3)\b/i.test(prefix)) {
      multiplier = 3.0;
    } else if (/\b(cuatro|4)\b/i.test(prefix)) {
      multiplier = 4.0;
    } else if (/\b(cinco|5)\b/i.test(prefix)) {
      multiplier = 5.0;
    }

    const fatFactor = isHomemade ? 0.8 : 1.0;
    const grams = Math.round(entry.item.grams * multiplier);
    const protein = Number((entry.item.protein * multiplier).toFixed(1));
    const carbs = Number((entry.item.carbs * multiplier).toFixed(1));
    const fat = Number((entry.item.fat * multiplier * fatFactor).toFixed(1));
    const calories = Math.round(protein * 4 + carbs * 4 + fat * 9);

    matchedItems.push({
      name:
        multiplier > 1.2 && !gramsMatch
          ? `${multiplier}x ${entry.item.name}`
          : entry.item.name,
      grams,
      calories,
      protein,
      carbs,
      fat,
    });
  });

  // Si el usuario escribió algo muy específico que no estaba en el léxico, estimación equilibrada
  if (matchedItems.length === 0) {
    matchedItems.push({
      name: clean.charAt(0).toUpperCase() + clean.slice(1),
      grams: 350,
      calories: 560,
      protein: 32.0,
      carbs: 58.0,
      fat: 22.0,
    });
  }

  const totalCalories = matchedItems.reduce((s, i) => s + i.calories, 0);
  const totalProtein = Math.round(matchedItems.reduce((s, i) => s + i.protein, 0));
  const totalCarbs = Math.round(matchedItems.reduce((s, i) => s + i.carbs, 0));
  const totalFat = Math.round(matchedItems.reduce((s, i) => s + i.fat, 0));
  const totalGrams = matchedItems.reduce((s, i) => s + i.grams, 0);

  return {
    name: clean.charAt(0).toUpperCase() + clean.slice(1),
    category: detectedPeruvian ? "Cocina Peruana" : "Análisis Nutricional IA",
    isPeruvian: detectedPeruvian,
    confidence: 95,
    totalGrams,
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    tip: "Puedes ajustar los gramos de cada ingrediente o desmarcar lo que no consumiste antes de guardar.",
    items: matchedItems,
  };
}

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

    const data = await res.json();
    // Si el backend antiguo devolvió solo { name, calories, protein, carbs, fat } sin items[], enriquecerlo
    if (data && data.name && !Array.isArray(data.items)) {
        const enriched = analyzeMealByPeruvianNLP(contextHint || data.name);
        return {
            ...enriched,
            name: data.name,
            calories: data.calories || enriched.calories,
            protein: data.protein || enriched.protein,
            carbs: data.carbs || enriched.carbs,
            fat: data.fat || enriched.fat,
        };
    }
    return data;
}

export async function analyzeMealText(description: string): Promise<MealData> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`${BASE_URL}/ai/analyze-text`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ description }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data && data.name && !data.error) {
                return data;
            }
        }
    } catch {
        // Si el contenedor cloud aún no expone /ai/analyze-text o hay latencia, usamos el motor NLP CENAN local instantáneo
    }

    return analyzeMealByPeruvianNLP(description);
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
