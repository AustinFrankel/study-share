import { supabase } from './supabase'

// Comprehensive list of major US colleges and universities
const US_COLLEGES = [
  // Ivy League
  { name: 'Harvard University', city: 'Cambridge', state: 'Massachusetts' },
  { name: 'Yale University', city: 'New Haven', state: 'Connecticut' },
  { name: 'Princeton University', city: 'Princeton', state: 'New Jersey' },
  { name: 'Columbia University', city: 'New York', state: 'New York' },
  { name: 'University of Pennsylvania', city: 'Philadelphia', state: 'Pennsylvania' },
  { name: 'Dartmouth College', city: 'Hanover', state: 'New Hampshire' },
  { name: 'Brown University', city: 'Providence', state: 'Rhode Island' },
  { name: 'Cornell University', city: 'Ithaca', state: 'New York' },

  // Top Public Universities
  { name: 'University of California, Berkeley', city: 'Berkeley', state: 'California' },
  { name: 'University of California, Los Angeles', city: 'Los Angeles', state: 'California' },
  { name: 'University of Michigan', city: 'Ann Arbor', state: 'Michigan' },
  { name: 'University of Virginia', city: 'Charlottesville', state: 'Virginia' },
  { name: 'University of North Carolina at Chapel Hill', city: 'Chapel Hill', state: 'North Carolina' },
  { name: 'University of California, San Diego', city: 'La Jolla', state: 'California' },
  { name: 'University of Florida', city: 'Gainesville', state: 'Florida' },
  { name: 'Georgia Institute of Technology', city: 'Atlanta', state: 'Georgia' },
  { name: 'University of Texas at Austin', city: 'Austin', state: 'Texas' },
  { name: 'University of Wisconsin-Madison', city: 'Madison', state: 'Wisconsin' },
  { name: 'University of Illinois at Urbana-Champaign', city: 'Urbana', state: 'Illinois' },
  { name: 'University of Washington', city: 'Seattle', state: 'Washington' },

  // Top Private Universities
  { name: 'Stanford University', city: 'Stanford', state: 'California' },
  { name: 'Massachusetts Institute of Technology', city: 'Cambridge', state: 'Massachusetts' },
  { name: 'California Institute of Technology', city: 'Pasadena', state: 'California' },
  { name: 'University of Chicago', city: 'Chicago', state: 'Illinois' },
  { name: 'Duke University', city: 'Durham', state: 'North Carolina' },
  { name: 'Northwestern University', city: 'Evanston', state: 'Illinois' },
  { name: 'Johns Hopkins University', city: 'Baltimore', state: 'Maryland' },
  { name: 'Washington University in St. Louis', city: 'St. Louis', state: 'Missouri' },
  { name: 'Vanderbilt University', city: 'Nashville', state: 'Tennessee' },
  { name: 'Rice University', city: 'Houston', state: 'Texas' },
  { name: 'Notre Dame', city: 'Notre Dame', state: 'Indiana' },
  { name: 'Carnegie Mellon University', city: 'Pittsburgh', state: 'Pennsylvania' },
  { name: 'Emory University', city: 'Atlanta', state: 'Georgia' },

  // State Universities by State
  { name: 'University of Alabama', city: 'Tuscaloosa', state: 'Alabama' },
  { name: 'Auburn University', city: 'Auburn', state: 'Alabama' },
  { name: 'University of Alaska Fairbanks', city: 'Fairbanks', state: 'Alaska' },
  { name: 'Arizona State University', city: 'Tempe', state: 'Arizona' },
  { name: 'University of Arizona', city: 'Tucson', state: 'Arizona' },
  { name: 'University of Arkansas', city: 'Fayetteville', state: 'Arkansas' },
  { name: 'University of California, Davis', city: 'Davis', state: 'California' },
  { name: 'University of California, Irvine', city: 'Irvine', state: 'California' },
  { name: 'University of California, Santa Barbara', city: 'Santa Barbara', state: 'California' },
  { name: 'San Diego State University', city: 'San Diego', state: 'California' },
  { name: 'University of Southern California', city: 'Los Angeles', state: 'California' },
  { name: 'Colorado State University', city: 'Fort Collins', state: 'Colorado' },
  { name: 'University of Colorado Boulder', city: 'Boulder', state: 'Colorado' },
  { name: 'University of Connecticut', city: 'Storrs', state: 'Connecticut' },
  { name: 'University of Delaware', city: 'Newark', state: 'Delaware' },
  { name: 'Florida State University', city: 'Tallahassee', state: 'Florida' },
  { name: 'University of Miami', city: 'Coral Gables', state: 'Florida' },
  { name: 'University of Georgia', city: 'Athens', state: 'Georgia' },
  { name: 'University of Hawaii at Manoa', city: 'Honolulu', state: 'Hawaii' },
  { name: 'Boise State University', city: 'Boise', state: 'Idaho' },
  { name: 'University of Idaho', city: 'Moscow', state: 'Idaho' },
  { name: 'Northwestern University', city: 'Evanston', state: 'Illinois' },
  { name: 'University of Illinois at Chicago', city: 'Chicago', state: 'Illinois' },
  { name: 'Purdue University', city: 'West Lafayette', state: 'Indiana' },
  { name: 'Indiana University', city: 'Bloomington', state: 'Indiana' },
  { name: 'Iowa State University', city: 'Ames', state: 'Iowa' },
  { name: 'University of Iowa', city: 'Iowa City', state: 'Iowa' },
  { name: 'University of Kansas', city: 'Lawrence', state: 'Kansas' },
  { name: 'Kansas State University', city: 'Manhattan', state: 'Kansas' },
  { name: 'University of Kentucky', city: 'Lexington', state: 'Kentucky' },
  { name: 'University of Louisville', city: 'Louisville', state: 'Kentucky' },
  { name: 'Louisiana State University', city: 'Baton Rouge', state: 'Louisiana' },
  { name: 'Tulane University', city: 'New Orleans', state: 'Louisiana' },
  { name: 'University of Maine', city: 'Orono', state: 'Maine' },
  { name: 'University of Maryland', city: 'College Park', state: 'Maryland' },
  { name: 'Boston University', city: 'Boston', state: 'Massachusetts' },
  { name: 'University of Massachusetts Amherst', city: 'Amherst', state: 'Massachusetts' },
  { name: 'Michigan State University', city: 'East Lansing', state: 'Michigan' },
  { name: 'University of Minnesota', city: 'Minneapolis', state: 'Minnesota' },
  { name: 'University of Mississippi', city: 'Oxford', state: 'Mississippi' },
  { name: 'Mississippi State University', city: 'Starkville', state: 'Mississippi' },
  { name: 'University of Missouri', city: 'Columbia', state: 'Missouri' },
  { name: 'University of Montana', city: 'Missoula', state: 'Montana' },
  { name: 'University of Nebraska-Lincoln', city: 'Lincoln', state: 'Nebraska' },
  { name: 'University of Nevada, Las Vegas', city: 'Las Vegas', state: 'Nevada' },
  { name: 'University of New Hampshire', city: 'Durham', state: 'New Hampshire' },
  { name: 'Rutgers University', city: 'New Brunswick', state: 'New Jersey' },
  { name: 'University of New Mexico', city: 'Albuquerque', state: 'New Mexico' },
  { name: 'New York University', city: 'New York', state: 'New York' },
  { name: 'SUNY Buffalo', city: 'Buffalo', state: 'New York' },
  { name: 'Syracuse University', city: 'Syracuse', state: 'New York' },
  { name: 'North Carolina State University', city: 'Raleigh', state: 'North Carolina' },
  { name: 'Duke University', city: 'Durham', state: 'North Carolina' },
  { name: 'University of North Dakota', city: 'Grand Forks', state: 'North Dakota' },
  { name: 'Ohio State University', city: 'Columbus', state: 'Ohio' },
  { name: 'University of Cincinnati', city: 'Cincinnati', state: 'Ohio' },
  { name: 'Case Western Reserve University', city: 'Cleveland', state: 'Ohio' },
  { name: 'University of Oklahoma', city: 'Norman', state: 'Oklahoma' },
  { name: 'Oklahoma State University', city: 'Stillwater', state: 'Oklahoma' },
  { name: 'University of Oregon', city: 'Eugene', state: 'Oregon' },
  { name: 'Oregon State University', city: 'Corvallis', state: 'Oregon' },
  { name: 'Pennsylvania State University', city: 'University Park', state: 'Pennsylvania' },
  { name: 'Temple University', city: 'Philadelphia', state: 'Pennsylvania' },
  { name: 'University of Rhode Island', city: 'Kingston', state: 'Rhode Island' },
  { name: 'University of South Carolina', city: 'Columbia', state: 'South Carolina' },
  { name: 'Clemson University', city: 'Clemson', state: 'South Carolina' },
  { name: 'University of South Dakota', city: 'Vermillion', state: 'South Dakota' },
  { name: 'University of Tennessee', city: 'Knoxville', state: 'Tennessee' },
  { name: 'Texas A&M University', city: 'College Station', state: 'Texas' },
  { name: 'University of Houston', city: 'Houston', state: 'Texas' },
  { name: 'Texas Tech University', city: 'Lubbock', state: 'Texas' },
  { name: 'University of Utah', city: 'Salt Lake City', state: 'Utah' },
  { name: 'Utah State University', city: 'Logan', state: 'Utah' },
  { name: 'University of Vermont', city: 'Burlington', state: 'Vermont' },
  { name: 'Virginia Tech', city: 'Blacksburg', state: 'Virginia' },
  { name: 'George Mason University', city: 'Fairfax', state: 'Virginia' },
  { name: 'Washington State University', city: 'Pullman', state: 'Washington' },
  { name: 'West Virginia University', city: 'Morgantown', state: 'West Virginia' },
  { name: 'University of Wyoming', city: 'Laramie', state: 'Wyoming' },

  // Community Colleges and Additional Universities
  { name: 'Santa Monica College', city: 'Santa Monica', state: 'California' },
  { name: 'Valencia College', city: 'Orlando', state: 'Florida' },
  { name: 'Northern Virginia Community College', city: 'Annandale', state: 'Virginia' },
  { name: 'Miami Dade College', city: 'Miami', state: 'Florida' },
  { name: 'Austin Community College', city: 'Austin', state: 'Texas' },
  { name: 'Houston Community College', city: 'Houston', state: 'Texas' },
  { name: 'City College of San Francisco', city: 'San Francisco', state: 'California' },
  { name: 'Montgomery College', city: 'Rockville', state: 'Maryland' },
  { name: 'Tarrant County College', city: 'Fort Worth', state: 'Texas' },
  { name: 'Mesa Community College', city: 'Mesa', state: 'Arizona' },
  
  // More Major Universities
  { name: 'University of Pittsburgh', city: 'Pittsburgh', state: 'Pennsylvania' },
  { name: 'University of Rochester', city: 'Rochester', state: 'New York' },
  { name: 'University of Miami', city: 'Coral Gables', state: 'Florida' },
  { name: 'Tufts University', city: 'Medford', state: 'Massachusetts' },
  { name: 'Wake Forest University', city: 'Winston-Salem', state: 'North Carolina' },
  { name: 'Lehigh University', city: 'Bethlehem', state: 'Pennsylvania' },
  { name: 'Brandeis University', city: 'Waltham', state: 'Massachusetts' },
  { name: 'University of Tulsa', city: 'Tulsa', state: 'Oklahoma' },
  { name: 'Baylor University', city: 'Waco', state: 'Texas' },
  { name: 'Southern Methodist University', city: 'Dallas', state: 'Texas' },
  { name: 'Tulane University', city: 'New Orleans', state: 'Louisiana' },
  { name: 'George Washington University', city: 'Washington', state: 'DC' },
  { name: 'American University', city: 'Washington', state: 'DC' },
  { name: 'Georgetown University', city: 'Washington', state: 'DC' },
  { name: 'Villanova University', city: 'Villanova', state: 'Pennsylvania' },
  { name: 'Fordham University', city: 'Bronx', state: 'New York' },
  { name: 'Boston College', city: 'Chestnut Hill', state: 'Massachusetts' },
  { name: 'College of William & Mary', city: 'Williamsburg', state: 'Virginia' },
  
  // State Schools by Region
  { name: 'California State University, Los Angeles', city: 'Los Angeles', state: 'California' },
  { name: 'California State University, Northridge', city: 'Northridge', state: 'California' },
  { name: 'California State University, Fullerton', city: 'Fullerton', state: 'California' },
  { name: 'California State University, Long Beach', city: 'Long Beach', state: 'California' },
  { name: 'San Francisco State University', city: 'San Francisco', state: 'California' },
  { name: 'California Polytechnic State University', city: 'San Luis Obispo', state: 'California' },
  { name: 'San Jose State University', city: 'San Jose', state: 'California' },
  { name: 'Sacramento State University', city: 'Sacramento', state: 'California' },
  
  { name: 'Florida International University', city: 'Miami', state: 'Florida' },
  { name: 'University of Central Florida', city: 'Orlando', state: 'Florida' },
  { name: 'Florida Atlantic University', city: 'Boca Raton', state: 'Florida' },
  { name: 'Florida Institute of Technology', city: 'Melbourne', state: 'Florida' },
  { name: 'Nova Southeastern University', city: 'Fort Lauderdale', state: 'Florida' },
  
  { name: 'Texas State University', city: 'San Marcos', state: 'Texas' },
  { name: 'University of Texas at Dallas', city: 'Richardson', state: 'Texas' },
  { name: 'University of Texas at San Antonio', city: 'San Antonio', state: 'Texas' },
  { name: 'Texas Christian University', city: 'Fort Worth', state: 'Texas' },
  { name: 'Trinity University', city: 'San Antonio', state: 'Texas' },
  
  { name: 'Arizona State University', city: 'Tempe', state: 'Arizona' },
  { name: 'Northern Arizona University', city: 'Flagstaff', state: 'Arizona' },
  { name: 'Grand Canyon University', city: 'Phoenix', state: 'Arizona' },
  
  { name: 'University of Colorado Denver', city: 'Denver', state: 'Colorado' },
  { name: 'Colorado School of Mines', city: 'Golden', state: 'Colorado' },
  { name: 'University of Denver', city: 'Denver', state: 'Colorado' },
  
  { name: 'Portland State University', city: 'Portland', state: 'Oregon' },
  { name: 'Reed College', city: 'Portland', state: 'Oregon' },
  { name: 'Lewis & Clark College', city: 'Portland', state: 'Oregon' },
  
  { name: 'Gonzaga University', city: 'Spokane', state: 'Washington' },
  { name: 'Seattle University', city: 'Seattle', state: 'Washington' },
  { name: 'Western Washington University', city: 'Bellingham', state: 'Washington' },
  
  { name: 'University of Nevada, Reno', city: 'Reno', state: 'Nevada' },
  { name: 'UNLV', city: 'Las Vegas', state: 'Nevada' },
  
  { name: 'University of Utah', city: 'Salt Lake City', state: 'Utah' },
  { name: 'Brigham Young University', city: 'Provo', state: 'Utah' },
  { name: 'Utah State University', city: 'Logan', state: 'Utah' }
]

