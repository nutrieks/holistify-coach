export interface NAQSection {
  name: string;
  category: string;
  questionCount: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
}

export interface NAQScore {
  sectionName: string;
  totalScore: number;
  maxPossibleScore: number;
  symptomBurden: number;
  priorityLevel: 'low' | 'medium' | 'high';
}

export interface NAQResults {
  scores: NAQScore[];
  overallBurden: number;
  primaryConcerns: NAQScore[];
  hierarchyRecommendations: string[];
}

// NAQ Section definitions based on the PDF document
// NAQ Section definitions based on the official PDF document with exact thresholds
export const NAQ_SECTIONS: NAQSection[] = [
  { name: 'Gornji gastrointestinalni sustav', category: 'upper_gi', questionCount: 19, lowPriority: 9, mediumPriority: 14, highPriority: 15 },
  { name: 'Jetra i žučni mjehur', category: 'liver_gallbladder', questionCount: 28, lowPriority: 11, mediumPriority: 17, highPriority: 18 },
  { name: 'Tanko crijevo', category: 'small_intestine', questionCount: 17, lowPriority: 7, mediumPriority: 15, highPriority: 16 },
  { name: 'Debelo crijevo', category: 'large_intestine', questionCount: 20, lowPriority: 9, mediumPriority: 15, highPriority: 16 },
  { name: 'Potrebe za mineralima', category: 'minerals', questionCount: 29, lowPriority: 12, mediumPriority: 19, highPriority: 20 },
  { name: 'Esencijalne masne kiseline', category: 'essential_fatty_acids', questionCount: 8, lowPriority: 4, mediumPriority: 6, highPriority: 7 },
  { name: 'Regulacija šećera', category: 'sugar_regulation', questionCount: 13, lowPriority: 6, mediumPriority: 10, highPriority: 11 },
  { name: 'Potrebe za vitaminima', category: 'vitamins', questionCount: 27, lowPriority: 12, mediumPriority: 19, highPriority: 20 },
  { name: 'Nadbubrežne žlijezde', category: 'adrenals', questionCount: 26, lowPriority: 12, mediumPriority: 20, highPriority: 21 },
  { name: 'Hipofiza', category: 'pituitary', questionCount: 13, lowPriority: 4, mediumPriority: 7, highPriority: 8 },
  { name: 'Štitnjača', category: 'thyroid', questionCount: 16, lowPriority: 5, mediumPriority: 8, highPriority: 12 },
  { name: 'Samo za muškarce', category: 'male_health', questionCount: 9, lowPriority: 5, mediumPriority: 6, highPriority: 7 },
  { name: 'Samo za žene', category: 'female_health', questionCount: 20, lowPriority: 9, mediumPriority: 14, highPriority: 15 },
  { name: 'Kardiovaskularni sustav', category: 'cardiovascular', questionCount: 10, lowPriority: 4, mediumPriority: 7, highPriority: 8 },
  { name: 'Bubrezi i mjehur', category: 'kidneys_bladder', questionCount: 5, lowPriority: 3, mediumPriority: 4, highPriority: 4 },
  { name: 'Imunološki sustav', category: 'immune', questionCount: 10, lowPriority: 4, mediumPriority: 7, highPriority: 8 }
];

// Health Foundation Hierarchy - defines treatment priority order
export const HEALTH_FOUNDATION_HIERARCHY = [
  'upper_gi',
  'liver_gallbladder', 
  'small_intestine',
  'large_intestine',
  'minerals',
  'essential_fatty_acids',
  'sugar_regulation',
  'vitamins',
  'adrenals',
  'thyroid',
  'male_health',
  'female_health',
  'cardiovascular',
  'kidneys_bladder',
  'immune'
];

