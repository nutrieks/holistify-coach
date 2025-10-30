/**
 * Expert System za Određivanje Kalorijskih Ciljeva
 * FAZA 1: BRI/FLI Indeksi, Pathway A/B Logika, Ispravljeni TEF Calculation
 * Prema specifikaciji iz PDF dokumenta (Str. 1-24)
 */

// ============================================
// TEF LOOKUP TABLE (PDF Str. 2-4)
// ============================================
const TEF_TABLE = {
  standard: { protein: 0.25, carbs: 0.06, fats: 0.03 },
  higher_protein: { protein: 0.30, carbs: 0.06, fats: 0.03 },
  high_carb: { protein: 0.25, carbs: 0.08, fats: 0.03 }
};

type DietType = keyof typeof TEF_TABLE;

// ============================================
// BRI & FLI CALCULATIONS (PDF Str. 6-7)
// ============================================

/**
 * Body Roundness Index (BRI) - PDF Str. 6
 * Formula: BRI = 364.2 - 365.5 × √(1 - ((WC / (2π))² / (0.5 × Height)²))
 */
export function calculateBRI(height: number, waistCircumference: number): number {
  const radius = waistCircumference / (2 * Math.PI);
  const halfHeight = 0.5 * height;
  const ratio = (radius * radius) / (halfHeight * halfHeight);
  const bri = 364.2 - 365.5 * Math.sqrt(Math.max(0, 1 - ratio));
  return Math.max(0, bri);
}

/**
 * Fatty Liver Index (FLI) - PDF Str. 7
 * Formula: FLI = (e^y / (1 + e^y)) × 100
 * y = 0.953×ln(TG) + 0.139×BMI + 0.718×ln(GGT) + 0.053×WC - 15.745
 */
export function calculateFLI(params: {
  bmi: number;
  waistCircumference: number;
  triglycerides: number;
  ggt: number;
}): number {
  const { bmi, waistCircumference, triglycerides, ggt } = params;
  
  const y = 
    0.953 * Math.log(triglycerides) +
    0.139 * bmi +
    0.718 * Math.log(ggt) +
    0.053 * waistCircumference -
    15.745;
  
  const fli = (Math.exp(y) / (1 + Math.exp(y))) * 100;
  return Math.min(100, Math.max(0, fli));
}

// ============================================
// DAILY ADAPTIVE TRACKING (PDF Str. 26-31)
// ============================================

export interface DailyTrackingEntry {
  date: Date;
  weight: number;
  caloriesConsumed: number;
  weightEWMA?: number;
  storeChange?: number;
  adaptiveTDEE?: number;
}

/**
 * EWMA Weight Trend (PDF Str. 26-27)
 * Formula: EWMA_today = alpha × Weight_today + (1 - alpha) × EWMA_yesterday
 * @param weights Array of {date, weight} ordered chronologically
 * @param alpha Smoothing factor (default 0.3 per PDF)
 */
export function calculateEWMA(
  weights: Array<{ date: Date; weight: number }>,
  alpha: number = 0.3
): number[] {
  if (weights.length === 0) return [];
  
  const ewmaValues: number[] = [];
  ewmaValues[0] = weights[0].weight; // Initialize with first weight
  
  for (let i = 1; i < weights.length; i++) {
    ewmaValues[i] = alpha * weights[i].weight + (1 - alpha) * ewmaValues[i - 1];
  }
  
  return ewmaValues;
}

/**
 * Daily Change in Energy Stores (PDF Str. 28)
 * Formula: ΔStores = (Weight_today - Weight_yesterday) × 7700 kcal
 */
export function calculateDailyStoreChange(
  weightToday: number,
  weightYesterday: number
): number {
  return (weightToday - weightYesterday) * 7700;
}

/**
 * Weighted 7-Day Adaptive TDEE (PDF Str. 29-30)
 * TDEE_daily = Calories_consumed + ΔStores
 * Weighted average with recent days having more weight
 */