// Sample high schools from major cities across the US
const US_HIGH_SCHOOLS = [
  // California
  { name: 'Beverly Hills High School', city: 'Beverly Hills', state: 'California' },
  { name: 'Palo Alto High School', city: 'Palo Alto', state: 'California' },
  { name: 'Lowell High School', city: 'San Francisco', state: 'California' },
  { name: 'Harvard-Westlake School', city: 'Los Angeles', state: 'California' },
  { name: 'Torrey Pines High School', city: 'San Diego', state: 'California' },
  
  // New York
  { name: 'Stuyvesant High School', city: 'New York', state: 'New York' },
  { name: 'Bronx High School of Science', city: 'Bronx', state: 'New York' },
  { name: 'Brooklyn Technical High School', city: 'Brooklyn', state: 'New York' },
  { name: 'Horace Mann School', city: 'Bronx', state: 'New York' },
  
  // Texas
  { name: 'Highland Park High School', city: 'Dallas', state: 'Texas' },
  { name: 'The Kinkaid School', city: 'Houston', state: 'Texas' },
  { name: 'Westlake High School', city: 'Austin', state: 'Texas' },
  { name: 'Plano Senior High School', city: 'Plano', state: 'Texas' },
  
  // Florida
  { name: 'Pine Crest School', city: 'Fort Lauderdale', state: 'Florida' },
  { name: 'Ransom Everglades School', city: 'Miami', state: 'Florida' },
  { name: 'The Bolles School', city: 'Jacksonville', state: 'Florida' },
  
  // Illinois
  { name: 'New Trier High School', city: 'Winnetka', state: 'Illinois' },
  { name: 'Walter Payton College Prep', city: 'Chicago', state: 'Illinois' },
  { name: 'Lane Tech College Prep', city: 'Chicago', state: 'Illinois' },
  
  // Massachusetts
  { name: 'Boston Latin School', city: 'Boston', state: 'Massachusetts' },
  { name: 'Phillips Academy', city: 'Andover', state: 'Massachusetts' },
  { name: 'The Winsor School', city: 'Boston', state: 'Massachusetts' },
  
  // Other states
  { name: 'Thomas Jefferson High School', city: 'Alexandria', state: 'Virginia' },
  { name: 'Lakeside School', city: 'Seattle', state: 'Washington' },
  { name: 'The Westminster Schools', city: 'Atlanta', state: 'Georgia' },
  { name: 'Sidwell Friends School', city: 'Washington', state: 'DC' },
  { name: 'University High School', city: 'Irvine', state: 'California' },
  { name: 'Scarsdale High School', city: 'Scarsdale', state: 'New York' },
  { name: 'Montgomery Blair High School', city: 'Silver Spring', state: 'Maryland' },
  { name: 'North Carolina School of Science and Mathematics', city: 'Durham', state: 'North Carolina' },
  { name: 'International Academy', city: 'Bloomfield Hills', state: 'Michigan' },
  { name: 'Whitney High School', city: 'Cerritos', state: 'California' },
  { name: 'School for the Talented and Gifted', city: 'Dallas', state: 'Texas' },
  { name: 'Illinois Mathematics and Science Academy', city: 'Aurora', state: 'Illinois' },
  { name: 'Gwinnett School of Mathematics', city: 'Lawrenceville', state: 'Georgia' },
  { name: 'Pine View School', city: 'Osprey', state: 'Florida' },
  { name: 'Adlai E. Stevenson High School', city: 'Lincolnshire', state: 'Illinois' },
  { name: 'Monta Vista High School', city: 'Cupertino', state: 'California' },
  
  // Additional High Schools by State
  // California
  { name: 'Mission San Jose High School', city: 'Fremont', state: 'California' },
  { name: 'Troy High School', city: 'Fullerton', state: 'California' },
  { name: 'Arcadia High School', city: 'Arcadia', state: 'California' },
  { name: 'Diamond Bar High School', city: 'Diamond Bar', state: 'California' },
  { name: 'Granada Hills Charter High School', city: 'Granada Hills', state: 'California' },
  { name: 'Palos Verdes Peninsula High School', city: 'Rolling Hills Estates', state: 'California' },
  
  // Texas
  { name: 'Bellaire High School', city: 'Bellaire', state: 'Texas' },
  { name: 'Memorial High School', city: 'Houston', state: 'Texas' },
  { name: 'Cinco Ranch High School', city: 'Katy', state: 'Texas' },
  { name: 'Frisco High School', city: 'Frisco', state: 'Texas' },
  { name: 'Allen High School', city: 'Allen', state: 'Texas' },
  { name: 'Coppell High School', city: 'Coppell', state: 'Texas' },
  
  // New York
  { name: 'Regis High School', city: 'New York', state: 'New York' },
  { name: 'Xavier High School', city: 'New York', state: 'New York' },
  { name: 'Collegiate School', city: 'New York', state: 'New York' },
  { name: 'Great Neck South High School', city: 'Great Neck', state: 'New York' },
  { name: 'Jericho High School', city: 'Jericho', state: 'New York' },
  
  // Florida
  { name: 'Design and Architecture Senior High', city: 'Miami', state: 'Florida' },
  { name: 'Stanton College Preparatory School', city: 'Jacksonville', state: 'Florida' },
  { name: 'International Baccalaureate School at Bartow', city: 'Bartow', state: 'Florida' },
  { name: 'Boca Raton Community High School', city: 'Boca Raton', state: 'Florida' },
  
  // Illinois
  { name: 'Northside College Prep High School', city: 'Chicago', state: 'Illinois' },
  { name: 'Jones College Prep High School', city: 'Chicago', state: 'Illinois' },
  { name: 'Hinsdale Central High School', city: 'Hinsdale', state: 'Illinois' },
  { name: 'Naperville North High School', city: 'Naperville', state: 'Illinois' },
  
  // Washington
  { name: 'Garfield High School', city: 'Seattle', state: 'Washington' },
  { name: 'Roosevelt High School', city: 'Seattle', state: 'Washington' },
  { name: 'International School', city: 'Bellevue', state: 'Washington' },
  
  // Virginia
  { name: 'Maggie L. Walker Governor\'s School', city: 'Richmond', state: 'Virginia' },
  { name: 'Langley High School', city: 'McLean', state: 'Virginia' },
  { name: 'West Springfield High School', city: 'Springfield', state: 'Virginia' },
  
  // Maryland
  { name: 'Richard Montgomery High School', city: 'Rockville', state: 'Maryland' },
  { name: 'Poolesville High School', city: 'Poolesville', state: 'Maryland' },
  { name: 'Winston Churchill High School', city: 'Potomac', state: 'Maryland' },
  
  // Georgia
  { name: 'Northview High School', city: 'Johns Creek', state: 'Georgia' },
  { name: 'Walton High School', city: 'Marietta', state: 'Georgia' },
  { name: 'Lambert High School', city: 'Suwanee', state: 'Georgia' },
  
  // North Carolina
  { name: 'Early College at Guilford', city: 'Greensboro', state: 'North Carolina' },
  { name: 'School of Science and Math', city: 'Durham', state: 'North Carolina' },
  { name: 'Myers Park High School', city: 'Charlotte', state: 'North Carolina' },
  
  // Ohio
  { name: 'Walnut Hills High School', city: 'Cincinnati', state: 'Ohio' },
  { name: 'Solon High School', city: 'Solon', state: 'Ohio' },
  { name: 'Mason High School', city: 'Mason', state: 'Ohio' },
  
  // Pennsylvania
  { name: 'Central High School', city: 'Philadelphia', state: 'Pennsylvania' },
  { name: 'Masterman School', city: 'Philadelphia', state: 'Pennsylvania' },
  { name: 'Fox Chapel Area High School', city: 'Pittsburgh', state: 'Pennsylvania' },
  
  // Michigan
  { name: 'International Academy East', city: 'Troy', state: 'Michigan' },
  { name: 'Stoney Creek High School', city: 'Rochester Hills', state: 'Michigan' },
  { name: 'Pioneer High School', city: 'Ann Arbor', state: 'Michigan' },
  
  // Colorado
  { name: 'DSST: STEM School Highlands Ranch', city: 'Highlands Ranch', state: 'Colorado' },
  { name: 'Cherry Creek High School', city: 'Greenwood Village', state: 'Colorado' },
  { name: 'Fairview High School', city: 'Boulder', state: 'Colorado' },
  
  // Arizona
  { name: 'BASIS Scottsdale', city: 'Scottsdale', state: 'Arizona' },
  { name: 'Desert Vista High School', city: 'Phoenix', state: 'Arizona' },
  { name: 'Hamilton High School', city: 'Chandler', state: 'Arizona' }
]

