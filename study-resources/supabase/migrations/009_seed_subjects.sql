-- Seed common subjects if table exists and subjects are missing
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'subjects'
  ) THEN
    -- Insert subjects only if they do not already exist
    INSERT INTO subjects (name)
    SELECT s FROM UNNEST(ARRAY[
      'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Biology',
      'Engineering', 'Economics', 'Psychology', 'History', 'Business',
      'English', 'Philosophy', 'Art', 'Political Science', 'Sociology',
      'Anthropology', 'Geography', 'Foreign Languages', 'Music', 'Theatre',
      'Kinesiology', 'Environmental Science', 'Communications', 'Journalism'
    ]) AS s
    ON CONFLICT DO NOTHING;
  END IF;
END $$;