export function calculateWeightedAdaptiveTDEE(
  dailyData: Array<{
    caloriesConsumed: number;
    storeChange: number;
  }>
): number {
  if (dailyData.length === 0) return 0;
  
  // Weights from PDF Str. 29: Most recent = 0.25, oldest = 0.05
  const weights = [0.25, 0.20, 0.15, 0.15, 0.10, 0.10, 0.05];
  
  // If less than 7 days, normalize weights
  const numDays = Math.min(dailyData.length, 7);
  const applicableWeights = weights.slice(0, numDays);
  const weightSum = applicableWeights.reduce((sum, w) => sum + w, 0);
  
  let weightedTDEE = 0;
  for (let i = 0; i < numDays; i++) {
    const dailyTDEE = dailyData[i].caloriesConsumed + dailyData[i].storeChange;
    weightedTDEE += dailyTDEE * (applicableWeights[i] / weightSum);
  }
  
  return weightedTDEE;
}

/**
 * Fast Adaptation Mode Check (PDF Str. 31)
 * Enable if weight loss < 0.5% per week during fat loss phase
 */
export function shouldEnableFastAdaptation(
  goalType: 'fat_loss' | 'muscle_gain' | 'maintain',
  weeklyWeightChange: number,
  targetWeeklyChange: number
): {
  shouldEnable: boolean;
  reasoning: string;
} {
  if (goalType !== 'fat_loss') {
    return {
      shouldEnable: false,
      reasoning: 'Fast Adaptation samo za fazu smanjenja težine'
    };
  }
  
  const weeklyChangePercentage = Math.abs(weeklyWeightChange);
  
  if (weeklyChangePercentage < 0.005) { // Less than 0.5%
    return {
      shouldEnable: true,
      reasoning: `Gubitak težine ${(weeklyChangePercentage * 100).toFixed(2)}% < 0.5% tjedno → Aktiviraj Fast Adaptation`
    };
  }
  
  return {
    shouldEnable: false,
    reasoning: `Gubitak težine ${(weeklyChangePercentage * 100).toFixed(2)}% ≥ 0.5% tjedno → Nastaviti standardno`
  };
}

// ============================================
// PATHWAY A vs B LOGIC (PDF Str. 17-24)
// ============================================

export interface PathwayParams {
  currentWeight: number;
  targetWeight?: number;
  targetDate?: Date;
  goal: 'fat_loss' | 'muscle_gain' | 'maintain';
  currentFFMI?: number;
  gender: 'male' | 'female';
}

export interface PathwayResult {
  pathway: 'A' | 'B';
  usesTwoPhaseModel: boolean;
  ffmiCeiling?: number;
  canSurplus?: boolean;
  reasoning: string;
}

/**
 * Determines Pathway A (user-defined) or B (system-defined) - PDF Str. 17
 */
export function determinePathway(params: PathwayParams): PathwayResult {
  const { targetWeight, targetDate, goal, currentFFMI, gender } = params;
  
  // Pathway A: User provides target weight AND target date
  if (targetWeight && targetDate) {
    return {
      pathway: 'A',
      usesTwoPhaseModel: true,
      reasoning: 'Korisnik definirao ciljnu težinu i datum → Pathway A (Two-Phase DEE Model)'
    };
  }
  
  // Check FFMI ceiling for muscle gain
  if (goal === 'muscle_gain' && currentFFMI) {
    const maxFFMI = gender === 'male' ? 25 : 21.5;
    const canSurplus = currentFFMI < maxFFMI;
    
    return {
      pathway: 'B',
      usesTwoPhaseModel: false,
      ffmiCeiling: maxFFMI,
      canSurplus,
      reasoning: canSurplus 
        ? `FFMI ${currentFFMI.toFixed(1)} < ${maxFFMI} - prostor za rast → Pathway B`
        : `FFMI ${currentFFMI.toFixed(1)} ≥ ${maxFFMI} - genetski limit → NE preporučujemo surplus`
    };
  }
  
  // Pathway B: System determines tempo
  return {
    pathway: 'B',
    usesTwoPhaseModel: false,
    reasoning: 'Sistem određuje tempo (Pathway B) na osnovu psiholoških/metaboličkih faktora'
  };
}