// Comprehensive list of academic subjects
const ACADEMIC_SUBJECTS = [
  // Core Subjects
  { name: 'Mathematics' },
  { name: 'English Language Arts' },
  { name: 'Science' },
  { name: 'Social Studies' },
  { name: 'History' },
  
  // Mathematics Subdivisions
  { name: 'Algebra I' },
  { name: 'Algebra II' },
  { name: 'Geometry' },
  { name: 'Trigonometry' },
  { name: 'Pre-Calculus' },
  { name: 'Calculus' },
  { name: 'AP Calculus AB' },
  { name: 'AP Calculus BC' },
  { name: 'Statistics' },
  { name: 'AP Statistics' },
  { name: 'Discrete Mathematics' },
  { name: 'Linear Algebra' },
  { name: 'Differential Equations' },
  { name: 'Multivariable Calculus' },
  
  // Science Subdivisions
  { name: 'Biology' },
  { name: 'AP Biology' },
  { name: 'Chemistry' },
  { name: 'AP Chemistry' },
  { name: 'Physics' },
  { name: 'AP Physics 1' },
  { name: 'AP Physics 2' },
  { name: 'AP Physics C: Mechanics' },
  { name: 'AP Physics C: Electricity and Magnetism' },
  { name: 'Earth Science' },
  { name: 'Environmental Science' },
  { name: 'AP Environmental Science' },
  { name: 'Anatomy and Physiology' },
  { name: 'Organic Chemistry' },
  { name: 'Biochemistry' },
  { name: 'Microbiology' },
  { name: 'Genetics' },
  { name: 'Astronomy' },
  
  // English/Language Arts
  { name: 'English Literature' },
  { name: 'AP English Literature' },
  { name: 'AP English Language' },
  { name: 'Creative Writing' },
  { name: 'Journalism' },
  { name: 'Public Speaking' },
  { name: 'Debate' },
  { name: 'Rhetoric' },
  
  // Social Studies/History
  { name: 'World History' },
  { name: 'AP World History' },
  { name: 'US History' },
  { name: 'AP US History' },
  { name: 'European History' },
  { name: 'AP European History' },
  { name: 'Government' },
  { name: 'AP Government and Politics' },
  { name: 'Economics' },
  { name: 'AP Macroeconomics' },
  { name: 'AP Microeconomics' },
  { name: 'Psychology' },
  { name: 'AP Psychology' },
  { name: 'Sociology' },
  { name: 'Anthropology' },
  { name: 'Geography' },
  { name: 'AP Human Geography' },
  
  // Foreign Languages
  { name: 'Spanish' },
  { name: 'AP Spanish Language' },
  { name: 'AP Spanish Literature' },
  { name: 'French' },
  { name: 'AP French Language' },
  { name: 'German' },
  { name: 'AP German Language' },
  { name: 'Italian' },
  { name: 'Latin' },
  { name: 'AP Latin' },
  { name: 'Chinese' },
  { name: 'AP Chinese Language' },
  { name: 'Japanese' },
  { name: 'AP Japanese Language' },
  { name: 'Russian' },
  { name: 'Arabic' },
  { name: 'Portuguese' },
  
  // Computer Science
  { name: 'Computer Science' },
  { name: 'AP Computer Science A' },
  { name: 'AP Computer Science Principles' },
  { name: 'Programming' },
  { name: 'Web Development' },
  { name: 'Data Structures' },
  { name: 'Algorithms' },
  { name: 'Software Engineering' },
  { name: 'Artificial Intelligence' },
  { name: 'Machine Learning' },
  { name: 'Database Systems' },
  { name: 'Computer Networks' },
  { name: 'Cybersecurity' },
  
  // Business
  { name: 'Business' },
  { name: 'Accounting' },
  { name: 'Finance' },
  { name: 'Marketing' },
  { name: 'Management' },
  { name: 'Entrepreneurship' },
  { name: 'Business Law' },
  
  // Arts
  { name: 'Art' },
  { name: 'AP Art History' },
  { name: 'AP Studio Art' },
  { name: 'Music' },
  { name: 'AP Music Theory' },
  { name: 'Theater' },
  { name: 'Dance' },
  { name: 'Film Studies' },
  { name: 'Photography' },
  { name: 'Graphic Design' },
  
  // Engineering
  { name: 'Engineering' },
  { name: 'Mechanical Engineering' },
  { name: 'Electrical Engineering' },
  { name: 'Civil Engineering' },
  { name: 'Chemical Engineering' },
  { name: 'Biomedical Engineering' },
  { name: 'Computer Engineering' },
  { name: 'Aerospace Engineering' },
  
  // Health Sciences
  { name: 'Health Sciences' },
  { name: 'Nursing' },
  { name: 'Pre-Med' },
  { name: 'Public Health' },
  { name: 'Nutrition' },
  { name: 'Kinesiology' },
  { name: 'Sports Medicine' },
  
  // Other
  { name: 'Philosophy' },
  { name: 'Religion' },
  { name: 'Ethics' },
  { name: 'Physical Education' },
  { name: 'Health' },
  { name: 'Study Skills' },
  { name: 'SAT Prep' },
  { name: 'ACT Prep' },
  { name: 'Test Prep' }
]

