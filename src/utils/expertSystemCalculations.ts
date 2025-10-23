/**
 * Expert System za Određivanje Kalorijskih Ciljeva
 * Prema specifikaciji iz PDF dokumenta
 */

// TEF Lookup tablica (Str. 2 PDF-a)
export const TEF_TABLE = {
  high_protein: { protein: 0.25, carbs: 0.05, fats: 0.02 },
  balanced: { protein: 0.20, carbs: 0.05, fats: 0.02 },
  low_protein: { protein: 0.15, carbs: 0.05, fats: 0.02 }
} as const;

export type DietType = keyof typeof TEF_TABLE;

// Interfaces
export interface DEEParams {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  lbm?: number;
  bodyFat?: number;
}

export interface TEFParams {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  dietType: DietType;
}

export interface InsulinSensitivityParams {
  ggt?: number;
  triglycerides?: number;
  fastingGlucose?: number;
  hba1c?: number;
  waistCircumference?: number;
  bodyFat?: number;
  gender?: 'male' | 'female';
}

export interface MusclePotentialParams {
  digitRatio?: number; // 2D:4D
  wristCircumference?: number;
  height: number;
  gender: 'male' | 'female';
}

export interface PsychologicalProfile {
  foodRelationshipScore: number; // 1-10
  stressLevel: 'low' | 'moderate' | 'high' | 'extreme';
  dietHistoryComplexity: number;
  timeAvailabilityMinutes?: number;
  motivationLevel?: 'exploring' | 'moderate' | 'high' | 'extreme';
}

export interface AdaptiveTDEEParams {
  dee: number;
  neat: number;
  ea: number;
  tef: number;
  metabolicAdaptation?: number;
}

export interface DeficitSpeedParams {
  psychologicalProfile: PsychologicalProfile;
  metabolicHealth: 'excellent' | 'good' | 'fair' | 'poor';
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
}

export interface OptimalCaloriesParams {
  // Antropometrija
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  lbm?: number;
  bodyFat?: number;
  waistCircumference?: number;
  
  // Biokemija
  ggt?: number;
  triglycerides?: number;
  fastingGlucose?: number;
  hba1c?: number;
  
  // Psihološki profil
  foodRelationshipScore?: number;
  stressLevel?: 'low' | 'moderate' | 'high' | 'extreme';
  dietHistoryComplexity?: number;
  timeAvailabilityMinutes?: number;
  motivationLevel?: 'exploring' | 'moderate' | 'high' | 'extreme';
  
  // Aktivnost
  neatLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  exerciseMinutesPerWeek: number;
  
  // Cilj
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
  
  // Napredni parametri
  digitRatio?: number;
  wristCircumference?: number;
}

export interface OptimalCaloriesResult {
  recommendedCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  dee: number;
  tef: number;
  adaptiveTDEE: number;
  insulinSensitivity: string;
  musclePotential: string;
  deficitSpeed: string;
  reasoning: string[];
}

