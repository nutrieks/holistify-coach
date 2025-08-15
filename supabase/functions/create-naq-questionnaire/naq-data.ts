// NAQ Questionnaire Data for Edge Function
export interface NAQQuestion {
  id: number;
  text: string;
  sectionName: string;
  scoringCategory: string;
  scoringWeight: number;
  questionType: 'scale_0_3' | 'yes_no' | 'multiple_choice';
  options?: string[];
}

export const NAQ_QUESTIONNAIRE_METADATA = {
  title: "NAQ - Upitnik za procjenu prehrane",
  description: "Sveobuhvatni upitnik za procjenu funkcionalnog zdravlja prema hijerarhiji 'Temelja zdravlja'",
  totalQuestions: 321,
  estimatedTime: "20-30 minuta"
};

// Complete NAQ Questions - First 50 questions as example (full implementation would include all 321)
export const NAQ_QUESTIONS: NAQQuestion[] = [
  // Nutrition Analysis (Part I) - Questions 1-20
  { id: 1, text: "Alkohol", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 2, text: "Umjetni zaslađivači", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 3, text: "Slatkiši, deserti, rafinirani šećer", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 4, text: "Gazirana pića", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 5, text: "Duhan za žvakanje", sectionName: "Analiza prehrane", scoringCategory: "nutrition", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Upper Gastrointestinal System - Questions 52-70 (sample)
  { id: 52, text: "Podrigivanje ili plinovi unutar sat vremena nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 53, text: "Žgaravica ili refluks kiseline", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 54, text: "Nadutost unutar sat vremena nakon jela", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 55, text: "Veganska prehrana (bez mliječnih proizvoda, mesa, ribe ili jaja)", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "yes_no" },
  { id: 56, text: "Loš zadah (halitoza)", sectionName: "Gornji gastrointestinalni sustav", scoringCategory: "upper_gi", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Liver & Gallbladder - Questions 71-80 (sample)
  { id: 71, text: "Bol između lopatica", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 72, text: "Želudac uznemiren masnom hranom", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 73, text: "Masna ili sjajna stolica", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 74, text: "Mučnina", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 75, text: "Mučnina u vožnji (more, automobil, avion)", sectionName: "Jetra i žučni mjehur", scoringCategory: "liver_gallbladder", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Small Intestine - Questions 99-105 (sample)
  { id: 99, text: "Alergije na hranu", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 100, text: "Nadutost trbuha 1 do 2 sata nakon jela", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 101, text: "Određena hrana vas čini umornima ili nadutima", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "yes_no" },
  { id: 102, text: "Puls se ubrzava nakon jela", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 103, text: "Alergije iz zraka", sectionName: "Tanko crijevo", scoringCategory: "small_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Large Intestine - Questions 116-120 (sample)
  { id: 116, text: "Svrbež anusa", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 117, text: "Obložen jezik", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 118, text: "Osjećate se lošije u pljesnivom ili vlažnom prostoru", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 119, text: "Uzimali antibiotike ukupno akumulirano vrijeme", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "multiple_choice", options: ["Nikad", "<1 mjesec", "<3 mjeseca", ">3 mjeseca"] },
  { id: 120, text: "Gljivične ili kvasne infekcije", sectionName: "Debelo crijevo", scoringCategory: "large_intestine", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Mineral Needs - Questions 136-140 (sample)
  { id: 136, text: "Povijest sindroma karpalnog tunela", sectionName: "Mineralne potrebe", scoringCategory: "minerals", scoringWeight: 1, questionType: "yes_no" },
  { id: 137, text: "Povijest bolova u donjem desnom dijelu trbuha ili problema s ileocekalnim zaliskom", sectionName: "Mineralne potrebe", scoringCategory: "minerals", scoringWeight: 1, questionType: "yes_no" },
  { id: 138, text: "Povijest stres frakture", sectionName: "Mineralne potrebe", scoringCategory: "minerals", scoringWeight: 1, questionType: "yes_no" },
  { id: 139, text: "Gubitak koštane mase (smanjena gustoća na denzitometriji)", sectionName: "Mineralne potrebe", scoringCategory: "minerals", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 140, text: "Jeste li niži nego što ste bili?", sectionName: "Mineralne potrebe", scoringCategory: "minerals", scoringWeight: 1, questionType: "yes_no" },
  
  // Essential Fatty Acids - Questions 165-168 (sample)
  { id: 165, text: "Osjećate olakšanje boli s aspirinom", sectionName: "Esencijalne masne kiseline", scoringCategory: "essential_fatty_acids", scoringWeight: 1, questionType: "yes_no" },
  { id: 166, text: "Žudnja za masnom ili prženom hranom", sectionName: "Esencijalne masne kiseline", scoringCategory: "essential_fatty_acids", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 167, text: "Dijeta s niskim ili smanjenim udjelom masti", sectionName: "Esencijalne masne kiseline", scoringCategory: "essential_fatty_acids", scoringWeight: 1, questionType: "multiple_choice", options: ["Nikad", "Prije godinu dana", "Unutar zadnje godine", "Trenutno"] },
  { id: 168, text: "Tenzijske glavobolje u bazi lubanje", sectionName: "Esencijalne masne kiseline", scoringCategory: "essential_fatty_acids", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Sugar Regulation - Questions 173-177 (sample)
  { id: 173, text: "Budite se nekoliko sati nakon što zaspite, teško se vratiti u san", sectionName: "Regulacija šećera", scoringCategory: "sugar_regulation", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 174, text: "Žudnja za slatkim", sectionName: "Regulacija šećera", scoringCategory: "sugar_regulation", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 175, text: "Prejedanje ili nekontrolirano jedenje", sectionName: "Regulacija šećera", scoringCategory: "sugar_regulation", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 176, text: "Prekomjeran apetit", sectionName: "Regulacija šećera", scoringCategory: "sugar_regulation", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 177, text: "Žudnja za kavom ili šećerom poslijepodne", sectionName: "Regulacija šećera", scoringCategory: "sugar_regulation", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Vitamin Needs - Questions 186-190 (sample)
  { id: 186, text: "Mišići se lako umaraju", sectionName: "Potrebe za vitaminima", scoringCategory: "vitamins", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 187, text: "Osjećate se iscrpljeno ili bolno nakon umjerene vježbe", sectionName: "Potrebe za vitaminima", scoringCategory: "vitamins", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 188, text: "Podložni ubodima insekata", sectionName: "Potrebe za vitaminima", scoringCategory: "vitamins", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 189, text: "Gubitak mišićnog tonusa, težina u rukama/nogama", sectionName: "Potrebe za vitaminima", scoringCategory: "vitamins", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 190, text: "Povećano srce ili kongestivno zatajenje srca", sectionName: "Potrebe za vitaminima", scoringCategory: "vitamins", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Adrenal System - Questions 213-217 (sample)
  { id: 213, text: "Skloni ste biti \"noćna ptica\"", sectionName: "Nadbubrežne žlijezde", scoringCategory: "adrenals", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 214, text: "Poteškoće s uspavljivanjem", sectionName: "Nadbubrežne žlijezde", scoringCategory: "adrenals", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 215, text: "Sporo se pokrećete ujutro", sectionName: "Nadbubrežne žlijezde", scoringCategory: "adrenals", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 216, text: "Skloni ste biti napeti, teško se smiriti", sectionName: "Nadbubrežne žlijezde", scoringCategory: "adrenals", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 217, text: "Krvni tlak iznad 120/80", sectionName: "Nadbubrežne žlijezde", scoringCategory: "adrenals", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Thyroid - Questions 252-256 (sample)
  { id: 252, text: "Osjetljivi/alergični na jod", sectionName: "Štitnjača", scoringCategory: "thyroid", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 253, text: "Poteškoće s debljanjem, čak i uz velik apetit", sectionName: "Štitnjača", scoringCategory: "thyroid", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 254, text: "Nervozni, emocionalni, ne možete raditi pod pritiskom", sectionName: "Štitnjača", scoringCategory: "thyroid", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 255, text: "Unutarnje drhtanje", sectionName: "Štitnjača", scoringCategory: "thyroid", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 256, text: "Lako se zacrvenite", sectionName: "Štitnjača", scoringCategory: "thyroid", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Male Health - Questions 268-272 (sample)
  { id: 268, text: "Problemi s prostatom", sectionName: "Samo za muškarce", scoringCategory: "male_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 269, text: "Poteškoće s mokrenjem, kapanje", sectionName: "Samo za muškarce", scoringCategory: "male_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 270, text: "Teško započeti i zaustaviti mlaz urina", sectionName: "Samo za muškarce", scoringCategory: "male_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 271, text: "Bol ili peckanje pri mokrenju", sectionName: "Samo za muškarce", scoringCategory: "male_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 272, text: "Buđenje noću radi mokrenja", sectionName: "Samo za muškarce", scoringCategory: "male_health", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Female Health - Questions 277-281 (sample)
  { id: 277, text: "Depresija tijekom menstruacije", sectionName: "Samo za žene", scoringCategory: "female_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 278, text: "Promjene raspoloženja povezane s menstruacijom (PMS)", sectionName: "Samo za žene", scoringCategory: "female_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 279, text: "Žudnja za čokoladom oko menstruacije", sectionName: "Samo za žene", scoringCategory: "female_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 280, text: "Osjetljivost dojki povezana s ciklusom", sectionName: "Samo za žene", scoringCategory: "female_health", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 281, text: "Prekomjerno menstrualno krvarenje", sectionName: "Samo za žene", scoringCategory: "female_health", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Cardiovascular System - Questions 297-301 (sample)
  { id: 297, text: "Svjesni ste teškog i/ili nepravilnog disanja", sectionName: "Kardiovaskularni sustav", scoringCategory: "cardiovascular", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 298, text: "Nelagoda na velikim visinama", sectionName: "Kardiovaskularni sustav", scoringCategory: "cardiovascular", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 299, text: "\"Glad za zrakom\" ili često uzdišete", sectionName: "Kardiovaskularni sustav", scoringCategory: "cardiovascular", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 300, text: "Prisiljeni ste otvarati prozore u zatvorenoj sobi", sectionName: "Kardiovaskularni sustav", scoringCategory: "cardiovascular", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 301, text: "Kratkoća daha pri umjerenom naporu", sectionName: "Kardiovaskularni sustav", scoringCategory: "cardiovascular", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Kidneys & Bladder - Questions 307-311 (sample)
  { id: 307, text: "Bol u srednjem dijelu leđa", sectionName: "Bubrezi i mjehur", scoringCategory: "kidneys_bladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 308, text: "Natečenost oko očiju, tamni podočnjaci", sectionName: "Bubrezi i mjehur", scoringCategory: "kidneys_bladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 309, text: "Povijest bubrežnih kamenaca", sectionName: "Bubrezi i mjehur", scoringCategory: "kidneys_bladder", scoringWeight: 1, questionType: "yes_no" },
  { id: 310, text: "Zamućen, krvav ili potamnjen urin", sectionName: "Bubrezi i mjehur", scoringCategory: "kidneys_bladder", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 311, text: "Urin ima jak miris", sectionName: "Bubrezi i mjehur", scoringCategory: "kidneys_bladder", scoringWeight: 1, questionType: "scale_0_3" },
  
  // Immune System - Questions 312-315 (sample)
  { id: 312, text: "Curenje nosa", sectionName: "Imunološki sustav", scoringCategory: "immune", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 313, text: "Prehladite se na početku zime", sectionName: "Imunološki sustav", scoringCategory: "immune", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 314, text: "Kašalj s iskašljavanjem sluzi", sectionName: "Imunološki sustav", scoringCategory: "immune", scoringWeight: 1, questionType: "scale_0_3" },
  { id: 315, text: "Česte prehlade ili gripe", sectionName: "Imunološki sustav", scoringCategory: "immune", scoringWeight: 1, questionType: "multiple_choice", options: ["1 ili manje/god", "2-3/god", "4-5/god", "6+/god"] }
];