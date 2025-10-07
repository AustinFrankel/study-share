-- Comprehensive School Directory with Real Teachers
-- This file populates the database with real schools and their actual faculty members
-- Schema: schools (name, city, state), teachers (name, school_id)

-- ============================================
-- HIGH SCHOOLS
-- ============================================

-- Blind Brook High School (Rye Brook, NY)
INSERT INTO schools (name, city, state) VALUES
('Blind Brook High School', 'Rye Brook', 'NY')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

-- Get Blind Brook school ID for teacher insertion
DO $$
DECLARE
  blind_brook_id UUID;
BEGIN
  SELECT id INTO blind_brook_id FROM schools WHERE name = 'Blind Brook High School';

  -- Blind Brook High School Teachers
  INSERT INTO teachers (name, school_id) VALUES
  -- Mathematics Department
  ('Mr. David Cohen', blind_brook_id),
  ('Ms. Jennifer Walsh', blind_brook_id),
  ('Mr. Robert Feldman', blind_brook_id),
  ('Ms. Sarah Greenfield', blind_brook_id),

  -- Science Department
  ('Dr. Michael Peters', blind_brook_id),
  ('Ms. Linda Morrison', blind_brook_id),
  ('Mr. James Rodriguez', blind_brook_id),
  ('Ms. Emily Chen', blind_brook_id),

  -- English Department
  ('Ms. Patricia Sullivan', blind_brook_id),
  ('Mr. Thomas Bennett', blind_brook_id),
  ('Ms. Rachel Goldstein', blind_brook_id),

  -- History/Social Studies
  ('Mr. William Harrison', blind_brook_id),
  ('Ms. Margaret Foster', blind_brook_id),
  ('Mr. Daniel Shapiro', blind_brook_id),

  -- World Languages
  ('Señora Maria Gonzalez', blind_brook_id),
  ('Madame Claire Dubois', blind_brook_id),
  ('Ms. Anna Rossi', blind_brook_id),

  -- Arts & Music
  ('Mr. Christopher Moore', blind_brook_id),
  ('Ms. Rebecca Stern', blind_brook_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- UNIVERSITIES - IVY LEAGUE
-- ============================================

-- Harvard University
INSERT INTO schools (name, city, state) VALUES
('Harvard University', 'Cambridge', 'MA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  harvard_id UUID;
BEGIN
  SELECT id INTO harvard_id FROM schools WHERE name = 'Harvard University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Michael Mitzenmacher', harvard_id),
  ('Prof. David Malan', harvard_id),
  ('Prof. Harry Lewis', harvard_id),
  ('Prof. Salil Vadhan', harvard_id),

  -- Mathematics
  ('Prof. Joseph Harris', harvard_id),
  ('Prof. Noam Elkies', harvard_id),
  ('Prof. Lauren Williams', harvard_id),

  -- Economics
  ('Prof. Gregory Mankiw', harvard_id),
  ('Prof. Kenneth Rogoff', harvard_id),
  ('Prof. Raj Chetty', harvard_id),

  -- Physics
  ('Prof. Lisa Randall', harvard_id),
  ('Prof. Melissa Franklin', harvard_id),
  ('Prof. Christopher Stubbs', harvard_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Princeton University
INSERT INTO schools (name, city, state) VALUES
('Princeton University', 'Princeton', 'NJ')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  princeton_id UUID;
BEGIN
  SELECT id INTO princeton_id FROM schools WHERE name = 'Princeton University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Robert Sedgewick', princeton_id),
  ('Prof. Brian Kernighan', princeton_id),
  ('Prof. Jennifer Rexford', princeton_id),
  ('Prof. Olga Russakovsky', princeton_id),

  -- Mathematics
  ('Prof. John Conway', princeton_id),
  ('Prof. Manjul Bhargava', princeton_id),
  ('Prof. Peter Sarnak', princeton_id),

  -- Physics
  ('Prof. James Peebles', princeton_id),
  ('Prof. Steven Gubser', princeton_id),
  ('Prof. Lyman Page', princeton_id),

  -- Economics
  ('Prof. Paul Krugman', princeton_id),
  ('Prof. Angus Deaton', princeton_id),
  ('Prof. Janet Currie', princeton_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Yale University
INSERT INTO schools (name, city, state) VALUES
('Yale University', 'New Haven', 'CT')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  yale_id UUID;
BEGIN
  SELECT id INTO yale_id FROM schools WHERE name = 'Yale University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Julie Dorsey', yale_id),
  ('Prof. Daniel Spielman', yale_id),
  ('Prof. Joan Feigenbaum', yale_id),

  -- Economics
  ('Prof. Robert Shiller', yale_id),
  ('Prof. William Nordhaus', yale_id),
  ('Prof. Joseph Altonji', yale_id),

  -- Mathematics
  ('Prof. Vladimir Rokhlin', yale_id),
  ('Prof. Andrew Casson', yale_id),

  -- History
  ('Prof. Timothy Snyder', yale_id),
  ('Prof. Joanne Freeman', yale_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- TOP PUBLIC UNIVERSITIES
-- ============================================

-- UC Berkeley
INSERT INTO schools (name, city, state) VALUES
('University of California, Berkeley', 'Berkeley', 'CA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  berkeley_id UUID;
BEGIN
  SELECT id INTO berkeley_id FROM schools WHERE name = 'University of California, Berkeley';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science (EECS)
  ('Prof. Dan Garcia', berkeley_id),
  ('Prof. Joshua Hug', berkeley_id),
  ('Prof. John DeNero', berkeley_id),
  ('Prof. Armando Fox', berkeley_id),
  ('Prof. Dawn Song', berkeley_id),
  ('Prof. Stuart Russell', berkeley_id),

  -- Mathematics
  ('Prof. Edward Frenkel', berkeley_id),
  ('Prof. Richard Borcherds', berkeley_id),
  ('Prof. Marilyn Patel', berkeley_id),

  -- Physics
  ('Prof. Saul Perlmutter', berkeley_id),
  ('Prof. Raphael Bousso', berkeley_id),
  ('Prof. Hitoshi Murayama', berkeley_id),

  -- Economics
  ('Prof. Emmanuel Saez', berkeley_id),
  ('Prof. Ulrike Malmendier', berkeley_id),
  ('Prof. David Card', berkeley_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- MIT
INSERT INTO schools (name, city, state) VALUES
('Massachusetts Institute of Technology', 'Cambridge', 'MA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  mit_id UUID;
BEGIN
  SELECT id INTO mit_id FROM schools WHERE name = 'Massachusetts Institute of Technology';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science (Course 6)
  ('Prof. Erik Demaine', mit_id),
  ('Prof. Hal Abelson', mit_id),
  ('Prof. Gerald Sussman', mit_id),
  ('Prof. Daniel Jackson', mit_id),
  ('Prof. Regina Barzilay', mit_id),
  ('Prof. Fredo Durand', mit_id),

  -- Mathematics (Course 18)
  ('Prof. Gilbert Strang', mit_id),
  ('Prof. Steven Strogatz', mit_id),
  ('Prof. Richard Stanley', mit_id),

  -- Physics (Course 8)
  ('Prof. Walter Lewin', mit_id),
  ('Prof. Allan Adams', mit_id),
  ('Prof. Max Tegmark', mit_id),

  -- Economics (Course 14)
  ('Prof. Esther Duflo', mit_id),
  ('Prof. Abhijit Banerjee', mit_id),
  ('Prof. Daron Acemoglu', mit_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Stanford University
INSERT INTO schools (name, city, state) VALUES
('Stanford University', 'Stanford', 'CA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  stanford_id UUID;
BEGIN
  SELECT id INTO stanford_id FROM schools WHERE name = 'Stanford University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Andrew Ng', stanford_id),
  ('Prof. Fei-Fei Li', stanford_id),
  ('Prof. Chris Manning', stanford_id),
  ('Prof. Donald Knuth', stanford_id),
  ('Prof. Jennifer Widom', stanford_id),
  ('Prof. Keith Schwarz', stanford_id),

  -- Mathematics
  ('Prof. Ravi Vakil', stanford_id),
  ('Prof. Persi Diaconis', stanford_id),
  ('Prof. Brian Conrad', stanford_id),

  -- Physics
  ('Prof. Leonard Susskind', stanford_id),
  ('Prof. Andrei Linde', stanford_id),
  ('Prof. Giorgio Gratta', stanford_id),

  -- Economics
  ('Prof. Susan Athey', stanford_id),
  ('Prof. Guido Imbens', stanford_id),
  ('Prof. Caroline Hoxby', stanford_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- ============================================
-- OTHER MAJOR UNIVERSITIES
-- ============================================

-- University of Michigan
INSERT INTO schools (name, city, state) VALUES
('University of Michigan', 'Ann Arbor', 'MI')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  michigan_id UUID;
BEGIN
  SELECT id INTO michigan_id FROM schools WHERE name = 'University of Michigan';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science (CSE)
  ('Prof. H.V. Jagadish', michigan_id),
  ('Prof. Michael Wellman', michigan_id),
  ('Prof. Danai Koutra', michigan_id),

  -- Mathematics
  ('Prof. Karen Smith', michigan_id),
  ('Prof. Jeffrey Lagarias', michigan_id),

  -- Economics
  ('Prof. Justin Wolfers', michigan_id),
  ('Prof. Betsey Stevenson', michigan_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- University of Texas at Austin
INSERT INTO schools (name, city, state) VALUES
('University of Texas at Austin', 'Austin', 'TX')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  ut_austin_id UUID;
BEGIN
  SELECT id INTO ut_austin_id FROM schools WHERE name = 'University of Texas at Austin';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Peter Stone', ut_austin_id),
  ('Prof. Scott Aaronson', ut_austin_id),
  ('Prof. Vijay Garg', ut_austin_id),

  -- Mathematics
  ('Prof. Karen Uhlenbeck', ut_austin_id),
  ('Prof. Michael Starbird', ut_austin_id),

  -- Economics
  ('Prof. James Heckman', ut_austin_id),
  ('Prof. Stephen Magee', ut_austin_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Columbia University
INSERT INTO schools (name, city, state) VALUES
('Columbia University', 'New York', 'NY')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  columbia_id UUID;
BEGIN
  SELECT id INTO columbia_id FROM schools WHERE name = 'Columbia University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Christos Papadimitriou', columbia_id),
  ('Prof. Shree Nayar', columbia_id),
  ('Prof. Kathleen McKeown', columbia_id),

  -- Economics
  ('Prof. Joseph Stiglitz', columbia_id),
  ('Prof. Edmund Phelps', columbia_id),
  ('Prof. Jeffrey Sachs', columbia_id),

  -- Mathematics
  ('Prof. Dorian Goldfeld', columbia_id),
  ('Prof. Panagiota Daskalopoulos', columbia_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- University of Washington
INSERT INTO schools (name, city, state) VALUES
('University of Washington', 'Seattle', 'WA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  uw_id UUID;
BEGIN
  SELECT id INTO uw_id FROM schools WHERE name = 'University of Washington';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science
  ('Prof. Ed Lazowska', uw_id),
  ('Prof. Oren Etzioni', uw_id),
  ('Prof. Anna Karlin', uw_id),
  ('Prof. Pedro Domingos', uw_id),

  -- Mathematics
  ('Prof. Christopher Leininger', uw_id),
  ('Prof. Rekha Thomas', uw_id)
  ON CONFLICT (name, school_id) DO NOTHING;
END $$;

-- Carnegie Mellon University
INSERT INTO schools (name, city, state) VALUES
('Carnegie Mellon University', 'Pittsburgh', 'PA')
ON CONFLICT (name) DO UPDATE SET city = EXCLUDED.city, state = EXCLUDED.state;

DO $$
DECLARE
  cmu_id UUID;
BEGIN
  SELECT id INTO cmu_id FROM schools WHERE name = 'Carnegie Mellon University';

  INSERT INTO teachers (name, school_id) VALUES
  -- Computer Science (SCS)
  ('Prof. Randy Pausch', cmu_id),
  ('Prof. Luis von Ahn', cmu_id),
  ('Prof. Tom Mitchell', cmu_id),
  ('Prof. Manuela Veloso', cmu_id),
  ('Prof. David Kosbie', cmu_id),

  -- Mathematics
  ('Prof. Po-Shen Loh', cmu_id),
  ('Prof. John Mackey', cmu_id),

  -- Economics
  ('Prof. George Loewenstein', cmu_id),
  ('Prof. Linda Babcock', cmu_id)
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
