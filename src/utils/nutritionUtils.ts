// Nutrition Plan Utilities and Mock Data

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface TrainingDayType {
  value: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training';
  label: string;
  color: string;
  gradient: string;
}

export const trainingDayTypes: TrainingDayType[] = [
  { 
    value: 'no_training', 
    label: 'Bez Treninga', 
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #4B5563 0%, #6B7280 100%)'
  },
  { 
    value: 'light_training', 
    label: '1 Trening', 
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)'
  },
  { 
    value: 'moderate_training', 
    label: '2 Treninga', 
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
  },
  { 
    value: 'heavy_training', 
    label: '3+ Treninga', 
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
  }
];

export const mealTypeGradients: Record<string, string> = {
  'breakfast': 'gradient-breakfast',
  'morning_snack': 'gradient-snack-cyan',
  'lunch': 'gradient-lunch',
  'afternoon_snack': 'gradient-snack-rose',
  'dinner': 'gradient-dinner',
  'evening_snack': 'gradient-snack-cyan',
  'pre_workout': 'gradient-preworkout',
  'post_workout': 'gradient-postworkout'
};

export const mealTypeLabels: Record<string, string> = {
  'breakfast': 'Doručak',
  'morning_snack': 'Užina',
  'lunch': 'Ručak',
  'afternoon_snack': 'Međuobrok',
  'dinner': 'Večera',
  'evening_snack': 'Kasna Večera',
  'pre_workout': 'Prije Treninga',
  'post_workout': 'Nakon Treninga'
};

export const mealTypeOptions = [
  { value: 'breakfast', label: 'Doručak', gradientClass: 'gradient-breakfast' },
  { value: 'morning_snack', label: 'Užina', gradientClass: 'gradient-snack-cyan' },
  { value: 'lunch', label: 'Ručak', gradientClass: 'gradient-lunch' },
  { value: 'afternoon_snack', label: 'Međuobrok', gradientClass: 'gradient-snack-rose' },
  { value: 'dinner', label: 'Večera', gradientClass: 'gradient-dinner' },
  { value: 'evening_snack', label: 'Kasna Večera', gradientClass: 'gradient-snack-cyan' },
  { value: 'pre_workout', label: 'Prije Treninga', gradientClass: 'gradient-preworkout' },
  { value: 'post_workout', label: 'Nakon Treninga', gradientClass: 'gradient-postworkout' }
];

// Mock function to calculate daily macros based on training type
export function calculateDailyMacros(
  baseMacros: MacroNutrients,
  trainingType: 'no_training' | 'light_training' | 'moderate_training' | 'heavy_training'
): MacroNutrients {
  const adjustments = {
    no_training: { caloriesMult: 1, carbsAdd: 0, proteinAdd: 0, fatsAdd: 0 },
    light_training: { caloriesMult: 1.1, carbsAdd: 15, proteinAdd: 5, fatsAdd: 2 },
    moderate_training: { caloriesMult: 1.2, carbsAdd: 30, proteinAdd: 10, fatsAdd: 3 },
    heavy_training: { caloriesMult: 1.3, carbsAdd: 50, proteinAdd: 15, fatsAdd: 5 }
  };

  const adjustment = adjustments[trainingType];

  return {
    calories: Math.round(baseMacros.calories * adjustment.caloriesMult),
    protein: baseMacros.protein + adjustment.proteinAdd,
    carbs: baseMacros.carbs + adjustment.carbsAdd,
    fats: baseMacros.fats + adjustment.fatsAdd
  };
}

// Mock function to generate meal schedule suggestions
export function generateMealSchedule(
  trainingTimes: string[],
  mealPreferences: string[]
): { time: string; mealType: string }[] {
  // Mock implementation - returns default schedule
  return [
    { time: '08:00', mealType: 'breakfast' },
    { time: '10:30', mealType: 'morning_snack' },
    { time: '13:00', mealType: 'lunch' },
    { time: '16:00', mealType: 'afternoon_snack' },
    { time: '19:00', mealType: 'dinner' }
  ];
}

// Mock function to adjust macros for training
export function adjustMacrosForTraining(
  baseMacros: MacroNutrients,
  trainingIntensity: 'low' | 'medium' | 'high'
): MacroNutrients {
  const multipliers = {
    low: 1.05,
    medium: 1.15,
    high: 1.25
  };

  const mult = multipliers[trainingIntensity];

  return {
    calories: Math.round(baseMacros.calories * mult),
    protein: Math.round(baseMacros.protein * mult),
    carbs: Math.round(baseMacros.carbs * mult),
    fats: Math.round(baseMacros.fats * mult)
  };
}

export const daysOfWeek = [
  { value: 0, label: 'Ponedjeljak', short: 'Pon' },
  { value: 1, label: 'Utorak', short: 'Uto' },
  { value: 2, label: 'Srijeda', short: 'Sri' },
  { value: 3, label: 'Četvrtak', short: 'Čet' },
  { value: 4, label: 'Petak', short: 'Pet' },
  { value: 5, label: 'Subota', short: 'Sub' },
  { value: 6, label: 'Nedjelja', short: 'Ned' }
];

// Helper function to get formatted day date
export function getFormattedDayDate(weekStart: Date, dayIndex: number): string {
  const date = new Date(weekStart);
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
}
