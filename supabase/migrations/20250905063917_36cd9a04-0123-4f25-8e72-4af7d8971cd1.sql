-- Insert all NAQ questions for existing questionnaire
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
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate trenutno bilo kakve dijetetske ograničenja?', 'yes_no', 1, 'Nutrition Analysis', 'dietary_restrictions', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa varenjem ili apsorpcijom hrane?', 'yes_no', 2, 'Nutrition Analysis', 'digestion', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vaše dijete ima problema sa apetitom?', 'yes_no', 3, 'Nutrition Analysis', 'appetite', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vaše dijete ima problema sa žvaćem ili gutanjem?', 'yes_no', 4, 'Nutrition Analysis', 'eating_mechanics', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa kontrolom težine?', 'yes_no', 5, 'Nutrition Analysis', 'weight_control', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite bilo koje dodatke ishrani?', 'yes_no', 6, 'Nutrition Analysis', 'supplements', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa gastrointestinalnim simptomima?', 'yes_no', 7, 'Nutrition Analysis', 'gastrointestinal', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate alergije na hranu?', 'yes_no', 8, 'Nutrition Analysis', 'food_allergies', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate intoleranciju na hranu?', 'yes_no', 9, 'Nutrition Analysis', 'food_intolerance', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pratite neki određeni način ishrane?', 'yes_no', 10, 'Nutrition Analysis', 'diet_type', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko često vježbate tjedno?', 'multiple_choice', 11, 'Lifestyle Analysis', 'exercise_frequency', 1, '{"choices": ["Nikad", "1-2 puta", "3-4 puta", "5+ puta"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Kakav je vaš nivo stresa?', 'scale_1_10', 12, 'Lifestyle Analysis', 'stress_level', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko sati spavate noću?', 'multiple_choice', 13, 'Lifestyle Analysis', 'sleep_hours', 1, '{"choices": ["Manje od 6", "6-7", "7-8", "8+"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Kakav je kvalitet vašeg sna?', 'scale_1_10', 14, 'Lifestyle Analysis', 'sleep_quality', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pušite cigarete?', 'yes_no', 15, 'Lifestyle Analysis', 'smoking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko alkohola konzumirate tjedno?', 'multiple_choice', 16, 'Lifestyle Analysis', 'alcohol_consumption', 1, '{"choices": ["Nikad", "1-3 pića", "4-7 pića", "8+ pića"]}'),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li ste izloženi toksičnim supstancama na radnom mjestu?', 'yes_no', 17, 'Lifestyle Analysis', 'toxic_exposure', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Koliko vode pijete dnevno?', 'multiple_choice', 18, 'Lifestyle Analysis', 'water_intake', 1, '{"choices": ["Manje od 1L", "1-2L", "2-3L", "3L+"]}'),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li trenutno uzimate bilo koje lijekove na recept?', 'yes_no', 19, 'Medications', 'prescription_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate lijekove bez recepta?', 'yes_no', 20, 'Medications', 'otc_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate hormonsku terapiju?', 'yes_no', 21, 'Medications', 'hormone_therapy', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li ste imali neželjene reakcije na lijekove?', 'yes_no', 22, 'Medications', 'med_reactions', 1, NULL),

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
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bronhitis?', 'scale_1_10', 34, 'Lungs', 'bronchitis', 1, NULL),
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

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate zatvor?', 'scale_1_10', 47, 'Intestines', 'constipation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate dijareu?', 'scale_1_10', 48, 'Intestines', 'diarrhea', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate gasove?', 'scale_1_10', 49, 'Intestines', 'gas', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate krv u stolici?', 'scale_1_10', 50, 'Intestines', 'blood_stool', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate sindrom iritabilnog creva?', 'scale_1_10', 51, 'Intestines', 'ibs', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa jetrom?', 'scale_1_10', 52, 'Liver', 'liver_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate žuticu?', 'scale_1_10', 53, 'Liver', 'jaundice', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate oticanje abdomena?', 'scale_1_10', 54, 'Liver', 'abdominal_swelling', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa žučom kesом?', 'scale_1_10', 55, 'Gallbladder', 'gallbladder_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u gornjem desnom dijelu abdomena?', 'scale_1_10', 56, 'Gallbladder', 'upper_right_pain', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa bubrezima?', 'scale_1_10', 57, 'Kidneys', 'kidney_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u leđima/bubrezima?', 'scale_1_10', 58, 'Kidneys', 'kidney_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate kamence u bubrezima?', 'scale_1_10', 59, 'Kidneys', 'kidney_stones', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate česte urinarne infekcije?', 'scale_1_10', 60, 'Bladder', 'uti', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bol prilikom mokrenja?', 'scale_1_10', 61, 'Bladder', 'painful_urination', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate često mokrenje?', 'scale_1_10', 62, 'Bladder', 'frequent_urination', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate hitno mokrenje?', 'scale_1_10', 63, 'Bladder', 'urgent_urination', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate oticanje nogu/stopala?', 'scale_1_10', 64, 'Legs/Feet', 'swelling', 1, NULL), 
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u nogama?', 'scale_1_10', 65, 'Legs/Feet', 'leg_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate grčeve u nogama?', 'scale_1_10', 66, 'Legs/Feet', 'leg_cramps', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate varikozne vene?', 'scale_1_10', 67, 'Legs/Feet', 'varicose_veins', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate hladne ruke/stopala?', 'scale_1_10', 68, 'Legs/Feet', 'cold_extremities', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa kožom?', 'scale_1_10', 69, 'Skin', 'skin_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate osip na koži?', 'scale_1_10', 70, 'Skin', 'rash', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate suvu kožu?', 'scale_1_10', 71, 'Skin', 'dry_skin', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate akne?', 'scale_1_10', 72, 'Skin', 'acne', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate ekceme?', 'scale_1_10', 73, 'Skin', 'eczema', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate psorijazu?', 'scale_1_10', 74, 'Skin', 'psoriasis', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate svrab?', 'scale_1_10', 75, 'Skin', 'itching', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa kosaom?', 'scale_1_10', 76, 'Hair', 'hair_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam opada kosa?', 'scale_1_10', 77, 'Hair', 'hair_loss', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate perut?', 'scale_1_10', 78, 'Hair', 'dandruff', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate masnu kosu?', 'scale_1_10', 79, 'Hair', 'oily_hair', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa noktima?', 'scale_1_10', 80, 'Nails', 'nail_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li su vam nokti krti?', 'scale_1_10', 81, 'Nails', 'brittle_nails', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate gljivice na noktama?', 'scale_1_10', 82, 'Nails', 'nail_fungus', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se osjećate umorno?', 'scale_1_10', 83, 'Energy/Activity', 'fatigue', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa koncentracijom?', 'scale_1_10', 84, 'Energy/Activity', 'concentration', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa memorijom?', 'scale_1_10', 85, 'Energy/Activity', 'memory', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate nedostatak energije?', 'scale_1_10', 86, 'Energy/Activity', 'low_energy', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate motivaciju?', 'scale_1_10', 87, 'Energy/Activity', 'motivation', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate tugu?', 'scale_1_10', 88, 'Mind', 'sadness', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate anksioznost?', 'scale_1_10', 89, 'Mind', 'anxiety', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate panične napade?', 'scale_1_10', 90, 'Mind', 'panic_attacks', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate depresiju?', 'scale_1_10', 91, 'Mind', 'depression', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate promene raspoloženja?', 'scale_1_10', 92, 'Mind', 'mood_swings', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate razdražljivost?', 'scale_1_10', 93, 'Mind', 'irritability', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa spavenjem?', 'scale_1_10', 94, 'Sleep', 'falling_asleep', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se često budite tokom noći?', 'scale_1_10', 95, 'Sleep', 'staying_asleep', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se budite rano?', 'scale_1_10', 96, 'Sleep', 'early_waking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li sanjate noćne more?', 'scale_1_10', 97, 'Sleep', 'nightmares', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se osjećate odmorno nakon sna?', 'scale_1_10', 98, 'Sleep', 'refreshed_sleep', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa menstruacijom?', 'scale_1_10', 99, 'Reproductive', 'menstrual_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate PMS simptome?', 'scale_1_10', 100, 'Reproductive', 'pms', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa libidoом?', 'scale_1_10', 101, 'Reproductive', 'libido', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa plodnošću?', 'scale_1_10', 102, 'Reproductive', 'fertility', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u mišićima?', 'scale_1_10', 103, 'Muscles', 'muscle_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate grčeve u mišićima?', 'scale_1_10', 104, 'Muscles', 'muscle_cramps', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate slabost u mišićima?', 'scale_1_10', 105, 'Muscles', 'muscle_weakness', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate ukočenost mišića?', 'scale_1_10', 106, 'Muscles', 'muscle_stiffness', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u zglobovima?', 'scale_1_10', 107, 'Joints', 'joint_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate ukočenost zglobova?', 'scale_1_10', 108, 'Joints', 'joint_stiffness', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate oticanje zglobova?', 'scale_1_10', 109, 'Joints', 'joint_swelling', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate artritis?', 'scale_1_10', 110, 'Joints', 'arthritis', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u leđima?', 'scale_1_10', 111, 'Bones', 'back_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bolove u vratu?', 'scale_1_10', 112, 'Bones', 'neck_pain', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate osteoporozu?', 'scale_1_10', 113, 'Bones', 'osteoporosis', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa kičmom?', 'scale_1_10', 114, 'Bones', 'spine_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate dijabetes?', 'scale_1_10', 115, 'Blood Sugar Control', 'diabetes', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa kontrolom šećera u krvi?', 'scale_1_10', 116, 'Blood Sugar Control', 'blood_sugar_control', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate česte žudnje za slatkišima?', 'scale_1_10', 117, 'Blood Sugar Control', 'sugar_cravings', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate umor nakon obroka?', 'scale_1_10', 118, 'Blood Sugar Control', 'post_meal_fatigue', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa štitnom žlezdom?', 'scale_1_10', 119, 'Thyroid', 'thyroid_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate hladnoću?', 'scale_1_10', 120, 'Thyroid', 'cold_sensitivity', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate vrućinu?', 'scale_1_10', 121, 'Thyroid', 'heat_sensitivity', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa goušom?', 'scale_1_10', 122, 'Thyroid', 'goiter', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa nadbubrežnim žlezdama?', 'scale_1_10', 123, 'Adrenals', 'adrenal_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se teško nositi sa stresom?', 'scale_1_10', 124, 'Adrenals', 'stress_handling', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate burnout?', 'scale_1_10', 125, 'Adrenals', 'burnout', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate česte infekcije?', 'scale_1_10', 126, 'Immune System', 'frequent_infections', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate autoимуне bolesti?', 'scale_1_10', 127, 'Immune System', 'autoimmune', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se teško oporavljate od bolesti?', 'scale_1_10', 128, 'Immune System', 'slow_recovery', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate alergije?', 'scale_1_10', 129, 'Immune System', 'allergies', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate vitamin D?', 'scale_1_10', 130, 'Vitamin D', 'vitamin_d_supplement', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li provodite vremena na suncu?', 'scale_1_10', 131, 'Vitamin D', 'sun_exposure', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa kostima?', 'scale_1_10', 132, 'Vitamin D', 'bone_health', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa vidom u mraku?', 'scale_1_10', 133, 'Vitamin A', 'night_vision', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate suhe oči?', 'scale_1_10', 134, 'Vitamin A', 'dry_eyes', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno povrća?', 'scale_1_10', 135, 'Vitamin A', 'vegetable_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate umor?', 'scale_1_10', 136, 'B Vitamins', 'b_vitamin_fatigue', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa nervima?', 'scale_1_10', 137, 'B Vitamins', 'nerve_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate anemiju?', 'scale_1_10', 138, 'B Vitamins', 'anemia', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno žitarica?', 'scale_1_10', 139, 'B Vitamins', 'grain_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa krvljenjem?', 'scale_1_10', 140, 'Vitamin C', 'bleeding_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se slabo zarastavaju rane?', 'scale_1_10', 141, 'Vitamin C', 'wound_healing', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno citrusа?', 'scale_1_10', 142, 'Vitamin C', 'citrus_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa krvarenjem?', 'scale_1_10', 143, 'Vitamin K', 'bleeding_disorders', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno zelenog povrća?', 'scale_1_10', 144, 'Vitamin K', 'green_vegetable_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate grčeve u mišićima?', 'scale_1_10', 145, 'Calcium', 'calcium_muscle_cramps', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa zubima?', 'scale_1_10', 146, 'Calcium', 'dental_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno mliječnih proizvoda?', 'scale_1_10', 147, 'Calcium', 'dairy_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate umor?', 'scale_1_10', 148, 'Iron', 'iron_fatigue', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate bljedilo?', 'scale_1_10', 149, 'Iron', 'pallor', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno mesa?', 'scale_1_10', 150, 'Iron', 'meat_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa imunostem?', 'scale_1_10', 151, 'Zinc', 'zinc_immunity', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se slabo zarastavljaju rane?', 'scale_1_10', 152, 'Zinc', 'zinc_wound_healing', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa misom ukusa?', 'scale_1_10', 153, 'Zinc', 'taste_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa srcem?', 'scale_1_10', 154, 'Magnesium', 'magnesium_heart', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate grčeve?', 'scale_1_10', 155, 'Magnesium', 'magnesium_cramps', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno orašastih plodova?', 'scale_1_10', 156, 'Magnesium', 'nut_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa štitnom žlezdom?', 'scale_1_10', 157, 'Iodine', 'iodine_thyroid', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno morskih plodova?', 'scale_1_10', 158, 'Iodine', 'seafood_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa krvnim protokom?', 'scale_1_10', 159, 'Essential Fatty Acids', 'blood_flow', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa memorijom?', 'scale_1_10', 160, 'Essential Fatty Acids', 'efa_memory', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno ribe?', 'scale_1_10', 161, 'Essential Fatty Acids', 'fish_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa varenjem?', 'scale_1_10', 162, 'Protein', 'protein_digestion', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate slabost mišića?', 'scale_1_10', 163, 'Protein', 'protein_muscle_weakness', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno proteina?', 'scale_1_10', 164, 'Protein', 'protein_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa energijom?', 'scale_1_10', 165, 'Carbohydrates', 'carb_energy', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate česte žudnje za slatkišima?', 'scale_1_10', 166, 'Carbohydrates', 'carb_cravings', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno složenih ugljenih hidrata?', 'scale_1_10', 167, 'Carbohydrates', 'complex_carb_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa apsorpcijom masti?', 'scale_1_10', 168, 'Fats', 'fat_absorption', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate suvu kožu zbog nedostatka masti?', 'scale_1_10', 169, 'Fats', 'fat_deficiency_skin', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno zdravih masti?', 'scale_1_10', 170, 'Fats', 'healthy_fat_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pijete dovoljno vode?', 'scale_1_10', 171, 'Water', 'water_intake_adequate', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate žeđ?', 'scale_1_10', 172, 'Water', 'thirst', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate suva usta?', 'scale_1_10', 173, 'Water', 'dry_mouth_dehydration', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa varenjem vlakna?', 'scale_1_10', 174, 'Fiber', 'fiber_digestion', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate zatvor zbog nedovoljno vlakna?', 'scale_1_10', 175, 'Fiber', 'fiber_constipation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedете dovoljno voća i povrća?', 'scale_1_10', 176, 'Fiber', 'fruit_vegetable_fiber', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete previše prerađene hrane?', 'scale_1_10', 177, 'Processed Foods', 'processed_food_intake', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete previše fast food-a?', 'scale_1_10', 178, 'Processed Foods', 'fast_food_intake', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li čitate etikete na hrani?', 'scale_1_10', 179, 'Processed Foods', 'label_reading', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete previše šećera?', 'scale_1_10', 180, 'Sugar', 'sugar_intake_high', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pijete slatke napitke?', 'scale_1_10', 181, 'Sugar', 'sugary_drinks', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate energetske padove nakon šećera?', 'scale_1_10', 182, 'Sugar', 'sugar_crashes', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete previše soli?', 'scale_1_10', 183, 'Salt', 'salt_intake_high', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li dodajete sol u hranu?', 'scale_1_10', 184, 'Salt', 'salt_adding', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate visok krvni pritisak od soli?', 'scale_1_10', 185, 'Salt', 'salt_blood_pressure', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pijete kafu?', 'scale_1_10', 186, 'Caffeine', 'coffee_intake', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pijete čaj?', 'scale_1_10', 187, 'Caffeine', 'tea_intake', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li kofeин utječe na vaš san?', 'scale_1_10', 188, 'Caffeine', 'caffeine_sleep_impact', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite alkohol za opuštanje?', 'scale_1_10', 189, 'Alcohol', 'alcohol_relaxation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li alkohol utječe na vaš san?', 'scale_1_10', 190, 'Alcohol', 'alcohol_sleep_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa jetrom od alkohola?', 'scale_1_10', 191, 'Alcohol', 'alcohol_liver_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam je teško da se držite dijete?', 'scale_1_10', 192, 'Weight Management', 'diet_adherence', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li često mijenjajte dijete?', 'scale_1_10', 193, 'Weight Management', 'diet_cycling', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate jojo efekat sa težinom?', 'scale_1_10', 194, 'Weight Management', 'weight_yo_yo', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete kada ste stresni?', 'scale_1_10', 195, 'Emotional Eating', 'stress_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete kada ste dosadi se?', 'scale_1_10', 196, 'Emotional Eating', 'boredom_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete kada ste tužni?', 'scale_1_10', 197, 'Emotional Eating', 'sadness_eating', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li preskačete obroke?', 'scale_1_10', 198, 'Meal Patterns', 'meal_skipping', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete kasno navečer?', 'scale_1_10', 199, 'Meal Patterns', 'late_night_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedете irregularно?', 'scale_1_10', 200, 'Meal Patterns', 'irregular_eating', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete brzo?', 'scale_1_10', 201, 'Eating Habits', 'fast_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dok gledate TV?', 'scale_1_10', 202, 'Eating Habits', 'distracted_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate sitost nakon obroka?', 'scale_1_10', 203, 'Eating Habits', 'satiety_feeling', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li kuvate kod kuće?', 'scale_1_10', 204, 'Food Preparation', 'home_cooking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li planirate obroke unapred?', 'scale_1_10', 205, 'Food Preparation', 'meal_planning', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li kupujete organsku hranu?', 'scale_1_10', 206, 'Food Preparation', 'organic_food', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno obroka dnevno?', 'scale_1_10', 207, 'Meal Frequency', 'meal_frequency_adequate', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete užine između obroka?', 'scale_1_10', 208, 'Meal Frequency', 'snacking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li doručkujete redovno?', 'scale_1_10', 209, 'Meal Frequency', 'breakfast_regularity', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa žvakanjem?', 'scale_1_10', 210, 'Digestive Health', 'chewing_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate probleme sa gutanjem?', 'scale_1_10', 211, 'Digestive Health', 'swallowing_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa probavom?', 'scale_1_10', 212, 'Digestive Health', 'digestion_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate probiotike?', 'scale_1_10', 213, 'Gut Health', 'probiotics_use', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete fermentisanu hranu?', 'scale_1_10', 214, 'Gut Health', 'fermented_foods', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa crevnom florom?', 'scale_1_10', 215, 'Gut Health', 'gut_flora_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite umjetne zaslađivače?', 'scale_1_10', 216, 'Food Additives', 'artificial_sweeteners', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete hranu sa puno aditiva?', 'scale_1_10', 217, 'Food Additives', 'food_additives', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate alergijske reakcije na aditive?', 'scale_1_10', 218, 'Food Additives', 'additive_reactions', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pratite kalorije?', 'scale_1_10', 219, 'Nutrition Tracking', 'calorie_tracking', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vodite dnevnik ishrane?', 'scale_1_10', 220, 'Nutrition Tracking', 'food_diary', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate znanje o ishrani?', 'scale_1_10', 221, 'Nutrition Tracking', 'nutrition_knowledge', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete kada niste gladni?', 'scale_1_10', 222, 'Hunger Cues', 'eating_without_hunger', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li prepoznajete signale gladi?', 'scale_1_10', 223, 'Hunger Cues', 'hunger_recognition', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li prepoznajete signale sitosti?', 'scale_1_10', 224, 'Hunger Cues', 'satiety_recognition', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate podršku porodice za zdravu ishranu?', 'scale_1_10', 225, 'Social Support', 'family_support', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete sa drugima?', 'scale_1_10', 226, 'Social Support', 'social_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate profesionalnu podršku nutricionist?', 'scale_1_10', 227, 'Social Support', 'professional_support', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam je budžet ograničenje za zdravu hranu?', 'scale_1_10', 228, 'Barriers to Healthy Eating', 'budget_barriers', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam je vrijeme ograničenje za pripremu hrane?', 'scale_1_10', 229, 'Barriers to Healthy Eating', 'time_barriers', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam je dostupnost zdrave hrane problem?', 'scale_1_10', 230, 'Barriers to Healthy Eating', 'access_barriers', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate motivaciju za promjenu ishrane?', 'scale_1_10', 231, 'Motivation', 'change_motivation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vjerujete da možete promijeniti svoju ishranu?', 'scale_1_10', 232, 'Motivation', 'self_efficacy', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate jasne ciljeve za ishranu?', 'scale_1_10', 233, 'Motivation', 'clear_goals', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li je vaš rad sedentaran?', 'scale_1_10', 234, 'Physical Activity', 'sedentary_work', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se krećete dovoljno tokom dana?', 'scale_1_10', 235, 'Physical Activity', 'daily_movement', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate redovnu fizičku aktivnost?', 'scale_1_10', 236, 'Physical Activity', 'regular_exercise', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa mentalnim zdravljem koji utječu na ishranu?', 'scale_1_10', 237, 'Mental Health Impact', 'mental_health_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li anksioznost utječe na vaše navike ishrane?', 'scale_1_10', 238, 'Mental Health Impact', 'anxiety_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li depresija utječe na vaš apetit?', 'scale_1_10', 239, 'Mental Health Impact', 'depression_appetite', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li su vam potrebne dodatne informacije o vitaminu B12?', 'scale_1_10', 240, 'Specific Nutrients', 'b12_info_need', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li su vam potrebne dodatne informacije o omega-3?', 'scale_1_10', 241, 'Specific Nutrients', 'omega3_info_need', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li su vam potrebne informacije o antioksidantima?', 'scale_1_10', 242, 'Specific Nutrients', 'antioxidant_info_need', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa hormonskim nebalansом koji utječe na ishranu?', 'scale_1_10', 243, 'Hormonal Impact', 'hormonal_eating_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li menopauza utječe na vašu ishranu?', 'scale_1_10', 244, 'Hormonal Impact', 'menopause_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li PCOS utječe na vašu ishranu?', 'scale_1_10', 245, 'Hormonal Impact', 'pcos_eating', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate lijekove koji utječu na apetit?', 'scale_1_10', 246, 'Medication Impact', 'appetite_affecting_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate lijekove koji utječu na varenje?', 'scale_1_10', 247, 'Medication Impact', 'digestion_affecting_meds', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate suplemente koji mogu interferovati sa hranom?', 'scale_1_10', 248, 'Medication Impact', 'supplement_interactions', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li putujete često i to utječe na vašu ishranu?', 'scale_1_10', 249, 'Lifestyle Factors', 'travel_eating_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li rad u smjenama utječe na vašu ishranu?', 'scale_1_10', 250, 'Lifestyle Factors', 'shift_work_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li društveni događaji utječu na vašu ishranu?', 'scale_1_10', 251, 'Lifestyle Factors', 'social_events_eating', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa apsorpcijom nutrijenata?', 'scale_1_10', 252, 'Absorption Issues', 'nutrient_absorption', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate leaky gut sindrom?', 'scale_1_10', 253, 'Absorption Issues', 'leaky_gut', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate SIBO (prekomerna rast bakterija)?', 'scale_1_10', 254, 'Absorption Issues', 'sibo', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa detoksifikacijom?', 'scale_1_10', 255, 'Detoxification', 'detox_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate potrebu za čišćenjem organizma?', 'scale_1_10', 256, 'Detoxification', 'detox_need', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa elimisacijom toksina?', 'scale_1_10', 257, 'Detoxification', 'toxin_elimination', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa nivoima energije tokom dana?', 'scale_1_10', 258, 'Energy Patterns', 'energy_fluctuations', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li osjećate pad energije posle podne?', 'scale_1_10', 259, 'Energy Patterns', 'afternoon_energy_crash', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li se budite umorno uprkos dovoljno sna?', 'scale_1_10', 260, 'Energy Patterns', 'tired_despite_sleep', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa inflamacijom u tijelu?', 'scale_1_10', 261, 'Inflammation', 'body_inflammation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete protivupalna hrana?', 'scale_1_10', 262, 'Inflammation', 'anti_inflammatory_foods', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate suplemente za inflamaciju?', 'scale_1_10', 263, 'Inflammation', 'anti_inflammatory_supplements', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problemse sa metabolizmom?', 'scale_1_10', 264, 'Metabolism', 'metabolism_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam je spor metabolizam?', 'scale_1_10', 265, 'Metabolism', 'slow_metabolism', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa termoregulacijom?', 'scale_1_10', 266, 'Metabolism', 'temperature_regulation', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate oksidativni stres?', 'scale_1_10', 267, 'Oxidative Stress', 'oxidative_stress', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate antioksidante?', 'scale_1_10', 268, 'Oxidative Stress', 'antioxidant_intake', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete hranu bogatu antioksidantima?', 'scale_1_10', 269, 'Oxidative Stress', 'antioxidant_rich_foods', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa pH balansom u tijelu?', 'scale_1_10', 270, 'pH Balance', 'ph_balance_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete previše kisle hrane?', 'scale_1_10', 271, 'pH Balance', 'acidic_foods', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete dovoljno alkalne hrane?', 'scale_1_10', 272, 'pH Balance', 'alkaline_foods', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa neurotransmiterima?', 'scale_1_10', 273, 'Neurotransmitters', 'neurotransmitter_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa serotoninom?', 'scale_1_10', 274, 'Neurotransmitters', 'serotonin_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa dopaminom?', 'scale_1_10', 275, 'Neurotransmitters', 'dopamine_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa mitohodnrijama (energija ćelija)?', 'scale_1_10', 276, 'Cellular Health', 'mitochondrial_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa ćelijskim oporavkom?', 'scale_1_10', 277, 'Cellular Health', 'cellular_repair', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate koenzim Q10?', 'scale_1_10', 278, 'Cellular Health', 'coq10_intake', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa genetskom predispozicijom za određene nutricione potrebe?', 'scale_1_10', 279, 'Genetic Factors', 'genetic_nutrition_needs', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate mutacije genov koji utječu na metabolizam?', 'scale_1_10', 280, 'Genetic Factors', 'metabolic_gene_mutations', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li ste radili nutrigenetsku analizu?', 'scale_1_10', 281, 'Genetic Factors', 'nutrigenetic_testing', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa crievnim mikrobiomom?', 'scale_1_10', 282, 'Microbiome', 'microbiome_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate probiotike redovno?', 'scale_1_10', 283, 'Microbiome', 'regular_probiotics', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete prebiotic hranu?', 'scale_1_10', 284, 'Microbiome', 'prebiotic_foods', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa razvojem ili rastom (djeca)?', 'scale_1_10', 285, 'Development', 'growth_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa kognitivnim razvojem?', 'scale_1_10', 286, 'Development', 'cognitive_development', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa pubertetom?', 'scale_1_10', 287, 'Development', 'puberty_problems', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa starenjem organizma?', 'scale_1_10', 288, 'Aging', 'accelerated_aging', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate suplemente za anti-aging?', 'scale_1_10', 289, 'Aging', 'anti_aging_supplements', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa elastičošću kože?', 'scale_1_10', 290, 'Aging', 'skin_elasticity', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa sportskim performansama?', 'scale_1_10', 291, 'Athletic Performance', 'athletic_performance', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate sportske suplemente?', 'scale_1_10', 292, 'Athletic Performance', 'sports_supplements', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa oporavkom nakon vježbe?', 'scale_1_10', 293, 'Athletic Performance', 'exercise_recovery', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa povredom koja utječe na ishranu?', 'scale_1_10', 294, 'Injury Recovery', 'injury_nutrition_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate suplemente za zarastavanje rana?', 'scale_1_10', 295, 'Injury Recovery', 'wound_healing_supplements', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete hranu koja pomaže oporavku?', 'scale_1_10', 296, 'Injury Recovery', 'recovery_supporting_foods', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa radom noću?', 'scale_1_10', 297, 'Circadian Rhythm', 'night_shift_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa jet lag-ом?', 'scale_1_10', 298, 'Circadian Rhythm', 'jet_lag_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li vam svetлост utječe na apetit?', 'scale_1_10', 299, 'Circadian Rhythm', 'light_appetite_impact', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa seanzonskim promenjama u ishrani?', 'scale_1_10', 300, 'Seasonal Changes', 'seasonal_eating_changes', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li uzimate dodatke vitamin D зимом?', 'scale_1_10', 301, 'Seasonal Changes', 'winter_vitamin_d', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete sezonsku hranu?', 'scale_1_10', 302, 'Seasonal Changes', 'seasonal_foods', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa ekološnim toksinima koje utječu na ishranu?', 'scale_1_10', 303, 'Environmental Toxins', 'environmental_toxin_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete organska hrana zbog toksina?', 'scale_1_10', 304, 'Environmental Toxins', 'organic_for_toxins', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite filtriranu vodu?', 'scale_1_10', 305, 'Environmental Toxins', 'filtered_water', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa EMF zрачenjem koje utječe na metabolizam?', 'scale_1_10', 306, 'EMF Exposure', 'emf_metabolism_impact', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite dosta elektronskih uređaja tokom obroka?', 'scale_1_10', 307, 'EMF Exposure', 'electronics_during_meals', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa mold toksinima?', 'scale_1_10', 308, 'Mold Exposure', 'mold_toxin_problems', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedete hranu koja je bila izložena buđavi?', 'scale_1_10', 309, 'Mold Exposure', 'moldy_food_exposure', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa Heavy metalima u tijelu?', 'scale_1_10', 310, 'Heavy Metals', 'heavy_metal_toxicity', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li jedете ribu zbog žive?', 'scale_1_10', 311, 'Heavy Metals', 'mercury_fish_concern', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite keladove suplemente?', 'scale_1_10', 312, 'Heavy Metals', 'chelation_supplements', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa kroničnim umorom?', 'scale_1_10', 313, 'Chronic Conditions', 'chronic_fatigue', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate fibromyalgiju?', 'scale_1_10', 314, 'Chronic Conditions', 'fibromyalgia', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate metabolički sindrom?', 'scale_1_10', 315, 'Chronic Conditions', 'metabolic_syndrome', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li imate problema sa lečenjem prirodnim načinima?', 'scale_1_10', 316, 'Natural Healing', 'natural_healing_preference', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite byliske čajeve za zdravlje?', 'scale_1_10', 317, 'Natural Healing', 'herbal_teas', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li koristite etarska ulja za digestiju?', 'scale_1_10', 318, 'Natural Healing', 'essential_oils_digestion', 1, NULL),

('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li održavate mindful eating prakse?', 'scale_1_10', 319, 'Mindful Eating', 'mindful_eating', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li медитирате prije obroka?', 'scale_1_10', 320, 'Mindful Eating', 'pre_meal_meditation', 1, NULL),
('b421c273-10bc-4d64-bc8b-8bcc7f68f367', 'Da li pokazujete zahvalnost za hranu?', 'scale_1_10', 321, 'Mindful Eating', 'food_gratitude', 1, NULL);