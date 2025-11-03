// Complete list of 166 micronutrient questionnaire questions
export const MICRONUTRIENT_QUESTIONS = [
  // ==================== DIO A: PREHRAMBENE NAVIKE (86 pitanja) ====================
  
  // A.1 Žitarice (4 pitanja)
  {
    section: 'A', category: 'Žitarice', question_code: 'A.1.1a',
    question_text: 'Koliko ČESTO jedete cjelovite (integralne) žitarice? (npr. integralni kruh, zobene pahuljice, smeđa riža, kvinoja)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 0,
    nutrient_relevance: { 'MG': 1.8, 'FE': 1.5, 'CINK': 1.5, 'MN': 3.0, 'SE': 1.2 }
  },
  {
    section: 'A', category: 'Žitarice', question_code: 'A.1.1b',
    question_text: 'Kada jedete cjelovite žitarice, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 1,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 1.8, 'FE': 1.5, 'CINK': 1.5 }
  },
  {
    section: 'A', category: 'Žitarice', question_code: 'A.1.2a',
    question_text: 'Koliko ČESTO jedete rafinirane (bijele) žitarice? (npr. bijeli kruh, bijela riža, obična tjestenina, peciva)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 2,
    nutrient_relevance: { 'MG': 0.3, 'FE': 0.3, 'CINK': 0.3, 'MN': 0.3 }
  },
  {
    section: 'A', category: 'Žitarice', question_code: 'A.1.2b',
    question_text: 'Kada jedete rafinirane žitarice, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 3,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 0.3, 'FE': 0.3 }
  },

  // A.2 Meso (6 pitanja)
  {
    section: 'A', category: 'Meso', question_code: 'A.2.1a',
    question_text: 'Koliko ČESTO jedete crveno meso? (govedina, svinjetina, janjetina)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 4,
    nutrient_relevance: { 'FE': 3.0, 'CINK': 2.5, 'B12': 2.0, 'KOLIN': 1.5 }
  },
  {
    section: 'A', category: 'Meso', question_code: 'A.2.1b',
    question_text: 'Kada jedete crveno meso, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od dlana', 'Veličina dlana', 'Veća od dlana'],
    order_index: 5,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'FE': 3.0, 'CINK': 2.5 }
  },
  {
    section: 'A', category: 'Meso', question_code: 'A.2.2a',
    question_text: 'Koliko ČESTO jedete meso peradi? (piletina, puretina)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 6,
    nutrient_relevance: { 'B12': 1.5, 'CINK': 1.5, 'SE': 2.0, 'KOLIN': 2.0 }
  },
  {
    section: 'A', category: 'Meso', question_code: 'A.2.2b',
    question_text: 'Kada jedete meso peradi, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od dlana', 'Veličina dlana', 'Veća od dlana'],
    order_index: 7,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'B12': 1.5, 'SE': 2.0 }
  },
  {
    section: 'A', category: 'Meso', question_code: 'A.2.3a',
    question_text: 'Koliko ČESTO jedete iznutrice? (jetra, bubrezi, srce)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 8,
    nutrient_relevance: { 'VIT_A': 4.0, 'FE': 3.5, 'B12': 4.0, 'FOLAT': 3.0, 'KOLIN': 4.0 }
  },
  {
    section: 'A', category: 'Meso', question_code: 'A.2.3b',
    question_text: 'Kada jedete iznutrice, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od dlana', 'Veličina dlana', 'Veća od dlana'],
    order_index: 9,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_A': 4.0, 'FE': 3.5, 'B12': 4.0 }
  },

  // A.3 Riba i morski plodovi (8 pitanja)
  {
    section: 'A', category: 'Riba', question_code: 'A.3.1a',
    question_text: 'Koliko ČESTO jedete masnu ribu? (losos, skuša, sardine, haringa)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 10,
    nutrient_relevance: { 'VIT_D': 3.0, 'B12': 2.5, 'SE': 2.0, 'JOD': 2.0, 'KOLIN': 2.0 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.1b',
    question_text: 'Kada jedete masnu ribu, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od dlana', 'Veličina dlana', 'Veća od dlana'],
    order_index: 11,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_D': 3.0, 'B12': 2.5 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.2a',
    question_text: 'Koliko ČESTO jedete bijelu ribu? (oslić, bakalar, orada, brancin)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 12,
    nutrient_relevance: { 'JOD': 2.5, 'SE': 2.0, 'B12': 1.5 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.2b',
    question_text: 'Kada jedete bijelu ribu, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Veličina dlana', 'Veća od dlana'],
    order_index: 13,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'JOD': 2.5, 'SE': 2.0 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.3a',
    question_text: 'Koliko ČESTO jedete školjke i rakove? (dagnje, kamenice, škampi)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 14,
    nutrient_relevance: { 'CINK': 3.5, 'JOD': 3.0, 'SE': 2.5, 'B12': 3.0 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.3b',
    question_text: 'Kada jedete školjke i rakove, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 15,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CINK': 3.5, 'JOD': 3.0 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.4a',
    question_text: 'Koliko ČESTO jedete morske alge? (nori u sushiju, wakame, kelp)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 16,
    nutrient_relevance: { 'JOD': 4.0, 'MG': 2.0, 'FE': 2.0 }
  },
  {
    section: 'A', category: 'Riba', question_code: 'A.3.4b',
    question_text: 'Kada jedete morske alge, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Vrlo malo (posip)', 'Umjereno (salata)', 'Puno (kao prilog)'],
    order_index: 17,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'JOD': 4.0 }
  },

  // A.4 Mliječni proizvodi (6 pitanja)
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.1a',
    question_text: 'Koliko ČESTO pijete mlijeko (kravlje, kozje)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 18,
    nutrient_relevance: { 'CA': 3.0, 'VIT_D': 1.5, 'B12': 2.0, 'JOD': 2.5 }
  },
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.1b',
    question_text: 'Koja je Vaša UOBIČAJENA porcija mlijeka?',
    question_type: 'portion',
    options: ['Manja od 1 čaše (< 200ml)', '1 čaša (200-250ml)', 'Više od 1 čaše (> 250ml)'],
    order_index: 19,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CA': 3.0, 'VIT_D': 1.5 }
  },
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.2a',
    question_text: 'Koliko ČESTO jedete jogurt ili kefir?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 20,
    nutrient_relevance: { 'CA': 3.0, 'B12': 2.0, 'JOD': 2.0 }
  },
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.2b',
    question_text: 'Kada jedete jogurt ili kefir, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od 1 čaše', '1 čaša', 'Više od 1 čaše'],
    order_index: 21,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CA': 3.0, 'B12': 2.0 }
  },
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.3a',
    question_text: 'Koliko ČESTO jedete sir (tvrdi, svježi, mekani)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 22,
    nutrient_relevance: { 'CA': 3.5, 'B12': 2.0, 'VIT_K2': 2.5 }
  },
  {
    section: 'A', category: 'Mliječni proizvodi', question_code: 'A.4.3b',
    question_text: 'Kada jedete sir, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 23,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CA': 3.5, 'VIT_K2': 2.5 }
  },

  // A.5 Jaja (2 pitanja)
  {
    section: 'A', category: 'Jaja', question_code: 'A.5.1a',
    question_text: 'Koliko ČESTO jedete jaja?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 24,
    nutrient_relevance: { 'VIT_D': 1.5, 'B12': 2.0, 'KOLIN': 4.0, 'SE': 2.0, 'VIT_A': 1.5 }
  },
  {
    section: 'A', category: 'Jaja', question_code: 'A.5.1b',
    question_text: 'Kada jedete jaja, koliko ih UOBIČAJENO pojedete u jednom obroku?',
    question_type: 'portion',
    options: ['1 jaje', '2 jaja', '3 ili više jaja'],
    order_index: 25,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'KOLIN': 4.0, 'B12': 2.0 }
  },

  // A.6 Voće (10 pitanja)
  {
    section: 'A', category: 'Voće', question_code: 'A.6.1a',
    question_text: 'Koliko ČESTO jedete agrume? (naranče, mandarine, grejp)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 26,
    nutrient_relevance: { 'VIT_C': 3.5, 'FOLAT': 1.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.1b',
    question_text: 'Kada jedete agrume, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 27,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 3.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.2a',
    question_text: 'Koliko ČESTO jedete bobičasto voće? (borovnice, maline, jagode, kupine, ribizl)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 28,
    nutrient_relevance: { 'VIT_C': 2.5, 'MN': 2.0 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.2b',
    question_text: 'Kada jedete bobičasto voće, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 29,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 2.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.3a',
    question_text: 'Koliko ČESTO jedete banane?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 30,
    nutrient_relevance: { 'MG': 1.5, 'B6': 2.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.3b',
    question_text: 'Koliko banana UOBIČAJENO pojedete odjednom?',
    question_type: 'portion',
    options: ['1 banana', '2 banane', '3 ili više banana'],
    order_index: 31,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 1.5, 'B6': 2.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.4a',
    question_text: 'Koliko ČESTO jedete avokado?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 32,
    nutrient_relevance: { 'VIT_K1': 2.0, 'FOLAT': 2.0, 'MG': 1.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.4b',
    question_text: 'Kada jedete avokado, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manje od polovice', 'Polovica avokada', 'Cijeli avokado ili više'],
    order_index: 33,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_K1': 2.0, 'FOLAT': 2.0 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.5a',
    question_text: 'Koliko ČESTO jedete ostalo svježe voće? (jabuke, kruške, breskve, šljive, grožđe...)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 34,
    nutrient_relevance: { 'VIT_C': 1.5 }
  },
  {
    section: 'A', category: 'Voće', question_code: 'A.6.5b',
    question_text: 'Kada jedete ostalo svježe voće, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 35,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 1.5 }
  },

  // A.7 Povrće (14 pitanja)
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.1a',
    question_text: 'Koliko ČESTO jedete kuhano tamnozeleno lisnato povrće? (špinat, blitva, kelj, raštika)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 36,
    nutrient_relevance: { 'VIT_K1': 4.0, 'FOLAT': 3.0, 'MG': 2.5, 'FE': 2.0, 'CA': 2.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.1b',
    question_text: 'Kada jedete kuhano zeleno lisnato povrće, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 37,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_K1': 4.0, 'FOLAT': 3.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.2a',
    question_text: 'Koliko ČESTO jedete svježe salate? (zelena salata, matovilac, rukola, radič, miješane salate)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 38,
    nutrient_relevance: { 'VIT_K1': 3.0, 'FOLAT': 2.0, 'VIT_C': 1.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.2b',
    question_text: 'Kada jedete salatu, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od 2 šake', 'Oko 2 šake', 'Više od 2 šake'],
    order_index: 39,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_K1': 3.0, 'FOLAT': 2.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.3a',
    question_text: 'Koliko ČESTO jedete mrkvu, batat (slatki krumpir) ili bundevu?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 40,
    nutrient_relevance: { 'VIT_A': 4.0, 'MG': 1.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.3b',
    question_text: 'Kada jedete ovo povrće, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 41,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_A': 4.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.4a',
    question_text: 'Koliko ČESTO jedete papriku (svježu, pečenu, kiselu)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 42,
    nutrient_relevance: { 'VIT_C': 3.5, 'VIT_A': 2.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.4b',
    question_text: 'Kada jedete papriku, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 43,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 3.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.5a',
    question_text: 'Koliko ČESTO jedete rajčicu (svježu, kuhanu, kao umak, sok)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 44,
    nutrient_relevance: { 'VIT_C': 2.0, 'VIT_A': 1.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.5b',
    question_text: 'Kada jedete rajčicu, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 45,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 2.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.6a',
    question_text: 'Koliko ČESTO jedete kupusnjače? (brokula, cvjetača, svježi kupus, prokulice)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 46,
    nutrient_relevance: { 'VIT_K1': 3.0, 'VIT_C': 2.5, 'FOLAT': 2.0 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.6b',
    question_text: 'Kada jedete kupusnjače, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 47,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_K1': 3.0, 'VIT_C': 2.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.7a',
    question_text: 'Koliko ČESTO jedete krumpir?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 48,
    nutrient_relevance: { 'VIT_C': 1.5, 'B6': 1.5 }
  },
  {
    section: 'A', category: 'Povrće', question_code: 'A.7.7b',
    question_text: 'Kada jedete krumpir, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 49,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_C': 1.5 }
  },

  // A.8 Mahunarke (4 pitanja)
  {
    section: 'A', category: 'Mahunarke', question_code: 'A.8.1a',
    question_text: 'Koliko ČESTO jedete grah, leću ili slanutak? (npr. kao varivo, salata, humus)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 50,
    nutrient_relevance: { 'FE': 2.5, 'FOLAT': 3.0, 'MG': 2.0, 'CINK': 2.0 }
  },
  {
    section: 'A', category: 'Mahunarke', question_code: 'A.8.1b',
    question_text: 'Kada jedete ove mahunarke, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 51,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'FE': 2.5, 'FOLAT': 3.0 }
  },
  {
    section: 'A', category: 'Mahunarke', question_code: 'A.8.2a',
    question_text: 'Koliko ČESTO jedete soju ili proizvode od soje? (tofu, tempeh, edamame)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 52,
    nutrient_relevance: { 'CA': 2.0, 'FE': 2.0, 'MG': 1.5 }
  },
  {
    section: 'A', category: 'Mahunarke', question_code: 'A.8.2b',
    question_text: 'Kada jedete soju, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 53,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CA': 2.0, 'FE': 2.0 }
  },

  // A.9 Orašasti plodovi i sjemenke (8 pitanja)
  {
    section: 'A', category: 'Orašasti plodovi', question_code: 'A.9.1a',
    question_text: 'Koliko ČESTO jedete orašaste plodove poput badema, lješnjaka, indijskih ili brazilskih oraščića?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 54,
    nutrient_relevance: { 'MG': 2.5, 'SE': 3.0, 'VIT_E': 3.0, 'CINK': 1.5 }
  },
  {
    section: 'A', category: 'Orašasti plodovi', question_code: 'A.9.1b',
    question_text: 'Kada jedete ove orašaste plodove, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 55,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 2.5, 'SE': 3.0, 'VIT_E': 3.0 }
  },
  {
    section: 'A', category: 'Orašasti plodovi', question_code: 'A.9.2a',
    question_text: 'Koliko ČESTO jedete orahe?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 56,
    nutrient_relevance: { 'MG': 2.0, 'MN': 2.5 }
  },
  {
    section: 'A', category: 'Orašasti plodovi', question_code: 'A.9.2b',
    question_text: 'Kada jedete orahe, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 57,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 2.0, 'MN': 2.5 }
  },
  {
    section: 'A', category: 'Sjemenke', question_code: 'A.9.3a',
    question_text: 'Koliko ČESTO jedete sjemenke bundeve, suncokreta ili sezama (uključujući tahini)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 58,
    nutrient_relevance: { 'CINK': 3.0, 'MG': 2.5, 'FE': 2.0, 'CA': 2.5 }
  },
  {
    section: 'A', category: 'Sjemenke', question_code: 'A.9.3b',
    question_text: 'Kada jedete ove sjemenke, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 59,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'CINK': 3.0, 'MG': 2.5 }
  },
  {
    section: 'A', category: 'Sjemenke', question_code: 'A.9.4a',
    question_text: 'Koliko ČESTO jedete mljevene lanene ili chia sjemenke? (npr. u kašama, smoothieju, jogurtu)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 60,
    nutrient_relevance: { 'MG': 2.0, 'CA': 2.0 }
  },
  {
    section: 'A', category: 'Sjemenke', question_code: 'A.9.4b',
    question_text: 'Kada jedete ove sjemenke, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['1 žlica', '2 žlice', '3 ili više žlica'],
    order_index: 61,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 2.0, 'CA': 2.0 }
  },

  // A.10 Masnoće (3 pitanja)
  {
    section: 'A', category: 'Masnoće', question_code: 'A.10.1',
    question_text: 'Koju vrstu masnoće najčešće koristite za kuhanje, pečenje i dinstanje?',
    question_type: 'select_one',
    options: ['Maslinovo ulje', 'Maslac', 'Kokosovo ulje', 'Suncokretovo/repičino ulje', 'Margarin', 'Ne koristim masnoću', 'Ostalo'],
    order_index: 62,
    nutrient_relevance: { 'VIT_E': 2.0, 'VIT_K1': 1.5 }
  },
  {
    section: 'A', category: 'Masnoće', question_code: 'A.10.2',
    question_text: 'Koju vrstu masnoće najčešće koristite kao preljev za salate?',
    question_type: 'select_one',
    options: ['Maslinovo ulje', 'Laneno ulje', 'Suncokretovo ulje', 'Ocat/limun bez ulja', 'Ne koristim preljev', 'Ostalo'],
    order_index: 63,
    nutrient_relevance: { 'VIT_E': 2.5, 'VIT_K1': 2.0 }
  },
  {
    section: 'A', category: 'Masnoće', question_code: 'A.10.3a',
    question_text: 'Koliko ČESTO konzumirate maslac? (npr. kao namaz na kruhu)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 64,
    nutrient_relevance: { 'VIT_A': 1.5, 'VIT_D': 0.5, 'VIT_K2': 1.5 }
  },
  {
    section: 'A', category: 'Masnoće', question_code: 'A.10.3b',
    question_text: 'Kada jedete maslac, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Tanki sloj', 'Umjereni sloj', 'Debeli sloj'],
    order_index: 65,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_A': 1.5 }
  },

  // A.11 Obogaćeni proizvodi (2 pitanja)
  {
    section: 'A', category: 'Obogaćeni proizvodi', question_code: 'A.11.1a',
    question_text: 'Koliko ČESTO konzumirate BILO KOJI proizvod obogaćen vitaminom D? (npr. "Vitamin D" mlijeko, margarin)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 66,
    nutrient_relevance: { 'VIT_D': 2.0 }
  },
  {
    section: 'A', category: 'Obogaćeni proizvodi', question_code: 'A.11.1b',
    question_text: 'Koliko otprilike porcija obogaćenih proizvoda unesete u JEDNOM DANU u kojem ih konzumirate?',
    question_type: 'select_one',
    options: ['1 porcija', '2 porcije', '3 ili više porcija'],
    order_index: 67,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_D': 2.0 }
  },

  // A.12 Napici (5 pitanja)
  {
    section: 'A', category: 'Napici', question_code: 'A.12.1',
    question_text: 'Koliko tekućine (voda, nezaslađeni čajevi, mineralna) popijete tijekom prosječnog dana?',
    question_type: 'select_one',
    options: ['Manje od 1L', '1-2L', '2-3L', 'Više od 3L'],
    order_index: 68,
    nutrient_relevance: {}
  },
  {
    section: 'A', category: 'Napici', question_code: 'A.12.2a',
    question_text: 'Koliko ČESTO pijete kavu ili jače čajeve (crni, zeleni)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 69,
    nutrient_relevance: { 'FE': -0.5, 'CA': -0.5 }
  },
  {
    section: 'A', category: 'Napici', question_code: 'A.12.2b',
    question_text: 'Kakvu kavu ili čaj UOBIČAJENO pijete?',
    question_type: 'select_one',
    options: ['Crna (bez mlijeka)', 'S mlijekom', 'Varira'],
    order_index: 70,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: {}
  },
  {
    section: 'A', category: 'Napici', question_code: 'A.12.3a',
    question_text: 'Koliko ČESTO konzumirate alkoholna pića? (pivo, vino, žestoka pića)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 71,
    nutrient_relevance: { 'MG': -0.5, 'B1': -1.0, 'FOLAT': -0.5 }
  },
  {
    section: 'A', category: 'Napici', question_code: 'A.12.3b',
    question_text: 'Kada pijete alkohol, koliko UOBIČAJENO popijete u jednom navratu?',
    question_type: 'select_one',
    options: ['1-2 pića', '3-4 pića', '5 ili više pića'],
    order_index: 72,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': -0.5, 'B1': -1.0 }
  },

  // A.13 Ostalo (6 pitanja)
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.1a',
    question_text: 'Koliko ČESTO jedete gljive? (šampinjoni, bukovače, vrganji, itd.)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 73,
    nutrient_relevance: { 'VIT_D': 2.5, 'SE': 1.5 }
  },
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.1b',
    question_text: 'Kada jedete gljive, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 74,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_D': 2.5 }
  },
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.2a',
    question_text: 'Koliko ČESTO jedete fermentirano povrće? (kiseli kupus, repa, turšija)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 75,
    nutrient_relevance: { 'VIT_K2': 2.0 }
  },
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.2b',
    question_text: 'Kada jedete fermentirano povrće, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['Manja od šake', 'Veličina šake', 'Veća od šake'],
    order_index: 76,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'VIT_K2': 2.0 }
  },
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.3a',
    question_text: 'Koliko ČESTO jedete tamnu čokoladu (s udjelom kakaa >70%)?',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', '1-2 puta mjesečno', '1-3 puta tjedno', '4-6 puta tjedno', 'Dnevno ili više'],
    order_index: 77,
    nutrient_relevance: { 'MG': 2.0, 'FE': 1.5 }
  },
  {
    section: 'A', category: 'Ostalo', question_code: 'A.13.3b',
    question_text: 'Kada jedete tamnu čokoladu, kolika je Vaša UOBIČAJENA porcija?',
    question_type: 'portion',
    options: ['1-2 kockice (10-20g)', '1/4 ploče (25-30g)', 'Više od 1/4 ploče (>30g)'],
    order_index: 78,
    skip_logic: { skip_if: 'Nikad ili vrlo rijetko' },
    nutrient_relevance: { 'MG': 2.0 }
  },

  // A.14 Začini i sol (2 pitanja)
  {
    section: 'A', category: 'Začini', question_code: 'A.14.1',
    question_text: 'Koju vrstu soli PRETEŽNO koristite za kuhanje i dosoljavanje?',
    question_type: 'select_one',
    options: ['Obična (rafinirar) kuhinjska sol', 'Jodirana sol', 'Morska sol (nejodirana)', 'Himalajska/keltska sol', 'Ne solim hranu', 'Ne znam'],
    order_index: 79,
    nutrient_relevance: { 'JOD': 3.0 }
  },
  {
    section: 'A', category: 'Začini', question_code: 'A.14.2',
    question_text: 'Koliko ČESTO koristite raznovrsno bilje i začine u pripremi hrane? (npr. svježi peršin, bosiljak, kurkuma, origano, cimet...)',
    question_type: 'frequency',
    options: ['Nikad ili vrlo rijetko', 'Ponekad', 'Često', 'Redovito pri svakom obroku'],
    order_index: 80,
    nutrient_relevance: {}
  },

  // A.15 Suplementi (3 pitanja)
  {
    section: 'A', category: 'Suplementi', question_code: 'A.15.1',
    question_text: 'Uzimate li redovito BILO KAKVE dodatke prehrani?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 81,
    nutrient_relevance: {}
  },
  {
    section: 'A', category: 'Suplementi', question_code: 'A.15.2',
    question_text: 'Koje od sljedećih dodataka prehrani uzimate redovito?',
    question_type: 'multi_select',
    options: ['Vitamin D', 'Multivitamin/mineral', 'Omega-3', 'Željezo', 'Magnezij', 'Kalcij', 'Cink', 'B-kompleks', 'Ostalo'],
    order_index: 82,
    skip_logic: { skip_if: 'Ne' },
    nutrient_relevance: {}
  },
  {
    section: 'A', category: 'Suplementi', question_code: 'A.15.3',
    question_text: 'Ako uzimate Vitamin D, koja je doza navedena na proizvodu?',
    question_type: 'select_one',
    options: ['Ne uzimam Vitamin D', 'Manje od 1000 IU', '1000-2000 IU', '2000-4000 IU', 'Više od 4000 IU', 'Ne znam'],
    order_index: 83,
    nutrient_relevance: { 'VIT_D': 4.0 }
  },

  // A.16 Sunce (2 pitanja)
  {
    section: 'A', category: 'Sunce', question_code: 'A.16.1',
    question_text: 'Koliko vremena u prosjeku dnevno provodite na suncu u periodu od travnja do rujna, s otkrivenim licem i rukama/nogama, bez zaštitnog faktora?',
    question_type: 'select_one',
    options: ['Gotovo nikad', 'Manje od 15 min', '15-30 min', '30-60 min', 'Više od 1 sat'],
    order_index: 84,
    nutrient_relevance: { 'VIT_D': 4.0 }
  },
  {
    section: 'A', category: 'Sunce', question_code: 'A.16.2',
    question_text: 'Koliko vremena u prosjeku dnevno provodite na suncu u periodu od listopada do ožujka, s otkrivenim licem i rukama, bez zaštitnog faktora?',
    question_type: 'select_one',
    options: ['Gotovo nikad', 'Manje od 15 min', '15-30 min', '30-60 min', 'Više od 1 sat'],
    order_index: 85,
    nutrient_relevance: { 'VIT_D': 2.0 }
  },

  // ==================== DIO B: SIMPTOMI I ZNAKOVI (67 pitanja) ====================
  
  // B.1 Kosa (5 pitanja)
  {
    section: 'B', category: 'Kosa', question_code: 'B.1.1',
    question_text: 'Primjećujete li da Vam je kosa postala tanja, da se prorijedila ili da Vam pojačano ispada?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 86,
    nutrient_relevance: { 'FE': 3, 'CINK': 3, 'BIOTIN': 4, 'VIT_D': 2, 'SE': 2 }
  },
  {
    section: 'B', category: 'Kosa', question_code: 'B.1.2',
    question_text: 'Jeste li primijetili promjene u boji kose (npr. pojava svijetlih pramenova) ili da je izgubila sjaj?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 87,
    nutrient_relevance: { 'CU': 3, 'BIOTIN': 2, 'B12': 2 }
  },
  {
    section: 'B', category: 'Kosa', question_code: 'B.1.3',
    question_text: 'Imate li osjećaj da je kosa izrazito suha i lomljiva te da se lako kida?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 88,
    nutrient_relevance: { 'BIOTIN': 3, 'VIT_A': 2, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Kosa', question_code: 'B.1.4',
    question_text: 'Jeste li primijetili neobično uvijene ili "čepaste" dlake koje se lome?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 89,
    nutrient_relevance: { 'VIT_C': 4, 'VIT_A': 2 }
  },
  {
    section: 'B', category: 'Kosa', question_code: 'B.1.5',
    question_text: 'Pojavljuju li Vam se meke, tanke i svijetle dlačice (paperje) na neuobičajenim mjestima?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 90,
    nutrient_relevance: { 'FE': 3, 'BIOTIN': 2 }
  },

  // B.2 Oči - Vid (6 pitanja)
  {
    section: 'B', category: 'Oči', question_code: 'B.2.1',
    question_text: 'Imate li poteškoća s vidom u uvjetima slabog osvjetljenja (noćna vožnja)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 91,
    nutrient_relevance: { 'VIT_A': 4, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Oči', question_code: 'B.2.2',
    question_text: 'Osjećate li često neugodnu suhoću, peckanje ili osjećaj "pijeska" u očima?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 92,
    nutrient_relevance: { 'VIT_A': 4, 'VIT_D': 2 }
  },
  {
    section: 'B', category: 'Oči', question_code: 'B.2.3',
    question_text: 'Jesu li Vam kapci često upaljeni, crveni ili natečeni uz rub trepavica?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 93,
    nutrient_relevance: { 'B2': 3, 'VIT_A': 2 }
  },
  {
    section: 'B', category: 'Oči', question_code: 'B.2.4',
    question_text: 'Čini li Vam se da je unutrašnjost Vaših donjih kapaka izrazito blijeda?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 94,
    nutrient_relevance: { 'FE': 4, 'B12': 3 }
  },
  {
    section: 'B', category: 'Oči', question_code: 'B.2.5',
    question_text: 'Javljaju li Vam se crvenilo i bolne pukotine u kutovima očiju ili Vam oči često suze bez očitog razloga?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 95,
    nutrient_relevance: { 'B2': 4, 'B6': 2 }
  },
  {
    section: 'B', category: 'Oči', question_code: 'B.2.6',
    question_text: 'Jeste li primijetili male žućkaste naslage masnoće na koži oko očiju?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 96,
    nutrient_relevance: {}
  },

  // B.3 Koža lica (4 pitanja)
  {
    section: 'B', category: 'Koža lica', question_code: 'B.3.1',
    question_text: 'Izgleda li Vaša koža lica neobično blijedo ili "isprano", čak i kada ste odmorni?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 97,
    nutrient_relevance: { 'FE': 3, 'B12': 3, 'FOLAT': 2 }
  },
  {
    section: 'B', category: 'Koža lica', question_code: 'B.3.2',
    question_text: 'Primjećujete li pojačano ljuštenje ili perutanje kože (posebno oko nosa, obrva ili na čelu)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 98,
    nutrient_relevance: { 'B2': 3, 'B6': 3, 'BIOTIN': 3, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Koža lica', question_code: 'B.3.3',
    question_text: 'Jeste li primijetili gubitak boje (svjetlije mrlje) na koži lica ili izražene, tamne podočnjake?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 99,
    nutrient_relevance: { 'B12': 2, 'FE': 2 }
  },
  {
    section: 'B', category: 'Koža lica', question_code: 'B.3.4',
    question_text: 'Pojavljuju li Vam se tamnije mrlje (hiperpigmentacija) na licu, vratu ili rukama?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 100,
    nutrient_relevance: { 'B3': 3, 'B12': 2 }
  },

  // B.4 Usna šupljina (5 pitanja)
  {
    section: 'B', category: 'Usna šupljina', question_code: 'B.4.1',
    question_text: 'Osjećate li često bol, peckanje, afte ili ranice unutar usne šupljine?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 101,
    nutrient_relevance: { 'FE': 3, 'B12': 3, 'FOLAT': 3, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Usna šupljina', question_code: 'B.4.2',
    question_text: 'Pojavljuju li Vam se bolne pukotine, crvenilo ili ranice u kutovima usana (žvale)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 102,
    nutrient_relevance: { 'B2': 4, 'FE': 3, 'B6': 2 }
  },
  {
    section: 'B', category: 'Usna šupljina', question_code: 'B.4.3',
    question_text: 'Jesu li Vam usne često suhe, ispucane, blijede ili osjećate da Vas peku?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 103,
    nutrient_relevance: { 'B2': 3, 'VIT_A': 2 }
  },
  {
    section: 'B', category: 'Usna šupljina', question_code: 'B.4.4',
    question_text: 'Je li Vam jezik često natečen, bolan ili izrazito crven?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 104,
    nutrient_relevance: { 'B3': 3, 'FOLAT': 3, 'FE': 2 }
  },
  {
    section: 'B', category: 'Usna šupljina', question_code: 'B.4.5',
    question_text: 'Imate li osjećaj peckanja jezika, a da je pritom neobične (ljubičaste ili magenta) boje?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 105,
    nutrient_relevance: { 'B2': 4, 'B12': 3 }
  },

  // B.5 Jezik (4 pitanja)
  {
    section: 'B', category: 'Jezik', question_code: 'B.5.1',
    question_text: 'Izgleda li Vaš jezik neobično gladak, natečen i sjajan?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 106,
    nutrient_relevance: { 'B12': 4, 'FOLAT': 3, 'FE': 3 }
  },
  {
    section: 'B', category: 'Jezik', question_code: 'B.5.2',
    question_text: 'Čini li se Vaš jezik neobično blijedim?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 107,
    nutrient_relevance: { 'FE': 4, 'B12': 3 }
  },

  // B.6 Desni i zubi (4 pitanja)
  {
    section: 'B', category: 'Desni i zubi', question_code: 'B.6.1',
    question_text: 'Jesu li Vam desni često natečene, osjetljive, tamno crvene ili krvare li lako?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 108,
    nutrient_relevance: { 'VIT_C': 4, 'VIT_K1': 2 }
  },
  {
    section: 'B', category: 'Desni i zubi', question_code: 'B.6.2',
    question_text: 'Jeste li primijetili povlačenje desni ili osjećate da su Vam zubi klimavi?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 109,
    nutrient_relevance: { 'VIT_C': 3, 'CA': 2, 'VIT_D': 2 }
  },
  {
    section: 'B', category: 'Desni i zubi', question_code: 'B.6.3',
    question_text: 'Imate li česte probleme s karijesom unatoč redovitoj higijeni?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 110,
    nutrient_relevance: { 'CA': 3, 'VIT_D': 3, 'VIT_K2': 2 }
  },
  {
    section: 'B', category: 'Desni i zubi', question_code: 'B.6.4',
    question_text: 'Jesu li Vaši zubi izrazito osjetljivi na hladno, toplo ili slatko?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 111,
    nutrient_relevance: { 'CA': 2, 'VIT_D': 2 }
  },

  // B.7 Osjet i apetit (2 pitanja)
  {
    section: 'B', category: 'Osjet i apetit', question_code: 'B.7.1',
    question_text: 'Jeste li primijetili da Vam je osjet okusa ili mirisa oslabio, ili da hrana ima drugačiji okus?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 112,
    nutrient_relevance: { 'CINK': 4, 'VIT_A': 2, 'B12': 2 }
  },
  {
    section: 'B', category: 'Osjet i apetit', question_code: 'B.7.2',
    question_text: 'Imate li ponekad iznenadne promjene apetita (jaka želja za hranom ili gubitak apetita)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 113,
    nutrient_relevance: { 'CINK': 2, 'B1': 2 }
  },

  // B.8 Vrat i štitnjača (2 pitanja)
  {
    section: 'B', category: 'Vrat i štitnjača', question_code: 'B.8.1',
    question_text: 'Jeste li primijetili ili napipali oteklinu na prednjoj strani vrata (područje štitnjače)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 114,
    nutrient_relevance: { 'JOD': 4, 'SE': 2 }
  },
  {
    section: 'B', category: 'Vrat i štitnjača', question_code: 'B.8.2',
    question_text: 'Osjećate li pritisak, nelagodu ili "knedlu" u grlu prilikom gutanja?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 115,
    nutrient_relevance: { 'JOD': 3 }
  },

  // B.9 Nokti (3 pitanja)
  {
    section: 'B', category: 'Nokti', question_code: 'B.9.1',
    question_text: 'Jesu li Vam nokti izrazito krhki, lomljivi, listaju se ili sporo rastu?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 116,
    nutrient_relevance: { 'FE': 3, 'BIOTIN': 3, 'CINK': 2, 'CA': 2 }
  },
  {
    section: 'B', category: 'Nokti', question_code: 'B.9.2',
    question_text: 'Jeste li primijetili bijele mrlje, udubljene ("žličaste") nokte ili izražene okomite brazde?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 117,
    nutrient_relevance: { 'FE': 4, 'CINK': 3, 'CA': 2 }
  },
  {
    section: 'B', category: 'Nokti', question_code: 'B.9.3',
    question_text: 'Pojavljuju li Vam se sitna, tamna, okomita krvarenja ispod noktiju?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 118,
    nutrient_relevance: { 'VIT_C': 3 }
  },

  // B.10 Koža tijela (6 pitanja)
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.1',
    question_text: 'Imate li generalno suhu, grubu kožu koja se peruta?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 119,
    nutrient_relevance: { 'VIT_A': 3, 'VIT_E': 2, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.2',
    question_text: 'Pojavljuju li Vam se modrice lako, često i bez jakog udarca?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 120,
    nutrient_relevance: { 'VIT_C': 4, 'VIT_K1': 3 }
  },
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.3',
    question_text: 'Zarastaju li Vam rane, ogrebotine ili posjekotine sporo?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 121,
    nutrient_relevance: { 'CINK': 4, 'VIT_C': 3, 'VIT_A': 2 }
  },
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.4',
    question_text: 'Patite li od ekcema, dermatitisa ili psorijaze?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 122,
    nutrient_relevance: { 'CINK': 3, 'VIT_D': 3, 'BIOTIN': 2 }
  },
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.5',
    question_text: 'Primjećujete li sitne, grube prištiće (poput "pureće kože")?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 123,
    nutrient_relevance: { 'VIT_A': 4, 'VIT_C': 2 }
  },
  {
    section: 'B', category: 'Koža tijela', question_code: 'B.10.6',
    question_text: 'Pojavljuju li Vam se sitna, točkasta, crvena krvarenja na koži?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 124,
    nutrient_relevance: { 'VIT_C': 4, 'VIT_K1': 2 }
  },

  // B.11 Probava (4 pitanja)
  {
    section: 'B', category: 'Probava', question_code: 'B.11.1',
    question_text: 'Imate li često problema s nadutošću, vjetrovima ili osjećajem težine nakon obroka?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 125,
    nutrient_relevance: { 'MG': 2, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Probava', question_code: 'B.11.2',
    question_text: 'Patite li od neredovite probave (česte izmjene zatvora i proljeva)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 126,
    nutrient_relevance: { 'MG': 2, 'B1': 2 }
  },
  {
    section: 'B', category: 'Probava', question_code: 'B.11.3',
    question_text: 'Imate li slab apetit ili osjećate mučninu bez jasnog uzroka?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 127,
    nutrient_relevance: { 'B1': 3, 'CINK': 2 }
  },
  {
    section: 'B', category: 'Probava', question_code: 'B.11.4',
    question_text: 'Jeste li primijetili da Vam je stolica često masna, sjajna i neugodnog mirisa?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 128,
    nutrient_relevance: { 'VIT_A': 2, 'VIT_D': 2, 'VIT_E': 2, 'VIT_K1': 2 }
  },

  // B.12 Kosti (3 pitanja)
  {
    section: 'B', category: 'Kosti', question_code: 'B.12.1',
    question_text: 'Osjećate li duboku, tupu bol u kostima (leđa, kukovi, noge) nevezanu za ozljedu?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 129,
    nutrient_relevance: { 'VIT_D': 4, 'CA': 3 }
  },
  {
    section: 'B', category: 'Kosti', question_code: 'B.12.2',
    question_text: 'Jeste li primijetili bolove u zglobovima ili mišićima koji imaju upalni karakter?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 130,
    nutrient_relevance: { 'VIT_D': 3, 'MG': 2 }
  },
  {
    section: 'B', category: 'Kosti', question_code: 'B.12.3',
    question_text: 'Jeste li doživjeli prijelom kosti uslijed manjeg pada ili udarca?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 131,
    nutrient_relevance: { 'CA': 4, 'VIT_D': 4, 'VIT_K2': 3 }
  },

  // B.13 Mišići (4 pitanja)
  {
    section: 'B', category: 'Mišići', question_code: 'B.13.1',
    question_text: 'Osjećate li česte i bolne grčeve u mišićima, posebno noću?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 132,
    nutrient_relevance: { 'MG': 4, 'CA': 2, 'VIT_D': 2 }
  },
  {
    section: 'B', category: 'Mišići', question_code: 'B.13.2',
    question_text: 'Imate li neobjašnjivu opću slabost mišića ili osjećaj težine u rukama i nogama?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 133,
    nutrient_relevance: { 'VIT_D': 4, 'MG': 3, 'B1': 2 }
  },
  {
    section: 'B', category: 'Mišići', question_code: 'B.13.3',
    question_text: 'Primjećujete li spontane, sitne trzajeve mišića (poput "titranja")?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 134,
    nutrient_relevance: { 'MG': 3, 'CA': 2 }
  },
  {
    section: 'B', category: 'Mišići', question_code: 'B.13.4',
    question_text: 'Jeste li iskusili "sindrom nemirnih nogu"?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 135,
    nutrient_relevance: { 'FE': 4, 'MG': 2 }
  },

  // B.14 Živci (4 pitanja)
  {
    section: 'B', category: 'Živci', question_code: 'B.14.1',
    question_text: 'Osjećate li često trnce, bockanje, mravinjanje ili utrnulost u rukama ili stopalima?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 136,
    nutrient_relevance: { 'B12': 4, 'B6': 3, 'B1': 2 }
  },
  {
    section: 'B', category: 'Živci', question_code: 'B.14.2',
    question_text: 'Imate li problema s ravnotežom ili Vam se čini da Vam je koordinacija lošija?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 137,
    nutrient_relevance: { 'B12': 4, 'VIT_D': 2 }
  },
  {
    section: 'B', category: 'Živci', question_code: 'B.14.3',
    question_text: 'Imate li poteškoća s pamćenjem i koncentracijom, osjećate se "zamućeno"?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 138,
    nutrient_relevance: { 'B12': 3, 'B1': 3, 'FE': 2, 'MG': 2 }
  },
  {
    section: 'B', category: 'Živci', question_code: 'B.14.4',
    question_text: 'Doživljavate li zbunjenost, dezorijentaciju ili Vam je teško pratiti razgovor?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 139,
    nutrient_relevance: { 'B12': 4, 'B1': 3, 'B3': 2 }
  },

  // B.15 Energija i raspoloženje (5 pitanja)
  {
    section: 'B', category: 'Energija i raspoloženje', question_code: 'B.15.1',
    question_text: 'Osjećate li se kronično umorno, iscrpljeno ili bezvoljno, čak i nakon dovoljno sna?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 140,
    nutrient_relevance: { 'FE': 3, 'B12': 3, 'VIT_D': 2, 'MG': 2 }
  },
  {
    section: 'B', category: 'Energija i raspoloženje', question_code: 'B.15.2',
    question_text: 'Osjećate li često vrtoglavicu ili ošamućenost, posebno prilikom naglog ustajanja?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 141,
    nutrient_relevance: { 'FE': 4, 'B12': 2 }
  },
  {
    section: 'B', category: 'Energija i raspoloženje', question_code: 'B.15.3',
    question_text: 'Primjećujete li ubrzan rad srca, lupanje (palpitacije) ili nedostatak zraka pri manjem naporu?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 142,
    nutrient_relevance: { 'FE': 3, 'MG': 3, 'B1': 2 }
  },
  {
    section: 'B', category: 'Energija i raspoloženje', question_code: 'B.15.4',
    question_text: 'Imate li česte i nagle promjene raspoloženja, osjećaj depresije ili pojačanu razdražljivost?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 143,
    nutrient_relevance: { 'VIT_D': 3, 'B12': 2, 'MG': 2, 'B6': 2 }
  },
  {
    section: 'B', category: 'Energija i raspoloženje', question_code: 'B.15.5',
    question_text: 'Je li Vaša tjelesna težina značajno porasla ili pala u posljednjih nekoliko mjeseci?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 144,
    nutrient_relevance: { 'JOD': 2, 'B1': 2 }
  },

  // B.16 Metabolizam (5 pitanja)
  {
    section: 'B', category: 'Metabolizam', question_code: 'B.16.1',
    question_text: 'Osjećate li se često umorno ili Vam se spava nakon obroka bogatog ugljikohidratima?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 145,
    nutrient_relevance: { 'CR': 3, 'MG': 2 }
  },
  {
    section: 'B', category: 'Metabolizam', question_code: 'B.16.2',
    question_text: 'Imate li izraženu i čestu želju za slatkom hranom, posebno između obroka?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 146,
    nutrient_relevance: { 'CR': 3, 'MG': 2 }
  },
  {
    section: 'B', category: 'Metabolizam', question_code: 'B.16.3',
    question_text: 'Doživljavate li nagle padove energije, drhtavicu ili nervozu ako preskočite obrok?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 147,
    nutrient_relevance: { 'CR': 2 }
  },
  {
    section: 'B', category: 'Metabolizam', question_code: 'B.16.4',
    question_text: 'Primjećujete li zamućen vid ili glavobolje sat ili dva nakon obilnijeg obroka?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 148,
    nutrient_relevance: { 'CR': 2 }
  },
  {
    section: 'B', category: 'Metabolizam', question_code: 'B.16.5',
    question_text: 'Osjećate li pojačanu žeđ i potrebu za učestalim mokrenjem?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 149,
    nutrient_relevance: { 'CR': 3 }
  },

  // B.17 Imunitet (3 pitanja)
  {
    section: 'B', category: 'Imunitet', question_code: 'B.17.1',
    question_text: 'Jeste li češće bolesni (npr. prehlade, viroze) od ljudi u Vašoj okolini?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 150,
    nutrient_relevance: { 'VIT_D': 3, 'CINK': 3, 'VIT_C': 2, 'SE': 2 }
  },
  {
    section: 'B', category: 'Imunitet', question_code: 'B.17.2',
    question_text: 'Treba li Vam dugo da se oporavite od uobičajenih bolesti?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 151,
    nutrient_relevance: { 'CINK': 3, 'VIT_C': 2, 'VIT_D': 2 }
  },
  {
    section: 'B', category: 'Imunitet', question_code: 'B.17.3',
    question_text: 'Jeste li skloni čestim gljivičnim ili bakterijskim infekcijama?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 152,
    nutrient_relevance: { 'CINK': 4, 'VIT_D': 3, 'VIT_A': 2 }
  },

  // ==================== DIO C: FAKTORI RIZIKA (13 pitanja) ====================
  
  {
    section: 'C', category: 'Zdravstveno stanje', question_code: 'C.1.1',
    question_text: 'Imate li dijagnosticiranu bolest štitnjače (npr. hipotireoza, Hashimotov tireoiditis)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 153,
    nutrient_relevance: { 'JOD': 0.7, 'SE': 0.7, 'VIT_D': 0.9 }
  },
  {
    section: 'C', category: 'Zdravstveno stanje', question_code: 'C.1.2',
    question_text: 'Imate li dijagnosticiranu bolest probavnog sustava (npr. kronični gastritis, GERB, celijakija, Crohnova bolest)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 154,
    nutrient_relevance: { 'FE': 0.6, 'CA': 0.7, 'VIT_D': 0.7, 'B12': 0.6, 'FOLAT': 0.7 }
  },
  {
    section: 'C', category: 'Zdravstveno stanje', question_code: 'C.1.3',
    question_text: 'Imate li dijagnosticiranu neku drugu autoimunu bolest (npr. reumatoidni artritis, lupus)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 155,
    nutrient_relevance: { 'VIT_D': 0.8, 'CINK': 0.85 }
  },
  {
    section: 'C', category: 'Zdravstveno stanje', question_code: 'C.1.4',
    question_text: 'Imate li dijagnosticiranu inzulinsku rezistenciju, predijabetes ili dijabetes tipa 2?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 156,
    nutrient_relevance: { 'CR': 0.7, 'MG': 0.8, 'CINK': 0.85 }
  },
  {
    section: 'C', category: 'Lijekovi', question_code: 'C.2.1',
    question_text: 'Uzimate li redovito lijekove za smanjenje želučane kiseline (tzv. "zaštitu želuca")?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 157,
    nutrient_relevance: { 'B12': 0.5, 'FE': 0.7, 'CA': 0.75, 'MG': 0.8 }
  },
  {
    section: 'C', category: 'Lijekovi', question_code: 'C.2.2',
    question_text: 'Uzimate li redovito Metformin?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 158,
    nutrient_relevance: { 'B12': 0.6, 'FOLAT': 0.8 }
  },
  {
    section: 'C', category: 'Lijekovi', question_code: 'C.2.3',
    question_text: 'Koristite li redovito oralnu hormonsku kontracepciju ("antibebi pilule")?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 159,
    nutrient_relevance: { 'B6': 0.75, 'FOLAT': 0.8, 'B12': 0.85, 'MG': 0.85 }
  },
  {
    section: 'C', category: 'Lijekovi', question_code: 'C.2.4',
    question_text: 'Uzimate li redovito diuretike (lijekove za izbacivanje viška vode)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 160,
    nutrient_relevance: { 'MG': 0.6, 'CA': 0.75 }
  },
  {
    section: 'C', category: 'Lijekovi', question_code: 'C.2.5',
    question_text: 'Uzimate li redovito statine (lijekove za snižavanje kolesterola)?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 161,
    nutrient_relevance: { 'VIT_D': 0.85 }
  },
  {
    section: 'C', category: 'Stil života', question_code: 'C.3.1',
    question_text: 'Imate li naviku piti kavu ili jače čajeve (crni, zeleni) za vrijeme ili unutar sat vremena nakon glavnih obroka?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 162,
    nutrient_relevance: { 'FE': 0.7, 'CA': 0.8 }
  },
  {
    section: 'C', category: 'Stil života', question_code: 'C.3.2',
    question_text: 'Slijedite li vegetarijansku (ne jedete meso i ribu) ili vegansku (ne jedete nikakve životinjske proizvode) prehranu?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 163,
    nutrient_relevance: { 'B12': 0.3, 'FE': 0.6, 'CINK': 0.7, 'CA': 0.8, 'VIT_D': 0.7, 'JOD': 0.7 }
  },
  {
    section: 'C', category: 'Stil života', question_code: 'C.3.3',
    question_text: 'Kako biste ocijenili svoju prosječnu razinu stresa u posljednjih nekoliko mjeseci?',
    question_type: 'select_one',
    options: ['Niska', 'Umjerena', 'Visoka', 'Vrlo visoka'],
    order_index: 164,
    nutrient_relevance: { 'MG': 0.8, 'VIT_C': 0.85, 'B_KOMPLEKS': 0.85 }
  },
  {
    section: 'C', category: 'Stil života', question_code: 'C.3.4',
    question_text: 'Spavate li redovito (većinu noći) manje od 6-7 sati?',
    question_type: 'yes_no',
    options: ['Da', 'Ne'],
    order_index: 165,
    nutrient_relevance: { 'MG': 0.85, 'VIT_D': 0.9 }
  }
];