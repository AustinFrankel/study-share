#!/usr/bin/env node

// This script seeds the database with comprehensive data - hundreds of schools and teachers
// Run with: npm run seed-comprehensive

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Major US colleges and universities
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

  // Additional Universities
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
]

// High schools from major cities
const US_HIGH_SCHOOLS = [
  // California
  { name: 'Beverly Hills High School', city: 'Beverly Hills', state: 'California' },
  { name: 'Palo Alto High School', city: 'Palo Alto', state: 'California' },
  { name: 'Lowell High School', city: 'San Francisco', state: 'California' },
  { name: 'Harvard-Westlake School', city: 'Los Angeles', state: 'California' },
  { name: 'Torrey Pines High School', city: 'San Diego', state: 'California' },
  { name: 'Mission San Jose High School', city: 'Fremont', state: 'California' },
  { name: 'Troy High School', city: 'Fullerton', state: 'California' },
  { name: 'Arcadia High School', city: 'Arcadia', state: 'California' },
  
  // New York
  { name: 'Stuyvesant High School', city: 'New York', state: 'New York' },
  { name: 'Bronx High School of Science', city: 'Bronx', state: 'New York' },
  { name: 'Brooklyn Technical High School', city: 'Brooklyn', state: 'New York' },
  { name: 'Horace Mann School', city: 'Bronx', state: 'New York' },
  { name: 'Regis High School', city: 'New York', state: 'New York' },
  { name: 'Xavier High School', city: 'New York', state: 'New York' },
  
  // Texas
  { name: 'Highland Park High School', city: 'Dallas', state: 'Texas' },
  { name: 'The Kinkaid School', city: 'Houston', state: 'Texas' },
  { name: 'Westlake High School', city: 'Austin', state: 'Texas' },
  { name: 'Plano Senior High School', city: 'Plano', state: 'Texas' },
  { name: 'Bellaire High School', city: 'Bellaire', state: 'Texas' },
  
  // Florida
  { name: 'Pine Crest School', city: 'Fort Lauderdale', state: 'Florida' },
  { name: 'Ransom Everglades School', city: 'Miami', state: 'Florida' },
  { name: 'The Bolles School', city: 'Jacksonville', state: 'Florida' },
  { name: 'Design and Architecture Senior High', city: 'Miami', state: 'Florida' },
  
  // Illinois
  { name: 'New Trier High School', city: 'Winnetka', state: 'Illinois' },
  { name: 'Walter Payton College Prep', city: 'Chicago', state: 'Illinois' },
  { name: 'Lane Tech College Prep', city: 'Chicago', state: 'Illinois' },
  { name: 'Northside College Prep High School', city: 'Chicago', state: 'Illinois' },
  
  // Massachusetts
  { name: 'Boston Latin School', city: 'Boston', state: 'Massachusetts' },
  { name: 'Phillips Academy', city: 'Andover', state: 'Massachusetts' },
  { name: 'The Winsor School', city: 'Boston', state: 'Massachusetts' },
  
  // Other states
  { name: 'Thomas Jefferson High School', city: 'Alexandria', state: 'Virginia' },
  { name: 'Lakeside School', city: 'Seattle', state: 'Washington' },
  { name: 'The Westminster Schools', city: 'Atlanta', state: 'Georgia' },
  { name: 'Sidwell Friends School', city: 'Washington', state: 'DC' },
]

// Academic subjects
const ACADEMIC_SUBJECTS = [
  // Core Subjects
  { name: 'Mathematics' },
  { name: 'English Language Arts' },
  { name: 'Science' },
  { name: 'Social Studies' },
  { name: 'History' },
  
  // Mathematics
  { name: 'Algebra I' },
  { name: 'Algebra II' },
  { name: 'Geometry' },
  { name: 'Pre-Calculus' },
  { name: 'Calculus' },
  { name: 'AP Calculus AB' },
  { name: 'AP Calculus BC' },
  { name: 'Statistics' },
  { name: 'AP Statistics' },
  
  // Science
  { name: 'Biology' },
  { name: 'AP Biology' },
  { name: 'Chemistry' },
  { name: 'AP Chemistry' },
  { name: 'Physics' },
  { name: 'AP Physics 1' },
  { name: 'AP Physics 2' },
  { name: 'Environmental Science' },
  { name: 'AP Environmental Science' },
  
  // English/Language Arts
  { name: 'English Literature' },
  { name: 'AP English Literature' },
  { name: 'AP English Language' },
  { name: 'Creative Writing' },
  
  // History/Social Studies
  { name: 'World History' },
  { name: 'AP World History' },
  { name: 'US History' },
  { name: 'AP US History' },
  { name: 'Government' },
  { name: 'Economics' },
  { name: 'Psychology' },
  { name: 'AP Psychology' },
  
  // Foreign Languages
  { name: 'Spanish' },
  { name: 'AP Spanish Language' },
  { name: 'French' },
  { name: 'German' },
  { name: 'Latin' },
  { name: 'Chinese' },
  
  // Computer Science
  { name: 'Computer Science' },
  { name: 'AP Computer Science A' },
  { name: 'Programming' },
  
  // Arts
  { name: 'Art' },
  { name: 'Music' },
  { name: 'Theater' },
  
  // Other
  { name: 'Physical Education' },
  { name: 'Health' },
]

