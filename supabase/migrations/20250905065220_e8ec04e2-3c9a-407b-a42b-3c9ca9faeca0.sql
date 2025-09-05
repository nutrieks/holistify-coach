
-- 1) Pretvori krivo unesena yes/no pitanja (checkbox bez opcija) u single-choice s Da/Ne
UPDATE public.questionnaire_questions
SET
  question_type = 'multiple_choice',
  options = '["Da","Ne"]'::jsonb
WHERE questionnaire_id = 'b421c273-10bc-4d64-bc8b-8bcc7f68f367'
  AND question_type = 'checkbox'
  AND (options IS NULL OR jsonb_typeof(options) IS NULL);

-- Napomena:
-- options je jsonb – ovdje ga spremamo kao JSON array ["Da","Ne"].
-- Nakon ovoga ću u kodu prilagoditi renderer da ispravno radi i s jsonb (array/objekt) i sa stringom.
