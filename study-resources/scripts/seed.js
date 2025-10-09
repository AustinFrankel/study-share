#!/usr/bin/env node

// This script seeds the database with sample data
// Run with: node scripts/seed.js

const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')

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

// Sample data
const SAMPLE_SCHOOLS = [
  { name: 'University of California, Berkeley', city: 'Berkeley', state: 'CA' },
  { name: 'Stanford University', city: 'Stanford', state: 'CA' },
  { name: 'Massachusetts Institute of Technology', city: 'Cambridge', state: 'MA' },
]

const SAMPLE_SUBJECTS = [
  { name: 'Computer Science' },
  { name: 'Mathematics' },
  { name: 'Physics' },
  { name: 'Chemistry' },
  { name: 'Biology' },
  { name: 'Psychology' },
]

const SAMPLE_TEACHERS = [
  'Dr. Sarah Johnson',
  'Prof. Michael Chen',
  'Dr. Emily Rodriguez',
  'Prof. David Kim',
  'Dr. Lisa Wang',
  'Prof. James Brown',
]

const SAMPLE_CLASSES = [
  { title: 'Introduction to Computer Science', code: 'CS 101' },
  { title: 'Data Structures and Algorithms', code: 'CS 201' },
  { title: 'Calculus I', code: 'MATH 101' },
  { title: 'Linear Algebra', code: 'MATH 201' },
  { title: 'General Physics', code: 'PHYS 101' },
  { title: 'Introduction to Psychology', code: 'PSYC 101' },
]

const SAMPLE_RESOURCES = [
  { title: 'Midterm Study Guide - Data Structures', type: 'study_guide' },
  { title: 'Calculus Practice Problems', type: 'practice_set' },
  { title: 'Physics Lab Notes - Week 5', type: 'notes' },
  { title: 'Previous Semester Final Exam', type: 'past_material' },
  { title: 'Psychology Chapter 6 Summary', type: 'notes' },
]

const SAMPLE_STRUCTURED_CONTENT = {
  meta: {
    school: 'University of California, Berkeley',
    class: 'Introduction to Psychology',
    teacher: 'Dr. Sarah Johnson',
    approx_topic: 'Memory and Cognition',
    source_form: 'notes'
  },
  items: [
    {
      type: 'mcq',
      prompt: 'Which type of memory has the shortest duration?',
      choices: ['A) Long-term memory', 'B) Short-term memory', 'C) Sensory memory', 'D) Working memory'],
      answer: 'C) Sensory memory',
      explanation: 'Sensory memory lasts only 0.5-3 seconds, making it the shortest duration memory type.'
    },
    {
      type: 'short',
      prompt: 'Define working memory and explain its role in cognition.',
      answer: 'Working memory is a temporary storage system that actively maintains and manipulates information needed for cognitive tasks.',
      explanation: 'Working memory is crucial for reasoning, learning, and comprehension as it holds information while we process it.'
    }
  ],
  notes: [
    'Memory is a multi-stage process involving encoding, storage, and retrieval',
    'Different types of memory serve different functions in cognition'
  ]
}

