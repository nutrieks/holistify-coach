// Nutrient configuration for micronutrient assessment
// Sample: 6 key nutrients shown, remaining 21 will be added in next phase

export const NUTRIENT_CONFIG: Record<string, any> = {
  'VIT_D': {
    name: 'Vitamin D',
    relevantQuestions: {
      intake: ['A.16.1', 'A.16.2', 'A.15.3', 'A.3.1a', 'A.3.1b', 'A.11.1a', 'A.11.1b', 'A.13.1a', 'A.13.1b', 'A.2.3a', 'A.2.3b', 'A.5.1a', 'A.5.1b'],
      symptoms: ['B.12.1', 'B.12.2', 'B.12.3', 'B.13.2', 'B.15.1', 'B.15.4', 'B.17.1']
    },
    weightingFactors: {
      'A.16.1': 3.5, 'A.16.2': 1.0, 'A.15.3': 4.0, 'A.3.1a': 2.5, 'A.3.1b': 2.5,
      'A.11.1a': 2.0, 'A.13.1a': 2.0
    },
    symptomScores: {
      'B.12.1': 5, 'B.12.2': 4, 'B.12.3': 5, 'B.13.2': 4, 'B.15.1': 3, 'B.15.4': 3, 'B.17.1': 3
    },
    riskModifiers: {
      'C.1.2': 0.7, 'C.3.3': 0.9, 'C.3.4': 0.9
    },
    prevalenceFactor: 1.2
  },

  'FE': {
    name: 'Željezo',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.3a', 'A.2.3b', 'A.8.1a', 'A.8.1b', 'A.1.1a', 'A.1.1b', 'A.13.3a'],
      symptoms: ['B.1.1', 'B.2.4', 'B.3.1', 'B.4.1', 'B.4.2', 'B.5.1', 'B.5.2', 'B.9.1', 'B.9.2', 'B.13.4', 'B.15.1', 'B.15.2']
    },
    weightingFactors: {
      'A.2.1a': 3.0, 'A.2.1b': 3.0, 'A.2.3a': 3.5, 'A.2.3b': 3.5, 'A.8.1a': 2.5, 'A.1.1a': 1.5
    },
    symptomScores: {
      'B.1.1': 4, 'B.2.4': 5, 'B.3.1': 4, 'B.4.1': 4, 'B.4.2': 4, 'B.5.1': 4, 'B.5.2': 5, 'B.9.1': 4, 'B.9.2': 5, 'B.13.4': 5, 'B.15.1': 4, 'B.15.2': 5
    },
    clusterRules: [
      { condition: ['B.1.1', 'B.9.2', 'B.15.2'], action: { type: 'subtract', value: 10 } }
    ],
    riskModifiers: {
      'C.1.2': 0.6, 'C.2.1': 0.7, 'C.3.1': 0.7, 'C.3.2': 0.6
    },
    prevalenceFactor: 1.3
  },

  'B12': {
    name: 'Vitamin B12',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.3a', 'A.2.3b', 'A.3.1a', 'A.3.1b', 'A.3.3a', 'A.4.1a', 'A.4.2a', 'A.4.3a', 'A.5.1a'],
      symptoms: ['B.1.2', 'B.3.1', 'B.3.3', 'B.4.1', 'B.4.5', 'B.5.1', 'B.14.1', 'B.14.2', 'B.14.3', 'B.14.4', 'B.15.1']
    },
    weightingFactors: {
      'A.2.3a': 4.0, 'A.2.3b': 4.0, 'A.3.1a': 2.5, 'A.3.3a': 3.0, 'A.2.1a': 2.0, 'A.4.1a': 2.0, 'A.5.1a': 2.0
    },
    symptomScores: {
      'B.14.1': 5, 'B.14.2': 5, 'B.14.3': 4, 'B.14.4': 5, 'B.5.1': 5, 'B.15.1': 3, 'B.4.1': 3
    },
    riskModifiers: {
      'C.1.2': 0.6, 'C.2.1': 0.5, 'C.2.2': 0.6, 'C.3.2': 0.3
    },
    prevalenceFactor: 1.2
  },

  'MG': {
    name: 'Magnezij',
    relevantQuestions: {
      intake: ['A.1.1a', 'A.1.1b', 'A.9.1a', 'A.9.1b', 'A.9.2a', 'A.9.3a', 'A.7.1a', 'A.13.3a', 'A.8.1a'],
      symptoms: ['B.13.1', 'B.13.2', 'B.13.3', 'B.14.3', 'B.15.3']
    },
    weightingFactors: {
      'A.1.1a': 1.8, 'A.9.1a': 2.5, 'A.9.1b': 2.5, 'A.7.1a': 2.5, 'A.13.3a': 2.0, 'A.8.1a': 2.0
    },
    symptomScores: {
      'B.13.1': 5, 'B.13.2': 4, 'B.13.3': 4, 'B.14.3': 3, 'B.15.3': 3
    },
    riskModifiers: {
      'C.2.4': 0.6, 'C.3.3': 0.8, 'C.12.3a': 0.85
    },
    prevalenceFactor: 1.1
  },

  'CINK': {
    name: 'Cink',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.3.3a', 'A.3.3b', 'A.9.3a', 'A.9.3b', 'A.8.1a', 'A.1.1a'],
      symptoms: ['B.1.1', 'B.7.1', 'B.9.1', 'B.9.2', 'B.10.3', 'B.10.4', 'B.17.1', 'B.17.2', 'B.17.3']
    },
    weightingFactors: {
      'A.3.3a': 3.5, 'A.3.3b': 3.5, 'A.9.3a': 3.0, 'A.2.1a': 2.5, 'A.8.1a': 2.0
    },
    symptomScores: {
      'B.7.1': 5, 'B.9.2': 4, 'B.10.3': 5, 'B.17.1': 4, 'B.17.2': 4, 'B.17.3': 5, 'B.1.1': 3
    },
    riskModifiers: {
      'C.3.2': 0.7, 'C.1.2': 0.7
    },
    prevalenceFactor: 1.15
  },

  'VIT_C': {
    name: 'Vitamin C',
    relevantQuestions: {
      intake: ['A.6.1a', 'A.6.1b', 'A.6.2a', 'A.7.4a', 'A.7.4b', 'A.7.6a', 'A.7.7a'],
      symptoms: ['B.1.4', 'B.6.1', 'B.6.2', 'B.9.3', 'B.10.2', 'B.10.3', 'B.10.6']
    },
    weightingFactors: {
      'A.6.1a': 3.5, 'A.6.1b': 3.5, 'A.7.4a': 3.5, 'A.7.4b': 3.5, 'A.6.2a': 2.5, 'A.7.6a': 2.5
    },
    symptomScores: {
      'B.1.4': 5, 'B.6.1': 5, 'B.6.2': 4, 'B.9.3': 4, 'B.10.2': 5, 'B.10.3': 4, 'B.10.6': 5
    },
    riskModifiers: {
      'C.3.3': 0.85
    },
    prevalenceFactor: 1.0
  },

  'VIT_A': {
    name: 'Vitamin A',
    relevantQuestions: {
      intake: ['A.3.1a', 'A.3.1b', 'A.3.2a', 'A.4.1a', 'A.4.1b', 'A.5.1a', 'A.5.1b', 'A.7.3a', 'A.7.3b'],
      symptoms: ['B.11.1', 'B.17.1', 'B.10.3']
    },
    weightingFactors: {
      'A.3.2a': 4.0, 'A.7.3a': 3.5, 'A.7.3b': 3.5, 'A.3.1a': 2.5, 'A.4.1a': 2.0, 'A.5.1a': 2.0
    },
    symptomScores: {
      'B.11.1': 5, 'B.17.1': 4, 'B.10.3': 3
    },
    riskModifiers: {
      'C.1.2': 0.7, 'C.3.2': 0.8
    },
    prevalenceFactor: 1.1
  },

  'VIT_E': {
    name: 'Vitamin E',
    relevantQuestions: {
      intake: ['A.9.1a', 'A.9.1b', 'A.9.2a', 'A.9.2b', 'A.10.1a', 'A.10.1b'],
      symptoms: ['B.13.2', 'B.17.1', 'B.10.3', 'B.6.1']
    },
    weightingFactors: {
      'A.9.1a': 3.5, 'A.9.1b': 3.5, 'A.9.2a': 3.0, 'A.10.1a': 3.0
    },
    symptomScores: {
      'B.13.2': 4, 'B.17.1': 4, 'B.10.3': 3, 'B.6.1': 3
    },
    riskModifiers: {
      'C.3.3': 0.85
    },
    prevalenceFactor: 1.0
  },

  'VIT_K1': {
    name: 'Vitamin K1',
    relevantQuestions: {
      intake: ['A.7.1a', 'A.7.1b', 'A.7.2a', 'A.7.5a'],
      symptoms: ['B.6.1', 'B.6.2', 'B.12.3']
    },
    weightingFactors: {
      'A.7.1a': 4.0, 'A.7.1b': 4.0, 'A.7.2a': 3.0
    },
    symptomScores: {
      'B.6.1': 5, 'B.6.2': 5, 'B.12.3': 3
    },
    riskModifiers: {
      'C.2.1': 0.6
    },
    prevalenceFactor: 1.0
  },

  'VIT_K2': {
    name: 'Vitamin K2',
    relevantQuestions: {
      intake: ['A.5.1a', 'A.5.1b', 'A.5.2a', 'A.3.1a', 'A.3.1b', 'A.2.1a', 'A.2.1b'],
      symptoms: ['B.12.3', 'B.12.1', 'B.6.1']
    },
    weightingFactors: {
      'A.5.1a': 3.5, 'A.5.2a': 4.0, 'A.3.1a': 2.5, 'A.2.1a': 2.0
    },
    symptomScores: {
      'B.12.3': 5, 'B.12.1': 4, 'B.6.1': 3
    },
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 1.05
  },

  'B1': {
    name: 'Tiamin (B1)',
    relevantQuestions: {
      intake: ['A.1.1a', 'A.1.1b', 'A.2.1a', 'A.2.1b', 'A.12.1a', 'A.12.1b', 'A.9.3a'],
      symptoms: ['B.1.2', 'B.4.1', 'B.13.3', 'B.14.1']
    },
    weightingFactors: {
      'A.12.1a': 3.5, 'A.1.1a': 3.0, 'A.2.1a': 2.5
    },
    symptomScores: {
      'B.1.2': 5, 'B.4.1': 4, 'B.13.3': 4, 'B.14.1': 4
    },
    riskModifiers: {
      'C.3.3': 0.8, 'C.12.1a': 0.7
    },
    prevalenceFactor: 1.1
  },

  'B2': {
    name: 'Riboflavin (B2)',
    relevantQuestions: {
      intake: ['A.3.1a', 'A.3.1b', 'A.4.1a', 'A.4.1b', 'A.7.1a', 'A.7.1b', 'A.2.1a'],
      symptoms: ['B.8.1', 'B.11.1', 'B.17.1']
    },
    weightingFactors: {
      'A.4.1a': 3.5, 'A.3.1a': 3.0, 'A.7.1a': 2.5
    },
    symptomScores: {
      'B.8.1': 5, 'B.11.1': 4, 'B.17.1': 3
    },
    riskModifiers: {
      'C.3.2': 0.7
    },
    prevalenceFactor: 1.0
  },

  'B3': {
    name: 'Niacin (B3)',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.2b', 'A.9.1a', 'A.9.1b'],
      symptoms: ['B.1.2', 'B.17.1', 'B.14.1']
    },
    weightingFactors: {
      'A.2.2a': 3.5, 'A.2.1a': 3.0, 'A.9.1a': 2.5
    },
    symptomScores: {
      'B.1.2': 4, 'B.17.1': 4, 'B.14.1': 3
    },
    riskModifiers: {
      'C.3.3': 0.85
    },
    prevalenceFactor: 1.0
  },

  'B6': {
    name: 'Piridoksin (B6)',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.2b', 'A.1.1a', 'A.1.1b', 'A.7.8a'],
      symptoms: ['B.1.2', 'B.8.1', 'B.14.1', 'B.14.3']
    },
    weightingFactors: {
      'A.2.2a': 3.5, 'A.2.1a': 3.0, 'A.1.1a': 2.5, 'A.7.8a': 2.5
    },
    symptomScores: {
      'B.14.1': 5, 'B.1.2': 4, 'B.8.1': 4, 'B.14.3': 4
    },
    riskModifiers: {
      'C.2.3': 0.7
    },
    prevalenceFactor: 1.1
  },

  'FOLAT': {
    name: 'Folna kiselina',
    relevantQuestions: {
      intake: ['A.7.1a', 'A.7.1b', 'A.1.1a', 'A.1.1b', 'A.3.1a', 'A.3.1b', 'A.7.5a'],
      symptoms: ['B.1.1', 'B.4.1', 'B.14.1', 'B.14.2', 'B.5.1']
    },
    weightingFactors: {
      'A.7.1a': 4.0, 'A.7.1b': 4.0, 'A.1.1a': 3.5, 'A.3.1a': 2.5
    },
    symptomScores: {
      'B.1.1': 5, 'B.14.1': 5, 'B.14.2': 4, 'B.4.1': 4, 'B.5.1': 3
    },
    riskModifiers: {
      'C.2.1': 0.6, 'C.2.3': 0.7, 'C.12.1a': 0.75
    },
    prevalenceFactor: 1.2
  },

  'BIOTIN': {
    name: 'Biotin (B7)',
    relevantQuestions: {
      intake: ['A.3.1a', 'A.3.1b', 'A.9.1a', 'A.9.1b', 'A.3.2a'],
      symptoms: ['B.5.1', 'B.5.2', 'B.17.1', 'B.15.4']
    },
    weightingFactors: {
      'A.3.1a': 4.0, 'A.3.1b': 4.0, 'A.9.1a': 3.0, 'A.3.2a': 3.5
    },
    symptomScores: {
      'B.5.1': 5, 'B.5.2': 5, 'B.17.1': 4, 'B.15.4': 3
    },
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 1.0
  },

  'KOLIN': {
    name: 'Kolin',
    relevantQuestions: {
      intake: ['A.3.1a', 'A.3.1b', 'A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.2b', 'A.1.1a'],
      symptoms: ['B.4.1', 'B.4.5', 'B.1.2']
    },
    weightingFactors: {
      'A.3.1a': 4.0, 'A.3.1b': 4.0, 'A.2.2a': 3.0, 'A.2.1a': 2.5
    },
    symptomScores: {
      'B.4.5': 5, 'B.4.1': 4, 'B.1.2': 3
    },
    riskModifiers: {
      'C.3.2': 0.6
    },
    prevalenceFactor: 1.1
  },

  'CA': {
    name: 'Kalcij',
    relevantQuestions: {
      intake: ['A.4.1a', 'A.4.1b', 'A.5.1a', 'A.5.1b', 'A.7.1a', 'A.7.1b', 'A.2.2a', 'A.13.3a'],
      symptoms: ['B.12.1', 'B.12.3', 'B.15.4', 'B.13.3']
    },
    weightingFactors: {
      'A.4.1a': 4.0, 'A.4.1b': 4.0, 'A.5.1a': 3.5, 'A.7.1a': 2.5, 'A.2.2a': 2.5
    },
    symptomScores: {
      'B.12.1': 5, 'B.12.3': 5, 'B.15.4': 3, 'B.13.3': 3
    },
    riskModifiers: {
      'C.1.2': 0.7, 'C.2.4': 0.75
    },
    prevalenceFactor: 1.15
  },

  'JOD': {
    name: 'Jod',
    relevantQuestions: {
      intake: ['A.2.2a', 'A.2.2b', 'A.2.4a', 'A.2.4b', 'A.14.1', 'A.4.1a'],
      symptoms: ['B.1.2', 'B.2.4', 'B.3.1', 'B.5.1', 'B.5.2']
    },
    weightingFactors: {
      'A.14.1': 5.0, 'A.2.2a': 3.5, 'A.2.4a': 3.5
    },
    symptomScores: {
      'B.1.2': 5, 'B.2.4': 5, 'B.5.1': 4, 'B.5.2': 4, 'B.3.1': 3
    },
    riskModifiers: {
      'C.1.1': 0.4, 'C.3.2': 0.7
    },
    prevalenceFactor: 1.3
  },

  'SE': {
    name: 'Selen',
    relevantQuestions: {
      intake: ['A.2.2a', 'A.2.2b', 'A.2.1a', 'A.2.1b', 'A.9.1a', 'A.9.1b', 'A.12.1a'],
      symptoms: ['B.1.2', 'B.5.1', 'B.10.3', 'B.13.2']
    },
    weightingFactors: {
      'A.2.2a': 4.0, 'A.2.1a': 3.0, 'A.9.1a': 2.5, 'A.12.1a': 2.0
    },
    symptomScores: {
      'B.10.3': 5, 'B.5.1': 4, 'B.1.2': 4, 'B.13.2': 3
    },
    riskModifiers: {
      'C.1.1': 0.7, 'C.3.3': 0.8
    },
    prevalenceFactor: 1.1
  },

  'CU': {
    name: 'Bakar',
    relevantQuestions: {
      intake: ['A.9.1a', 'A.9.1b', 'A.2.4a', 'A.2.4b', 'A.1.1a', 'A.1.1b', 'A.3.2a'],
      symptoms: ['B.1.1', 'B.13.2', 'B.15.1']
    },
    weightingFactors: {
      'A.9.1a': 3.5, 'A.2.4a': 3.5, 'A.1.1a': 2.5, 'A.3.2a': 2.5
    },
    symptomScores: {
      'B.1.1': 5, 'B.13.2': 4, 'B.15.1': 3
    },
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 1.0
  },

  'MN': {
    name: 'Mangan',
    relevantQuestions: {
      intake: ['A.12.1a', 'A.12.1b', 'A.9.1a', 'A.9.1b', 'A.11.1a', 'A.11.1b', 'A.1.1a'],
      symptoms: ['B.12.3', 'B.13.2', 'B.15.4']
    },
    weightingFactors: {
      'A.12.1a': 3.5, 'A.9.1a': 3.0, 'A.11.1a': 2.5, 'A.1.1a': 2.0
    },
    symptomScores: {
      'B.12.3': 4, 'B.13.2': 4, 'B.15.4': 3
    },
    riskModifiers: {
      'C.3.3': 0.85
    },
    prevalenceFactor: 1.0
  },

  'CR': {
    name: 'Krom',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.12.1a', 'A.12.1b', 'A.7.5a', 'A.1.1a'],
      symptoms: ['B.16.1', 'B.16.2', 'B.1.2']
    },
    weightingFactors: {
      'A.2.1a': 3.0, 'A.12.1a': 3.5, 'A.7.5a': 2.5, 'A.1.1a': 2.0
    },
    symptomScores: {
      'B.16.1': 5, 'B.16.2': 5, 'B.1.2': 3
    },
    riskModifiers: {
      'C.1.4': 0.5, 'C.3.3': 0.8
    },
    prevalenceFactor: 1.2
  },

  'OMEGA_3': {
    name: 'Omega-3 masne kiseline',
    relevantQuestions: {
      intake: ['A.2.2a', 'A.2.2b', 'A.9.2a', 'A.9.2b', 'A.9.3a', 'A.9.3b'],
      symptoms: ['B.13.1', 'B.14.1', 'B.17.1', 'B.4.1']
    },
    weightingFactors: {
      'A.2.2a': 4.5, 'A.2.2b': 4.5, 'A.9.2a': 3.5, 'A.9.3a': 2.5
    },
    symptomScores: {
      'B.13.1': 5, 'B.14.1': 4, 'B.17.1': 4, 'B.4.1': 3
    },
    riskModifiers: {
      'C.1.3': 0.7, 'C.3.3': 0.8
    },
    prevalenceFactor: 1.25
  },

  'KOENZIM_Q10': {
    name: 'Koenzim Q10',
    relevantQuestions: {
      intake: ['A.2.1a', 'A.2.1b', 'A.2.2a', 'A.2.2b', 'A.9.1a', 'A.9.1b'],
      symptoms: ['B.1.2', 'B.13.2', 'B.2.4']
    },
    weightingFactors: {
      'A.2.2a': 3.5, 'A.2.1a': 3.0, 'A.9.1a': 2.5
    },
    symptomScores: {
      'B.1.2': 5, 'B.13.2': 4, 'B.2.4': 3
    },
    riskModifiers: {
      'C.2.5': 0.5, 'C.3.3': 0.8
    },
    prevalenceFactor: 1.15
  },

  'PROBIOTICI': {
    name: 'Probiotici',
    relevantQuestions: {
      intake: ['A.5.2a', 'A.5.2b'],
      symptoms: ['B.7.1', 'B.7.2', 'B.7.3', 'B.10.3']
    },
    weightingFactors: {
      'A.5.2a': 5.0, 'A.5.2b': 5.0
    },
    symptomScores: {
      'B.7.1': 5, 'B.7.2': 4, 'B.7.3': 4, 'B.10.3': 4
    },
    riskModifiers: {
      'C.1.2': 0.6, 'C.2.1': 0.7, 'C.12.2a': 0.7
    },
    prevalenceFactor: 1.2
  },

  'VLAKNA': {
    name: 'Prehrambena vlakna',
    relevantQuestions: {
      intake: ['A.6.1a', 'A.6.1b', 'A.7.1a', 'A.7.1b', 'A.12.1a', 'A.12.1b', 'A.1.1a', 'A.1.1b'],
      symptoms: ['B.7.1', 'B.16.2', 'B.7.2']
    },
    weightingFactors: {
      'A.6.1a': 3.5, 'A.7.1a': 3.5, 'A.12.1a': 4.0, 'A.1.1a': 3.0
    },
    symptomScores: {
      'B.7.1': 5, 'B.16.2': 4, 'B.7.2': 3
    },
    riskModifiers: {
      'C.1.2': 0.7
    },
    prevalenceFactor: 1.1
  }
};