/**
 * Two-Phase DEE Model for Pathway A - PDF Str. 18-21
 */
export interface TwoPhaseCaloriesParams {
  currentWeight: number;
  targetWeight: number;
  targetDate: Date;
  dee: number;
  gender: 'male' | 'female';
}

export interface TwoPhaseCaloriesResult {
  phase1Calories: number;
  stabilizedCalories: number;
  expectedWeeklyLoss: number;
  weeksToTarget: number;
  reasoning: string[];
}

export function calculateTwoPhaseCalories(params: TwoPhaseCaloriesParams): TwoPhaseCaloriesResult {
  const { currentWeight, targetWeight, targetDate, dee, gender } = params;
  const reasoning: string[] = [];
  
  // Phase 1: First 2 weeks
  const phase1DEE = currentWeight * 3000;
  reasoning.push(`Faza 1 DEE (prve 2 sedmice): ${currentWeight} kg × 3000 = ${phase1DEE.toFixed(0)} kcal`);
  
  // Phase 2: Stabilized
  const multiplier = gender === 'male' ? 6500 : 5500;
  const stabilizedDEE = targetWeight * multiplier;
  reasoning.push(`Stabilizirani DEE: ${targetWeight} kg × ${multiplier} = ${stabilizedDEE.toFixed(0)} kcal`);
  
  // Calculate timeline
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksToTarget = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / msPerWeek));
  
  // Backtracking
  const totalWeightChange = Math.abs(currentWeight - targetWeight);
  const expectedWeeklyLoss = totalWeightChange / weeksToTarget;
  reasoning.push(`Očekivani tjedni gubitak: ${expectedWeeklyLoss.toFixed(2)} kg/sedmicu`);
  
  // Safety check
  const maxSafeWeeklyLoss = currentWeight * 0.01;
  if (expectedWeeklyLoss > maxSafeWeeklyLoss) {
    reasoning.push(`⚠️ UPOZORENJE: Traženi tempo (${expectedWeeklyLoss.toFixed(2)} kg/tjedan) > sigurna granica (${maxSafeWeeklyLoss.toFixed(2)} kg/tjedan)`);
  }
  
  return {
    phase1Calories: phase1DEE,
    stabilizedCalories: stabilizedDEE,
    expectedWeeklyLoss,
    weeksToTarget,
    reasoning
  };
}

/**
 * FFMI Ceiling Check for Muscle Gain - PDF Str. 23-24
 */
export interface FFMICeilingResult {
  canSurplus: boolean;
  currentFFMI: number;
  maxFFMI: number;
  remainingPotential: number;
  reasoning: string;
}

export function checkFFMICeiling(currentFFMI: number, gender: 'male' | 'female'): FFMICeilingResult {
  const maxFFMI = gender === 'male' ? 25 : 21.5;
  const remainingPotential = Math.max(0, maxFFMI - currentFFMI);
  const canSurplus = currentFFMI < maxFFMI;
  
  return {
    canSurplus,
    currentFFMI,
    maxFFMI,
    remainingPotential,
    reasoning: canSurplus
      ? `FFMI ${currentFFMI.toFixed(1)} < ${maxFFMI} → Preostali potencijal: ${remainingPotential.toFixed(1)} bodova. Surplus preporučen.`
      : `FFMI ${currentFFMI.toFixed(1)} ≥ ${maxFFMI} → Dostignut genetski maksimum. Surplus NE preporučen.`
  };
}

// ============================================
// CORE CALCULATION INTERFACES
// ============================================

export interface DEEParams {
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFatPercentage: number;
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
  bodyFatPercentage?: number;
  gender?: 'male' | 'female';
}

export interface MusclePotentialParams {
  digitRatio2D4D?: number;
  wristCircumference?: number;
  height: number;
  gender: 'male' | 'female';
  leanBodyMass: number;
}

