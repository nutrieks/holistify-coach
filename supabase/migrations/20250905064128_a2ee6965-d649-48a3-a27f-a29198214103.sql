-- Insert all NAQ questions for existing questionnaire (using correct question types)
INSERT INTO questionnaire_questions (
  questionnaire_id,
  question_text,
  question_type,
  question_order,
  section_name,
  scoring_category,
  scoring_weight,
  options
) VALUES 
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate trenutno bilo kakve dijetetske ograničenja?', 'checkbox', 1, 'Nutrition Analysis', 'dietary_restrictions', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa varenjem ili apsorpcijom hrane?', 'checkbox', 2, 'Nutrition Analysis', 'digestion', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vaše dijete ima problema sa apetitom?', 'checkbox', 3, 'Nutrition Analysis', 'appetite', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vaše dijete ima problema sa žvaćem ili gutanjem?', 'checkbox', 4, 'Nutrition Analysis', 'eating_mechanics', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa kontrolom težine?', 'checkbox', 5, 'Nutrition Analysis', 'weight_control', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite bilo koje dodatke ishrani?', 'checkbox', 6, 'Nutrition Analysis', 'supplements', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa gastrointestinalnim simptomima?', 'checkbox', 7, 'Nutrition Analysis', 'gastrointestinal', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate alergije na hranu?', 'checkbox', 8, 'Nutrition Analysis', 'food_allergies', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate intoleranciju na hranu?', 'checkbox', 9, 'Nutrition Analysis', 'food_intolerance', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pratite neki određeni način ishrane?', 'checkbox', 10, 'Nutrition Analysis', 'diet_type', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko često vježbate tjedno?', 'multiple_choice', 11, 'Lifestyle Analysis', 'exercise_frequency', 1, '{"choices": ["Nikad", "1-2 puta", "3-4 puta", "5+ puta"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Kakav je vaš nivo stresa?', 'scale_1_10', 12, 'Lifestyle Analysis', 'stress_level', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko sati spavate noću?', 'multiple_choice', 13, 'Lifestyle Analysis', 'sleep_hours', 1, '{"choices": ["Manje od 6", "6-7", "7-8", "8+"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Kakav je kvalitet vašeg sna?', 'scale_1_10', 14, 'Lifestyle Analysis', 'sleep_quality', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pušite cigarete?', 'checkbox', 15, 'Lifestyle Analysis', 'smoking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko alkohola konzumirate tjedno?', 'multiple_choice', 16, 'Lifestyle Analysis', 'alcohol_consumption', 1, '{"choices": ["Nikad", "1-3 pića", "4-7 pića", "8+ pića"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li ste izloženi toksičnim supstancama na radnom mjestu?', 'checkbox', 17, 'Lifestyle Analysis', 'toxic_exposure', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko vode pijete dnevno?', 'multiple_choice', 18, 'Lifestyle Analysis', 'water_intake', 1, '{"choices": ["Manje od 1L", "1-2L", "2-3L", "3L+"]}'),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li trenutno uzimate bilo koje lijekove na recept?', 'checkbox', 19, 'Medications', 'prescription_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate lijekove bez recepta?', 'checkbox', 20, 'Medications', 'otc_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate hormonsku terapiju?', 'checkbox', 21, 'Medications', 'hormone_therapy', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li ste imali neželjene reakcije na lijekove?', 'checkbox', 22, 'Medications', 'med_reactions', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate glavobolje?', 'scale_1_10', 23, 'Head', 'headaches', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate migrene?', 'scale_1_10', 24, 'Head', 'migraines', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate vrtoglavicu?', 'scale_1_10', 25, 'Head', 'dizziness', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa vidom?', 'scale_1_10', 26, 'Head', 'vision_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa sluhom?', 'scale_1_10', 27, 'Head', 'hearing_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate suva usta?', 'scale_1_10', 28, 'Mouth/Throat', 'dry_mouth', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate česte bolove u grlu?', 'scale_1_10', 29, 'Mouth/Throat', 'sore_throat', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate osjećaj kašlja?', 'scale_1_10', 30, 'Mouth/Throat', 'cough', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa desnim?', 'scale_1_10', 31, 'Mouth/Throat', 'gum_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate kratkoću daha?', 'scale_1_10', 32, 'Lungs', 'shortness_breath', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate astmu?', 'scale_1_10', 33, 'Lungs', 'asthma', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bronhitis?', 'scale_1_10', 34, 'Lungs', 'bronhitis', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li kašljete sa iskašljavanjem?', 'scale_1_10', 35, 'Lungs', 'productive_cough', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bol u grudima?', 'scale_1_10', 36, 'Heart', 'chest_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate nepravilno kucanje srca?', 'scale_1_10', 37, 'Heart', 'palpitations', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate visok krvni pritisak?', 'scale_1_10', 38, 'Heart', 'high_blood_pressure', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate nizak krvni pritisak?', 'scale_1_10', 39, 'Heart', 'low_blood_pressure', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate visok holesterol?', 'scale_1_10', 40, 'Heart', 'high_cholesterol', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate mučninu?', 'scale_1_10', 41, 'Stomach', 'nausea', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate povraćanje?', 'scale_1_10', 42, 'Stomach', 'vomiting', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate žgaravicu?', 'scale_1_10', 43, 'Stomach', 'heartburn', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate nadutost?', 'scale_1_10', 44, 'Stomach', 'bloating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u stomaku?', 'scale_1_10', 45, 'Stomach', 'stomach_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate čir na želucu?', 'scale_1_10', 46, 'Stomach', 'ulcers', 1, NULL),

-- Dodaj ostatak pitanja za sada samo prvih 50 da vidimo da li radi
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate zatvor?', 'scale_1_10', 47, 'Intestines', 'constipation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate dijareu?', 'scale_1_10', 48, 'Intestines', 'diarrhea', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate gasove?', 'scale_1_10', 49, 'Intestines', 'gas', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate krv u stolici?', 'scale_1_10', 50, 'Intestines', 'blood_stool', 1, NULL);