export class NAQScoringEngine {
  static calculateSectionScore(answers: Record<string, number>, sectionCategory: string): NAQScore {
    const section = NAQ_SECTIONS.find(s => s.category === sectionCategory);
    if (!section) {
      throw new Error(`Unknown section category: ${sectionCategory}`);
    }

    // Calculate total score for this section
    const sectionAnswers = Object.entries(answers).filter(([questionId, _]) => 
      questionId.startsWith(sectionCategory)
    );
    
    const totalScore = sectionAnswers.reduce((sum, [_, score]) => sum + score, 0);
    const maxPossibleScore = section.questionCount * 3; // Max score per question is 3
    
    // Calculate symptom burden (normalized score)
    const symptomBurden = totalScore / section.questionCount;
    
    // Determine priority level
    let priorityLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalScore >= section.highPriority) {
      priorityLevel = 'high';
    } else if (totalScore >= section.mediumPriority) {
      priorityLevel = 'medium';
    }

    return {
      sectionName: section.name,
      totalScore,
      maxPossibleScore,
      symptomBurden: Math.round(symptomBurden * 100) / 100,
      priorityLevel
    };
  }

  static calculateOverallResults(answers: Record<string, number>): NAQResults {
    const scores: NAQScore[] = [];
    
    // Calculate scores for each section
    for (const section of NAQ_SECTIONS) {
      const score = this.calculateSectionScore(answers, section.category);
      scores.push(score);
    }

    // Calculate overall burden (excluding lifestyle section)
    const totalQuestions = NAQ_SECTIONS.reduce((sum, section) => sum + section.questionCount, 0);
    const totalScore = scores.reduce((sum, score) => sum + score.totalScore, 0);
    const overallBurden = Math.round((totalScore / totalQuestions) * 100) / 100;

    // Identify primary concerns (high priority sections)
    const primaryConcerns = scores.filter(score => score.priorityLevel === 'high');

    // Generate hierarchy-based recommendations
    const hierarchyRecommendations = this.generateHierarchyRecommendations(scores);

    return {
      scores,
      overallBurden,
      primaryConcerns,
      hierarchyRecommendations
    };
  }

  private static generateHierarchyRecommendations(scores: NAQScore[]): string[] {
    const recommendations: string[] = [];
    
    // Sort sections by hierarchy priority and symptom burden
    const sortedConcerns = scores
      .filter(score => score.priorityLevel !== 'low')
      .sort((a, b) => {
        const aIndex = HEALTH_FOUNDATION_HIERARCHY.findIndex(cat => 
          NAQ_SECTIONS.find(s => s.name === a.sectionName)?.category === cat
        );
        const bIndex = HEALTH_FOUNDATION_HIERARCHY.findIndex(cat => 
          NAQ_SECTIONS.find(s => s.name === b.sectionName)?.category === cat
        );
        return aIndex - bIndex;
      });

    if (sortedConcerns.length > 0) {
      const topPriority = sortedConcerns[0];
      recommendations.push(`Prioritet 1: ${topPriority.sectionName} (opterećenje: ${topPriority.symptomBurden})`);
      
      if (sortedConcerns.length > 1) {
        const secondPriority = sortedConcerns[1];
        recommendations.push(`Prioritet 2: ${secondPriority.sectionName} (opterećenje: ${secondPriority.symptomBurden})`);
      }
    }

    // Add specific recommendations based on hierarchy
    const upperGI = scores.find(s => s.sectionName === 'Gornji gastrointestinalni sustav');
    if (upperGI && upperGI.priorityLevel === 'high') {
      recommendations.push('Preporučuje se prvo rješavanje probave prije pristupanja drugim sustavima.');
    }

    return recommendations;
  }

  static getPriorityColor(priorityLevel: 'low' | 'medium' | 'high'): string {
    switch (priorityLevel) {
      case 'high': return 'hsl(var(--destructive))';
      case 'medium': return 'hsl(var(--warning))';
      case 'low': return 'hsl(var(--success))';
      default: return 'hsl(var(--muted))';
    }
  }

  static getPriorityLabel(priorityLevel: 'low' | 'medium' | 'high'): string {
    switch (priorityLevel) {
      case 'high': return 'Visok prioritet';
      case 'medium': return 'Srednji prioritet';
      case 'low': return 'Nizak prioritet';
      default: return 'Nepoznato';
    }
  }
}