export interface DeficitSpeedParams {
  goal: 'fat_loss' | 'maintain' | 'muscle_gain';
  stressLevel?: 'low' | 'moderate' | 'high' | 'extreme';
  foodRelationshipScore?: number;
  dietHistoryComplexity?: number;
  motivationLevel?: 'exploring' | 'moderate' | 'high' | 'extreme';
  insulinSensitivity: string;
  musclePotential: string;
}

export interface OptimalCaloriesParams {
  // Anthropometric
  age: number;
  gender: 'male' | 'female';
  height: number;
  weight: number;
  bodyFatPercentage: number;
  waistCircumference?: number;
  neckCircumference?: number;
  hipCircumference?: number;
  wristCircumference?: number;
  digitRatio2D4D?: number;
  
  // Goal & Pathway (NEW)
  goal: 'fat_loss' | 'muscle_gain' | 'maintain';
  targetWeight?: number;
  targetDate?: Date;
  
  // Biochemical
  ggt?: number;
  triglycerides?: number;
  fastingGlucose?: number;
  hba1c?: number;
  
  // Psychological
  stressLevel?: 'low' | 'moderate' | 'high' | 'extreme';
  foodRelationshipScore?: number;
  dietHistoryComplexity?: number;
  timeAvailabilityMinutes?: number;
  motivationLevel?: 'exploring' | 'moderate' | 'high' | 'extreme';
  
  // Activity
  neatLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  exerciseMinutesPerWeek: number;
}

export interface OptimalCaloriesResult {
  // Final recommendations
  recommendedCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  
  // Intermediate results
  dee: number;
  tef: number;
  neat: number;
  ea: number;
  maintenanceTDEE: number;
  adaptiveTDEE: number;
  insulinSensitivity: { score: 'high' | 'moderate' | 'low' | 'very_low'; numericScore: number };
  musclePotential: { score: 'high' | 'moderate' | 'low'; numericScore: number };
  deficitSpeed: {
    speed: 'slow' | 'moderate' | 'fast';
    percentage: number;
    recommendDietBreaks: boolean;
    reasoning: string[];
  };
  
  // NEW: Pathway & Goal Info
  pathway?: PathwayResult;
  twoPhaseModel?: TwoPhaseCaloriesResult;
  ffmiCeiling?: FFMICeilingResult;
  bri?: number;
  fli?: number;
  
