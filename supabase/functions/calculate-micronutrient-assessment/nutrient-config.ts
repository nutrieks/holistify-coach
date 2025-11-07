// SLUŽBENA LISTA 27 MIKRONUTRIJENATA
// Bazirana na: Samo_kriteriji_Upitnik_mikronutrijenti_v2_s_komentarima.pdf
// Datum revizije: 2025-01-07
// 
// VITAMINI (13): A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E, K
// MINERALI (14): Ca, Mg, Fe, Zn, Se, I, Cu, Mn, Cr, Mo, P, K, Kolin, Omega-3
//
// Configuration mapping nutrient codes to their calculation parameters
// Each nutrient has:
// - relevantQuestions: intake and symptom question codes
// - weightingFactors: how much each intake question contributes
// - symptomScores: points for each symptom
// - riskModifiers: factors that increase risk (lower the score)
// - clusterRules: special symptom combinations
// - prevalenceFactor: adjusts for population prevalence

export const NUTRIENT_CONFIG: Record<string, any> = {
  'VIT_A': {
    name: 'Vitamin A',
    relevantQuestions: {
      intake: ['A.2.3a', 'A.2.3b', 'A.5.1a', 'A.5.1b', 'A.4.1a', 'A.4.1b', 'A.4.3a', 'A.4.3b', 'A.10.3a', 'A.7.3a', 'A.7.3b', 'A.7.1a', 'A.7.1b'],
      symptoms: ['B.2.1', 'B.2.2', 'B.10.5', 'B.10.1', 'B.17.1']
    },
    weightingFactors: {
      'A.2.3a': 3.0, 'A.2.3b': 3.0, 'A.5.1a': 1.5, 'A.5.1b': 1.5, 'A.4.1a': 1.0, 'A.4.1b': 1.0, 'A.4.3a': 1.0, 'A.4.3b': 1.0, 'A.10.3a': 0.8, 'A.7.3a': 1.2, 'A.7.3b': 1.2, 'A.7.1a': 1.0, 'A.7.1b': 1.0
    },
    symptomScores: {
      'B.2.1': 5, 'B.2.2': 4, 'B.10.5': 4, 'B.10.1': 2, 'B.17.1': 1
    },
    clusterRules: [
      { condition: ['B.2.1', 'B.10.5'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.7, 'C.3.2': 0.8, 'A.12.3': 0.8
    },
    prevalenceFactor: 1.00
  },

  'B1': {
    name: 'Tiamin (B1)',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.8.1a', 'A.8.1b', 'A.1.1a', 'A.1.1b', 'A.9.3a', 'A.9.3b', 'A.2.2a', 'A.2.2b'],
      symptoms: ['B.14.1', 'B.13.2', 'B.14.3', 'B.15.1']
    },
    weightingFactors: {
      'A.2.1a': 2.5, 'A.2.1b': 2.5, 'A.8.1a': 2.0, 'A.8.1b': 2.0, 'A.1.1a': 1.8, 'A.1.1b': 1.8, 'A.9.3a': 1.5, 'A.9.3b': 1.5, 'A.2.2a': 1.0, 'A.2.2b': 1.0
    },
    symptomScores: {
      'B.14.1': 5, 'B.13.2': 4, 'B.14.3': 3, 'B.15.1': 1
    },
    clusterRules: [
      { condition: ['B.14.1', 'B.13.2'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'A.12.3': 0.6, 'C.1.2': 0.8, 'C.2.4': 0.8
    },
    prevalenceFactor: 1.00
  },

  'B2': {
    name: 'Riboflavin (B2)',
    relevantQuestions: {
      intake: ['A.4.2a', 'A.4.2b', 'A.4.1a', 'A.4.1b', 'A.2.3a', 'A.2.3b', 'A.5.1a', 'A.5.1b', 'A.9.1a', 'A.9.1b', 'A.7.1a', 'A.7.1b'],
      symptoms: ['B.4.2', 'B.5.2', 'B.4.3', 'B.3.2']
    },
    weightingFactors: {
      'A.4.2a': 2.5, 'A.4.2b': 2.5, 'A.4.1a': 2.0, 'A.4.1b': 2.0, 'A.2.3a': 2.0, 'A.2.3b': 2.0, 'A.5.1a': 1.5, 'A.5.1b': 1.5, 'A.9.1a': 1.5, 'A.9.1b': 1.5, 'A.7.1a': 1.2, 'A.7.1b': 1.2
    },
    symptomScores: {
      'B.4.2': 5, 'B.5.2': 5, 'B.4.3': 3, 'B.3.2': 3
    },
    clusterRules: [
      { condition: ['B.4.2', 'B.5.2'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.3.2': 0.8, 'A.12.3': 0.8
    },
    prevalenceFactor: 1.00
  },

  'B3': {
    name: 'Niacin (B3)',
    relevantQuestions: {
      intake: ['A.2.2a', 'A.2.2b', 'A.2.1a', 'A.2.1b', 'A.3.1a', 'A.3.1b', 'A.8.1a', 'A.8.1b', 'A.9.1a', 'A.9.1b', 'A.1.1a', 'A.1.1b'],
      symptoms: ['B.10.4', 'B.3.2', 'B.5.3', 'B.14.3', 'B.11.1']
    },
    weightingFactors: {
      'A.2.2a': 2.5, 'A.2.2b': 2.5, 'A.2.1a': 2.0, 'A.2.1b': 2.0, 'A.3.1a': 2.0, 'A.3.1b': 2.0, 'A.8.1a': 1.8, 'A.8.1b': 1.8, 'A.9.1a': 1.5, 'A.9.1b': 1.5, 'A.1.1a': 1.5, 'A.1.1b': 1.5
    },
    symptomScores: {
      'B.10.4': 5, 'B.3.2': 4, 'B.5.3': 4, 'B.14.3': 3, 'B.11.1': 2
    },
    clusterRules: [
      { condition: ['B.10.4', 'B.11.1', 'B.14.3'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.8, 'A.12.3': 0.7
    },
    prevalenceFactor: 1.00
  },

  'B5': {
    name: 'Pantotenska kiselina (B5)',
    relevantQuestions: {
      intake: ['A.2.3a', 'A.2.3b', 'A.6.4a', 'A.6.4b', 'A.13.1a', 'A.13.1b', 'A.5.1a', 'A.5.1b', 'A.9.3a', 'A.9.3b', 'A.7.7a', 'A.7.7b', 'A.7.6a', 'A.7.6b', 'A.1.1a', 'A.1.1b'],
      symptoms: ['B.14.1', 'B.15.1', 'B.13.1', 'B.11.3']
    },
    weightingFactors: {
      'A.2.3a': 3.0, 'A.2.3b': 3.0, 'A.6.4a': 2.5, 'A.6.4b': 2.5, 'A.13.1a': 2.0, 'A.13.1b': 2.0, 'A.5.1a': 1.8, 'A.5.1b': 1.8, 'A.9.3a': 1.8, 'A.9.3b': 1.8, 'A.7.7a': 1.5, 'A.7.7b': 1.5, 'A.7.6a': 1.2, 'A.7.6b': 1.2, 'A.1.1a': 1.0, 'A.1.1b': 1.0
    },
    symptomScores: {
      'B.14.1': 5, 'B.15.1': 2, 'B.13.1': 1, 'B.11.3': 1
    },
    clusterRules: [
      { condition: ['B.14.1', 'B.15.1'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'A.12.3': 0.8, 'C.1.4': 0.9, 'C.3.3': 0.9
    },
    prevalenceFactor: 1.05
  },

  'B6': {
    name: 'Piridoksin (B6)',
    relevantQuestions: {
      intake: ['A.8.1a', 'A.8.1b', 'A.2.3a', 'A.2.3b', 'A.3.1a', 'A.3.1b', 'A.2.2a', 'A.2.2b', 'A.6.3a', 'A.6.3b', 'A.7.7a', 'A.7.7b', 'A.1.1a', 'A.1.1b'],
      symptoms: ['B.15.4', 'B.4.2', 'B.5.1', 'B.5.3', 'B.14.1', 'B.14.3']
    },
    weightingFactors: {
      'A.8.1a': 3.0, 'A.8.1b': 3.0, 'A.2.3a': 2.8, 'A.2.3b': 2.8, 'A.3.1a': 2.5, 'A.3.1b': 2.5, 'A.2.2a': 2.0, 'A.2.2b': 2.0, 'A.6.3a': 1.8, 'A.6.3b': 1.8, 'A.7.7a': 1.5, 'A.7.7b': 1.5, 'A.1.1a': 1.2, 'A.1.1b': 1.2
    },
    symptomScores: {
      'B.15.4': 4, 'B.4.2': 3, 'B.5.1': 3, 'B.5.3': 3, 'B.14.1': 3, 'B.14.3': 2
    },
    clusterRules: [
      { condition: ['B.15.4', 'B.4.2', 'B.5.3'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.2.3': 0.7, 'A.12.3': 0.7, 'C.1.3': 0.8
    },
    prevalenceFactor: 1.10
  },

  'B7': {
    name: 'Biotin (B7)',
    relevantQuestions: {
      intake: ['A.5.1a', 'A.5.1b', 'A.2.3a', 'A.2.3b', 'A.3.1a', 'A.3.1b', 'A.9.1a', 'A.9.1b', 'A.9.3a', 'A.9.3b', 'A.7.7a', 'A.7.7b'],
      symptoms: ['B.1.1', 'B.3.2', 'B.10.4', 'B.9.1', 'B.14.1']
    },
    weightingFactors: {
      'A.5.1a': 3.0, 'A.5.1b': 3.0, 'A.2.3a': 2.5, 'A.2.3b': 2.5, 'A.3.1a': 2.0, 'A.3.1b': 2.0, 'A.9.1a': 1.5, 'A.9.1b': 1.5, 'A.9.3a': 1.5, 'A.9.3b': 1.5, 'A.7.7a': 1.2, 'A.7.7b': 1.2
    },
    symptomScores: {
      'B.1.1': 5, 'B.3.2': 5, 'B.10.4': 5, 'B.9.1': 3, 'B.14.1': 2
    },
    clusterRules: [
      { condition: ['B.1.1', 'B.3.2'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'A.12.3': 0.8, 'C.1.2': 0.8
    },
    prevalenceFactor: 1.05
  },

  'B9': {
    name: 'Folna kiselina (B9)',
    relevantQuestions: {
      intake: ['A.7.1a', 'A.7.1b', 'A.8.1a', 'A.8.1b', 'A.2.3a', 'A.2.3b', 'A.6.1a', 'A.6.1b', 'A.7.6a', 'A.7.6b', 'A.6.4a', 'A.6.4b'],
      symptoms: ['B.15.1', 'B.5.1', 'B.5.3', 'B.4.1', 'B.15.4', 'B.2.4']
    },
    weightingFactors: {
      'A.7.1a': 3.0, 'A.7.1b': 3.0, 'A.8.1a': 2.8, 'A.8.1b': 2.8, 'A.2.3a': 2.5, 'A.2.3b': 2.5, 'A.6.1a': 1.5, 'A.6.1b': 1.5, 'A.7.6a': 1.5, 'A.7.6b': 1.5, 'A.6.4a': 1.2, 'A.6.4b': 1.2
    },
    symptomScores: {
      'B.15.1': 4, 'B.5.1': 4, 'B.5.3': 4, 'B.4.1': 3, 'B.15.4': 3, 'B.2.4': 2
    },
    clusterRules: [
      { condition: ['B.15.1', 'B.5.3', 'B.2.4'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'A.12.3': 0.6, 'C.2.1': 0.9, 'C.2.3': 0.8, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.15
  },

  'B12': {
    name: 'Vitamin B12',
    relevantQuestions: {
      intake: ['A.3.3a', 'A.3.3b', 'A.2.3a', 'A.2.3b', 'A.3.1a', 'A.3.1b', 'A.2.1a', 'A.2.1b', 'A.5.1a', 'A.5.1b', 'A.4.1a', 'A.4.1b', 'A.4.2a', 'A.4.2b'],
      symptoms: ['B.14.1', 'B.5.1', 'B.5.3', 'B.14.3', 'B.15.1', 'B.14.2']
    },
    weightingFactors: {
      'A.3.3a': 3.0, 'A.3.3b': 3.0, 'A.2.3a': 2.8, 'A.2.3b': 2.8, 'A.3.1a': 2.5, 'A.3.1b': 2.5, 'A.2.1a': 2.0, 'A.2.1b': 2.0, 'A.5.1a': 1.5, 'A.5.1b': 1.5, 'A.4.1a': 1.0, 'A.4.1b': 1.0, 'A.4.2a': 1.0, 'A.4.2b': 1.0
    },
    symptomScores: {
      'B.14.1': 5, 'B.5.1': 5, 'B.5.3': 5, 'B.14.3': 4, 'B.15.1': 4, 'B.14.2': 3
    },
    clusterRules: [
      { condition: ['B.14.1', 'B.15.1', 'B.5.3'], action: { type: 'override', value: -15 } }
    ],
    riskModifiers: {
      'C.2.1': 0.6, 'C.2.2': 0.7, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.20
  },

  'VIT_C': {
    name: 'Vitamin C',
    relevantQuestions: {
      intake: ['A.7.4a', 'A.7.4b', 'A.6.1a', 'A.6.1b', 'A.6.2a', 'A.6.2b', 'A.7.6a', 'A.7.6b', 'A.7.3a', 'A.7.7a', 'A.7.7b'],
      symptoms: ['B.6.1', 'B.10.2', 'B.10.3', 'B.10.5', 'B.12.2']
    },
    weightingFactors: {
      'A.7.4a': 3.0, 'A.7.4b': 3.0, 'A.6.1a': 2.5, 'A.6.1b': 2.5, 'A.6.2a': 2.5, 'A.6.2b': 2.5, 'A.7.6a': 2.0, 'A.7.6b': 2.0, 'A.7.3a': 1.5, 'A.7.7a': 1.2, 'A.7.7b': 1.2
    },
    symptomScores: {
      'B.6.1': 5, 'B.10.2': 4, 'B.10.3': 4, 'B.10.5': 3, 'B.12.2': 2
    },
    clusterRules: [
      { condition: ['B.6.1', 'B.10.2'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.3.3': 0.9, 'C.1.4': 0.9
    },
    prevalenceFactor: 1.00
  },

  'VIT_D': {
    name: 'Vitamin D',
    relevantQuestions: {
      intake: ['A.16.1', 'A.16.2', 'A.15.1c', 'A.3.1a', 'A.3.1b', 'A.11.1a', 'A.11.1b', 'A.2.3a', 'A.2.3b', 'A.5.1a', 'A.5.1b'],
      symptoms: ['B.12.1', 'B.13.2', 'B.15.4', 'B.17.1', 'B.12.3']
    },
    weightingFactors: {
      'A.16.1': 3.0, 'A.16.2': 0.5, 'A.15.1c': 2.0, 'A.3.1a': 2.0, 'A.3.1b': 2.0, 'A.11.1a': 1.5, 'A.11.1b': 1.5, 'A.2.3a': 1.0, 'A.2.3b': 1.0, 'A.5.1a': 1.0, 'A.5.1b': 1.0
    },
    symptomScores: {
      'B.12.1': 5, 'B.13.2': 4, 'B.15.4': 3, 'B.17.1': 3, 'B.12.3': 3
    },
    clusterRules: [
      { condition: ['B.12.1', 'B.13.2', 'B.15.4'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 0.85
  },

  'VIT_E': {
    name: 'Vitamin E',
    relevantQuestions: {
      intake: ['A.9.3a', 'A.9.3b', 'A.9.1a', 'A.9.1b', 'A.10.1a', 'A.10.2a', 'A.6.4a', 'A.6.4b', 'A.7.1a', 'A.7.1b'],
      symptoms: ['B.14.1', 'B.14.2', 'B.13.2']
    },
    weightingFactors: {
      'A.9.3a': 3.0, 'A.9.3b': 3.0, 'A.9.1a': 2.8, 'A.9.1b': 2.8, 'A.10.1a': 2.0, 'A.10.2a': 2.0, 'A.6.4a': 1.5, 'A.6.4b': 1.5, 'A.7.1a': 1.0, 'A.7.1b': 1.0
    },
    symptomScores: {
      'B.14.1': 4, 'B.14.2': 4, 'B.13.2': 3
    },
    clusterRules: [
      { condition: ['B.14.1', 'B.14.2'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.6
    },
    prevalenceFactor: 1.00
  },

  'VIT_K': {
    name: 'Vitamin K',
    relevantQuestions: {
      intake: ['A.7.1a', 'A.7.1b', 'A.7.2a', 'A.7.2b', 'A.7.6a', 'A.7.6b', 'A.13.2a', 'A.13.2b', 'A.5.1a', 'A.5.1b', 'A.2.3a', 'A.2.3b'],
      symptoms: ['B.10.2', 'B.6.1', 'B.10.3']
    },
    weightingFactors: {
      'A.7.1a': 3.0, 'A.7.1b': 3.0, 'A.7.2a': 2.5, 'A.7.2b': 2.5, 'A.7.6a': 2.0, 'A.7.6b': 2.0, 'A.13.2a': 1.8, 'A.13.2b': 1.8, 'A.5.1a': 1.2, 'A.5.1b': 1.2, 'A.2.3a': 1.2, 'A.2.3b': 1.2
    },
    symptomScores: {
      'B.10.2': 5, 'B.6.1': 4, 'B.10.3': 4
    },
    clusterRules: [
      { condition: ['B.10.2', 'B.6.1'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 1.10
  },

  'CA': {
    name: 'Kalcij',
    relevantQuestions: {
      intake: ['A.4.3a', 'A.4.3b', 'A.4.1a', 'A.4.1b', 'A.4.2a', 'A.4.2b', 'A.3.1a', 'A.3.1b', 'A.7.1a', 'A.7.1b', 'A.9.3a', 'A.9.3b', 'A.8.2a', 'A.8.2b', 'A.9.1a', 'A.9.1b'],
      symptoms: ['B.13.1', 'B.14.1', 'B.9.1', 'B.12.1', 'B.12.3']
    },
    weightingFactors: {
      'A.4.3a': 3.0, 'A.4.3b': 3.0, 'A.4.1a': 2.5, 'A.4.1b': 2.5, 'A.4.2a': 2.5, 'A.4.2b': 2.5, 'A.3.1a': 2.5, 'A.3.1b': 2.5, 'A.7.1a': 1.5, 'A.7.1b': 1.5, 'A.9.3a': 1.2, 'A.9.3b': 1.2, 'A.8.2a': 1.2, 'A.8.2b': 1.2, 'A.9.1a': 1.0, 'A.9.1b': 1.0
    },
    symptomScores: {
      'B.13.1': 4, 'B.14.1': 4, 'B.9.1': 2, 'B.12.1': 1, 'B.12.3': 3
    },
    riskModifiers: {
      'C.2.1': 0.9, 'C.3.2': 0.8
    },
    prevalenceFactor: 1.00
  },

  'FE': {
    name: 'Željezo',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.3a', 'A.2.3b', 'A.3.3a', 'A.3.3b', 'A.8.1a', 'A.8.1b', 'A.7.1a', 'A.7.1b', 'A.9.3a', 'A.9.3b'],
      symptoms: ['B.15.1', 'B.2.4', 'B.3.1', 'B.9.2', 'B.1.1', 'B.15.3']
    },
    weightingFactors: {
      'A.2.1a': 3.0, 'A.2.1b': 3.0, 'A.2.3a': 2.8, 'A.2.3b': 2.8, 'A.3.3a': 2.5, 'A.3.3b': 2.5, 'A.8.1a': 1.5, 'A.8.1b': 1.5, 'A.7.1a': 1.2, 'A.7.1b': 1.2, 'A.9.3a': 1.2, 'A.9.3b': 1.2
    },
    symptomScores: {
      'B.15.1': 4, 'B.2.4': 5, 'B.3.1': 5, 'B.9.2': 5, 'B.1.1': 3, 'B.15.3': 3
    },
    clusterRules: [
      { condition: ['B.15.1', 'B.2.4', 'B.1.1'], action: { type: 'override', value: -15 } }
    ],
    riskModifiers: {
      'C.3.2': 0.7, 'C.3.1': 0.7, 'C.2.1': 0.8, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.25
  },

  'MG': {
    name: 'Magnezij',
    relevantQuestions: {
      intake: ['A.9.3a', 'A.9.3b', 'A.9.1a', 'A.9.1b', 'A.7.1a', 'A.7.1b', 'A.8.1a', 'A.8.1b', 'A.1.1a', 'A.1.1b', 'A.6.4a', 'A.6.4b', 'A.13.3a', 'A.13.3b'],
      symptoms: ['B.13.1', 'B.13.3', 'B.15.4', 'B.15.3', 'B.16.2']
    },
    weightingFactors: {
      'A.9.3a': 3.0, 'A.9.3b': 3.0, 'A.9.1a': 2.8, 'A.9.1b': 2.8, 'A.7.1a': 2.5, 'A.7.1b': 2.5, 'A.8.1a': 2.0, 'A.8.1b': 2.0, 'A.1.1a': 1.8, 'A.1.1b': 1.8, 'A.6.4a': 1.5, 'A.6.4b': 1.5, 'A.13.3a': 1.5, 'A.13.3b': 1.5
    },
    symptomScores: {
      'B.13.1': 5, 'B.13.3': 5, 'B.15.4': 3, 'B.15.3': 3, 'B.16.2': 2
    },
    clusterRules: [
      { condition: ['B.13.1', 'B.13.3', 'B.15.4'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.3.3': 0.7, 'A.12.3': 0.8, 'C.2.4': 0.8, 'C.2.1': 0.8, 'C.1.4': 0.8
    },
    prevalenceFactor: 1.20
  },

  'CINK': {
    name: 'Cink',
    relevantQuestions: {
      intake: ['A.3.3a', 'A.3.3b', 'A.2.1a', 'A.2.1b', 'A.9.3a', 'A.9.3b', 'A.8.1a', 'A.8.1b', 'A.4.3a', 'A.4.3b', 'A.9.1a', 'A.9.1b'],
      symptoms: ['B.7.1', 'B.17.1', 'B.10.3', 'B.1.1', 'B.9.2']
    },
    weightingFactors: {
      'A.3.3a': 3.0, 'A.3.3b': 3.0, 'A.2.1a': 2.8, 'A.2.1b': 2.8, 'A.9.3a': 2.0, 'A.9.3b': 2.0, 'A.8.1a': 1.5, 'A.8.1b': 1.5, 'A.4.3a': 1.2, 'A.4.3b': 1.2, 'A.9.1a': 1.2, 'A.9.1b': 1.2
    },
    symptomScores: {
      'B.7.1': 5, 'B.17.1': 4, 'B.10.3': 4, 'B.1.1': 3, 'B.9.2': 2
    },
    clusterRules: [
      { condition: ['B.7.1', 'B.17.1', 'B.10.3'], action: { type: 'override', value: -15 } }
    ],
    riskModifiers: {
      'C.3.2': 0.7, 'A.12.3': 0.8, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.25
  },

  'SE': {
    name: 'Selen',
    relevantQuestions: {
      intake: ['A.9.1a', 'A.9.1b', 'A.3.1a', 'A.3.1b', 'A.3.3a', 'A.3.3b', 'A.2.3a', 'A.2.3b', 'A.5.1a', 'A.5.1b', 'A.9.3a', 'A.9.3b'],
      symptoms: ['B.15.1', 'B.1.1', 'B.17.1', 'B.13.2', 'B.14.3']
    },
    weightingFactors: {
      'A.9.1a': 3.0, 'A.9.1b': 3.0, 'A.3.1a': 2.5, 'A.3.1b': 2.5, 'A.3.3a': 2.0, 'A.3.3b': 2.0, 'A.2.3a': 1.8, 'A.2.3b': 1.8, 'A.5.1a': 1.5, 'A.5.1b': 1.5, 'A.9.3a': 1.2, 'A.9.3b': 1.2
    },
    symptomScores: {
      'B.15.1': 2, 'B.1.1': 3, 'B.17.1': 3, 'B.13.2': 3, 'B.14.3': 2
    },
    clusterRules: [
      { condition: ['B.15.1', 'B.1.1', 'B.17.1'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.1.1': 0.7, 'C.1.2': 0.8, 'C.3.2': 0.8
    },
    prevalenceFactor: 1.10
  },

  'JOD': {
    name: 'Jod',
    relevantQuestions: {
      intake: ['A.14.1', 'A.3.4a', 'A.3.4b', 'A.3.2a', 'A.3.2b', 'A.4.1a', 'A.4.1b', 'A.5.1a', 'A.5.1b'],
      symptoms: ['B.8.1', 'B.15.1', 'B.15.5', 'B.10.1']
    },
    weightingFactors: {
      'A.14.1': 5.0, 'A.3.4a': 3.0, 'A.3.4b': 3.0, 'A.3.2a': 2.5, 'A.3.2b': 2.5, 'A.4.1a': 2.0, 'A.4.1b': 2.0, 'A.5.1a': 1.2, 'A.5.1b': 1.2
    },
    symptomScores: {
      'B.8.1': 5, 'B.15.1': 3, 'B.15.5': 3, 'B.10.1': 2
    },
    clusterRules: [
      { condition: ['B.8.1'], action: { type: 'override', value: -15 } }
    ],
    riskModifiers: {
      'C.1.1': 0.7, 'C.3.2': 0.8
    },
    prevalenceFactor: 1.25
  },

  'CU': {
    name: 'Bakar',
    relevantQuestions: {
      intake: ['A.2.3a', 'A.2.3b', 'A.3.3a', 'A.3.3b', 'A.9.1a', 'A.9.1b', 'A.9.3a', 'A.9.3b', 'A.13.1a', 'A.13.1b', 'A.13.3a', 'A.13.3b'],
      symptoms: ['B.1.2', 'B.17.1', 'B.12.1']
    },
    weightingFactors: {
      'A.2.3a': 3.0, 'A.2.3b': 3.0, 'A.3.3a': 2.8, 'A.3.3b': 2.8, 'A.9.1a': 2.0, 'A.9.1b': 2.0, 'A.9.3a': 2.0, 'A.9.3b': 2.0, 'A.13.1a': 1.5, 'A.13.1b': 1.5, 'A.13.3a': 1.5, 'A.13.3b': 1.5
    },
    symptomScores: {
      'B.1.2': 4, 'B.17.1': 3, 'B.12.1': 2
    },
    riskModifiers: {
      'C.2.1': 0.8, 'C.1.2': 0.8
    },
    prevalenceFactor: 1.00
  },

  'MN': {
    name: 'Mangan',
    relevantQuestions: {
      intake: ['A.1.1a', 'A.1.1b', 'A.8.1a', 'A.8.1b', 'A.9.1a', 'A.9.1b', 'A.9.2a', 'A.9.2b', 'A.7.1a', 'A.7.1b', 'A.12.2a', 'A.12.2b'],
      symptoms: []
    },
    weightingFactors: {
      'A.1.1a': 3.0, 'A.1.1b': 3.0, 'A.8.1a': 2.5, 'A.8.1b': 2.5, 'A.9.1a': 2.5, 'A.9.1b': 2.5, 'A.9.2a': 2.5, 'A.9.2b': 2.5, 'A.7.1a': 1.5, 'A.7.1b': 1.5, 'A.12.2a': 1.2, 'A.12.2b': 1.2
    },
    symptomScores: {},
    riskModifiers: {},
    prevalenceFactor: 1.05
  },

  'CR': {
    name: 'Krom',
    relevantQuestions: {
      intake: ['A.1.1a', 'A.1.1b', 'A.2.1a', 'A.2.1b', 'A.9.1a', 'A.9.1b'],
      symptoms: ['B.16.1', 'B.16.3', 'B.16.5']
    },
    weightingFactors: {
      'A.1.1a': 2.5, 'A.1.1b': 2.5, 'A.2.1a': 2.0, 'A.2.1b': 2.0, 'A.9.1a': 1.5, 'A.9.1b': 1.5
    },
    symptomScores: {
      'B.16.1': 4, 'B.16.3': 3, 'B.16.5': 3
    },
    riskModifiers: {
      'C.1.4': 0.7, 'C.3.3': 0.9
    },
    prevalenceFactor: 1.00
  },

  'MO': {
    name: 'Molibden',
    relevantQuestions: {
      intake: ['A.8.1a', 'A.8.1b', 'A.1.1a', 'A.1.1b', 'A.9.1a', 'A.9.1b', 'A.7.1a', 'A.7.1b'],
      symptoms: ['B.15.3']
    },
    weightingFactors: {
      'A.8.1a': 3.0, 'A.8.1b': 3.0, 'A.1.1a': 2.5, 'A.1.1b': 2.5, 'A.9.1a': 2.0, 'A.9.1b': 2.0, 'A.7.1a': 1.5, 'A.7.1b': 1.5
    },
    symptomScores: {
      'B.15.3': 2
    },
    riskModifiers: {},
    prevalenceFactor: 1.10
  },

  'P': {
    name: 'Fosfor',
    relevantQuestions: {
      intake: ['A.4.1a', 'A.4.1b', 'A.4.2a', 'A.4.2b', 'A.4.3a', 'A.4.3b', 'A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.2b', 'A.3.1a', 'A.3.1b', 'A.3.2a', 'A.3.2b', 'A.9.1a', 'A.9.1b', 'A.9.3a', 'A.9.3b', 'A.1.1a', 'A.1.1b', 'A.8.1a', 'A.8.1b'],
      symptoms: ['B.13.2', 'B.12.1', 'B.7.2', 'B.15.4']
    },
    weightingFactors: {
      'A.4.1a': 3.0, 'A.4.1b': 3.0, 'A.4.2a': 3.0, 'A.4.2b': 3.0, 'A.4.3a': 3.0, 'A.4.3b': 3.0, 'A.2.1a': 2.8, 'A.2.1b': 2.8, 'A.2.2a': 2.8, 'A.2.2b': 2.8, 'A.3.1a': 2.5, 'A.3.1b': 2.5, 'A.3.2a': 2.5, 'A.3.2b': 2.5, 'A.9.1a': 2.0, 'A.9.1b': 2.0, 'A.9.3a': 2.0, 'A.9.3b': 2.0, 'A.1.1a': 1.8, 'A.1.1b': 1.8, 'A.8.1a': 1.5, 'A.8.1b': 1.5
    },
    symptomScores: {
      'B.13.2': 3, 'B.12.1': 3, 'B.7.2': 1, 'B.15.4': 1
    },
    riskModifiers: {
      'A.12.3': 0.8, 'C.2.1': 0.7
    },
    prevalenceFactor: 1.10
  },

  'K': {
    name: 'Kalij',
    relevantQuestions: {
      intake: ['A.7.7a', 'A.7.7b', 'A.7.1a', 'A.7.1b', 'A.6.4a', 'A.6.4b', 'A.8.1a', 'A.8.1b', 'A.6.3a', 'A.6.3b', 'A.7.5a', 'A.7.5b', 'A.4.2a', 'A.4.2b', 'A.3.1a', 'A.3.1b'],
      symptoms: ['B.13.1', 'B.15.3', 'B.11.1']
    },
    weightingFactors: {
      'A.7.7a': 3.0, 'A.7.7b': 3.0, 'A.7.1a': 2.8, 'A.7.1b': 2.8, 'A.6.4a': 2.5, 'A.6.4b': 2.5, 'A.8.1a': 2.5, 'A.8.1b': 2.5, 'A.6.3a': 2.0, 'A.6.3b': 2.0, 'A.7.5a': 1.8, 'A.7.5b': 1.8, 'A.4.2a': 1.5, 'A.4.2b': 1.5, 'A.3.1a': 1.5, 'A.3.1b': 1.5
    },
    symptomScores: {
      'B.13.1': 4, 'B.15.3': 5, 'B.11.1': 3
    },
    clusterRules: [
      { condition: ['B.13.1', 'B.15.3'], action: { type: 'override', value: -10 } }
    ],
    riskModifiers: {
      'C.2.4': 0.6, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.15
  },

  'KOLIN': {
    name: 'Kolin',
    relevantQuestions: {
      intake: ['A.5.1a', 'A.5.1b', 'A.2.3a', 'A.2.3b', 'A.8.2a', 'A.8.2b', 'A.2.1a', 'A.2.1b', 'A.3.1a', 'A.3.1b', 'A.7.6a', 'A.7.6b'],
      symptoms: ['B.14.3', 'B.13.2', 'B.15.1']
    },
    weightingFactors: {
      'A.5.1a': 3.0, 'A.5.1b': 3.0, 'A.2.3a': 2.8, 'A.2.3b': 2.8, 'A.8.2a': 2.0, 'A.8.2b': 2.0, 'A.2.1a': 1.8, 'A.2.1b': 1.8, 'A.3.1a': 1.5, 'A.3.1b': 1.5, 'A.7.6a': 1.2, 'A.7.6b': 1.2
    },
    symptomScores: {
      'B.14.3': 4, 'B.13.2': 3, 'B.15.1': 2
    },
    clusterRules: [
      { condition: ['B.14.3', 'B.15.1'], action: { type: 'override', value: -5 } }
    ],
    riskModifiers: {
      'C.3.2': 0.6, 'A.12.3': 0.8
    },
    prevalenceFactor: 1.10
  },

  'OMEGA_3': {
    name: 'Omega-3 masne kiseline',
    relevantQuestions: {
      intake: ['A.3.1a', 'A.3.1b', 'A.9.2a', 'A.9.2b', 'A.9.4a', 'A.9.4b'],
      symptoms: ['B.10.1', 'B.10.4', 'B.12.2']
    },
    weightingFactors: {
      'A.3.1a': 3.0, 'A.3.1b': 3.0, 'A.9.2a': 0.5, 'A.9.2b': 0.5, 'A.9.4a': 0.5, 'A.9.4b': 0.5
    },
    symptomScores: {
      'B.10.1': 4, 'B.10.4': 4, 'B.12.2': 4
    },
    riskModifiers: {},
    prevalenceFactor: 0.85
  }
};
