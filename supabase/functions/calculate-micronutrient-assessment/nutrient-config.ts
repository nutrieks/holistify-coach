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
  }

  // TODO: Add remaining 21 nutrients:
  // VIT_A, VIT_E, VIT_K1, VIT_K2, B1, B2, B3, B6, FOLAT, BIOTIN, KOLIN,
  // CA, JOD, SE, CU, MN, CR, B_KOMPLEKS (grouped)
};