  reasoning: string[];
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * DEE Calculation (Harris-Benedict, Mifflin-St Jeor, Katch-McArdle)
 */
export function calculateDEE(params: DEEParams): number {
  const { age, gender, height, weight, bodyFatPercentage } = params;
  
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
  
  // Katch-McArdle (if body fat available)
  let katchMcArdle: number | null = null;
  if (bodyFatPercentage > 0) {
    const lbm = weight * (1 - bodyFatPercentage / 100);
    katchMcArdle = 370 + (21.6 * lbm);
  }
  
  // Average
  const formulas = [harrisBenedict, mifflinStJeor];
  if (katchMcArdle !== null) formulas.push(katchMcArdle);
  
  return formulas.reduce((sum, val) => sum + val, 0) / formulas.length;
}

/**
 * TEF (Thermic Effect of Food) - PDF Str. 2-4
 */
export function calculateTEF(params: TEFParams): number {
  const { proteinGrams, carbsGrams, fatsGrams, dietType } = params;
  const tefRates = TEF_TABLE[dietType];
  
  const proteinCal = proteinGrams * 4;
  const carbsCal = carbsGrams * 4;
  const fatsCal = fatsGrams * 9;
  
  return (proteinCal * tefRates.protein) +
         (carbsCal * tefRates.carbs) +
         (fatsCal * tefRates.fats);
}

/**
 * Insulin Sensitivity Score
 */
export function calculateInsulinSensitivity(params: InsulinSensitivityParams): {
  score: 'high' | 'moderate' | 'low' | 'very_low';
  numericScore: number;
} {
  const { ggt, triglycerides, fastingGlucose, hba1c, waistCircumference, bodyFatPercentage, gender } = params;
  
  let score = 100;
  
  if (ggt !== undefined) {
    if (ggt > 60) score -= 20;
    else if (ggt > 40) score -= 10;
  }
  
  if (triglycerides !== undefined) {
    if (triglycerides > 200) score -= 25;
    else if (triglycerides > 150) score -= 15;
  }
  
  if (fastingGlucose !== undefined) {
    if (fastingGlucose > 126) score -= 30;
    else if (fastingGlucose > 100) score -= 20;
  }
  
  if (hba1c !== undefined) {
    if (hba1c > 6.5) score -= 30;
    else if (hba1c > 5.7) score -= 15;
  }
  
  if (waistCircumference !== undefined && gender) {
    const threshold = gender === 'male' ? 102 : 88;
    if (waistCircumference > threshold) score -= 15;
  }
  
  if (bodyFatPercentage !== undefined && gender) {
    const threshold = gender === 'male' ? 25 : 32;
    if (bodyFatPercentage > threshold) score -= 10;
  }
  
  let category: 'high' | 'moderate' | 'low' | 'very_low';
  if (score >= 80) category = 'high';
  else if (score >= 60) category = 'moderate';
  else if (score >= 40) category = 'low';
  else category = 'very_low';
  
  return { score: category, numericScore: Math.max(0, score) };
}

/**
 * Muscle Potential Score
 */
export function calculateMusclePotential(params: MusclePotentialParams): {
  score: 'high' | 'moderate' | 'low';
  numericScore: number;
} {
  const { digitRatio2D4D, wristCircumference, height, gender } = params;
  let score = 50;
  
  if (digitRatio2D4D !== undefined) {
    if (digitRatio2D4D < 0.95) score += 20;
    else if (digitRatio2D4D < 1.0) score += 10;
    else if (digitRatio2D4D > 1.05) score -= 10;
  }
  
  if (wristCircumference !== undefined && height > 0) {
    const frameRatio = wristCircumference / height;
    const thresholds = gender === 'male' ? [0.11, 0.10] : [0.10, 0.09];
    
    if (frameRatio > thresholds[0]) score += 20;
    else if (frameRatio > thresholds[1]) score += 10;
    else score -= 10;
  }
  
  let category: 'high' | 'moderate' | 'low';
  if (score >= 70) category = 'high';
  else if (score >= 50) category = 'moderate';
  else category = 'low';
  
  return { score: category, numericScore: score };
}

/**
 * Deficit Speed Matrix
 */
export function determineDeficitSpeed(params: DeficitSpeedParams): {
  speed: 'slow' | 'moderate' | 'fast';
  percentage: number;
  recommendDietBreaks: boolean;
  reasoning: string[];
} {
  const { goal, stressLevel, foodRelationshipScore, dietHistoryComplexity, motivationLevel } = params;
  const reasoning: string[] = [];
  
  if (goal === 'maintain') {
    return { speed: 'moderate', percentage: 0, recommendDietBreaks: false, reasoning: ['Održavanje'] };
  }
  
  if (goal === 'muscle_gain') {
    return { speed: 'moderate', percentage: 10, recommendDietBreaks: false, reasoning: ['Suficit 10%'] };
  }
  
  // Fat loss logic
  let speedScore = 0;
  
  if (foodRelationshipScore && foodRelationshipScore <= 4) {
    speedScore -= 2;
    reasoning.push('Kompleksan odnos prema hrani → sporiji pristup');
  }
  
  if (stressLevel === 'extreme' || stressLevel === 'high') {
    speedScore -= 2;
    reasoning.push('Visok stres → sporiji deficit');
  }
  
  if (dietHistoryComplexity && dietHistoryComplexity > 5) {
    speedScore -= 2;
    reasoning.push('Yo-yo dijeta povijest → sporiji pristup');
  }
  
  if (motivationLevel === 'exploring') {
    speedScore -= 1;
    reasoning.push('Niska motivacija → sporiji tempo');
  }
  
  // Determine speed
  let speed: 'slow' | 'moderate' | 'fast';
  let percentage: number;
  let recommendDietBreaks = false;
  
  if (speedScore <= -3) {
    speed = 'slow';
    percentage = 12.5;
    recommendDietBreaks = true;
    reasoning.push('Spori deficit (10-15%) + diet breaks');
  } else if (speedScore >= 2) {
    speed = 'fast';
    percentage = 22.5;
    reasoning.push('Brži deficit (20-25%)');
  } else {
    speed = 'moderate';
    percentage = 17.5;
    reasoning.push('Umjeren deficit (15-20%)');
  }
  
  return { speed, percentage, recommendDietBreaks, reasoning };
}

/**
 * NEAT Estimation
 */
function estimateNEAT(neatLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active', dee: number): number {
  const multipliers = {
    sedentary: 0.15,
    light: 0.20,
    moderate: 0.30,
    active: 0.40,
    very_active: 0.50
  };
  return dee * multipliers[neatLevel];
}

/**
 * EA (Exercise Activity) Estimation
 */
function estimateEA(exerciseMinutesPerWeek: number, weight: number): number {
  const caloriesPerMinute = 5;
  const weeklyEA = exerciseMinutesPerWeek * caloriesPerMinute;
  return weeklyEA / 7;
}

/**
 * Macronutrient Calculation
 */
function calculateMacros(
  calories: number,
  goal: 'fat_loss' | 'maintain' | 'muscle_gain',
  weight: number,
  insulinSensitivity: string
): { protein: number; carbs: number; fats: number } {
  // Protein (g/kg)
  let proteinGPerKg = 2.0;
  if (goal === 'muscle_gain') proteinGPerKg = 2.2;
  else if (goal === 'fat_loss') proteinGPerKg = 2.4;
  
  const protein = weight * proteinGPerKg;
  const proteinCal = protein * 4;
  
  // Fats
  let fatPercentage = 0.25;
  if (insulinSensitivity === 'very_low' || insulinSensitivity === 'low') {
    fatPercentage = 0.35;
  }
  
  const fatCal = calories * fatPercentage;
  const fats = fatCal / 9;
  
  // Carbs (remainder)
  const carbsCal = calories - proteinCal - fatCal;
  const carbs = carbsCal / 4;
  
  return { protein, carbs, fats };
}

// ============================================
// MAIN EXPERT SYSTEM FUNCTION (CORRECTED)
// ============================================

/**
 * Calculate Optimal Calories with CORRECTED TEF Calculation (PDF Str. 2-4)
 * 
 * CRITICAL FIX: TEF must be recalculated based on ACTUAL planned intake (not maintenance).
 * This follows the 3-step process from the PDF:
 * 1. Calculate maintenance TDEE (DEE + NEAT + EA)
 * 2. Apply deficit/surplus → target calories
 * 3. Re-calculate TEF based on new macros
 */
export function calculateOptimalCalories(clientData: OptimalCaloriesParams): OptimalCaloriesResult {
  const reasoning: string[] = [];
  
  // === NEW: Calculate BRI & FLI ===
  let bri: number | undefined;
  let fli: number | undefined;
  
  if (clientData.height && clientData.waistCircumference) {
    bri = calculateBRI(clientData.height, clientData.waistCircumference);
    reasoning.push(`📊 Body Roundness Index (BRI): ${bri.toFixed(2)}`);
  }
  
  if (clientData.waistCircumference && clientData.triglycerides && clientData.ggt) {
    const bmi = clientData.weight / Math.pow(clientData.height / 100, 2);
    fli = calculateFLI({
      bmi,
      waistCircumference: clientData.waistCircumference,
      triglycerides: clientData.triglycerides,
      ggt: clientData.ggt
    });
    reasoning.push(`🏥 Fatty Liver Index (FLI): ${fli.toFixed(1)}%`);
  }
  
  // === NEW: Determine Pathway (A or B) ===
  const leanBodyMass = clientData.weight * (1 - clientData.bodyFatPercentage / 100);
  const ffmi = leanBodyMass / Math.pow(clientData.height / 100, 2);
  
  const pathway = determinePathway({
    currentWeight: clientData.weight,
    targetWeight: clientData.targetWeight,
    targetDate: clientData.targetDate,
    goal: clientData.goal,
    currentFFMI: ffmi,
    gender: clientData.gender
  });
  reasoning.push(`\n🎯 PATHWAY: ${pathway.pathway}`);
  reasoning.push(pathway.reasoning);
  
  // === NEW: Two-Phase Model for Pathway A ===
  let twoPhaseModel: TwoPhaseCaloriesResult | undefined;
  if (pathway.pathway === 'A' && clientData.targetWeight && clientData.targetDate) {
    const dee = calculateDEE({
      age: clientData.age,
      gender: clientData.gender,
      height: clientData.height,
      weight: clientData.weight,
      bodyFatPercentage: clientData.bodyFatPercentage
    });
    
    twoPhaseModel = calculateTwoPhaseCalories({
      currentWeight: clientData.weight,
      targetWeight: clientData.targetWeight,
      targetDate: clientData.targetDate,
      dee,
      gender: clientData.gender
    });
    reasoning.push('\n📊 TWO-PHASE MODEL:');
    reasoning.push(...twoPhaseModel.reasoning);
  }
  
  // === NEW: FFMI Ceiling Check ===
  let ffmiCeiling: FFMICeilingResult | undefined;
  if (clientData.goal === 'muscle_gain') {
    ffmiCeiling = checkFFMICeiling(ffmi, clientData.gender);
    reasoning.push('\n💪 FFMI CEILING:');
    reasoning.push(ffmiCeiling.reasoning);
    
    if (!ffmiCeiling.canSurplus) {
      reasoning.push('⚠️ Surplus nije preporučen!');
    }
  }
  
  // 1. Calculate DEE
  const dee = calculateDEE({
    age: clientData.age,
    gender: clientData.gender,
    height: clientData.height,
    weight: clientData.weight,
    bodyFatPercentage: clientData.bodyFatPercentage
  });
  reasoning.push(`\n🔥 DEE: ${dee.toFixed(0)} kcal`);
  
  // 2. NEAT
  const neat = estimateNEAT(clientData.neatLevel, dee);
  reasoning.push(`🚶 NEAT: ${neat.toFixed(0)} kcal (${clientData.neatLevel})`);
  
  // 3. EA
  const ea = estimateEA(clientData.exerciseMinutesPerWeek || 0, clientData.weight);
  reasoning.push(`🏋️ EA: ${ea.toFixed(0)} kcal (${clientData.exerciseMinutesPerWeek || 0} min/tjedan)`);
  
  // 4. Insulin Sensitivity
  const insulinSensitivity = calculateInsulinSensitivity({
    ggt: clientData.ggt,
    triglycerides: clientData.triglycerides,
    fastingGlucose: clientData.fastingGlucose,
    hba1c: clientData.hba1c,
    waistCircumference: clientData.waistCircumference,
    bodyFatPercentage: clientData.bodyFatPercentage,
    gender: clientData.gender
  });
  reasoning.push(`🩺 Insulin Sensitivity: ${insulinSensitivity.score} (${insulinSensitivity.numericScore})`);
  
  // 5. Muscle Potential
  const musclePotential = calculateMusclePotential({
    digitRatio2D4D: clientData.digitRatio2D4D,
    wristCircumference: clientData.wristCircumference,
    height: clientData.height,
    gender: clientData.gender,
    leanBodyMass
  });
  reasoning.push(`💪 Muscle Potential: ${musclePotential.score} (${musclePotential.numericScore})`);
  
  // 6. Deficit Speed
  const deficitSpeed = determineDeficitSpeed({
    goal: clientData.goal,
    stressLevel: clientData.stressLevel,
    foodRelationshipScore: clientData.foodRelationshipScore,
    dietHistoryComplexity: clientData.dietHistoryComplexity,
    motivationLevel: clientData.motivationLevel,
    insulinSensitivity: insulinSensitivity.score,
    musclePotential: musclePotential.score
  });
  reasoning.push(`⚡ Deficit Speed: ${deficitSpeed.speed} (${deficitSpeed.percentage}%)`);
  reasoning.push(...deficitSpeed.reasoning);
  
  // 7. Metabolic Adaptation
  const metabolicAdaptation = (clientData.dietHistoryComplexity || 0) > 3 ? 0.95 : 1.0;
  if (metabolicAdaptation < 1.0) {
    reasoning.push(`📉 Metabolička adaptacija: ${((1 - metabolicAdaptation) * 100).toFixed(0)}% smanjenje DEE`);
  }
  
  // 8. CORRECTED ADAPTIVE TDEE (3-Step TEF Process)
  const adaptedDEE = dee * metabolicAdaptation;
  const maintenanceTDEE = adaptedDEE + neat + ea;
  
  // Apply deficit/surplus
  let targetCalories = maintenanceTDEE;
  if (clientData.goal === 'fat_loss') {
    targetCalories = maintenanceTDEE * (1 - deficitSpeed.percentage / 100);
  } else if (clientData.goal === 'muscle_gain') {
    targetCalories = maintenanceTDEE * 1.10;
  }
  
  // Re-calculate macros for target calories
  const macros = calculateMacros(targetCalories, clientData.goal, clientData.weight, insulinSensitivity.score);
  
  // Re-calculate TEF based on ACTUAL planned intake
  const proteinPercent = (macros.protein * 4) / targetCalories;
  let dietType: DietType = 'standard';
  if (proteinPercent > 0.30) dietType = 'higher_protein';
  else if ((macros.carbs * 4) / targetCalories > 0.50) dietType = 'high_carb';
  
  const tef = calculateTEF({
    calories: targetCalories,
    proteinGrams: macros.protein,
    carbsGrams: macros.carbs,
    fatsGrams: macros.fats,
    dietType
  });
  
  const adaptiveTDEE = adaptedDEE + neat + ea + tef;
  
  reasoning.push(`\n📊 ADAPTIVE TDEE (CORRECTED):`);
  reasoning.push(`   Maintenance: ${maintenanceTDEE.toFixed(0)} kcal`);
  reasoning.push(`   Target: ${targetCalories.toFixed(0)} kcal`);
  reasoning.push(`   TEF (recalculated): ${tef.toFixed(0)} kcal`);
  reasoning.push(`   Adaptive TDEE: ${adaptiveTDEE.toFixed(0)} kcal`);
  
  reasoning.push(`\n📋 MAKRONUTRIJENTI:`);
  reasoning.push(`   Proteini: ${macros.protein.toFixed(0)}g (${((macros.protein * 4 / targetCalories) * 100).toFixed(0)}%)`);
  reasoning.push(`   Ugljikohidrati: ${macros.carbs.toFixed(0)}g (${((macros.carbs * 4 / targetCalories) * 100).toFixed(0)}%)`);
  reasoning.push(`   Masti: ${macros.fats.toFixed(0)}g (${((macros.fats * 9 / targetCalories) * 100).toFixed(0)}%)`);
  
  if (deficitSpeed.recommendDietBreaks) {
    reasoning.push('\n⚠️ Preporučeni diet breaks svaka 6-8 tjedana');
  }
  
  return {
    recommendedCalories: Math.round(targetCalories),
    protein: Math.round(macros.protein),
    carbs: Math.round(macros.carbs),
    fats: Math.round(macros.fats),
    dee,
    tef,
    neat,
    ea,
    maintenanceTDEE,
    adaptiveTDEE,
    insulinSensitivity,
    musclePotential,
    deficitSpeed,
    pathway,
    twoPhaseModel,
    ffmiCeiling,
    bri,
    fli,
    reasoning
  };
}
