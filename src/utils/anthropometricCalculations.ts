/**
 * Anthropometric calculations utilities
 * Contains formulas for body composition and measurements
 */

export interface NavyFormulaParams {
  gender: 'male' | 'female';
  waist: number; // cm
  neck: number; // cm
  hip?: number; // cm (required for females)
  height: number; // cm
}

/**
 * Calculate body fat percentage using the US Navy formula
 * 
 * Male: Body Fat % = 495 / (1.0324 - 0.19077 × log10(waist - neck) + 0.15456 × log10(height)) - 450
 * Female: Body Fat % = 495 / (1.29579 - 0.35004 × log10(waist + hip - neck) + 0.22100 × log10(height)) - 450
 */
export const calculateBodyFatNavy = (params: NavyFormulaParams): number | null => {
  const { gender, waist, neck, hip, height } = params;

  // Validate inputs
  if (!waist || !neck || !height || waist <= 0 || neck <= 0 || height <= 0) {
    return null;
  }

  if (gender === 'female' && (!hip || hip <= 0)) {
    return null;
  }

  try {
    let bodyFat: number;

    if (gender === 'male') {
      // Male formula
      const denominator = 1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height);
      bodyFat = 495 / denominator - 450;
    } else {
      // Female formula
      const denominator = 1.29579 - 0.35004 * Math.log10(waist + hip! - neck) + 0.22100 * Math.log10(height);
      bodyFat = 495 / denominator - 450;
    }

    // Body fat should be between 3% and 50%
    if (bodyFat < 3 || bodyFat > 50) {
      return null;
    }

    return Math.round(bodyFat * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error('Error calculating Navy body fat:', error);
    return null;
  }
};

/**
 * Calculate Lean Body Mass (LBM)
 * LBM = weight × (1 - bodyFat/100)
 */
export const calculateLeanBodyMass = (weight: number, bodyFatPercentage: number): number | null => {
  if (!weight || !bodyFatPercentage || weight <= 0 || bodyFatPercentage < 0 || bodyFatPercentage > 100) {
    return null;
  }

  const lbm = weight * (1 - bodyFatPercentage / 100);
  return Math.round(lbm * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate Fat Mass (FM)
 * FM = weight × (bodyFat/100)
 */
export const calculateFatMass = (weight: number, bodyFatPercentage: number): number | null => {
  if (!weight || !bodyFatPercentage || weight <= 0 || bodyFatPercentage < 0 || bodyFatPercentage > 100) {
    return null;
  }

  const fm = weight * (bodyFatPercentage / 100);
  return Math.round(fm * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate Body Mass Index (BMI)
 * BMI = weight(kg) / (height(m))²
 */
export const calculateBMI = (weight: number, height: number): number | null => {
  if (!weight || !height || weight <= 0 || height <= 0) {
    return null;
  }

  // Convert height from cm to m
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  
  return Math.round(bmi * 10) / 10; // Round to 1 decimal
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Pothranjenost';
  if (bmi < 25) return 'Normalna težina';
  if (bmi < 30) return 'Prekomjerna težina';
  if (bmi < 35) return 'Pretilost I stupnja';
  if (bmi < 40) return 'Pretilost II stupnja';
  return 'Pretilost III stupnja';
};

/**
 * Calculate Waist-to-Hip Ratio (WHR)
 * WHR = waist / hip
 */
export const calculateWaistToHipRatio = (waist: number, hip: number): number | null => {
  if (!waist || !hip || waist <= 0 || hip <= 0) {
    return null;
  }

  const whr = waist / hip;
  return Math.round(whr * 100) / 100; // Round to 2 decimals
};

/**
 * Get WHR risk category
 */
export const getWHRRiskCategory = (whr: number, gender: 'male' | 'female'): string => {
  if (gender === 'male') {
    if (whr < 0.95) return 'Nizak rizik';
    if (whr < 1.0) return 'Umjeren rizik';
    return 'Visok rizik';
  } else {
    if (whr < 0.80) return 'Nizak rizik';
    if (whr < 0.85) return 'Umjeren rizik';
    return 'Visok rizik';
  }
};

/**
 * Get body fat category
 */
export const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female'): string => {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Esencijalni';
    if (bodyFat < 14) return 'Atletski';
    if (bodyFat < 18) return 'Fit';
    if (bodyFat < 25) return 'Prosječan';
    return 'Pretilost';
  } else {
    if (bodyFat < 14) return 'Esencijalni';
    if (bodyFat < 21) return 'Atletski';
    if (bodyFat < 25) return 'Fit';
    if (bodyFat < 32) return 'Prosječan';
    return 'Pretilost';
  }
};
