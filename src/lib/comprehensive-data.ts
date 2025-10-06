// Use Web Crypto UUIDs to remain browser-friendly without bundling node uuid
const generateId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`

// Comprehensive list of US colleges and universities
export const US_COLLEGES = [
  // Top Universities
  { name: 'Harvard University', city: 'Cambridge', state: 'MA' },
  { name: 'Stanford University', city: 'Stanford', state: 'CA' },
  { name: 'MIT', city: 'Cambridge', state: 'MA' },
  { name: 'California Institute of Technology', city: 'Pasadena', state: 'CA' },
  { name: 'University of Chicago', city: 'Chicago', state: 'IL' },
  { name: 'Princeton University', city: 'Princeton', state: 'NJ' },
  { name: 'Yale University', city: 'New Haven', state: 'CT' },
  { name: 'Columbia University', city: 'New York', state: 'NY' },
  { name: 'University of Pennsylvania', city: 'Philadelphia', state: 'PA' },
  { name: 'Duke University', city: 'Durham', state: 'NC' },
  
  // UC System
  { name: 'University of California, Berkeley', city: 'Berkeley', state: 'CA' },
  { name: 'University of California, Los Angeles', city: 'Los Angeles', state: 'CA' },
  { name: 'University of California, San Diego', city: 'San Diego', state: 'CA' },
  { name: 'University of California, Davis', city: 'Davis', state: 'CA' },
  { name: 'University of California, Irvine', city: 'Irvine', state: 'CA' },
  { name: 'University of California, Santa Barbara', city: 'Santa Barbara', state: 'CA' },
  { name: 'University of California, Santa Cruz', city: 'Santa Cruz', state: 'CA' },
  { name: 'University of California, Riverside', city: 'Riverside', state: 'CA' },
  { name: 'University of California, Merced', city: 'Merced', state: 'CA' },
  
  // State Universities
  { name: 'University of Michigan', city: 'Ann Arbor', state: 'MI' },
  { name: 'University of Virginia', city: 'Charlottesville', state: 'VA' },
  { name: 'University of North Carolina at Chapel Hill', city: 'Chapel Hill', state: 'NC' },
  { name: 'University of Texas at Austin', city: 'Austin', state: 'TX' },
  { name: 'University of Wisconsin-Madison', city: 'Madison', state: 'WI' },
  { name: 'University of Illinois at Urbana-Champaign', city: 'Champaign', state: 'IL' },
  { name: 'Ohio State University', city: 'Columbus', state: 'OH' },
  { name: 'Pennsylvania State University', city: 'University Park', state: 'PA' },
  { name: 'University of Florida', city: 'Gainesville', state: 'FL' },
  { name: 'University of Washington', city: 'Seattle', state: 'WA' },
  
  // Tech Schools
  { name: 'Georgia Institute of Technology', city: 'Atlanta', state: 'GA' },
  { name: 'Carnegie Mellon University', city: 'Pittsburgh', state: 'PA' },
  { name: 'University of California San Francisco', city: 'San Francisco', state: 'CA' },
  { name: 'Johns Hopkins University', city: 'Baltimore', state: 'MD' },
  { name: 'Northwestern University', city: 'Evanston', state: 'IL' },
  
  // Liberal Arts
  { name: 'Williams College', city: 'Williamstown', state: 'MA' },
  { name: 'Amherst College', city: 'Amherst', state: 'MA' },
  { name: 'Swarthmore College', city: 'Swarthmore', state: 'PA' },
  { name: 'Wellesley College', city: 'Wellesley', state: 'MA' },
  { name: 'Bowdoin College', city: 'Brunswick', state: 'ME' },
  { name: 'Middlebury College', city: 'Middlebury', state: 'VT' },
  { name: 'Carleton College', city: 'Northfield', state: 'MN' },
  { name: 'Pomona College', city: 'Claremont', state: 'CA' },
  
  // More Major Universities
  { name: 'New York University', city: 'New York', state: 'NY' },
  { name: 'Boston University', city: 'Boston', state: 'MA' },
  { name: 'University of Southern California', city: 'Los Angeles', state: 'CA' },
  { name: 'Vanderbilt University', city: 'Nashville', state: 'TN' },
  { name: 'Rice University', city: 'Houston', state: 'TX' },
  { name: 'Emory University', city: 'Atlanta', state: 'GA' },
  { name: 'Notre Dame', city: 'South Bend', state: 'IN' },
  { name: 'Washington University in St. Louis', city: 'St. Louis', state: 'MO' },
  
  // State Schools
  { name: 'Arizona State University', city: 'Tempe', state: 'AZ' },
  { name: 'University of Arizona', city: 'Tucson', state: 'AZ' },
  { name: 'University of Colorado Boulder', city: 'Boulder', state: 'CO' },
  { name: 'University of Oregon', city: 'Eugene', state: 'OR' },
  { name: 'Oregon State University', city: 'Corvallis', state: 'OR' },
  { name: 'University of Utah', city: 'Salt Lake City', state: 'UT' },
  { name: 'University of Nevada Las Vegas', city: 'Las Vegas', state: 'NV' },
  { name: 'University of New Mexico', city: 'Albuquerque', state: 'NM' },
  
  // East Coast
  { name: 'Boston College', city: 'Chestnut Hill', state: 'MA' },
  { name: 'Tufts University', city: 'Medford', state: 'MA' },
  { name: 'Brandeis University', city: 'Waltham', state: 'MA' },
  { name: 'Brown University', city: 'Providence', state: 'RI' },
  { name: 'Dartmouth College', city: 'Hanover', state: 'NH' },
  { name: 'University of Vermont', city: 'Burlington', state: 'VT' },
  { name: 'University of Maine', city: 'Orono', state: 'ME' },
  { name: 'University of Connecticut', city: 'Storrs', state: 'CT' },
  { name: 'Rutgers University', city: 'New Brunswick', state: 'NJ' },
  { name: 'University of Delaware', city: 'Newark', state: 'DE' },
  { name: 'University of Maryland', city: 'College Park', state: 'MD' },
  { name: 'Virginia Tech', city: 'Blacksburg', state: 'VA' },
  { name: 'James Madison University', city: 'Harrisonburg', state: 'VA' },
  
  // Southeast
  { name: 'University of Miami', city: 'Coral Gables', state: 'FL' },
  { name: 'Florida State University', city: 'Tallahassee', state: 'FL' },
  { name: 'University of Central Florida', city: 'Orlando', state: 'FL' },
  { name: 'Florida International University', city: 'Miami', state: 'FL' },
  { name: 'University of Georgia', city: 'Athens', state: 'GA' },
  { name: 'Georgia State University', city: 'Atlanta', state: 'GA' },
  { name: 'University of South Carolina', city: 'Columbia', state: 'SC' },
  { name: 'Clemson University', city: 'Clemson', state: 'SC' },
  { name: 'Wake Forest University', city: 'Winston-Salem', state: 'NC' },
  { name: 'North Carolina State University', city: 'Raleigh', state: 'NC' },
  { name: 'University of Tennessee', city: 'Knoxville', state: 'TN' },
  { name: 'University of Kentucky', city: 'Lexington', state: 'KY' },
  { name: 'University of Alabama', city: 'Tuscaloosa', state: 'AL' },
  { name: 'Auburn University', city: 'Auburn', state: 'AL' },
  { name: 'University of Mississippi', city: 'Oxford', state: 'MS' },
  { name: 'Mississippi State University', city: 'Starkville', state: 'MS' },
  { name: 'Louisiana State University', city: 'Baton Rouge', state: 'LA' },
  { name: 'University of Arkansas', city: 'Fayetteville', state: 'AR' },
  
  // Midwest
  { name: 'University of Minnesota', city: 'Minneapolis', state: 'MN' },
  { name: 'University of Iowa', city: 'Iowa City', state: 'IA' },
  { name: 'Iowa State University', city: 'Ames', state: 'IA' },
  { name: 'University of Nebraska', city: 'Lincoln', state: 'NE' },
  { name: 'University of Kansas', city: 'Lawrence', state: 'KS' },
  { name: 'Kansas State University', city: 'Manhattan', state: 'KS' },
  { name: 'University of Missouri', city: 'Columbia', state: 'MO' },
  { name: 'Indiana University', city: 'Bloomington', state: 'IN' },
  { name: 'Purdue University', city: 'West Lafayette', state: 'IN' },
  { name: 'Michigan State University', city: 'East Lansing', state: 'MI' },
  { name: 'University of Wisconsin-Milwaukee', city: 'Milwaukee', state: 'WI' },
  
  // Southwest/West
  { name: 'University of Texas at Dallas', city: 'Richardson', state: 'TX' },
  { name: 'Texas A&M University', city: 'College Station', state: 'TX' },
  { name: 'University of Houston', city: 'Houston', state: 'TX' },
  { name: 'Texas Tech University', city: 'Lubbock', state: 'TX' },
  { name: 'Baylor University', city: 'Waco', state: 'TX' },
  { name: 'Southern Methodist University', city: 'Dallas', state: 'TX' },
  { name: 'University of Oklahoma', city: 'Norman', state: 'OK' },
  { name: 'Oklahoma State University', city: 'Stillwater', state: 'OK' },
  
  // Community Colleges & Regional
  { name: 'American University', city: 'Washington', state: 'DC' },
  { name: 'George Washington University', city: 'Washington', state: 'DC' },
  { name: 'Georgetown University', city: 'Washington', state: 'DC' },
  { name: 'Howard University', city: 'Washington', state: 'DC' },
  
  // More California Schools
  { name: 'San Diego State University', city: 'San Diego', state: 'CA' },
  { name: 'California State University, Long Beach', city: 'Long Beach', state: 'CA' },
  { name: 'California State University, Los Angeles', city: 'Los Angeles', state: 'CA' },
  { name: 'San Francisco State University', city: 'San Francisco', state: 'CA' },
  { name: 'California Polytechnic State University', city: 'San Luis Obispo', state: 'CA' },
  { name: 'California State Polytechnic University, Pomona', city: 'Pomona', state: 'CA' },
  { name: 'University of the Pacific', city: 'Stockton', state: 'CA' },
  { name: 'Santa Clara University', city: 'Santa Clara', state: 'CA' },
  { name: 'Pepperdine University', city: 'Malibu', state: 'CA' },
  { name: 'Loyola Marymount University', city: 'Los Angeles', state: 'CA' }
]

// Common class subjects and topics
export const COMPREHENSIVE_CLASSES = [
  // Mathematics
  { title: 'Calculus I', code: 'MATH 141', subject: 'Mathematics' },
  { title: 'Calculus II', code: 'MATH 142', subject: 'Mathematics' },
  { title: 'Calculus III', code: 'MATH 241', subject: 'Mathematics' },
  { title: 'Multivariable Calculus', code: 'MATH 243', subject: 'Mathematics' },
  { title: 'Differential Equations', code: 'MATH 246', subject: 'Mathematics' },
  { title: 'Linear Algebra', code: 'MATH 221', subject: 'Mathematics' },
  { title: 'Statistics', code: 'STAT 200', subject: 'Mathematics' },
  { title: 'Probability Theory', code: 'STAT 400', subject: 'Mathematics' },
  { title: 'Discrete Mathematics', code: 'MATH 213', subject: 'Mathematics' },
  { title: 'Abstract Algebra', code: 'MATH 403', subject: 'Mathematics' },
  { title: 'Real Analysis', code: 'MATH 421', subject: 'Mathematics' },
  { title: 'Complex Analysis', code: 'MATH 424', subject: 'Mathematics' },
  { title: 'Number Theory', code: 'MATH 312', subject: 'Mathematics' },
  { title: 'Topology', code: 'MATH 425', subject: 'Mathematics' },
  { title: 'Mathematical Logic', code: 'MATH 318', subject: 'Mathematics' },
  
  // Computer Science
  { title: 'Introduction to Computer Science', code: 'CS 101', subject: 'Computer Science' },
  { title: 'Programming Fundamentals', code: 'CS 110', subject: 'Computer Science' },
  { title: 'Data Structures', code: 'CS 225', subject: 'Computer Science' },
  { title: 'Algorithms', code: 'CS 374', subject: 'Computer Science' },
  { title: 'Computer Systems', code: 'CS 241', subject: 'Computer Science' },
  { title: 'Operating Systems', code: 'CS 341', subject: 'Computer Science' },
  { title: 'Database Systems', code: 'CS 411', subject: 'Computer Science' },
  { title: 'Computer Networks', code: 'CS 438', subject: 'Computer Science' },
  { title: 'Software Engineering', code: 'CS 427', subject: 'Computer Science' },
  { title: 'Machine Learning', code: 'CS 440', subject: 'Computer Science' },
  { title: 'Artificial Intelligence', code: 'CS 440', subject: 'Computer Science' },
  { title: 'Computer Graphics', code: 'CS 418', subject: 'Computer Science' },
  { title: 'Human-Computer Interaction', code: 'CS 465', subject: 'Computer Science' },
  { title: 'Cybersecurity', code: 'CS 461', subject: 'Computer Science' },
  { title: 'Theory of Computation', code: 'CS 373', subject: 'Computer Science' },
  { title: 'Programming Languages', code: 'CS 421', subject: 'Computer Science' },
  { title: 'Compilers', code: 'CS 426', subject: 'Computer Science' },
  { title: 'Distributed Systems', code: 'CS 425', subject: 'Computer Science' },
  { title: 'Mobile App Development', code: 'CS 442', subject: 'Computer Science' },
  { title: 'Web Development', code: 'CS 409', subject: 'Computer Science' },
  
  // Physics
  { title: 'Physics I: Mechanics', code: 'PHYS 211', subject: 'Physics' },
  { title: 'Physics II: Electricity & Magnetism', code: 'PHYS 212', subject: 'Physics' },
  { title: 'Physics III: Thermal Physics', code: 'PHYS 213', subject: 'Physics' },
  { title: 'Modern Physics', code: 'PHYS 214', subject: 'Physics' },
  { title: 'Quantum Mechanics I', code: 'PHYS 485', subject: 'Physics' },
  { title: 'Quantum Mechanics II', code: 'PHYS 486', subject: 'Physics' },
  { title: 'Classical Mechanics', code: 'PHYS 325', subject: 'Physics' },
  { title: 'Electrodynamics', code: 'PHYS 435', subject: 'Physics' },
  { title: 'Thermodynamics', code: 'PHYS 427', subject: 'Physics' },
  { title: 'Statistical Mechanics', code: 'PHYS 428', subject: 'Physics' },
  { title: 'Optics', code: 'PHYS 402', subject: 'Physics' },
  { title: 'Solid State Physics', code: 'PHYS 460', subject: 'Physics' },
  { title: 'Nuclear Physics', code: 'PHYS 446', subject: 'Physics' },
  { title: 'Particle Physics', code: 'PHYS 447', subject: 'Physics' },
  { title: 'Astrophysics', code: 'PHYS 419', subject: 'Physics' },
  
  // Chemistry
  { title: 'General Chemistry I', code: 'CHEM 102', subject: 'Chemistry' },
  { title: 'General Chemistry II', code: 'CHEM 103', subject: 'Chemistry' },
  { title: 'Organic Chemistry I', code: 'CHEM 232', subject: 'Chemistry' },
  { title: 'Organic Chemistry II', code: 'CHEM 233', subject: 'Chemistry' },
  { title: 'Physical Chemistry I', code: 'CHEM 340', subject: 'Chemistry' },
  { title: 'Physical Chemistry II', code: 'CHEM 341', subject: 'Chemistry' },
  { title: 'Inorganic Chemistry', code: 'CHEM 302', subject: 'Chemistry' },
  { title: 'Analytical Chemistry', code: 'CHEM 318', subject: 'Chemistry' },
  { title: 'Biochemistry I', code: 'CHEM 352', subject: 'Chemistry' },
  { title: 'Biochemistry II', code: 'CHEM 353', subject: 'Chemistry' },
  { title: 'Environmental Chemistry', code: 'CHEM 421', subject: 'Chemistry' },
  { title: 'Materials Chemistry', code: 'CHEM 444', subject: 'Chemistry' },
  { title: 'Medicinal Chemistry', code: 'CHEM 455', subject: 'Chemistry' },
  
  // Biology
  { title: 'General Biology I', code: 'BIOL 150', subject: 'Biology' },
  { title: 'General Biology II', code: 'BIOL 151', subject: 'Biology' },
  { title: 'Cell Biology', code: 'BIOL 244', subject: 'Biology' },
  { title: 'Molecular Biology', code: 'BIOL 345', subject: 'Biology' },
  { title: 'Genetics', code: 'BIOL 285', subject: 'Biology' },
  { title: 'Evolution', code: 'BIOL 335', subject: 'Biology' },
  { title: 'Ecology', code: 'BIOL 340', subject: 'Biology' },
  { title: 'Microbiology', code: 'BIOL 330', subject: 'Biology' },
  { title: 'Immunology', code: 'BIOL 414', subject: 'Biology' },
  { title: 'Developmental Biology', code: 'BIOL 415', subject: 'Biology' },
  { title: 'Neuroscience', code: 'BIOL 416', subject: 'Biology' },
  { title: 'Marine Biology', code: 'BIOL 370', subject: 'Biology' },
  { title: 'Plant Biology', code: 'BIOL 325', subject: 'Biology' },
  { title: 'Animal Behavior', code: 'BIOL 365', subject: 'Biology' },
  { title: 'Conservation Biology', code: 'BIOL 448', subject: 'Biology' },
  
  // Engineering
  { title: 'Introduction to Engineering', code: 'ENG 100', subject: 'Engineering' },
  { title: 'Engineering Graphics', code: 'ENG 102', subject: 'Engineering' },
  { title: 'Statics', code: 'CE 201', subject: 'Engineering' },
  { title: 'Dynamics', code: 'ME 230', subject: 'Engineering' },
  { title: 'Thermodynamics', code: 'ME 200', subject: 'Engineering' },
  { title: 'Fluid Mechanics', code: 'CE 330', subject: 'Engineering' },
  { title: 'Materials Science', code: 'MSE 280', subject: 'Engineering' },
  { title: 'Circuit Analysis', code: 'ECE 210', subject: 'Engineering' },
  { title: 'Digital Logic Design', code: 'ECE 290', subject: 'Engineering' },
  { title: 'Signals and Systems', code: 'ECE 310', subject: 'Engineering' },
  { title: 'Control Systems', code: 'ECE 486', subject: 'Engineering' },
  { title: 'Power Systems', code: 'ECE 476', subject: 'Engineering' },
  { title: 'Structural Analysis', code: 'CE 360', subject: 'Engineering' },
  { title: 'Environmental Engineering', code: 'CEE 450', subject: 'Engineering' },
  { title: 'Transportation Engineering', code: 'CEE 310', subject: 'Engineering' },
  
  // Economics
  { title: 'Principles of Microeconomics', code: 'ECON 102', subject: 'Economics' },
  { title: 'Principles of Macroeconomics', code: 'ECON 103', subject: 'Economics' },
  { title: 'Intermediate Microeconomics', code: 'ECON 301', subject: 'Economics' },
  { title: 'Intermediate Macroeconomics', code: 'ECON 302', subject: 'Economics' },
  { title: 'Econometrics', code: 'ECON 471', subject: 'Economics' },
  { title: 'International Economics', code: 'ECON 440', subject: 'Economics' },
  { title: 'Labor Economics', code: 'ECON 414', subject: 'Economics' },
  { title: 'Public Economics', code: 'ECON 420', subject: 'Economics' },
  { title: 'Industrial Organization', code: 'ECON 435', subject: 'Economics' },
  { title: 'Game Theory', code: 'ECON 469', subject: 'Economics' },
  { title: 'Development Economics', code: 'ECON 460', subject: 'Economics' },
  { title: 'Monetary Economics', code: 'ECON 442', subject: 'Economics' },
  { title: 'Financial Economics', code: 'ECON 441', subject: 'Economics' },
  { title: 'Environmental Economics', code: 'ECON 424', subject: 'Economics' },
  
  // Psychology
  { title: 'Introduction to Psychology', code: 'PSYC 100', subject: 'Psychology' },
  { title: 'Research Methods in Psychology', code: 'PSYC 235', subject: 'Psychology' },
  { title: 'Statistics for Psychology', code: 'PSYC 245', subject: 'Psychology' },
  { title: 'Cognitive Psychology', code: 'PSYC 335', subject: 'Psychology' },
  { title: 'Social Psychology', code: 'PSYC 240', subject: 'Psychology' },
  { title: 'Developmental Psychology', code: 'PSYC 216', subject: 'Psychology' },
  { title: 'Abnormal Psychology', code: 'PSYC 238', subject: 'Psychology' },
  { title: 'Personality Psychology', code: 'PSYC 360', subject: 'Psychology' },
  { title: 'Biological Psychology', code: 'PSYC 248', subject: 'Psychology' },
  { title: 'Learning and Memory', code: 'PSYC 350', subject: 'Psychology' },
  { title: 'Sensation and Perception', code: 'PSYC 230', subject: 'Psychology' },
  { title: 'Health Psychology', code: 'PSYC 306', subject: 'Psychology' },
  { title: 'Clinical Psychology', code: 'PSYC 440', subject: 'Psychology' },
  
  // History
  { title: 'World History I', code: 'HIST 111', subject: 'History' },
  { title: 'World History II', code: 'HIST 112', subject: 'History' },
  { title: 'US History I', code: 'HIST 151', subject: 'History' },
  { title: 'US History II', code: 'HIST 152', subject: 'History' },
  { title: 'European History', code: 'HIST 241', subject: 'History' },
  { title: 'Ancient History', code: 'HIST 181', subject: 'History' },
  { title: 'Medieval History', code: 'HIST 282', subject: 'History' },
  { title: 'Renaissance History', code: 'HIST 383', subject: 'History' },
  { title: 'Modern European History', code: 'HIST 342', subject: 'History' },
  { title: 'American Civil War', code: 'HIST 354', subject: 'History' },
  { title: 'World War II', code: 'HIST 456', subject: 'History' },
  { title: 'Cold War History', code: 'HIST 457', subject: 'History' },
  { title: 'African American History', code: 'HIST 355', subject: 'History' },
  { title: 'Women\'s History', code: 'HIST 356', subject: 'History' },
  
  // Business
  { title: 'Introduction to Business', code: 'BUS 101', subject: 'Business' },
  { title: 'Financial Accounting', code: 'ACCT 201', subject: 'Business' },
  { title: 'Managerial Accounting', code: 'ACCT 202', subject: 'Business' },
  { title: 'Corporate Finance', code: 'FIN 300', subject: 'Business' },
  { title: 'Investments', code: 'FIN 321', subject: 'Business' },
  { title: 'Marketing Principles', code: 'MKT 300', subject: 'Business' },
  { title: 'Operations Management', code: 'MGMT 340', subject: 'Business' },
  { title: 'Organizational Behavior', code: 'MGMT 301', subject: 'Business' },
  { title: 'Strategic Management', code: 'MGMT 490', subject: 'Business' },
  { title: 'International Business', code: 'BUS 450', subject: 'Business' },
  { title: 'Entrepreneurship', code: 'MGMT 370', subject: 'Business' },
  { title: 'Business Law', code: 'BUS 250', subject: 'Business' },
  { title: 'Business Ethics', code: 'BUS 200', subject: 'Business' },
  
  // English & Literature
  { title: 'English Composition I', code: 'ENGL 101', subject: 'English' },
  { title: 'English Composition II', code: 'ENGL 102', subject: 'English' },
  { title: 'American Literature I', code: 'ENGL 251', subject: 'English' },
  { title: 'American Literature II', code: 'ENGL 252', subject: 'English' },
  { title: 'British Literature I', code: 'ENGL 261', subject: 'English' },
  { title: 'British Literature II', code: 'ENGL 262', subject: 'English' },
  { title: 'Shakespeare', code: 'ENGL 363', subject: 'English' },
  { title: 'Creative Writing', code: 'ENGL 280', subject: 'English' },
  { title: 'Technical Writing', code: 'ENGL 302', subject: 'English' },
  { title: 'World Literature', code: 'ENGL 271', subject: 'English' },
  { title: 'Modern Poetry', code: 'ENGL 385', subject: 'English' },
  { title: 'Contemporary Fiction', code: 'ENGL 487', subject: 'English' },
  
  // Philosophy
  { title: 'Introduction to Philosophy', code: 'PHIL 101', subject: 'Philosophy' },
  { title: 'Logic', code: 'PHIL 103', subject: 'Philosophy' },
  { title: 'Ethics', code: 'PHIL 105', subject: 'Philosophy' },
  { title: 'Political Philosophy', code: 'PHIL 207', subject: 'Philosophy' },
  { title: 'Philosophy of Mind', code: 'PHIL 340', subject: 'Philosophy' },
  { title: 'Philosophy of Science', code: 'PHIL 365', subject: 'Philosophy' },
  { title: 'Ancient Philosophy', code: 'PHIL 301', subject: 'Philosophy' },
  { title: 'Modern Philosophy', code: 'PHIL 302', subject: 'Philosophy' },
  { title: 'Contemporary Philosophy', code: 'PHIL 403', subject: 'Philosophy' },
  { title: 'Philosophy of Religion', code: 'PHIL 208', subject: 'Philosophy' },
  
  // Art & Design
  { title: 'Art History Survey I', code: 'ART 111', subject: 'Art' },
  { title: 'Art History Survey II', code: 'ART 112', subject: 'Art' },
  { title: 'Drawing I', code: 'ART 130', subject: 'Art' },
  { title: 'Painting I', code: 'ART 140', subject: 'Art' },
  { title: 'Sculpture I', code: 'ART 150', subject: 'Art' },
  { title: 'Digital Art', code: 'ART 270', subject: 'Art' },
  { title: 'Graphic Design', code: 'ART 280', subject: 'Art' },
  { title: 'Photography I', code: 'ART 160', subject: 'Art' },
  { title: 'Ceramics I', code: 'ART 170', subject: 'Art' },
  { title: 'Printmaking', code: 'ART 180', subject: 'Art' }
]

// Generate schools with proper UUIDs
export function generateSchoolsWithUUIDs() {
  return US_COLLEGES.map(college => ({
    id: generateId(),
    name: college.name,
    city: college.city,
    state: college.state
  }))
}

// Generate classes with proper UUIDs
export function generateClassesWithUUIDs(teacherId: string, schoolId: string, subjectId: string) {
  return COMPREHENSIVE_CLASSES
    .filter(cls => cls.subject === getSubjectName(subjectId))
    .map(cls => ({
      id: generateId(),
      title: cls.title,
      code: cls.code,
      teacher_id: teacherId,
      school_id: schoolId,
      subject_id: subjectId,
      term: 'Fall 2024'
    }))
}

function getSubjectName(subjectId: string): string {
  const subjects: { [key: string]: string } = {
    'sub-math': 'Mathematics',
    'sub-cs': 'Computer Science',
    'sub-phys': 'Physics',
    'sub-chem': 'Chemistry',
    'sub-bio': 'Biology',
    'sub-eng': 'Engineering',
    'sub-econ': 'Economics',
    'sub-psyc': 'Psychology',
    'sub-hist': 'History',
    'sub-bus': 'Business',
    'sub-engl': 'English',
    'sub-phil': 'Philosophy',
    'sub-art': 'Art'
  }
  return subjects[subjectId] || 'Computer Science'
}

// Common subjects
export const COMPREHENSIVE_SUBJECTS = [
  { id: 'sub-math', name: 'Mathematics' },
  { id: 'sub-cs', name: 'Computer Science' },
  { id: 'sub-phys', name: 'Physics' },
  { id: 'sub-chem', name: 'Chemistry' },
  { id: 'sub-bio', name: 'Biology' },
  { id: 'sub-eng', name: 'Engineering' },
  { id: 'sub-econ', name: 'Economics' },
  { id: 'sub-psyc', name: 'Psychology' },
  { id: 'sub-hist', name: 'History' },
  { id: 'sub-bus', name: 'Business' },
  { id: 'sub-engl', name: 'English' },
  { id: 'sub-phil', name: 'Philosophy' },
  { id: 'sub-art', name: 'Art' },
  { id: 'sub-poli', name: 'Political Science' },
  { id: 'sub-soc', name: 'Sociology' },
  { id: 'sub-anthro', name: 'Anthropology' },
  { id: 'sub-geo', name: 'Geography' },
  { id: 'sub-foreign', name: 'Foreign Languages' },
  { id: 'sub-music', name: 'Music' },
  { id: 'sub-theatre', name: 'Theatre' },
  { id: 'sub-kines', name: 'Kinesiology' },
  { id: 'sub-env', name: 'Environmental Science' },
  { id: 'sub-comm', name: 'Communications' },
  { id: 'sub-journ', name: 'Journalism' }
]
