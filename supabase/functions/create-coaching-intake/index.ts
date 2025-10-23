import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sva 141 pitanja organizirana po sekcijama
const COACHING_INTAKE_QUESTIONS = [
  // SEKCIJA 1: Osnovni Kontaktni Podaci (11 pitanja)
  {
    question_text: "Ime i prezime",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 1,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Email adresa",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 2,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Datum rođenja",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 3,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Broj mobitela",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 4,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Kako preferirate da vas kontaktiramo?",
    question_type: "multiple_choice",
    section: "Osnovni Kontaktni Podaci",
    order_index: 5,
    is_required: true,
    options: ["Telefonski poziv", "SMS poruka", "Email", "Bilo što od navedenog"],
    category: "contact"
  },
  {
    question_text: "Koje doba dana je najbolje za kontakt?",
    question_type: "multiple_choice",
    section: "Osnovni Kontaktni Podaci",
    order_index: 6,
    is_required: true,
    options: ["Ujutro", "Poslijepodne", "Navečer", "Bilo kada"],
    category: "contact"
  },
  {
    question_text: "Preferirana zamjenica",
    question_type: "multiple_choice",
    section: "Osnovni Kontaktni Podaci",
    order_index: 7,
    is_required: false,
    options: ["ona/njezin", "on/njegov", "oni/njihov"],
    category: "contact"
  },
  {
    question_text: "Zanimanje",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 8,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Koliko sati tjedno u prosjeku radite?",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 9,
    is_required: true,
    options: null,
    category: "contact"
  },
  {
    question_text: "Ime osobe za kontakt u hitnim slučajevima",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 10,
    is_required: true,
    options: null,
    category: "emergency"
  },
  {
    question_text: "Broj telefona za hitne slučajeve",
    question_type: "short_text",
    section: "Osnovni Kontaktni Podaci",
    order_index: 11,
    is_required: true,
    options: null,
    category: "emergency"
  },
  
  // SEKCIJA 2: Opće Informacije i Ciljevi (30 pitanja)
  {
    question_text: "Spol",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 12,
    is_required: true,
    options: ["Muško", "Žensko", "Ostalo"],
    category: "general"
  },
  {
    question_text: "Mjesto rođenja",
    question_type: "short_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 13,
    is_required: false,
    options: null,
    category: "general"
  },
  {
    question_text: "Krvna grupa",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 14,
    is_required: false,
    options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Ne znam"],
    category: "health"
  },
  {
    question_text: "Visina (cm)",
    question_type: "short_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 15,
    is_required: true,
    options: null,
    category: "anthropometric"
  },
  {
    question_text: "Trenutna težina (kg)",
    question_type: "short_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 16,
    is_required: true,
    options: null,
    category: "anthropometric"
  },
  {
    question_text: "Status veze",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 17,
    is_required: false,
    options: ["Samac/Samačica", "U vezi", "Zaručen/Zaručena", "Oženjen/Udana", "Razveden/Razvedena", "Udovac/Udovica"],
    category: "general"
  },
  {
    question_text: "Broj djece (ako je primjenjivo)",
    question_type: "short_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 18,
    is_required: false,
    options: null,
    category: "general"
  },
  {
    question_text: "Godina dana od danas, u idealnom svijetu, gdje želite biti? Što želite raditi? Kako se želite osjećati? Koje avanture želite proživjeti? Kako se to uklapa s vašim identitetom, prioritetima i vrijednostima?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 19,
    is_required: true,
    options: null,
    category: "goals"
  },
  {
    question_text: "Alternativno, ako bi se dogodilo čudo i probudili biste se ostvarivši sve o čemu ste ikada sanjali, kako biste to znali? Što bi se točno promijenilo? Što biste drugačije radili, mislili, osjećali i doživljavali?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 20,
    is_required: false,
    options: null,
    category: "goals"
  },
  {
    question_text: "Koja su vaša 3 najvažnija cilja vezana za zdravlje i wellness?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 21,
    is_required: true,
    options: null,
    category: "goals"
  },
  {
    question_text: "Željena težina (kg)",
    question_type: "short_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 22,
    is_required: false,
    options: null,
    category: "goals"
  },
  {
    question_text: "Željena promjena tjelesne mase",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 23,
    is_required: true,
    options: ["Smanjiti težinu", "Povećati težinu", "Održati trenutnu težinu", "Povećati mišićnu masu", "Smanjiti masnoću"],
    category: "goals"
  },
  {
    question_text: "Cijena tijela - idealno bi htjeli izgledati kao...",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 24,
    is_required: false,
    options: null,
    category: "goals"
  },
  {
    question_text: "Energija - trenutna razina energije (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 25,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Energija - željena razina energije (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 26,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Motivacija - trenutna razina motivacije (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 27,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Motivacija - željena razina motivacije (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 28,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Raspoloženje - trenutna razina raspoloženja (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 29,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Raspoloženje - željena razina raspoloženja (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 30,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Samopoštovanje - trenutna razina samopoštovanja (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 31,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Samopoštovanje - željena razina samopoštovanja (1-10)",
    question_type: "scale_1_10",
    section: "Opće Informacije i Ciljevi",
    order_index: 32,
    is_required: true,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Opišite obrasce u koje stalno ponovo zapadate kada se radi o promjenama životnog stila i zdravstvenih navika.",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 33,
    is_required: true,
    options: null,
    category: "patterns"
  },
  {
    question_text: "U idealnom svijetu, kako biste konkretno htjeli promijeniti svoje navike (prehrana, stres, san, kretanje, način razmišljanja, socijalna povezanost, itd.) kako bi podržali svoje zdravlje i dobrobit?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 34,
    is_required: true,
    options: null,
    category: "goals"
  },
  {
    question_text: "Koji su vaši najveći motivacijski faktori za poboljšanje zdravlja? Drugim riječima, koji je vaš 'zašto'?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 35,
    is_required: true,
    options: null,
    category: "motivation"
  },
  {
    question_text: "Opišite svoja uvjerenja o vlastitoj sposobnosti da transformirate svoje zdravlje.",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 36,
    is_required: true,
    options: null,
    category: "mindset"
  },
  {
    question_text: "Što vidite kao svoje najveće izazove, ako ih ima, u postizanju vaših zdravstvenih i wellness ciljeva?",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 37,
    is_required: true,
    options: null,
    category: "challenges"
  },
  {
    question_text: "Jeste li spremni promijeniti svoje prehrambene navike?",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 38,
    is_required: true,
    options: ["Da", "Ne", "Možda", "Potrebna mi je pomoć"],
    category: "readiness"
  },
  {
    question_text: "Jeste li spremni povećati svoju razinu fizičke aktivnosti?",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 39,
    is_required: true,
    options: ["Da", "Ne", "Možda", "Potrebna mi je pomoć"],
    category: "readiness"
  },
  {
    question_text: "Postoje li razlozi zdravstvene prirode ili ozljede koje bi vas mogle ograničiti u vježbanju?",
    question_type: "multiple_choice",
    section: "Opće Informacije i Ciljevi",
    order_index: 40,
    is_required: true,
    options: ["Da", "Ne", "Nisam siguran/sigurna"],
    category: "limitations"
  },
  {
    question_text: "Ako da, molimo objasnite:",
    question_type: "long_text",
    section: "Opće Informacije i Ciljevi",
    order_index: 41,
    is_required: false,
    options: null,
    category: "limitations"
  },

  // SEKCIJA 3: San i Prehrana (20 pitanja)
  {
    question_text: "Koliko sati sna redovito dobijete noću?",
    question_type: "multiple_choice",
    section: "San i Prehrana",
    order_index: 42,
    is_required: true,
    options: ["Manje od 4 sata po noći", "4-5 sati po noći", "6-7 sati po noći", "8-9 sati po noći", "9+ sati po noći"],
    category: "sleep"
  },
  {
    question_text: "Spavate li redovito dobro noću?",
    question_type: "multiple_choice",
    section: "San i Prehrana",
    order_index: 43,
    is_required: true,
    options: ["Da", "Ne"],
    category: "sleep"
  },
  {
    question_text: "Uzimate li bilo kakve biljne suplemente, lijekove bez recepta, lijekove na recept, alkohol, itd. da vam pomognu zaspati noću?",
    question_type: "multiple_choice",
    section: "San i Prehrana",
    order_index: 44,
    is_required: true,
    options: ["Uvijek", "Većinu dana/noći", "Povremeno", "Rijetko", "Nikada"],
    category: "sleep"
  },
  {
    question_text: "Što uzimate za spavanje?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 45,
    is_required: false,
    options: null,
    category: "sleep"
  },
  {
    question_text: "Redovito se budite tijekom noći, i ako da, u koje vrijeme?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 46,
    is_required: false,
    options: null,
    category: "sleep"
  },
  {
    question_text: "U prosjeku, u koje vrijeme idete spavati?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 47,
    is_required: true,
    options: null,
    category: "sleep"
  },
  {
    question_text: "Imate li trenutno podržavajuću večernju/spavaću rutinu?",
    question_type: "multiple_choice",
    section: "San i Prehrana",
    order_index: 48,
    is_required: true,
    options: ["Da", "Ne"],
    category: "sleep"
  },
  {
    question_text: "U prosjeku, u koje vrijeme se budite ujutro?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 49,
    is_required: true,
    options: null,
    category: "sleep"
  },
  {
    question_text: "Kako se osjećate kada se probudite ujutro?",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 50,
    is_required: true,
    options: null,
    category: "sleep"
  },
  {
    question_text: "Molimo opišite svoje trenutne prehrambene navike.",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 51,
    is_required: true,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Pokušavate li izbjegavati određene vrste hrane?",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 52,
    is_required: false,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Doživljavate li bilo kakve simptome/osjećaje ako preskočite obrok?",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 53,
    is_required: false,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Koju hranu žudite?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 54,
    is_required: false,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Nalazite li radost u svojim trenutnim prehrambenim navikama?",
    question_type: "multiple_choice",
    section: "San i Prehrana",
    order_index: 55,
    is_required: true,
    options: ["Da", "Ne", "Uglavnom", "Ponekad", "Rijetko"],
    category: "nutrition"
  },
  {
    question_text: "Koliki postotak vaše hrane je kućno pripremljen?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 56,
    is_required: true,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Koliko često jedete vani?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 57,
    is_required: true,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Prema vašem mišljenju, koje su tri najzdravije/najhranjivije namirnice koje redovito jedete?",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 58,
    is_required: true,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Prema vašem mišljenju, koje su tri najmanje zdrave/najmanje hranjive namirnice koje redovito jedete?",
    question_type: "long_text",
    section: "San i Prehrana",
    order_index: 59,
    is_required: true,
    options: null,
    category: "nutrition"
  },
  {
    question_text: "Tko uglavnom obavlja kupovinu namirnica i kuhanje u vašem kućanstvu (označite sve što se odnosi)?",
    question_type: "checkbox",
    section: "San i Prehrana",
    order_index: 60,
    is_required: true,
    options: ["Ja", "Supružnik ili partner", "Cimer(i)", "Djeca", "Ostala obitelj (roditelj, baka/djed, brat/sestra, itd.)"],
    category: "nutrition"
  },
  {
    question_text: "Koliko vode u prosjeku popijete dnevno?",
    question_type: "short_text",
    section: "San i Prehrana",
    order_index: 61,
    is_required: true,
    options: null,
    category: "nutrition"
  },

  // SEKCIJA 4: Životni Stil (10 pitanja)
  {
    question_text: "Molimo opišite svoju trenutnu rutinu/navike kretanja/vježbanja.",
    question_type: "long_text",
    section: "Životni Stil",
    order_index: 62,
    is_required: true,
    options: null,
    category: "exercise"
  },
  {
    question_text: "Približno koliko sati tjedno vježbate?",
    question_type: "multiple_choice",
    section: "Životni Stil",
    order_index: 63,
    is_required: true,
    options: ["Manje od 5 sati", "5-9 sati", "10-14 sati", "15-19 sati", "20 sati ili više"],
    category: "exercise"
  },
  {
    question_text: "Približno koliko sati dnevno provodite sjedeći?",
    question_type: "multiple_choice",
    section: "Životni Stil",
    order_index: 64,
    is_required: true,
    options: ["Manje od 5 sati", "5-9 sati", "10-14 sati", "15 sati ili više"],
    category: "exercise"
  },
  {
    question_text: "Kako se osjećate u vezi svoje trenutne rutine kretanja/vježbanja?",
    question_type: "long_text",
    section: "Životni Stil",
    order_index: 65,
    is_required: true,
    options: null,
    category: "exercise"
  },
  {
    question_text: "Koje oblike kretanja/vježbanja najviše uživate?",
    question_type: "long_text",
    section: "Životni Stil",
    order_index: 66,
    is_required: true,
    options: null,
    category: "exercise"
  },
  {
    question_text: "Pušite li trenutno?",
    question_type: "multiple_choice",
    section: "Životni Stil",
    order_index: 67,
    is_required: true,
    options: ["Da", "Ne", "Ponekad"],
    category: "lifestyle"
  },
  {
    question_text: "Koliko i koliko često pušite?",
    question_type: "short_text",
    section: "Životni Stil",
    order_index: 68,
    is_required: false,
    options: null,
    category: "lifestyle"
  },
  {
    question_text: "Pijete li alkohol?",
    question_type: "multiple_choice",
    section: "Životni Stil",
    order_index: 69,
    is_required: true,
    options: ["Da", "Ne", "Ponekad"],
    category: "lifestyle"
  },
  {
    question_text: "Koliko alkoholnih pića i koliko često?",
    question_type: "short_text",
    section: "Životni Stil",
    order_index: 70,
    is_required: false,
    options: null,
    category: "lifestyle"
  },
  {
    question_text: "Jeste li ili ste bili izloženi toksičnim tvarima na poslu ili kod kuće? Ako da, molimo opišite.",
    question_type: "long_text",
    section: "Životni Stil",
    order_index: 71,
    is_required: false,
    options: null,
    category: "lifestyle"
  },

  // SEKCIJA 5: Sustav Podrške (7 pitanja)
  {
    question_text: "Članovi vašeg kućanstva (označite sve što se odnosi)",
    question_type: "checkbox",
    section: "Sustav Podrške",
    order_index: 72,
    is_required: false,
    options: ["Supružnik ili partner", "Cimer(i)", "Djeca", "Ostala obitelj (roditelj, baka/djed, brat/sestra, itd.)", "Kućni ljubimac(i)"],
    category: "support"
  },
  {
    question_text: "Na skali od 0-10, gdje je 0 uopće ne podržavaju a 10 potpuno podržavaju, koliko su ljudi s kojima živite podržavajući kada je riječ o zdravlju i promjeni ponašanja?",
    question_type: "scale_1_10",
    section: "Sustav Podrške",
    order_index: 73,
    is_required: false,
    options: null,
    category: "support"
  },
  {
    question_text: "Koji veliki stresori, ako ih ima, trenutno utječu na vaš život?",
    question_type: "long_text",
    section: "Sustav Podrške",
    order_index: 74,
    is_required: false,
    options: null,
    category: "stress"
  },
  {
    question_text: "Opišite kako se opuštate i/ili kako aktivno radite na smanjenju stresa.",
    question_type: "long_text",
    section: "Sustav Podrške",
    order_index: 75,
    is_required: false,
    options: null,
    category: "stress"
  },
  {
    question_text: "Koji hobiji/aktivnosti vam pružaju zadovoljstvo?",
    question_type: "long_text",
    section: "Sustav Podrške",
    order_index: 76,
    is_required: false,
    options: null,
    category: "wellness"
  },
  {
    question_text: "Imate li ikoga s kim možete razgovarati o svojim problemima?",
    question_type: "multiple_choice",
    section: "Sustav Podrške",
    order_index: 77,
    is_required: true,
    options: ["Da", "Ne", "Ponekad"],
    category: "support"
  },
  {
    question_text: "Osjećate li se usamljeno?",
    question_type: "multiple_choice",
    section: "Sustav Podrške",
    order_index: 78,
    is_required: true,
    options: ["Nikada", "Rijetko", "Ponekad", "Često", "Uvijek"],
    category: "support"
  },

  // SEKCIJA 6: Medicinska Anamneza (25 pitanja)
  {
    question_text: "Koje značajne medicinske stanje ili ozljede su vam dijagnosticirane, ako ih ima?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 79,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Koje su vaše zdravstvene brige, ako ih ima (uključujući bolesti, bol, simptome, itd.)? Molimo navedite sve što želite da znam o vašem mentalnom i/ili fizičkom zdravlju.",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 80,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Molimo navedite sve operacije, nezgode, ozljede ili dječje bolesti koje ste imali, zajedno s vrstom i datumom.",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 81,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Koje lijekove (bez recepta ili s receptom), biljne pripravke, homeopatska sredstva i/ili suplemente uzimate, ako ih uzimate?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 82,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Jeste li trenutno pod brigom liječnika zbog specifičnog zdravstvenog problema? Molimo navedite tretmane/zdravstvene probleme zbog kojih trenutno posjećujete liječnika.",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 83,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li dijagnosticiranu bolest srca?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 84,
    is_required: true,
    options: ["Da", "Ne"],
    category: "medical"
  },
  {
    question_text: "Imate li visoki krvni tlak?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 85,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Imate li visoki kolesterol?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 86,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Imate li dijabetes ili predijabetes?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 87,
    is_required: true,
    options: ["Da - Tip 1", "Da - Tip 2", "Da - Predijabetes", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Imate li problema sa štitnjačom?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 88,
    is_required: true,
    options: ["Da - Hipotireoza", "Da - Hipertireoza", "Da - Hašimoto", "Da - Drugi", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Imate li problema s probavom?",
    question_type: "checkbox",
    section: "Medicinska Anamneza",
    order_index: 89,
    is_required: false,
    options: ["IBS (Sindrom iritabilnog crijeva)", "Crohnova bolest", "Ulcerozni kolitis", "GERD (Gastroezofagealna refluksna bolest)", "Zatvor", "Proljev", "Nadutost", "Upala želuca", "Ostalo"],
    category: "medical"
  },
  {
    question_text: "Ako imate druge probleme s probavom, molimo opišite:",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 90,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li alergija na hranu?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 91,
    is_required: true,
    options: ["Da", "Ne"],
    category: "medical"
  },
  {
    question_text: "Ako da, na koje namirnice ste alergični?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 92,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li netolerancija na hranu?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 93,
    is_required: true,
    options: ["Da", "Ne"],
    category: "medical"
  },
  {
    question_text: "Ako da, na koje namirnice ste netolerantni?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 94,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li kronične bolove?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 95,
    is_required: true,
    options: ["Da", "Ne"],
    category: "medical"
  },
  {
    question_text: "Ako da, gdje i koliko dugo?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 96,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li problema s mentalnim zdravljem (depresija, anksioznost, PTSD, itd.)?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 97,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Ako da, molimo opišite:",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 98,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li autoimunu bolest?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 99,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "medical"
  },
  {
    question_text: "Ako da, koju?",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 100,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li problema s kostima ili zglobovima (artritis, osteoporoza, itd.)?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 101,
    is_required: true,
    options: ["Da", "Ne"],
    category: "medical"
  },
  {
    question_text: "Ako da, molimo opišite:",
    question_type: "long_text",
    section: "Medicinska Anamneza",
    order_index: 102,
    is_required: false,
    options: null,
    category: "medical"
  },
  {
    question_text: "Imate li hormonalne neravnoteže ili probleme?",
    question_type: "multiple_choice",
    section: "Medicinska Anamneza",
    order_index: 103,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "medical"
  },

  // SEKCIJA 7: Obiteljska Zdravstvena Anamneza (15 pitanja)
  {
    question_text: "Molimo navedite relevantnu obiteljsku zdravstvenu povijest (roditelji, baka i djed, braća/sestre).",
    question_type: "long_text",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 104,
    is_required: false,
    options: null,
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest bolesti srca?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 105,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest dijabetesa?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 106,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest raka?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 107,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Ako da, koje vrste raka?",
    question_type: "long_text",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 108,
    is_required: false,
    options: null,
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest visokog krvnog tlaka?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 109,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest problema sa štitnjačom?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 110,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest autoimunih bolesti?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 111,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest mentalnih bolesti?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 112,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest pretilosti?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 113,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest moždanog udara?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 114,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest problema s probavom?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 115,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest osteoporoze?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 116,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li u obitelji povijest Alzheimerove bolesti ili demencije?",
    question_type: "multiple_choice",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 117,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "family_history"
  },
  {
    question_text: "Postoji li nešto drugo u obiteljskoj zdravstvenoj povijesti što smatrate važnim?",
    question_type: "long_text",
    section: "Obiteljska Zdravstvena Anamneza",
    order_index: 118,
    is_required: false,
    options: null,
    category: "family_history"
  },

  // SEKCIJA 8: Reproduktivni Sustav - Žene (15 pitanja) - conditional na spol = Žensko
  {
    question_text: "Jeste li trudni?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 119,
    is_required: true,
    options: ["Da", "Ne", "Ne znam"],
    category: "reproductive"
  },
  {
    question_text: "Dojite li?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 120,
    is_required: true,
    options: ["Da", "Ne"],
    category: "reproductive"
  },
  {
    question_text: "Planirate li trudnoću u sljedećih 6 mjeseci?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 121,
    is_required: true,
    options: ["Da", "Ne", "Možda"],
    category: "reproductive"
  },
  {
    question_text: "U kojoj dobi ste dobili prvu menstruaciju?",
    question_type: "short_text",
    section: "Reproduktivni Sustav - Žene",
    order_index: 122,
    is_required: false,
    options: null,
    category: "reproductive"
  },
  {
    question_text: "Koliko dana traje vaš menstrualni ciklus?",
    question_type: "short_text",
    section: "Reproduktivni Sustav - Žene",
    order_index: 123,
    is_required: false,
    options: null,
    category: "reproductive"
  },
  {
    question_text: "Je li vaš menstrualni ciklus regularan?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 124,
    is_required: false,
    options: ["Da", "Ne", "Ponekad"],
    category: "reproductive"
  },
  {
    question_text: "Imate li jake menstrualne simptome (jaki grčevi, obilno krvarenje, PMS, itd.)?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 125,
    is_required: false,
    options: ["Da", "Ne", "Ponekad"],
    category: "reproductive"
  },
  {
    question_text: "Imate li dijagnosticirani PCOS (sindrom policističnih jajnika)?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 126,
    is_required: false,
    options: ["Da", "Ne", "Ne znam"],
    category: "reproductive"
  },
  {
    question_text: "Imate li endometriozu?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 127,
    is_required: false,
    options: ["Da", "Ne", "Ne znam"],
    category: "reproductive"
  },
  {
    question_text: "Koristite li kontracepciju?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 128,
    is_required: false,
    options: ["Da", "Ne"],
    category: "reproductive"
  },
  {
    question_text: "Ako da, koju vrstu kontracepcije koristite?",
    question_type: "short_text",
    section: "Reproduktivni Sustav - Žene",
    order_index: 129,
    is_required: false,
    options: null,
    category: "reproductive"
  },
  {
    question_text: "Jeste li u menopauzi?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 130,
    is_required: false,
    options: ["Da", "Ne", "Perimenopauza"],
    category: "reproductive"
  },
  {
    question_text: "Ako ste u menopauzi ili perimenopauzi, koje simptome doživljavate?",
    question_type: "checkbox",
    section: "Reproduktivni Sustav - Žene",
    order_index: 131,
    is_required: false,
    options: ["Vrućice", "Noćno znojenje", "Promjene raspoloženja", "Problemi sa snom", "Suhoća vagine", "Gubitak libida", "Povećanje težine", "Ostalo"],
    category: "reproductive"
  },
  {
    question_text: "Uzimate li hormonsku nadomjesnu terapiju (HRT)?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Žene",
    order_index: 132,
    is_required: false,
    options: ["Da", "Ne"],
    category: "reproductive"
  },
  {
    question_text: "Postoje li još neki reproduktivni zdravstveni problemi ili brige koje želite spomenuti?",
    question_type: "long_text",
    section: "Reproduktivni Sustav - Žene",
    order_index: 133,
    is_required: false,
    options: null,
    category: "reproductive"
  },

  // SEKCIJA 9: Reproduktivni Sustav - Muškarci (5 pitanja) - conditional na spol = Muško
  {
    question_text: "Imate li bilo kakve probleme s reproduktivnim zdravljem (niska razina testosterona, erektilna disfunkcija, itd.)?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Muškarci",
    order_index: 134,
    is_required: false,
    options: ["Da", "Ne", "Ne znam"],
    category: "reproductive"
  },
  {
    question_text: "Ako da, molimo opišite:",
    question_type: "long_text",
    section: "Reproduktivni Sustav - Muškarci",
    order_index: 135,
    is_required: false,
    options: null,
    category: "reproductive"
  },
  {
    question_text: "Uzimate li testosteron ili bilo koju drugu hormonsku terapiju?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Muškarci",
    order_index: 136,
    is_required: false,
    options: ["Da", "Ne"],
    category: "reproductive"
  },
  {
    question_text: "Imate li problema s prostatom?",
    question_type: "multiple_choice",
    section: "Reproduktivni Sustav - Muškarci",
    order_index: 137,
    is_required: false,
    options: ["Da", "Ne", "Ne znam"],
    category: "reproductive"
  },
  {
    question_text: "Postoje li još neki reproduktivni zdravstveni problemi ili brige koje želite spomenuti?",
    question_type: "long_text",
    section: "Reproduktivni Sustav - Muškarci",
    order_index: 138,
    is_required: false,
    options: null,
    category: "reproductive"
  },

  // SEKCIJA 10: Ostalo (3 pitanja)
  {
    question_text: "Kako ste saznali za naše usluge?",
    question_type: "multiple_choice",
    section: "Ostalo",
    order_index: 139,
    is_required: false,
    options: ["Društvene mreže", "Google pretraživanje", "Preporuka prijatelja/obitelji", "Liječnik", "Ostalo"],
    category: "general"
  },
  {
    question_text: "Postoji li još nešto što biste željeli da znam o vama?",
    question_type: "long_text",
    section: "Ostalo",
    order_index: 140,
    is_required: false,
    options: null,
    category: "general"
  },
  {
    question_text: "Koje je vaše glavno očekivanje od rada s nama?",
    question_type: "long_text",
    section: "Ostalo",
    order_index: 141,
    is_required: true,
    options: null,
    category: "goals"
  },

  // SEKCIJA 11: Odnos prema Hrani i Prehrani (5 pitanja)
  {
    question_text: "Kako biste opisali svoj odnos prema hrani?",
    question_type: "single_choice",
    section: "Odnos prema Hrani i Prehrani",
    order_index: 142,
    is_required: true,
    options: ["Hrana je samo gorivo", "Volim dobru hranu, ali ne pretjerujem", "Ponekad prejedim kada sam pod stresom", "Često mislim o hrani tijekom dana", "Imam problema s kontrolom porcija"],
    category: "psychology"
  },
  {
    question_text: "Koliko često osjećate glad tijekom dana?",
    question_type: "single_choice",
    section: "Odnos prema Hrani i Prehrani",
    order_index: 143,
    is_required: true,
    options: ["Rijetko (2-3 puta)", "Umjereno (4-5 puta)", "Često (6+ puta)", "Konstantno"],
    category: "psychology"
  },
  {
    question_text: "Koje obrasce primjećujete kod svoje prehrane?",
    question_type: "checkbox",
    section: "Odnos prema Hrani i Prehrani",
    order_index: 144,
    is_required: true,
    options: ["Preskačem doručak", "Ručam pred ekranom", "Večeram kasno navečer", "Grickam između obroka", "Jedem brzo", "Nemam specifičan obrazac"],
    category: "psychology"
  },
  {
    question_text: "Koliko često jedete iz dosade ili stresa?",
    question_type: "single_choice",
    section: "Odnos prema Hrani i Prehrani",
    order_index: 145,
    is_required: true,
    options: ["Nikada", "Rijetko (jednom tjedno)", "Ponekad (2-3 puta tjedno)", "Često (4+ puta tjedno)", "Gotovo svakodnevno"],
    category: "psychology"
  },
  {
    question_text: "Kako se osjećate nakon velikih obroka?",
    question_type: "single_choice",
    section: "Odnos prema Hrani i Prehrani",
    order_index: 146,
    is_required: true,
    options: ["Energičan/a i zadovoljan/a", "Umoran/a i napuhan/a", "Osjećam žgaravicu", "Spava mi se", "Osjećam se krivo"],
    category: "psychology"
  },

  // SEKCIJA 12: Stresni Čimbenici i Životne Okolnosti (3 pitanja)
  {
    question_text: "Kako biste ocijenili razinu stresa u svom životu?",
    question_type: "single_choice",
    section: "Stresni Čimbenici i Životne Okolnosti",
    order_index: 147,
    is_required: true,
    options: ["Nizak (rijetko se osjećam pod stresom)", "Umjeren (ponekad imam stresnih dana)", "Visok (često sam pod pritiskom)", "Ekstremno visok (gotovo konstantno)"],
    category: "psychology"
  },
  {
    question_text: "Jesu li se nedavno dogodile velike životne promjene?",
    question_type: "checkbox",
    section: "Stresni Čimbenici i Životne Okolnosti",
    order_index: 148,
    is_required: true,
    options: ["Promjena posla", "Preseljenje", "Promjena u obitelji", "Zdravstveni problemi", "Financijski stres", "Ne, sve je stabilno"],
    category: "psychology"
  },
  {
    question_text: "Koliko kvalitetno spavate?",
    question_type: "single_choice",
    section: "Stresni Čimbenici i Životne Okolnosti",
    order_index: 149,
    is_required: true,
    options: ["Odlično (7-9h, bez buđenja)", "Dobro (6-7h, ponekad se probudim)", "Loše (manje od 6h ili često buđenje)", "Jako loše (nesanica, konstantan umor)"],
    category: "psychology"
  },

  // SEKCIJA 13: Prioriteti i Motivacija (3 pitanja)
  {
    question_text: "Što vam je trenutno najvažnije u životu?",
    question_type: "checkbox",
    section: "Prioriteti i Motivacija",
    order_index: 150,
    is_required: true,
    options: ["Karijera i posao", "Obitelj i odnosi", "Zdravlje i fitness", "Osobni razvoj", "Financijska stabilnost", "Ravnoteža života"],
    category: "psychology"
  },
  {
    question_text: "Koliko ste spremni posvetiti vremena svakodnevno novoj prehrani/programu?",
    question_type: "single_choice",
    section: "Prioriteti i Motivacija",
    order_index: 151,
    is_required: true,
    options: ["Minimalno (manje od 30 min)", "Umjereno (30-60 min)", "Značajno (1-2h)", "Maksimalno (2h+)"],
    category: "psychology"
  },
  {
    question_text: "Kako biste opisali svoju trenutnu motivaciju?",
    question_type: "single_choice",
    section: "Prioriteti i Motivacija",
    order_index: 152,
    is_required: true,
    options: ["Ekstremno motiviran/a (spreman/na na sve)", "Jako motiviran/a (fokusiran/a na cilj)", "Umjereno motiviran/a (pokušavam)", "Nisam siguran/a (istražujem opcije)"],
    category: "psychology"
  },

  // SEKCIJA 14: Povijest Dijeta (4 pitanja)
  {
    question_text: "Koliko puta ste pokušavali sa smanjivanjem težine?",
    question_type: "single_choice",
    section: "Povijest Dijeta",
    order_index: 153,
    is_required: true,
    options: ["Nikada", "1-2 puta", "3-5 puta", "Više od 5 puta", "Previše da brojim (yo-yo efekt)"],
    category: "psychology"
  },
  {
    question_text: "Koje ste dijete probali?",
    question_type: "checkbox",
    section: "Povijest Dijeta",
    order_index: 154,
    is_required: true,
    options: ["Nisam bio/la na dijeti", "Kalorijska restrikcija", "Low-carb / Keto", "Intermittent fasting", "Paleo / Whole30", "Vegetarijanska / Veganska", "Komercijalni programi (Weight Watchers, itd.)", "Ostalo"],
    category: "psychology"
  },
  {
    question_text: "Što se obično dogodi nakon završetka dijete?",
    question_type: "single_choice",
    section: "Povijest Dijeta",
    order_index: 155,
    is_required: true,
    options: ["Nisam bio/la na dijeti", "Održavam rezultate", "Vratim dio kilograma", "Vratim sve + dodatno (yo-yo)", "Još uvijek sam na dijeti"],
    category: "psychology"
  },
  {
    question_text: "Imate li iskustva s prebrajanjem kalorija ili makronurijenata?",
    question_type: "single_choice",
    section: "Povijest Dijeta",
    order_index: 156,
    is_required: true,
    options: ["Da, trenutno pratim", "Da, imao/la sam u prošlosti", "Pokušao/la sam, ali mi je teško", "Ne, nikada nisam"],
    category: "psychology"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Inicijalni Coaching Upitnik...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Provjeriti postoji li već upitnik sa istim imenom
    const { data: existing } = await supabase
      .from('questionnaires')
      .select('id')
      .eq('title', 'Inicijalni Coaching Upitnik')
      .maybeSingle();

    if (existing) {
      console.log('Questionnaire already exists:', existing.id);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Inicijalni Coaching Upitnik već postoji',
          questionnaireId: existing.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Kreirati questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .insert({
        title: 'Inicijalni Coaching Upitnik',
        description: 'Ovaj upitnik nam pomaže da bolje razumijemo vaše trenutno zdravstveno stanje, životne navike i ciljeve. Informacije koje podijelite bit će strogo povjerljive. Hvala vam na vremenu!',
        questionnaire_type: 'general',
        is_active: true
      })
      .select()
      .single();

    if (questionnaireError) {
      console.error('Error creating questionnaire:', questionnaireError);
      throw questionnaireError;
    }

    console.log('Questionnaire created:', questionnaire.id);

    // Dodati sva pitanja
    const questionsToInsert = COACHING_INTAKE_QUESTIONS.map(q => ({
      ...q,
      questionnaire_id: questionnaire.id
    }));

    const { error: questionsError } = await supabase
      .from('questionnaire_questions')
      .insert(questionsToInsert);

    if (questionsError) {
      console.error('Error inserting questions:', questionsError);
      throw questionsError;
    }

    console.log(`Successfully inserted ${COACHING_INTAKE_QUESTIONS.length} questions`);

    return new Response(
      JSON.stringify({
        success: true,
        questionnaireId: questionnaire.id,
        questionCount: COACHING_INTAKE_QUESTIONS.length,
        message: 'Inicijalni Coaching Upitnik uspješno kreiran'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating coaching intake:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
