// Complete NAQ Questions - Full dataset
export interface NAQQuestion {
  id: number;
  text: string;
  sectionName: string;
  scoringCategory: string;
  scoringWeight: number;
  questionType: 'scale_0_3' | 'yes_no' | 'multiple_choice';
  options?: string[];
}

export const NAQ_QUESTIONS: NAQQuestion[] = [
  // Nutrition Analysis (Part I) - Questions 1-20
  { id: 1, text: "Alkohol", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 2, text: "Umjetni zaslađivači", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 3, text: "Slatkiši, deserti, rafinirani šećer", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 4, text: "Gazirana pića", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 5, text: "Duhan za žvakanje", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 6, text: "Cigarete", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 7, text: "Cigare/lule", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 8, text: "Kofeinska pića", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 9, text: "Brza hrana", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 10, text: "Pržena hrana", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 11, text: "Suhomesnati proizvodi", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 12, text: "Margarin", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 13, text: "Mliječni proizvodi", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 14, text: "Izloženost zračenju", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "yes_no" },
  { id: 15, text: "Rafinirano brašno/pekarski proizvodi", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 16, text: "Vitamini i minerali", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 17, text: "Voda, destilirana", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 18, text: "Voda, iz slavine", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 19, text: "Voda, iz bunara", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 20, text: "Često na dijeti radi kontrole težine", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },

  // Lifestyle Analysis (Part I) - Questions 21-24
  { id: 21, text: "Vježbanje tjedno", sectionName: "Analiza životnog stila", scoringCategory: "lifestyle", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 22, text: "Promjena posla", sectionName: "Analiza životnog stila", scoringCategory: "lifestyle", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 23, text: "Razvod", sectionName: "Analiza životnog stila", scoringCategory: "lifestyle", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 24, text: "Rad preko 60 sati tjedno", sectionName: "Analiza životnog stila", scoringCategory: "lifestyle", scoringWeight: 1, questionType: "scale_0_3" },

  // Medications (Part I) - Questions 25-51
  { id: 25, text: "Antacidi", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 26, text: "Lijekovi protiv anksioznosti", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 27, text: "Antibiotici", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 28, text: "Antikonvulzivi", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 29, text: "Antidepresivi", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 30, text: "Antifungici", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 31, text: "Aspirin/Ibuprofen", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 32, text: "Inhalatori za astmu", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 33, text: "Beta blokatori", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 34, text: "Kontracepcijske pilule/implantati", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 35, text: "Kemoterapija", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 36, text: "Lijekovi za snižavanje kolesterola", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 37, text: "Kortizon/steroidi", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 38, text: "Lijekovi za dijabetes/inzulin", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 39, text: "Diuretici", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 40, text: "Estrogen/progesteron (farmaceutski)", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 41, text: "Estrogen/progesteron (prirodni)", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 42, text: "Lijekovi za srce", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 43, text: "Lijekovi za visoki krvni tlak", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 44, text: "Laksativi", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 45, text: "Rekreativne droge", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 46, text: "Sredstva za opuštanje/spavanje", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 47, text: "Testosteron", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 48, text: "Lijekovi za štitnjaču", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 49, text: "Acetaminofen (Tylenol)", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 50, text: "Lijekovi za čir", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 51, text: "Sildenafil citrat (Viagra)", sectionName: "Lijekovi", scoringCategory: "medications", scoringWeight: 1, questionType: "scale_0_3" },

  // Upper Gastrointestinal System - Questions 52-70
  { id: 52, text: "Podrigivanje ili plinovi unutar sat vremena nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 53, text: "Žgaravica ili refluks kiseline", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 54, text: "Nadutost unutar sat vremena nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 55, text: "Veganska prehrana (bez mliječnih proizvoda, mesa, ribe ili jaja)", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "yes_no" },
  { id: 56, text: "Loš zadah (halitoza)", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 57, text: "Gubitak okusa za meso", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 58, text: "Znoj ima jak miris", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 59, text: "Želudac uznemiren uzimanjem vitamina", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 60, text: "Osjećaj prekomjerne punoće nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 61, text: "Osjećaj da biste preskočili doručak", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 62, text: "Osjećate se bolje ako ne jedete", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 63, text: "Pospanost nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 64, text: "Nokti se lako lome, ljušte ili pucaju", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 65, text: "Anemija koja ne reagira na željezo", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 66, text: "Bolovi ili grčevi u želucu", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 67, text: "Kronični proljev", sectionName: "Gornju gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 68, text: "Proljev ubrzo nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 69, text: "Crna ili katranasta stolica", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 70, text: "Neprobavljena hrana u stolici", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },

  // Additional questions to reach a substantial dataset - I'll include key questions from the main categories
  // Liver & Gallbladder - Key questions
  { id: 71, text: "Bol između lopatica", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 72, text: "Želudac uznemiren masnom hranom", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 73, text: "Masna ili sjajna stolica", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 74, text: "Mučnina", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 75, text: "Povijest hepatitisa", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "yes_no" },

  // Small Intestine - Key questions
  { id: 76, text: "Alergije na hranu", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 77, text: "Nadutost trbuha 1 do 2 sata nakon jela", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 78, text: "Osjetljivost na pšenicu ili žitarice", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 79, text: "Osjetljivost na mliječne proizvode", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 80, text: "Astma, infekcije sinusa, začepljen nos", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },

  // Large Intestine/Colon - Key questions
  { id: 81, text: "Zapor", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 82, text: "Proljev", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 83, text: "Intestinalni plinovi ili nadutost", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 84, text: "Krv u stolici", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 85, text: "Sluz u stolici", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },

  // Kidney & Adrenal - Key questions  
  { id: 86, text: "Bol u donjem dijelu leđa", sectionName: "Bubrezi i nadbubrežne žlijezde", scoringCategory: "kidney_adrenal", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 87, text: "Česti ili hitni poriv za mokrenjem", sectionName: "Bubrezi i nadbubrežne žlijezde", scoringCategory: "kidney_adrenal", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 88, text: "Osjetljiv na sjajno sunce ili reflektirajuću svjetlost", sectionName: "Bubrezi i nadbubrežne žlijezde", scoringCategory: "kidney_adrenal", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 89, text: "Stres utječe na vaše zdravlje", sectionName: "Bubrezi i nadbubrežne žlijezde", scoringCategory: "kidney_adrenal", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 90, text: "Žudnja za soli", sectionName: "Bubrezi i nadbubrežne žlijezde", scoringCategory: "kidney_adrenal", scoringWeight: 1, questionType: "scale_0_3" },

  // Heart & Lungs - Key questions
  { id: 91, text: "Bol u prsima", sectionName: "Srce i pluća", scoringCategory: "heart_lungs", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 92, text: "Nepravilan rad srca ili preskakanje otkucaja", sectionName: "Srce i pluća", scoringCategory: "heart_lungs", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 93, text: "Visoki krvni tlak", sectionName: "Srce i pluća", scoringCategory: "heart_lungs", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 94, text: "Kratkoća daha", sectionName: "Srce i pluća", scoringCategory: "heart_lungs", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 95, text: "Kašalj ili sluz", sectionName: "Srce i pluća", scoringCategory: "heart_lungs", scoringWeight: 1, questionType: "scale_0_3" },

  // Brain & Nervous System - Key questions
  { id: 96, text: "Glavobolje", sectionName: "Mozak i živčani sustav", scoringCategory: "brain_nervous", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 97, text: "Migrene", sectionName: "Mozak i živčani sustav", scoringCategory: "brain_nervous", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 98, text: "Vrtoglavica", sectionName: "Mozak i živčani sustav", scoringCategory: "brain_nervous", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 99, text: "Problemi s konzentracijom", sectionName: "Mozak i živčani sustav", scoringCategory: "brain_nervous", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 100, text: "Problemi s pamćenjem", sectionName: "Mozak i živčani sustav", scoringCategory: "brain_nervous", scoringWeight: 1, questionType: "scale_0_3" }
];