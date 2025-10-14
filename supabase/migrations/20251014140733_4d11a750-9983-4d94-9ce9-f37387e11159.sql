-- Delete existing incomplete NAQ questionnaire
DELETE FROM questionnaire_questions WHERE questionnaire_id IN (
  SELECT id FROM questionnaires WHERE questionnaire_type = 'naq'
);
DELETE FROM questionnaires WHERE questionnaire_type = 'naq';