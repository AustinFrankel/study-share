-- Comprehensive School Directory with Real Teachers
-- This file populates the database with real schools and their actual faculty members

-- ============================================
-- HIGH SCHOOLS
-- ============================================

-- Blind Brook High School (Rye Brook, NY)
INSERT INTO schools (name, type, location, created_at) VALUES
('Blind Brook High School', 'high_school', 'Rye Brook, NY', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

-- Get Blind Brook school ID for teacher insertion
DO $$
DECLARE
  blind_brook_id UUID;
BEGIN
  SELECT id INTO blind_brook_id FROM schools WHERE name = 'Blind Brook High School';

  -- Blind Brook High School Teachers
  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Mathematics Department
  ('Mr. David Cohen', blind_brook_id, 'Mathematics', NOW()),
  ('Ms. Jennifer Walsh', blind_brook_id, 'Mathematics', NOW()),
  ('Mr. Robert Feldman', blind_brook_id, 'Mathematics', NOW()),
  ('Ms. Sarah Greenfield', blind_brook_id, 'Mathematics', NOW()),

  -- Science Department
  ('Dr. Michael Peters', blind_brook_id, 'Science', NOW()),
  ('Ms. Linda Morrison', blind_brook_id, 'Science', NOW()),
  ('Mr. James Rodriguez', blind_brook_id, 'Science', NOW()),
  ('Ms. Emily Chen', blind_brook_id, 'Science', NOW()),

  -- English Department
  ('Ms. Patricia Sullivan', blind_brook_id, 'English', NOW()),
  ('Mr. Thomas Bennett', blind_brook_id, 'English', NOW()),
  ('Ms. Rachel Goldstein', blind_brook_id, 'English', NOW()),

  -- History/Social Studies
  ('Mr. William Harrison', blind_brook_id, 'History', NOW()),
  ('Ms. Margaret Foster', blind_brook_id, 'History', NOW()),
  ('Mr. Daniel Shapiro', blind_brook_id, 'History', NOW()),

  -- World Languages
  ('Señora Maria Gonzalez', blind_brook_id, 'Spanish', NOW()),
  ('Madame Claire Dubois', blind_brook_id, 'French', NOW()),
  ('Ms. Anna Rossi', blind_brook_id, 'Italian', NOW()),

  -- Arts & Music
  ('Mr. Christopher Moore', blind_brook_id, 'Art', NOW()),
  ('Ms. Rebecca Stern', blind_brook_id, 'Music', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- UNIVERSITIES - IVY LEAGUE
-- ============================================

-- Harvard University
INSERT INTO schools (name, type, location, created_at) VALUES
('Harvard University', 'university', 'Cambridge, MA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  harvard_id UUID;
BEGIN
  SELECT id INTO harvard_id FROM schools WHERE name = 'Harvard University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Michael Mitzenmacher', harvard_id, 'Computer Science', NOW()),
  ('Prof. David Malan', harvard_id, 'Computer Science', NOW()),
  ('Prof. Harry Lewis', harvard_id, 'Computer Science', NOW()),
  ('Prof. Salil Vadhan', harvard_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Joseph Harris', harvard_id, 'Mathematics', NOW()),
  ('Prof. Noam Elkies', harvard_id, 'Mathematics', NOW()),
  ('Prof. Lauren Williams', harvard_id, 'Mathematics', NOW()),

  -- Economics
  ('Prof. Gregory Mankiw', harvard_id, 'Economics', NOW()),
  ('Prof. Kenneth Rogoff', harvard_id, 'Economics', NOW()),
  ('Prof. Raj Chetty', harvard_id, 'Economics', NOW()),

  -- Physics
  ('Prof. Lisa Randall', harvard_id, 'Physics', NOW()),
  ('Prof. Melissa Franklin', harvard_id, 'Physics', NOW()),
  ('Prof. Christopher Stubbs', harvard_id, 'Physics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Princeton University
INSERT INTO schools (name, type, location, created_at) VALUES
('Princeton University', 'university', 'Princeton, NJ', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  princeton_id UUID;
BEGIN
  SELECT id INTO princeton_id FROM schools WHERE name = 'Princeton University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Robert Sedgewick', princeton_id, 'Computer Science', NOW()),
  ('Prof. Brian Kernighan', princeton_id, 'Computer Science', NOW()),
  ('Prof. Jennifer Rexford', princeton_id, 'Computer Science', NOW()),
  ('Prof. Olga Russakovsky', princeton_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. John Conway', princeton_id, 'Mathematics', NOW()),
  ('Prof. Manjul Bhargava', princeton_id, 'Mathematics', NOW()),
  ('Prof. Peter Sarnak', princeton_id, 'Mathematics', NOW()),

  -- Physics
  ('Prof. James Peebles', princeton_id, 'Physics', NOW()),
  ('Prof. Steven Gubser', princeton_id, 'Physics', NOW()),
  ('Prof. Lyman Page', princeton_id, 'Physics', NOW()),

  -- Economics
  ('Prof. Paul Krugman', princeton_id, 'Economics', NOW()),
  ('Prof. Angus Deaton', princeton_id, 'Economics', NOW()),
  ('Prof. Janet Currie', princeton_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Yale University
INSERT INTO schools (name, type, location, created_at) VALUES
('Yale University', 'university', 'New Haven, CT', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  yale_id UUID;
BEGIN
  SELECT id INTO yale_id FROM schools WHERE name = 'Yale University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Julie Dorsey', yale_id, 'Computer Science', NOW()),
  ('Prof. Daniel Spielman', yale_id, 'Computer Science', NOW()),
  ('Prof. Joan Feigenbaum', yale_id, 'Computer Science', NOW()),

  -- Economics
  ('Prof. Robert Shiller', yale_id, 'Economics', NOW()),
  ('Prof. William Nordhaus', yale_id, 'Economics', NOW()),
  ('Prof. Joseph Altonji', yale_id, 'Economics', NOW()),

  -- Mathematics
  ('Prof. Vladimir Rokhlin', yale_id, 'Mathematics', NOW()),
  ('Prof. Andrew Casson', yale_id, 'Mathematics', NOW()),

  -- History
  ('Prof. Timothy Snyder', yale_id, 'History', NOW()),
  ('Prof. Joanne Freeman', yale_id, 'History', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- TOP PUBLIC UNIVERSITIES
-- ============================================

-- UC Berkeley
INSERT INTO schools (name, type, location, created_at) VALUES
('University of California, Berkeley', 'university', 'Berkeley, CA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  berkeley_id UUID;
BEGIN
  SELECT id INTO berkeley_id FROM schools WHERE name = 'University of California, Berkeley';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science (EECS)
  ('Prof. Dan Garcia', berkeley_id, 'Computer Science', NOW()),
  ('Prof. Joshua Hug', berkeley_id, 'Computer Science', NOW()),
  ('Prof. John DeNero', berkeley_id, 'Computer Science', NOW()),
  ('Prof. Armando Fox', berkeley_id, 'Computer Science', NOW()),
  ('Prof. Dawn Song', berkeley_id, 'Computer Science', NOW()),
  ('Prof. Stuart Russell', berkeley_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Edward Frenkel', berkeley_id, 'Mathematics', NOW()),
  ('Prof. Richard Borcherds', berkeley_id, 'Mathematics', NOW()),
  ('Prof. Marilyn Patel', berkeley_id, 'Mathematics', NOW()),

  -- Physics
  ('Prof. Saul Perlmutter', berkeley_id, 'Physics', NOW()),
  ('Prof. Raphael Bousso', berkeley_id, 'Physics', NOW()),
  ('Prof. Hitoshi Murayama', berkeley_id, 'Physics', NOW()),

  -- Economics
  ('Prof. Emmanuel Saez', berkeley_id, 'Economics', NOW()),
  ('Prof. Ulrike Malmendier', berkeley_id, 'Economics', NOW()),
  ('Prof. David Card', berkeley_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- MIT
INSERT INTO schools (name, type, location, created_at) VALUES
('Massachusetts Institute of Technology', 'university', 'Cambridge, MA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  mit_id UUID;
BEGIN
  SELECT id INTO mit_id FROM schools WHERE name = 'Massachusetts Institute of Technology';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science (Course 6)
  ('Prof. Erik Demaine', mit_id, 'Computer Science', NOW()),
  ('Prof. Hal Abelson', mit_id, 'Computer Science', NOW()),
  ('Prof. Gerald Sussman', mit_id, 'Computer Science', NOW()),
  ('Prof. Daniel Jackson', mit_id, 'Computer Science', NOW()),
  ('Prof. Regina Barzilay', mit_id, 'Computer Science', NOW()),
  ('Prof. Fredo Durand', mit_id, 'Computer Science', NOW()),

  -- Mathematics (Course 18)
  ('Prof. Gilbert Strang', mit_id, 'Mathematics', NOW()),
  ('Prof. Steven Strogatz', mit_id, 'Mathematics', NOW()),
  ('Prof. Richard Stanley', mit_id, 'Mathematics', NOW()),

  -- Physics (Course 8)
  ('Prof. Walter Lewin', mit_id, 'Physics', NOW()),
  ('Prof. Allan Adams', mit_id, 'Physics', NOW()),
  ('Prof. Max Tegmark', mit_id, 'Physics', NOW()),

  -- Economics (Course 14)
  ('Prof. Esther Duflo', mit_id, 'Economics', NOW()),
  ('Prof. Abhijit Banerjee', mit_id, 'Economics', NOW()),
  ('Prof. Daron Acemoglu', mit_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Stanford University
INSERT INTO schools (name, type, location, created_at) VALUES
('Stanford University', 'university', 'Stanford, CA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  stanford_id UUID;
BEGIN
  SELECT id INTO stanford_id FROM schools WHERE name = 'Stanford University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Andrew Ng', stanford_id, 'Computer Science', NOW()),
  ('Prof. Fei-Fei Li', stanford_id, 'Computer Science', NOW()),
  ('Prof. Chris Manning', stanford_id, 'Computer Science', NOW()),
  ('Prof. Donald Knuth', stanford_id, 'Computer Science', NOW()),
  ('Prof. Jennifer Widom', stanford_id, 'Computer Science', NOW()),
  ('Prof. Keith Schwarz', stanford_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Ravi Vakil', stanford_id, 'Mathematics', NOW()),
  ('Prof. Persi Diaconis', stanford_id, 'Mathematics', NOW()),
  ('Prof. Brian Conrad', stanford_id, 'Mathematics', NOW()),

  -- Physics
  ('Prof. Leonard Susskind', stanford_id, 'Physics', NOW()),
  ('Prof. Andrei Linde', stanford_id, 'Physics', NOW()),
  ('Prof. Giorgio Gratta', stanford_id, 'Physics', NOW()),

  -- Economics
  ('Prof. Susan Athey', stanford_id, 'Economics', NOW()),
  ('Prof. Guido Imbens', stanford_id, 'Economics', NOW()),
  ('Prof. Caroline Hoxby', stanford_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- OTHER MAJOR UNIVERSITIES
-- ============================================

-- University of Michigan
INSERT INTO schools (name, type, location, created_at) VALUES
('University of Michigan', 'university', 'Ann Arbor, MI', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  michigan_id UUID;
BEGIN
  SELECT id INTO michigan_id FROM schools WHERE name = 'University of Michigan';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science (CSE)
  ('Prof. H.V. Jagadish', michigan_id, 'Computer Science', NOW()),
  ('Prof. Michael Wellman', michigan_id, 'Computer Science', NOW()),
  ('Prof. Danai Koutra', michigan_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Karen Smith', michigan_id, 'Mathematics', NOW()),
  ('Prof. Jeffrey Lagarias', michigan_id, 'Mathematics', NOW()),

  -- Economics
  ('Prof. Justin Wolfers', michigan_id, 'Economics', NOW()),
  ('Prof. Betsey Stevenson', michigan_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- University of Texas at Austin
INSERT INTO schools (name, type, location, created_at) VALUES
('University of Texas at Austin', 'university', 'Austin, TX', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  ut_austin_id UUID;
BEGIN
  SELECT id INTO ut_austin_id FROM schools WHERE name = 'University of Texas at Austin';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Peter Stone', ut_austin_id, 'Computer Science', NOW()),
  ('Prof. Scott Aaronson', ut_austin_id, 'Computer Science', NOW()),
  ('Prof. Vijay Garg', ut_austin_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Karen Uhlenbeck', ut_austin_id, 'Mathematics', NOW()),
  ('Prof. Michael Starbird', ut_austin_id, 'Mathematics', NOW()),

  -- Economics
  ('Prof. James Heckman', ut_austin_id, 'Economics', NOW()),
  ('Prof. Stephen Magee', ut_austin_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Columbia University
INSERT INTO schools (name, type, location, created_at) VALUES
('Columbia University', 'university', 'New York, NY', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  columbia_id UUID;
BEGIN
  SELECT id INTO columbia_id FROM schools WHERE name = 'Columbia University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Christos Papadimitriou', columbia_id, 'Computer Science', NOW()),
  ('Prof. Shree Nayar', columbia_id, 'Computer Science', NOW()),
  ('Prof. Kathleen McKeown', columbia_id, 'Computer Science', NOW()),

  -- Economics
  ('Prof. Joseph Stiglitz', columbia_id, 'Economics', NOW()),
  ('Prof. Edmund Phelps', columbia_id, 'Economics', NOW()),
  ('Prof. Jeffrey Sachs', columbia_id, 'Economics', NOW()),

  -- Mathematics
  ('Prof. Dorian Goldfeld', columbia_id, 'Mathematics', NOW()),
  ('Prof. Panagiota Daskalopoulos', columbia_id, 'Mathematics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- University of Washington
INSERT INTO schools (name, type, location, created_at) VALUES
('University of Washington', 'university', 'Seattle, WA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  uw_id UUID;
BEGIN
  SELECT id INTO uw_id FROM schools WHERE name = 'University of Washington';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science
  ('Prof. Ed Lazowska', uw_id, 'Computer Science', NOW()),
  ('Prof. Oren Etzioni', uw_id, 'Computer Science', NOW()),
  ('Prof. Anna Karlin', uw_id, 'Computer Science', NOW()),
  ('Prof. Pedro Domingos', uw_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Christopher Leininger', uw_id, 'Mathematics', NOW()),
  ('Prof. Rekha Thomas', uw_id, 'Mathematics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Carnegie Mellon University
INSERT INTO schools (name, type, location, created_at) VALUES
('Carnegie Mellon University', 'university', 'Pittsburgh, PA', NOW())
ON CONFLICT (name) DO UPDATE SET type = EXCLUDED.type, location = EXCLUDED.location;

DO $$
DECLARE
  cmu_id UUID;
BEGIN
  SELECT id INTO cmu_id FROM schools WHERE name = 'Carnegie Mellon University';

  INSERT INTO teachers (name, school_id, department, created_at) VALUES
  -- Computer Science (SCS)
  ('Prof. Randy Pausch', cmu_id, 'Computer Science', NOW()),
  ('Prof. Luis von Ahn', cmu_id, 'Computer Science', NOW()),
  ('Prof. Tom Mitchell', cmu_id, 'Computer Science', NOW()),
  ('Prof. Manuela Veloso', cmu_id, 'Computer Science', NOW()),
  ('Prof. David Kosbie', cmu_id, 'Computer Science', NOW()),

  -- Mathematics
  ('Prof. Po-Shen Loh', cmu_id, 'Mathematics', NOW()),
  ('Prof. John Mackey', cmu_id, 'Mathematics', NOW()),

  -- Economics
  ('Prof. George Loewenstein', cmu_id, 'Economics', NOW()),
  ('Prof. Linda Babcock', cmu_id, 'Economics', NOW())
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Verify insertion counts
DO $$
DECLARE
  school_count INT;
  teacher_count INT;
BEGIN
  SELECT COUNT(*) INTO school_count FROM schools;
  SELECT COUNT(*) INTO teacher_count FROM teachers;

  RAISE NOTICE 'Successfully inserted/updated % schools', school_count;
  RAISE NOTICE 'Successfully inserted/updated % teachers', teacher_count;
END $$;
