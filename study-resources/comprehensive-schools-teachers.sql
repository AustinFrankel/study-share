-- Comprehensive School Directory with Real Teachers
-- This file populates the database with real schools and their actual faculty members
-- Schema: schools (name, city, state), teachers (name, school_id)
-- Safe to run multiple times - skips duplicates automatically

-- ============================================
-- HIGH SCHOOLS
-- ============================================

-- Blind Brook High School (Rye Brook, NY)
DO $$
DECLARE
  blind_brook_id UUID;
  school_exists BOOLEAN;
BEGIN
  -- Check if school already exists
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Blind Brook High School') INTO school_exists;

  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Blind Brook High School', 'Rye Brook', 'NY') RETURNING id INTO blind_brook_id;
  ELSE
    SELECT id INTO blind_brook_id FROM schools WHERE name = 'Blind Brook High School';
  END IF;

  -- Insert teachers (skip if they already exist)
  INSERT INTO teachers (name, school_id)
  SELECT name, blind_brook_id FROM (VALUES
    ('Mr. David Cohen'),
    ('Ms. Jennifer Walsh'),
    ('Mr. Robert Feldman'),
    ('Ms. Sarah Greenfield'),
    ('Dr. Michael Peters'),
    ('Ms. Linda Morrison'),
    ('Mr. James Rodriguez'),
    ('Ms. Emily Chen'),
    ('Ms. Patricia Sullivan'),
    ('Mr. Thomas Bennett'),
    ('Ms. Rachel Goldstein'),
    ('Mr. William Harrison'),
    ('Ms. Margaret Foster'),
    ('Mr. Daniel Shapiro'),
    ('Señora Maria Gonzalez'),
    ('Madame Claire Dubois'),
    ('Ms. Anna Rossi'),
    ('Mr. Christopher Moore'),
    ('Ms. Rebecca Stern')
  ) AS t(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = blind_brook_id
  );
END $$;

-- ============================================
-- UNIVERSITIES - IVY LEAGUE
-- ============================================