// 1. DEE Model (Dynamic Energy Expenditure)
export function calculateDEE(params: DEEParams): number {
  const { weight, height, age, gender, lbm, bodyFat } = params;
  
  // Harris-Benedict
  let harrisBenedict: number;
  if (gender === 'male') {
    harrisBenedict = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    harrisBenedict = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Mifflin-St Jeor
  let mifflinStJeor: number;
  if (gender === 'male') {
    mifflinStJeor = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    mifflinStJeor = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  // Katch-McArdle (ako imamo LBM)
  let katchMcArdle: number | null = null;
  if (lbm) {
    katchMcArdle = 370 + (21.6 * lbm);
  } else if (bodyFat && bodyFat > 0) {
    const calculatedLBM = weight * (1 - bodyFat / 100);
    katchMcArdle = 370 + (21.6 * calculatedLBM);
  }
  
  // Prosječni DEE
  const formulas = [harrisBenedict, mifflinStJeor];
  if (katchMcArdle !== null) {
    formulas.push(katchMcArdle);
  }
  
  const dee = formulas.reduce((sum, val) => sum + val, 0) / formulas.length;
  
  return Math.round(dee);
}

// 2. TEF Korekcija
export function calculateTEF(params: TEFParams): number {
  const { proteinGrams, carbsGrams, fatsGrams, dietType } = params;
  
  const tefRates = TEF_TABLE[dietType];
  
  const proteinCalories = proteinGrams * 4;
  const carbsCalories = carbsGrams * 4;
  const fatsCalories = fatsGrams * 9;
  
  const tef = 
    (proteinCalories * tefRates.protein) +
    (carbsCalories * tefRates.carbs) +
    (fatsCalories * tefRates.fats);
  
  return Math.round(tef);
}

// 3. Insulin Sensitivity Score
export function calculateInsulinSensitivity(params: InsulinSensitivityParams): {
  score: 'high' | 'moderate' | 'low' | 'very_low';
  numericScore: number;
} {
  const { ggt, triglycerides, fastingGlucose, hba1c, waistCircumference, bodyFat } = params;
  
  let score = 100; // Start at perfect
  const factors: string[] = [];
  
  // GGT (Gamma-glutamyl transferase)
  if (ggt !== undefined) {
    if (ggt > 60) {
      score -= 20;
      factors.push('Povišena GGT');
    } else if (ggt > 40) {
      score -= 10;
      factors.push('Umjereno povišena GGT');
    }
  }
  
  // Trigliceridi
  if (triglycerides !== undefined) {
    if (triglycerides > 200) {
      score -= 25;
      factors.push('Visoki trigliceridi');
    } else if (triglycerides > 150) {
      score -= 15;
      factors.push('Umjereno povišeni trigliceridi');
    }
  }
  
  // Glukoza natašte
  if (fastingGlucose !== undefined) {
    if (fastingGlucose > 126) {
      score -= 30;
      factors.push('Dijabetes indikatori');
    } else if (fastingGlucose > 100) {
      score -= 20;
      factors.push('Pre-dijabetes indikatori');
    }
  }
  
  // HbA1c
  if (hba1c !== undefined) {
    if (hba1c > 6.5) {
      score -= 30;
      factors.push('Visok HbA1c');
    } else if (hba1c > 5.7) {
      score -= 15;
      factors.push('Umjereno povišen HbA1c');
    }
  }
  
  // Obim struka (centralna pretilost)
  if (waistCircumference !== undefined) {
    const threshold = params.gender === 'male' ? 102 : 88;
    if (waistCircumference > threshold) {
      score -= 15;
      factors.push('Centralna pretilost');
    }
  }
  
  // % tjelesne masti
  if (bodyFat !== undefined) {
    const threshold = params.gender === 'male' ? 25 : 32;
    if (bodyFat > threshold) {
      score -= 10;
      factors.push('Visok postotak tjelesne masti');
    }
  }
  
  // Kategorije
  let category: 'high' | 'moderate' | 'low' | 'very_low';
  if (score >= 80) {
    category = 'high';
  } else if (score >= 60) {
    category = 'moderate';
  } else if (score >= 40) {
    category = 'low';
  } else {
    category = 'very_low';
  }
  
  return { score: category, numericScore: Math.max(0, score) };
}

// 4. Muscle Potential Score
export function calculateMusclePotential(params: MusclePotentialParams): {
  score: 'high' | 'moderate' | 'low';
  numericScore: number;
} {
  const { digitRatio, wristCircumference, height, gender } = params;
  
  let score = 50; // Start at neutral
  
  // 2D:4D digit ratio (niži = veći potencijal za mišiće)
  if (digitRatio !== undefined) {
    if (digitRatio < 0.95) {
      score += 20;
    } else if (digitRatio < 1.0) {
      score += 10;
    } else if (digitRatio > 1.05) {
      score -= 10;
    }
  }
  
  // Frame size iz wrist circumference
  if (wristCircumference !== undefined && height > 0) {
    const frameRatio = wristCircumference / height;
    
    if (gender === 'male') {
      if (frameRatio > 0.11) {
        score += 20; // Large frame
      } else if (frameRatio > 0.10) {
        score += 10; // Medium frame
      } else {
        score -= 10; // Small frame
      }
    } else {
      if (frameRatio > 0.10) {
        score += 20;
      } else if (frameRatio > 0.09) {
        score += 10;
      } else {
        score -= 10;
      }
    }
  }
  
  // Kategorije
  let category: 'high' | 'moderate' | 'low';
  if (score >= 70) {
    category = 'high';
  } else if (score >= 50) {
    category = 'moderate';
  } else {
    category = 'low';
  }
  
  return { score: category, numericScore: score };
}

// 5. Adaptive TDEE Model
export function calculateAdaptiveTDEE(params: AdaptiveTDEEParams): number {
  const { dee, neat, ea, tef, metabolicAdaptation = 0 } = params;
  
  const adaptiveTDEE = dee + neat + ea + tef - metabolicAdaptation;
  
  return Math.round(Math.max(dee * 1.1, adaptiveTDEE)); // Never go below 110% of DEE
}

// 6. Deficit/Surplus Speed Matrix
export function determineDeficitSpeed(params: DeficitSpeedParams): {
  speed: 'slow' | 'moderate' | 'fast';
  percentage: number;
  recommendDietBreaks: boolean;
  reasoning: string[];
} {
  const { psychologicalProfile, metabolicHealth, goal } = params;
  const reasoning: string[] = [];
  
  // Ako nije fat loss, nema deficita
  if (goal === 'maintain') {
    return { speed: 'moderate', percentage: 0, recommendDietBreaks: false, reasoning: ['Održavanje težine'] };
  }
  
  if (goal === 'muscle_gain') {
    return { speed: 'moderate', percentage: 10, recommendDietBreaks: false, reasoning: ['Blagi suficit za gradnju mišića'] };
  }
  
  // Fat loss logika
  let speedScore = 0;
  
  // Psihološki faktori
  if (psychologicalProfile.foodRelationshipScore <= 4) {
    speedScore -= 2;
    reasoning.push('Kompleksan odnos prema hrani zahtijeva sporiji pristup');
  } else if (psychologicalProfile.foodRelationshipScore >= 8) {
    speedScore += 1;
    reasoning.push('Zdrav odnos prema hrani omogućava brži pristup');
  }
  
  if (psychologicalProfile.stressLevel === 'extreme' || psychologicalProfile.stressLevel === 'high') {
    speedScore -= 2;
    reasoning.push('Visok stres zahtijeva oprezniji pristup');
  }
  
  if (psychologicalProfile.dietHistoryComplexity > 5) {
    speedScore -= 2;
    reasoning.push('Yo-yo dijeta povijest - potreban sporiji pristup');
  }
  
  if (psychologicalProfile.motivationLevel === 'extreme') {
    speedScore += 1;
  } else if (psychologicalProfile.motivationLevel === 'exploring') {
    speedScore -= 1;
    reasoning.push('Niska motivacija - sporiji pristup za dugoročnost');
  }
  
  // Metaboličko zdravlje
  if (metabolicHealth === 'poor') {
    speedScore -= 2;
    reasoning.push('Loše metaboličko zdravlje - potreban sporiji deficit');
  } else if (metabolicHealth === 'excellent') {
    speedScore += 1;
    reasoning.push('Odlično metaboličko zdravlje podržava brži deficit');
  }
  
  // Odluka
  let speed: 'slow' | 'moderate' | 'fast';
  let percentage: number;
  let recommendDietBreaks = false;
  
  if (speedScore <= -3) {
    speed = 'slow';
    percentage = 12.5; // 10-15%
    recommendDietBreaks = true;
    reasoning.push('Preporuka: spori deficit (10-15%) sa planiranim diet breaks');
  } else if (speedScore >= 2) {
    speed = 'fast';
    percentage = 22.5; // 20-25%
    reasoning.push('Preporuka: brži deficit (20-25%)');
  } else {
    speed = 'moderate';
    percentage = 17.5; // 15-20%
    reasoning.push('Preporuka: umjeren deficit (15-20%)');
  }
  
  return { speed, percentage, recommendDietBreaks, reasoning };
}

// 7. NEAT Procjena
function estimateNEAT(neatLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active', dee: number): number {
  const neatMultipliers = {
    sedentary: 0.15,
    light: 0.20,
    moderate: 0.30,
    active: 0.40,
    very_active: 0.50
  };
  
  return Math.round(dee * neatMultipliers[neatLevel]);
}

// 8. EA (Exercise Activity) Procjena
function estimateEA(exerciseMinutesPerWeek: number, weight: number): number {
  // Prosječno 5 kcal/min za umjereni intenzitet
  const caloriesPerMinute = 5;
  const weeklyEA = exerciseMinutesPerWeek * caloriesPerMinute;
  const dailyEA = weeklyEA / 7;
  
  return Math.round(dailyEA);
}

// 9. Makronutrijenti
function calculateMacros(calories: number, goal: 'fat_loss' | 'maintain' | 'muscle_gain', weight: number, insulinSensitivity: string): {
  protein: number;
  carbs: number;
  fats: number;
} {
  // Protein (g/kg tjelesne težine)
  let proteinGPerKg: number;
  if (goal === 'muscle_gain') {
    proteinGPerKg = 2.2;
  } else if (goal === 'fat_loss') {
    proteinGPerKg = 2.4;
  } else {
    proteinGPerKg = 2.0;
  }
  
  const protein = Math.round(weight * proteinGPerKg);
  const proteinCalories = protein * 4;
  
  // Masti (% kalorija)
  let fatPercentage = 0.25;
  if (insulinSensitivity === 'very_low' || insulinSensitivity === 'low') {
    fatPercentage = 0.35; // Više masti, manje ugljikohidrata za lošu insulin sensitivity
  }
  
  const fatCalories = calories * fatPercentage;
  const fats = Math.round(fatCalories / 9);
  
  // Ugljikohidrati (ostatak)
  const carbsCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(carbsCalories / 4);
  
  return { protein, carbs, fats };
}

// 10. Glavni Expert System Function
export function calculateOptimalCalories(clientData: OptimalCaloriesParams): OptimalCaloriesResult {
  const reasoning: string[] = [];
  
  // 1. Izračunaj DEE
  const dee = calculateDEE({
    weight: clientData.weight,
    height: clientData.height,
    age: clientData.age,
    gender: clientData.gender,
    lbm: clientData.lbm,
    bodyFat: clientData.bodyFat
  });
  reasoning.push(`DEE (Dynamic Energy Expenditure): ${dee} kcal/dan`);
  
  // 2. Procijeni NEAT
  const neat = estimateNEAT(clientData.neatLevel, dee);
  reasoning.push(`NEAT (Non-Exercise Activity): ${neat} kcal/dan (${clientData.neatLevel})`);
  
  // 3. Procijeni EA
  const ea = estimateEA(clientData.exerciseMinutesPerWeek, clientData.weight);
  reasoning.push(`EA (Exercise Activity): ${ea} kcal/dan (${clientData.exerciseMinutesPerWeek} min/tjedan)`);
  
  // 4. Izračunaj Insulin Sensitivity
  const insulinSensitivityResult = calculateInsulinSensitivity({
    ggt: clientData.ggt,
    triglycerides: clientData.triglycerides,
    fastingGlucose: clientData.fastingGlucose,
    hba1c: clientData.hba1c,
    waistCircumference: clientData.waistCircumference,
    bodyFat: clientData.bodyFat,
    gender: clientData.gender
  });
  reasoning.push(`Insulin Sensitivity: ${insulinSensitivityResult.score} (score: ${insulinSensitivityResult.numericScore}/100)`);
  
  // 5. Izračunaj Muscle Potential
  const musclePotentialResult = calculateMusclePotential({
    digitRatio: clientData.digitRatio,
    wristCircumference: clientData.wristCircumference,
    height: clientData.height,
    gender: clientData.gender
  });
  reasoning.push(`Muscle Potential: ${musclePotentialResult.score} (score: ${musclePotentialResult.numericScore})`);
  
  // 6. Određi metaboličko zdravlje
  let metabolicHealth: 'excellent' | 'good' | 'fair' | 'poor';
  if (insulinSensitivityResult.numericScore >= 80) {
    metabolicHealth = 'excellent';
  } else if (insulinSensitivityResult.numericScore >= 60) {
    metabolicHealth = 'good';
  } else if (insulinSensitivityResult.numericScore >= 40) {
    metabolicHealth = 'fair';
  } else {
    metabolicHealth = 'poor';
  }
  
  // 7. Određi Deficit Speed
  const deficitSpeedResult = determineDeficitSpeed({
    psychologicalProfile: {
      foodRelationshipScore: clientData.foodRelationshipScore || 5,
      stressLevel: clientData.stressLevel || 'moderate',
      dietHistoryComplexity: clientData.dietHistoryComplexity || 0,
      timeAvailabilityMinutes: clientData.timeAvailabilityMinutes,
      motivationLevel: clientData.motivationLevel || 'moderate'
    },
    metabolicHealth,
    goal: clientData.goal
  });
  reasoning.push(...deficitSpeedResult.reasoning);
  
  // 8. Privremeni TDEE (bez TEF-a)
  const baseTDEE = dee + neat + ea;
  
  // 9. Izračunaj makronutrijente za preporučene kalorije
  let targetCalories: number;
  if (clientData.goal === 'maintain') {
    targetCalories = baseTDEE;
  } else if (clientData.goal === 'muscle_gain') {
    targetCalories = Math.round(baseTDEE * (1 + deficitSpeedResult.percentage / 100));
  } else {
    targetCalories = Math.round(baseTDEE * (1 - deficitSpeedResult.percentage / 100));
  }
  
  const macros = calculateMacros(targetCalories, clientData.goal, clientData.weight, insulinSensitivityResult.score);
  
  // 10. Izračunaj TEF korekciju
  let dietType: DietType = 'balanced';
  if (macros.protein >= clientData.weight * 2.2) {
    dietType = 'high_protein';
  } else if (macros.protein < clientData.weight * 1.6) {
    dietType = 'low_protein';
  }
  
  const tef = calculateTEF({
    calories: targetCalories,
    proteinGrams: macros.protein,
    carbsGrams: macros.carbs,
    fatsGrams: macros.fats,
    dietType
  });
  reasoning.push(`TEF (Thermic Effect of Food): ${tef} kcal/dan (${dietType} dijeta)`);
  
  // 11. Metabolička adaptacija (ako ima povijest dijeta)
  let metabolicAdaptation = 0;
  if (clientData.dietHistoryComplexity && clientData.dietHistoryComplexity > 3) {
    metabolicAdaptation = Math.round(dee * 0.05); // 5% smanjenje zbog metaboličke adaptacije
    reasoning.push(`Metabolička Adaptacija: -${metabolicAdaptation} kcal/dan (zbog yo-yo dijeta povijesti)`);
  }
  
  // 12. Finalni Adaptive TDEE
  const adaptiveTDEE = calculateAdaptiveTDEE({
    dee,
    neat,
    ea,
    tef,
    metabolicAdaptation
  });
  reasoning.push(`Adaptive TDEE (finalni): ${adaptiveTDEE} kcal/dan`);
  
  // 13. Primijeni deficit/surplus
  let recommendedCalories: number;
  if (clientData.goal === 'maintain') {
    recommendedCalories = adaptiveTDEE;
  } else if (clientData.goal === 'muscle_gain') {
    recommendedCalories = Math.round(adaptiveTDEE * (1 + deficitSpeedResult.percentage / 100));
    reasoning.push(`Preporučeni suficit: +${deficitSpeedResult.percentage}% = ${recommendedCalories} kcal/dan`);
  } else {
    recommendedCalories = Math.round(adaptiveTDEE * (1 - deficitSpeedResult.percentage / 100));
    reasoning.push(`Preporučeni deficit: -${deficitSpeedResult.percentage}% = ${recommendedCalories} kcal/dan`);
  }
  
  // 14. Prepočet makronurijenata sa finalnim kalorijama
  const finalMacros = calculateMacros(recommendedCalories, clientData.goal, clientData.weight, insulinSensitivityResult.score);
  
  if (deficitSpeedResult.recommendDietBreaks) {
    reasoning.push('⚠️ Preporuka: Uključi planirane diet breaks svaka 6-8 tjedana');
  }
  
  return {
    recommendedCalories,
    protein: finalMacros.protein,
    carbs: finalMacros.carbs,
    fats: finalMacros.fats,
    dee,
    tef,
    adaptiveTDEE,
    insulinSensitivity: insulinSensitivityResult.score,
    musclePotential: musclePotentialResult.score,
    deficitSpeed: deficitSpeedResult.speed,
    reasoning
  };
}
