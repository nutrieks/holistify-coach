-- Use edge function to seed remaining NAQ questions
SELECT 
  q.id,
  q.title,
  COUNT(qq.id) as current_question_count
FROM questionnaires q
LEFT JOIN questionnaire_questions qq ON q.id = qq.questionnaire_id
WHERE q.title ILIKE '%NAQ%'
GROUP BY q.id, q.title;