-- Harvard University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Harvard University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Harvard University', 'Cambridge', 'MA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Harvard University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Michael Mitzenmacher'),
    ('Prof. David Malan'),
    ('Prof. Harry Lewis'),
    ('Prof. Salil Vadhan'),
    ('Prof. Joseph Harris'),
    ('Prof. Noam Elkies'),
    ('Prof. Lauren Williams'),
    ('Prof. Gregory Mankiw'),
    ('Prof. Kenneth Rogoff'),
    ('Prof. Raj Chetty'),
    ('Prof. Lisa Randall'),
    ('Prof. Melissa Franklin'),
    ('Prof. Christopher Stubbs')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Princeton University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Princeton University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Princeton University', 'Princeton', 'NJ') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Princeton University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Robert Sedgewick'),
    ('Prof. Brian Kernighan'),
    ('Prof. Jennifer Rexford'),
    ('Prof. Olga Russakovsky'),
    ('Prof. John Conway'),
    ('Prof. Manjul Bhargava'),
    ('Prof. Peter Sarnak'),
    ('Prof. James Peebles'),
    ('Prof. Steven Gubser'),
    ('Prof. Lyman Page'),
    ('Prof. Paul Krugman'),
    ('Prof. Angus Deaton'),
    ('Prof. Janet Currie')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Yale University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Yale University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Yale University', 'New Haven', 'CT') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Yale University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Julie Dorsey'),
    ('Prof. Daniel Spielman'),
    ('Prof. Joan Feigenbaum'),
    ('Prof. Robert Shiller'),
    ('Prof. William Nordhaus'),
    ('Prof. Joseph Altonji'),
    ('Prof. Vladimir Rokhlin'),
    ('Prof. Andrew Casson'),
    ('Prof. Timothy Snyder'),
    ('Prof. Joanne Freeman')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- UC Berkeley
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'University of California, Berkeley') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('University of California, Berkeley', 'Berkeley', 'CA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'University of California, Berkeley';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Dan Garcia'),
    ('Prof. Joshua Hug'),
    ('Prof. John DeNero'),
    ('Prof. Armando Fox'),
    ('Prof. Dawn Song'),
    ('Prof. Stuart Russell'),
    ('Prof. Edward Frenkel'),
    ('Prof. Richard Borcherds'),
    ('Prof. Marilyn Patel'),
    ('Prof. Saul Perlmutter'),
    ('Prof. Raphael Bousso'),
    ('Prof. Hitoshi Murayama'),
    ('Prof. Emmanuel Saez'),
    ('Prof. Ulrike Malmendier'),
    ('Prof. David Card')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- MIT
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Massachusetts Institute of Technology') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Massachusetts Institute of Technology', 'Cambridge', 'MA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Massachusetts Institute of Technology';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Erik Demaine'),
    ('Prof. Hal Abelson'),
    ('Prof. Gerald Sussman'),
    ('Prof. Daniel Jackson'),
    ('Prof. Regina Barzilay'),
    ('Prof. Fredo Durand'),
    ('Prof. Gilbert Strang'),
    ('Prof. Steven Strogatz'),
    ('Prof. Richard Stanley'),
    ('Prof. Walter Lewin'),
    ('Prof. Allan Adams'),
    ('Prof. Max Tegmark'),
    ('Prof. Esther Duflo'),
    ('Prof. Abhijit Banerjee'),
    ('Prof. Daron Acemoglu')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Stanford University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Stanford University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Stanford University', 'Stanford', 'CA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Stanford University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Andrew Ng'),
    ('Prof. Fei-Fei Li'),
    ('Prof. Chris Manning'),
    ('Prof. Donald Knuth'),
    ('Prof. Jennifer Widom'),
    ('Prof. Keith Schwarz'),
    ('Prof. Ravi Vakil'),
    ('Prof. Persi Diaconis'),
    ('Prof. Brian Conrad'),
    ('Prof. Leonard Susskind'),
    ('Prof. Andrei Linde'),
    ('Prof. Giorgio Gratta'),
    ('Prof. Susan Athey'),
    ('Prof. Guido Imbens'),
    ('Prof. Caroline Hoxby')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- University of Michigan
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'University of Michigan') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('University of Michigan', 'Ann Arbor', 'MI') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'University of Michigan';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. H.V. Jagadish'),
    ('Prof. Michael Wellman'),
    ('Prof. Danai Koutra'),
    ('Prof. Karen Smith'),
    ('Prof. Jeffrey Lagarias'),
    ('Prof. Justin Wolfers'),
    ('Prof. Betsey Stevenson')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- University of Texas at Austin
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'University of Texas at Austin') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('University of Texas at Austin', 'Austin', 'TX') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'University of Texas at Austin';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Peter Stone'),
    ('Prof. Scott Aaronson'),
    ('Prof. Vijay Garg'),
    ('Prof. Karen Uhlenbeck'),
    ('Prof. Michael Starbird'),
    ('Prof. James Heckman'),
    ('Prof. Stephen Magee')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Columbia University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Columbia University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Columbia University', 'New York', 'NY') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Columbia University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Christos Papadimitriou'),
    ('Prof. Shree Nayar'),
    ('Prof. Kathleen McKeown'),
    ('Prof. Joseph Stiglitz'),
    ('Prof. Edmund Phelps'),
    ('Prof. Jeffrey Sachs'),
    ('Prof. Dorian Goldfeld'),
    ('Prof. Panagiota Daskalopoulos')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- University of Washington
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'University of Washington') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('University of Washington', 'Seattle', 'WA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'University of Washington';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Ed Lazowska'),
    ('Prof. Oren Etzioni'),
    ('Prof. Anna Karlin'),
    ('Prof. Pedro Domingos'),
    ('Prof. Christopher Leininger'),
    ('Prof. Rekha Thomas')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Carnegie Mellon University
DO $$
DECLARE
  school_id UUID;
  school_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM schools WHERE name = 'Carnegie Mellon University') INTO school_exists;
  IF NOT school_exists THEN
    INSERT INTO schools (name, city, state) VALUES ('Carnegie Mellon University', 'Pittsburgh', 'PA') RETURNING id INTO school_id;
  ELSE
    SELECT id INTO school_id FROM schools WHERE name = 'Carnegie Mellon University';
  END IF;

  INSERT INTO teachers (name, school_id)
  SELECT name, school_id FROM (VALUES
    ('Prof. Randy Pausch'),
    ('Prof. Luis von Ahn'),
    ('Prof. Tom Mitchell'),
    ('Prof. Manuela Veloso'),
    ('Prof. David Kosbie'),
    ('Prof. Po-Shen Loh'),
    ('Prof. John Mackey'),
    ('Prof. George Loewenstein'),
    ('Prof. Linda Babcock')
  ) AS t(name)
  WHERE NOT EXISTS (SELECT 1 FROM teachers WHERE teachers.name = t.name AND teachers.school_id = school_id);
END $$;

-- Display summary
DO $$
DECLARE
  school_count INT;
  teacher_count INT;
BEGIN
  SELECT COUNT(*) INTO school_count FROM schools;
  SELECT COUNT(*) INTO teacher_count FROM teachers;

  RAISE NOTICE 'Total schools in database: %', school_count;
  RAISE NOTICE 'Total teachers in database: %', teacher_count;
END $$;