// Diverse teacher names
const TEACHER_NAMES = [
  'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Ms. Emily Rodriguez', 'Dr. David Kim',
  'Prof. Lisa Thompson', 'Mr. James Wilson', 'Dr. Maria Garcia', 'Ms. Robert Lee',
  'Dr. Jennifer Brown', 'Prof. William Davis', 'Ms. Amanda Miller', 'Dr. Christopher Taylor',
  'Prof. Jessica Martinez', 'Dr. Daniel Anderson', 'Ms. Rachel Thomas', 'Mr. Kevin Jackson',
  'Dr. Nicole White', 'Prof. Andrew Harris', 'Ms. Stephanie Martin', 'Dr. Brian Thompson',
  'Dr. Catherine Lewis', 'Prof. Mark Walker', 'Ms. Laura Hall', 'Dr. Steven Allen',
  'Prof. Michelle Young', 'Mr. Jason King', 'Dr. Ashley Wright', 'Ms. Joshua Lopez',
  'Dr. Megan Hill', 'Prof. Ryan Scott', 'Ms. Kimberly Green', 'Dr. Adam Adams',
  'Prof. Samantha Baker', 'Mr. Jonathan Gonzalez', 'Dr. Elizabeth Nelson', 'Ms. Tyler Carter',
  'Dr. Rebecca Mitchell', 'Prof. Charles Perez', 'Ms. Hannah Roberts', 'Dr. Nathan Turner',
  'Prof. Brittany Phillips', 'Mr. Gregory Campbell', 'Dr. Victoria Parker', 'Ms. Benjamin Evans',
  'Dr. Alexis Edwards', 'Prof. Jacob Collins', 'Ms. Morgan Stewart', 'Dr. Aaron Sanchez',
  'Prof. Kayla Morris', 'Mr. Peter Rogers', 'Dr. Danielle Reed', 'Ms. Ian Cook',
  'Dr. Melissa Bailey', 'Prof. Sean Rivera', 'Ms. Christine Cooper', 'Dr. Eric Richardson',
  'Prof. Vanessa Cox', 'Mr. Kyle Howard', 'Dr. Heather Ward', 'Ms. Alex Torres',
  'Prof. Carmen Fernandez', 'Dr. François Dubois', 'Ms. Yuki Tanaka', 'Herr Klaus Weber',
  'Profesora Elena Vasquez', 'Dr. Wei Zhang', 'Ms. Isabella Romano', 'Prof. Ahmed Hassan',
  'Dr. Alex Patel', 'Prof. Jordan Smith', 'Ms. Casey Wong', 'Dr. Taylor Hughes',
  'Ms. Grace Williams', 'Mr. Lucas Johnson', 'Dr. Sophia Davis', 'Prof. Ethan Brown',
  'Coach Mike Rodriguez', 'Coach Sarah Martinez', 'Mr. Tony Garcia', 'Ms. Lisa Robinson',
]

async function seedComprehensiveDatabase() {
  console.log('🌱 Starting comprehensive database seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    const tables = ['resource_tags', 'votes', 'comments', 'flags', 'ai_derivatives', 'files', 'resources', 'classes', 'teachers', 'subjects', 'schools', 'tags', 'points_ledger', 'users']
    for (const table of tables) {
      try {
        await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000')
      } catch (error) {
        console.log(`   Note: Could not clear ${table} (might not exist or have dependencies)`)
      }
    }

    // Insert schools
    console.log('🏫 Creating schools...')
    const allSchools = [...US_COLLEGES, ...US_HIGH_SCHOOLS]
    const { data: schools, error: schoolsError } = await supabase.from('schools').insert(allSchools).select()
    if (schoolsError) throw schoolsError
    console.log(`   Created ${schools.length} schools`)

    // Insert subjects
    console.log('📚 Creating subjects...')
    const { data: subjects, error: subjectsError } = await supabase.from('subjects').insert(ACADEMIC_SUBJECTS).select()
    if (subjectsError) throw subjectsError
    console.log(`   Created ${subjects.length} subjects`)

    // Create teachers - 5-8 per school
    console.log('👨‍🏫 Creating teachers...')
    const teachers = []
    for (const school of schools.slice(0, 25)) { // Limit to first 25 schools for performance
      const numTeachers = Math.floor(Math.random() * 4) + 5
      for (let i = 0; i < numTeachers; i++) {
        teachers.push({
          school_id: school.id,
          name: TEACHER_NAMES[Math.floor(Math.random() * TEACHER_NAMES.length)]
        })
      }
    }

    const { data: createdTeachers, error: teachersError } = await supabase.from('teachers').insert(teachers).select()
    if (teachersError) throw teachersError
    console.log(`   Created ${createdTeachers.length} teachers`)

    // Create classes
    console.log('🎓 Creating classes...')
    const classes = []
    const terms = ['Fall 2024', 'Spring 2024', 'Summer 2024']

    for (const teacher of createdTeachers) {
      const numClasses = Math.floor(Math.random() * 3) + 1 // 1-3 classes per teacher
      for (let i = 0; i < numClasses; i++) {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
        classes.push({
          school_id: teacher.school_id,
          subject_id: randomSubject.id,
          teacher_id: teacher.id,
          code: `${randomSubject.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 999) + 100}`,
          title: `${randomSubject.name} - ${terms[Math.floor(Math.random() * terms.length)]}`,
          term: terms[Math.floor(Math.random() * terms.length)]
        })
      }
    }

    const { data: createdClasses, error: classesError } = await supabase.from('classes').insert(classes).select()
    if (classesError) throw classesError
    console.log(`   Created ${createdClasses.length} classes`)

    console.log('✅ Comprehensive database seeding completed!')
    console.log(`📊 Summary:`)
    console.log(`   - ${schools.length} schools`)
    console.log(`   - ${subjects.length} subjects`)
    console.log(`   - ${createdTeachers.length} teachers`)
    console.log(`   - ${createdClasses.length} classes`)

  } catch (error) {
    console.error('❌ Error seeding comprehensive database:', error)
    throw error
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting comprehensive seeding...')
  
  try {
    await seedComprehensiveDatabase()
    console.log('🎉 Comprehensive seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
