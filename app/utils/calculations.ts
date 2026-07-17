export function calculateAge(dateString: string): number {
  if (!dateString) return 25; // Default if missing
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string, // "M" or "F"
  activityLevel: string
): number {
  // Mifflin-St Jeor Equation
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  
  const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === "M" || gender === "Masculino" || gender === "Hombre" ? 5 : -161);
  
  // Activity Multipliers
  let multiplier = 1.2; // Sedentary
  const al = activityLevel?.toLowerCase() || "";
  
  if (al.includes("ligero") || al.includes("light")) multiplier = 1.375;
  else if (al.includes("moderado") || al.includes("moderate")) multiplier = 1.55;
  else if (al.includes("muy") || al.includes("heavy") || al.includes("intenso")) multiplier = 1.725;
  else if (al.includes("atleta") || al.includes("extreme")) multiplier = 1.9;

  return bmr * multiplier;
}

export interface GoalProjectionResult {
  isPossible: boolean;
  message: string;
  projectedDate: Date | null;
  weeksRemaining: number;
}

export function calculateGoalProjection(
  currentWeight: number,
  targetWeight: number,
  tdee: number,
  targetCalories: number
): GoalProjectionResult {
  if (!currentWeight || !targetWeight || !tdee || !targetCalories) {
    return { isPossible: false, message: "Faltan datos de perfil", projectedDate: null, weeksRemaining: 0 };
  }

  const weightDiff = currentWeight - targetWeight; 
  // > 0 means losing weight, < 0 means gaining weight.
  
  const dailyDeficit = tdee - targetCalories; 
  // > 0 means deficit (losing), < 0 means surplus (gaining).

  // Check if physics align with goals
  if (weightDiff > 0 && dailyDeficit <= 0) {
    return { isPossible: false, message: "Velocidad insuficiente. Ajusta tus macros.", projectedDate: null, weeksRemaining: 0 };
  }
  if (weightDiff < 0 && dailyDeficit >= 0) {
    return { isPossible: false, message: "Velocidad insuficiente. Ajusta tus macros.", projectedDate: null, weeksRemaining: 0 };
  }

  if (weightDiff === 0) {
    return { isPossible: true, message: "¡Meta alcanzada!", projectedDate: new Date(), weeksRemaining: 0 };
  }

  // Approx 7700 kcal per 1kg of tissue
  const totalKcalNeeded = Math.abs(weightDiff) * 7700;
  const daysNeeded = totalKcalNeeded / Math.abs(dailyDeficit);
  
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysNeeded);
  
  return {
    isPossible: true,
    message: "¡Vas por buen camino!",
    projectedDate,
    weeksRemaining: daysNeeded / 7
  };
}