function generateHandle() {
  const adjectives = ['cobalt', 'crimson', 'azure', 'golden', 'silver', 'emerald']
  const animals = ['walrus', 'penguin', 'dolphin', 'octopus', 'tiger', 'eagle']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}-${animal}-${number}`
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Create schools
    console.log('Creating schools...')
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .insert(SAMPLE_SCHOOLS)
      .select()

    if (schoolsError) throw schoolsError
    console.log(`✅ Created ${schools.length} schools`)

    // 2. Create subjects
    console.log('Creating subjects...')
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .insert(SAMPLE_SUBJECTS)
      .select()

    if (subjectsError) throw subjectsError
    console.log(`✅ Created ${subjects.length} subjects`)

    // 3. Create users
    console.log('Creating users...')
    const users = Array.from({ length: 8 }, () => ({
      id: uuidv4(),
      handle: generateHandle(),
      handle_version: 1
    }))

    const { data: createdUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select()

    if (usersError) throw usersError
    console.log(`✅ Created ${createdUsers.length} users`)

    // 4. Create teachers
    console.log('Creating teachers...')
    const teachers = []
    schools.forEach(school => {
      SAMPLE_TEACHERS.slice(0, 2).forEach(teacherName => {
        teachers.push({
          school_id: school.id,
          name: teacherName
        })
      })
    })

    const { data: createdTeachers, error: teachersError } = await supabase
      .from('teachers')
      .insert(teachers)
      .select()

    if (teachersError) throw teachersError
    console.log(`✅ Created ${createdTeachers.length} teachers`)

    // 5. Create classes
    console.log('Creating classes...')
    const classes = []
    createdTeachers.forEach(teacher => {
      SAMPLE_CLASSES.slice(0, 2).forEach(classData => {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)]
        classes.push({
          school_id: teacher.school_id,
          subject_id: randomSubject.id,
          teacher_id: teacher.id,
          title: classData.title,
          code: classData.code,
          term: 'Fall 2024'
        })
      })
    })

    const { data: createdClasses, error: classesError } = await supabase
      .from('classes')
      .insert(classes)
      .select()

    if (classesError) throw classesError
    console.log(`✅ Created ${createdClasses.length} classes`)

    // 6. Create resources
    console.log('Creating resources...')
    const resources = []
    
    // Create resources for each class
    createdClasses.forEach((cls, classIndex) => {
      SAMPLE_RESOURCES.forEach((resourceData, resourceIndex) => {
        const randomUser = createdUsers[resourceIndex % createdUsers.length]
        resources.push({
          class_id: cls.id,
          uploader_id: randomUser.id,
          type: resourceData.type,
          title: `${resourceData.title} - ${cls.code}`
        })
      })
    })

    const { data: createdResources, error: resourcesError } = await supabase
      .from('resources')
      .insert(resources)
      .select()

    if (resourcesError) throw resourcesError
    console.log(`✅ Created ${createdResources.length} resources`)

    // 7. Create AI derivatives
    console.log('Creating AI derivatives...')
    const aiDerivatives = createdResources.map(resource => ({
      resource_id: resource.id,
      status: 'ready',
      summary: `Generated practice questions from ${resource.title}`,
      structured_json: SAMPLE_STRUCTURED_CONTENT,
      html_render: '<div class="practice-content">AI-generated practice questions</div>'
    }))

    const { data: createdDerivatives, error: derivativesError } = await supabase
      .from('ai_derivatives')
      .insert(aiDerivatives)
      .select()

    if (derivativesError) throw derivativesError
    console.log(`✅ Created ${createdDerivatives.length} AI derivatives`)

    // 8. Create some votes
    console.log('Creating votes...')
    const votes = []
    createdResources.forEach(resource => {
      // Add 2-5 random votes per resource
      const numVotes = Math.floor(Math.random() * 4) + 2
      const voters = createdUsers.slice(0, numVotes)
      
      voters.forEach(voter => {
        if (voter.id !== resource.uploader_id) {
          votes.push({
            resource_id: resource.id,
            voter_id: voter.id,
            value: Math.random() > 0.2 ? 1 : -1 // 80% upvotes
          })
        }
      })
    })

    const { data: createdVotes, error: votesError } = await supabase
      .from('votes')
      .insert(votes)
      .select()

    if (votesError) throw votesError
    console.log(`✅ Created ${createdVotes.length} votes`)

    // 9. Create points ledger
    console.log('Creating points ledger...')
    const pointsEntries = []
    
    // Award upload points
    createdResources.forEach(resource => {
      pointsEntries.push({
        user_id: resource.uploader_id,
        delta: 5,
        reason: 'upload'
      })
    })

    // Award upvote points
    createdVotes.forEach(vote => {
      if (vote.value === 1) {
        const resource = createdResources.find(r => r.id === vote.resource_id)
        if (resource) {
          pointsEntries.push({
            user_id: resource.uploader_id,
            delta: 2,
            reason: 'net_upvote'
          })
        }
      }
    })

    const { data: createdPoints, error: pointsError } = await supabase
      .from('points_ledger')
      .insert(pointsEntries)
      .select()

    if (pointsError) throw pointsError
    console.log(`✅ Created ${createdPoints.length} points entries`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('\nSummary:')
    console.log(`- ${schools.length} schools`)
    console.log(`- ${subjects.length} subjects`)
    console.log(`- ${createdUsers.length} users`)
    console.log(`- ${createdTeachers.length} teachers`)
    console.log(`- ${createdClasses.length} classes`)
    console.log(`- ${createdResources.length} resources`)
    console.log(`- ${createdDerivatives.length} AI derivatives`)
    console.log(`- ${createdVotes.length} votes`)
    console.log(`- ${createdPoints.length} points entries`)
    console.log('\n🚀 You can now run "npm run dev" and visit http://localhost:3000')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Check if we should run the seed
async function main() {
  console.log('🔍 Checking database...')
  
  try {
    const { count } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })

    if (count > 0) {
      console.log('⚠️  Database already has data. Skipping seed.')
      console.log('To re-seed, first clear the data manually in Supabase dashboard.')
      process.exit(0)
    }

    await seedDatabase()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
