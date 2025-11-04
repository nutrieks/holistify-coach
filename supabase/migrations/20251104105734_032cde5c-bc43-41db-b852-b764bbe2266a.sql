-- Dodavanje novog pitanja A.15.2b za tekstualni unos dodataka prehrani
INSERT INTO micronutrient_questions (
  questionnaire_id,
  section,
  category,
  question_code,
  question_text,
  question_type,
  options,
  order_index,
  skip_logic,
  nutrient_relevance,
  parent_question_id
)
SELECT 
  mq.id,
  'A',
  'Suplementi',
  'A.15.2b',
  'Navedite nazive dodatnih dodataka prehrani koje uzimate (odvojite zarezom):',
  'text',
  NULL,
  82.5,
  NULL,
  '{}'::jsonb,
  NULL
FROM micronutrient_questionnaires mq
WHERE mq.is_active = true
LIMIT 1;