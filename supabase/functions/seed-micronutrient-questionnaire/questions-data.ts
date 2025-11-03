// Sample questions - Full 166 questions will be added in next phase
export const MICRONUTRIENT_QUESTIONS = [
  // DIO A: PREHRAMBENE NAVIKE - Sample (86 total needed)
  {
    section: 'A',
    category: 'Žitarice',
    question_code: 'A.1.1a',
    question_text: 'Koliko ČESTO jedete cjelovite (integralne) žitarice? (npr. integralni kruh, zobene pahuljice, smeđa riža, kvinoja)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 0,
    nutrient_relevance: { 'MG': 1.8, 'FE': 1.5, 'CINK': 1.5, 'MN': 3.0, 'SE': 1.2 }
  },
  {
    section: 'A',
    category: 'Žitarice',
    question_code: 'A.1.1b',
    question_text: 'Kada jedete cjelovite žitarice, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 1,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 1.8, 'FE': 1.5, 'CINK': 1.5 }
  },
  
  // DIO B: SIMPTOMI - Sample (67 total needed)
  {
    section: 'B',
    category: 'Kosa',
    question_code: 'B.1.1',
    question_text: 'Primjećujete li da Vam je kosa postala tanja, da se prorijedila ili da Vam pojačano ispada?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 86,
    nutrient_relevance: { 'FE': 3, 'CINK': 3, 'BIOTIN': 4, 'VIT_D': 2 }
  },
  
  // DIO C: FAKTORI RIZIKA - Sample (13 total needed)
  {
    section: 'C',
    category: 'Zdravstveno stanje',
    question_code: 'C.1.1',
    question_text: 'Imate li dijagnosticiranu bolest štitnjače (npr. hipotireoza, Hashimotov tireoiditis)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 153,
    nutrient_relevance: { 'JOD': 0.7, 'SE': 0.7, 'VIT_D': 0.9 }
  }
];