export async function seedComprehensiveDatabase() {
  console.log('🌱 Starting comprehensive database seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await supabase.from('resource_tags').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('votes').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('comments').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('flags').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('ai_derivatives').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('files').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('resources').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('classes').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('teachers').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('subjects').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('schools').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('tags').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('points_ledger').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().gte('id', '00000000-0000-0000-0000-000000000000')

    // Insert schools in batches
    console.log('🏫 Creating schools...')
    const allSchools = [...US_COLLEGES, ...US_HIGH_SCHOOLS]
    
    for (let i = 0; i < allSchools.length; i += 50) {
      const batch = allSchools.slice(i, i + 50)
      const { error } = await supabase.from('schools').insert(batch)
      if (error) throw error
      console.log(`   Created schools ${i + 1}-${Math.min(i + 50, allSchools.length)} of ${allSchools.length}`)
    }

    // Insert subjects in batches
    console.log('📚 Creating subjects...')
    for (let i = 0; i < ACADEMIC_SUBJECTS.length; i += 50) {
      const batch = ACADEMIC_SUBJECTS.slice(i, i + 50)
      const { error } = await supabase.from('subjects').insert(batch)
      if (error) throw error
      console.log(`   Created subjects ${i + 1}-${Math.min(i + 50, ACADEMIC_SUBJECTS.length)} of ${ACADEMIC_SUBJECTS.length}`)
    }

    // Get inserted schools and subjects for creating teachers and classes
    const { data: schools } = await supabase.from('schools').select('*').limit(20)
    const { data: subjects } = await supabase.from('subjects').select('*').limit(20)

    if (!schools || !subjects) throw new Error('Failed to fetch schools or subjects')

    // Create sample teachers
    console.log('👨‍🏫 Creating teachers...')
    const sampleTeachers = []
    const teacherNames = [
      // Mathematics Teachers
      'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Ms. Emily Rodriguez', 'Dr. David Kim',
      'Prof. Lisa Thompson', 'Mr. James Wilson', 'Dr. Maria Garcia', 'Ms. Robert Lee',
      'Dr. Jennifer Brown', 'Prof. William Davis', 'Ms. Amanda Miller', 'Dr. Christopher Taylor',
      'Prof. Jessica Martinez', 'Dr. Daniel Anderson', 'Ms. Rachel Thomas', 'Mr. Kevin Jackson',
      'Dr. Nicole White', 'Prof. Andrew Harris', 'Ms. Stephanie Martin', 'Dr. Brian Thompson',
      
      // Science Teachers  
      'Dr. Catherine Lewis', 'Prof. Mark Walker', 'Ms. Laura Hall', 'Dr. Steven Allen',
      'Prof. Michelle Young', 'Mr. Jason King', 'Dr. Ashley Wright', 'Ms. Joshua Lopez',
      'Dr. Megan Hill', 'Prof. Ryan Scott', 'Ms. Kimberly Green', 'Dr. Adam Adams',
      'Prof. Samantha Baker', 'Mr. Jonathan Gonzalez', 'Dr. Elizabeth Nelson', 'Ms. Tyler Carter',
      
      // English Teachers
      'Dr. Rebecca Mitchell', 'Prof. Charles Perez', 'Ms. Hannah Roberts', 'Dr. Nathan Turner',
      'Prof. Brittany Phillips', 'Mr. Gregory Campbell', 'Dr. Victoria Parker', 'Ms. Benjamin Evans',
      'Dr. Alexis Edwards', 'Prof. Jacob Collins', 'Ms. Morgan Stewart', 'Dr. Aaron Sanchez',
      'Prof. Kayla Morris', 'Mr. Peter Rogers', 'Dr. Danielle Reed', 'Ms. Ian Cook',
      
      // History/Social Studies Teachers
      'Dr. Melissa Bailey', 'Prof. Sean Rivera', 'Ms. Christine Cooper', 'Dr. Eric Richardson',
      'Prof. Vanessa Cox', 'Mr. Kyle Howard', 'Dr. Heather Ward', 'Ms. Alex Torres',
      'Dr. Lindsay Peterson', 'Prof. Blake Gray', 'Ms. Tiffany Ramirez', 'Dr. Trevor James',
      'Prof. Courtney Watson', 'Mr. Cole Brooks', 'Dr. Sierra Kelly', 'Ms. Garrett Sanders',
      
      // Foreign Language Teachers
      'Prof. Carmen Fernandez', 'Dr. François Dubois', 'Ms. Yuki Tanaka', 'Herr Klaus Weber',
      'Profesora Elena Vasquez', 'Dr. Wei Zhang', 'Ms. Isabella Romano', 'Prof. Ahmed Hassan',
      'Dr. Olga Petrov', 'Ms. Priya Sharma', 'Prof. João Silva', 'Dr. Lars Andersen',
      
      // Computer Science Teachers
      'Dr. Alex Patel', 'Prof. Jordan Smith', 'Ms. Casey Wong', 'Dr. Taylor Hughes',
      'Prof. Cameron Foster', 'Mr. Dylan Price', 'Dr. Skyler Bennett', 'Ms. Quinn Murphy',
      'Dr. Avery Bryant', 'Prof. Riley Washington', 'Ms. Sage Butler', 'Dr. Phoenix Gray',
      
      // Arts Teachers
      'Ms. Grace Williams', 'Mr. Lucas Johnson', 'Dr. Sophia Davis', 'Prof. Ethan Brown',
      'Ms. Chloe Wilson', 'Mr. Mason Miller', 'Dr. Zoe Taylor', 'Prof. Logan Anderson',
      'Ms. Lily Thomas', 'Mr. Owen Jackson', 'Dr. Ruby White', 'Prof. Caleb Harris',
      
      // PE/Health Teachers
      'Coach Mike Rodriguez', 'Coach Sarah Martinez', 'Mr. Tony Garcia', 'Ms. Lisa Robinson',
      'Coach David Clark', 'Coach Jennifer Lewis', 'Mr. Steve Lee', 'Ms. Karen Walker',
      'Coach Robert Hall', 'Coach Michelle Allen', 'Mr. Chris Young', 'Ms. Amy King'
    ]

    // Create 5-8 teachers per school for better variety
    for (const school of schools) {
      const numTeachers = Math.floor(Math.random() * 4) + 5 // 5-8 teachers per school
      for (let i = 0; i < numTeachers; i++) {
        sampleTeachers.push({
          school_id: school.id,
          name: teacherNames[Math.floor(Math.random() * teacherNames.length)]
        })
      }
    }

    const { data: teachers } = await supabase.from('teachers').insert(sampleTeachers).select()
    if (!teachers) throw new Error('Failed to create teachers')

    // Create sample classes
    console.log('🎓 Creating sample classes...')
    const sampleClasses = []
    const terms = ['Fall 2024', 'Spring 2024', 'Summer 2024']

    for (const teacher of teachers) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
      sampleClasses.push({
        school_id: teacher.school_id,
        subject_id: randomSubject.id,
        teacher_id: teacher.id,
        code: `${randomSubject.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 999) + 100}`,
        title: `${randomSubject.name} - ${terms[Math.floor(Math.random() * terms.length)]}`,
        term: terms[Math.floor(Math.random() * terms.length)]
      })
    }

    await supabase.from('classes').insert(sampleClasses)

    console.log('✅ Comprehensive database seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   - ${allSchools.length} schools (${US_COLLEGES.length} colleges + ${US_HIGH_SCHOOLS.length} high schools)`)
    console.log(`   - ${ACADEMIC_SUBJECTS.length} subjects`)
    console.log(`   - ${sampleTeachers.length} sample teachers`)
    console.log(`   - ${sampleClasses.length} sample classes`)

  } catch (error) {
    console.error('❌ Error seeding comprehensive database:', error)
    throw error
  }
}
