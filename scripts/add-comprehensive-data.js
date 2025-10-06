require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Comprehensive US colleges
const US_COLLEGES = [
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
  { name: 'University of California, Berkeley', city: 'Berkeley', state: 'CA' },
  { name: 'University of California, Los Angeles', city: 'Los Angeles', state: 'CA' },
  { name: 'University of California, San Diego', city: 'San Diego', state: 'CA' },
  { name: 'University of California, Davis', city: 'Davis', state: 'CA' },
  { name: 'University of California, Irvine', city: 'Irvine', state: 'CA' },
  { name: 'University of California, Santa Barbara', city: 'Santa Barbara', state: 'CA' },
  { name: 'University of California, Santa Cruz', city: 'Santa Cruz', state: 'CA' },
  { name: 'University of California, Riverside', city: 'Riverside', state: 'CA' },
  { name: 'University of California, Merced', city: 'Merced', state: 'CA' },
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
  { name: 'Georgia Institute of Technology', city: 'Atlanta', state: 'GA' },
  { name: 'Carnegie Mellon University', city: 'Pittsburgh', state: 'PA' },
  { name: 'Johns Hopkins University', city: 'Baltimore', state: 'MD' },
  { name: 'Northwestern University', city: 'Evanston', state: 'IL' },
  { name: 'American University', city: 'Washington', state: 'DC' },
  { name: 'George Washington University', city: 'Washington', state: 'DC' },
  { name: 'Georgetown University', city: 'Washington', state: 'DC' },
  { name: 'New York University', city: 'New York', state: 'NY' },
  { name: 'Boston University', city: 'Boston', state: 'MA' },
  { name: 'University of Southern California', city: 'Los Angeles', state: 'CA' },
  { name: 'Vanderbilt University', city: 'Nashville', state: 'TN' },
  { name: 'Rice University', city: 'Houston', state: 'TX' },
  { name: 'Emory University', city: 'Atlanta', state: 'GA' },
  { name: 'Notre Dame', city: 'South Bend', state: 'IN' },
  { name: 'Arizona State University', city: 'Tempe', state: 'AZ' },
  { name: 'University of Arizona', city: 'Tucson', state: 'AZ' },
  { name: 'University of Colorado Boulder', city: 'Boulder', state: 'CO' },
  { name: 'University of Oregon', city: 'Eugene', state: 'OR' },
  { name: 'Boston College', city: 'Chestnut Hill', state: 'MA' },
  { name: 'Brown University', city: 'Providence', state: 'RI' },
  { name: 'Dartmouth College', city: 'Hanover', state: 'NH' },
  { name: 'University of Miami', city: 'Coral Gables', state: 'FL' },
  { name: 'Florida State University', city: 'Tallahassee', state: 'FL' },
  { name: 'University of Georgia', city: 'Athens', state: 'GA' },
  { name: 'University of Alabama', city: 'Tuscaloosa', state: 'AL' },
]

// Comprehensive subjects
const COMPREHENSIVE_SUBJECTS = [
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

async function addComprehensiveData() {
  console.log('🌱 Adding comprehensive colleges and universities...')

  try {
    // Check existing schools count
    const { data: existingSchools, error: schoolsError } = await supabase
      .from('schools')
      .select('id', { count: 'exact' })

    if (schoolsError) {
      console.error('Error checking existing schools:', schoolsError)
      return
    }

    console.log(`Current schools: ${existingSchools?.length || 0}`)

    // Add schools if we have fewer than 20
    if (!existingSchools || existingSchools.length < 20) {
      console.log('Adding comprehensive schools...')
      
      const { data: newSchools, error: insertError } = await supabase
        .from('schools')
        .insert(US_COLLEGES)
        .select()
        .on('conflict', 'name', {
          ignoreDuplicates: true
        })

      if (insertError) {
        console.warn('Some schools may already exist, continuing...', insertError)
      } else {
        console.log(`✅ Added ${newSchools?.length || 0} new schools`)
      }
    }

    // Check existing subjects
    const { data: existingSubjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id', { count: 'exact' })

    if (subjectsError) {
      console.error('Error checking existing subjects:', subjectsError)
      return
    }

    console.log(`Current subjects: ${existingSubjects?.length || 0}`)

    // Add subjects if we have fewer than 10
    if (!existingSubjects || existingSubjects.length < 10) {
      console.log('Adding comprehensive subjects...')
      
      const { data: newSubjects, error: subjectInsertError } = await supabase
        .from('subjects')
        .insert(COMPREHENSIVE_SUBJECTS)
        .select()
        .on('conflict', 'id', {
          ignoreDuplicates: true
        })

      if (subjectInsertError) {
        console.warn('Some subjects may already exist, continuing...', subjectInsertError)
      } else {
        console.log(`✅ Added ${newSubjects?.length || 0} new subjects`)
      }
    }

    console.log('✅ Comprehensive data addition completed!')
    console.log('📚 Your app now has access to hundreds of colleges and comprehensive class options!')

  } catch (error) {
    console.error('❌ Error adding comprehensive data:', error)
  }
}

addComprehensiveData()
