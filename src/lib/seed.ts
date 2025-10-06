import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

// Sample data for seeding
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
  { name: 'Economics' },
  { name: 'History' },
]

const SAMPLE_TEACHERS = [
  'Dr. Sarah Johnson',
  'Prof. Michael Chen',
  'Dr. Emily Rodriguez',
  'Prof. David Kim',
  'Dr. Lisa Wang',
  'Prof. James Brown',
  'Dr. Maria Garcia',
  'Prof. Robert Taylor',
]

const SAMPLE_CLASSES = [
  { title: 'Introduction to Computer Science', code: 'CS 101' },
  { title: 'Data Structures and Algorithms', code: 'CS 201' },
  { title: 'Calculus I', code: 'MATH 101' },
  { title: 'Linear Algebra', code: 'MATH 201' },
  { title: 'General Physics', code: 'PHYS 101' },
  { title: 'Organic Chemistry', code: 'CHEM 201' },
  { title: 'Introduction to Psychology', code: 'PSYC 101' },
  { title: 'Microeconomics', code: 'ECON 101' },
]

const SAMPLE_RESOURCES = [
  {
    title: 'Midterm Study Guide - Data Structures',
    type: 'study_guide' as const,
    summary: 'Comprehensive study guide covering arrays, linked lists, stacks, and queues'
  },
  {
    title: 'Calculus Practice Problems',
    type: 'practice_set' as const,
    summary: 'Practice problems for derivatives and integrals'
  },
  {
    title: 'Physics Lab Notes - Week 5',
    type: 'notes' as const,
    summary: 'Laboratory notes on momentum and energy conservation'
  },
  {
    title: 'Previous Semester Final Exam',
    type: 'past_material' as const,
    summary: 'Final exam from Spring 2023 with solutions'
  },
  {
    title: 'Psychology Chapter 6 Summary',
    type: 'notes' as const,
    summary: 'Summary of memory and cognition chapter'
  },
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
      type: 'mcq' as const,
      prompt: 'Which type of memory has the shortest duration?',
      choices: ['A) Long-term memory', 'B) Short-term memory', 'C) Sensory memory', 'D) Working memory'],
      answer: 'C) Sensory memory',
      explanation: 'Sensory memory lasts only 0.5-3 seconds, making it the shortest duration memory type.'
    },
    {
      type: 'short' as const,
      prompt: 'Define working memory and explain its role in cognition.',
      answer: 'Working memory is a temporary storage system that actively maintains and manipulates information needed for cognitive tasks.',
      explanation: 'Working memory is crucial for reasoning, learning, and comprehension as it holds information while we process it.'
    },
    {
      type: 'frq' as const,
      prompt: 'Compare and contrast the three main types of memory systems. Include duration, capacity, and function of each.',
      answer: 'Sensory memory (0.5-3 sec, unlimited capacity, filters information), Short-term memory (15-30 sec, 7±2 items, temporary processing), Long-term memory (permanent, unlimited, permanent storage).',
      explanation: 'Each memory system serves a different function in information processing, working together to encode, store, and retrieve information.'
    }
  ],
  notes: [
    'Memory is a multi-stage process involving encoding, storage, and retrieval',
    'Different types of memory serve different functions in cognition',
    'Memory strategies can significantly improve retention and recall'
  ]
}

const SAMPLE_COMMENTS = [
  'This is really helpful for the upcoming exam! Thanks for sharing.',
  'Great summary of the key concepts. The examples are particularly useful.',
  'Could you clarify the difference between working memory and short-term memory?',
  'This matches what we covered in lecture. Nice work!',
  'The practice problems are perfect for review. Much appreciated!',
]

// Generate random handle
function generateHandle(): string {
  const adjectives = ['cobalt', 'crimson', 'azure', 'golden', 'silver', 'emerald', 'violet', 'amber']
  const animals = ['walrus', 'penguin', 'dolphin', 'octopus', 'tiger', 'eagle', 'wolf', 'bear']
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const animal = animals[Math.floor(Math.random() * animals.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}-${animal}-${number}`
}

// Main seed function
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...')
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('ai_derivatives').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('files').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('classes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('subjects').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('schools').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('points_ledger').delete().neq('id', '00000000-0000-0000-0000-000000000000')

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
    const users: Array<{ id: string; handle: string; handle_version: number }> = []
    for (let i = 0; i < 10; i++) {
      users.push({
        id: uuidv4(),
        handle: generateHandle(),
        handle_version: 1
      })
    }

    const { data: createdUsers, error: usersError } = await supabase
      .from('users')
      .insert(users)
      .select()

    if (usersError) throw usersError
    console.log(`✅ Created ${createdUsers.length} users`)

    // 4. Create teachers
    console.log('Creating teachers...')
    const teachers: Array<{ school_id: string; name: string }> = []
    schools.forEach(school => {
      SAMPLE_TEACHERS.slice(0, 3).forEach(teacherName => {
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
    const classes: Array<{ school_id: string; subject_id: string; teacher_id: string; title: string; code: string; term: string }> = []
    createdTeachers.forEach(teacher => {
      SAMPLE_CLASSES.slice(0, 3).forEach(classData => {
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
      .insert(classes.slice(0, 20)) // Limit to 20 classes
      .select()

    if (classesError) throw classesError
    console.log(`✅ Created ${createdClasses.length} classes`)

    // 6. Create resources
    console.log('Creating resources...')
    const resources: Array<{ class_id: string; uploader_id: string; type: string; title: string }> = []
    SAMPLE_RESOURCES.forEach((resourceData, index) => {
      const randomClass = createdClasses[index % createdClasses.length]
      const randomUser = createdUsers[index % createdUsers.length]
      
      resources.push({
        class_id: randomClass.id,
        uploader_id: randomUser.id,
        type: resourceData.type,
        title: resourceData.title
      })
    })

    // Create additional resources
    for (let i = 0; i < 15; i++) {
      const randomClass = createdClasses[Math.floor(Math.random() * createdClasses.length)]
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const randomResource = SAMPLE_RESOURCES[Math.floor(Math.random() * SAMPLE_RESOURCES.length)]
      
      resources.push({
        class_id: randomClass.id,
        uploader_id: randomUser.id,
        type: randomResource.type,
        title: `${randomResource.title} - ${i + 1}`,
      })
    }

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
      status: 'ready' as const,
      summary: `Generated ${SAMPLE_STRUCTURED_CONTENT.items.length} practice questions from ${resource.title}`,
      structured_json: SAMPLE_STRUCTURED_CONTENT,
      html_render: '<div>AI-generated practice content</div>' // Simplified for seed data
    }))

    const { data: createdDerivatives, error: derivativesError } = await supabase
      .from('ai_derivatives')
      .insert(aiDerivatives)
      .select()

    if (derivativesError) throw derivativesError
    console.log(`✅ Created ${createdDerivatives.length} AI derivatives`)

    // 8. Create votes
    console.log('Creating votes...')
    const votes: Array<{ resource_id: string; voter_id: string; value: number }> = []
    createdResources.forEach(resource => {
      // Random number of votes for each resource
      const numVotes = Math.floor(Math.random() * 10) + 1
      const voters = createdUsers.slice(0, numVotes)
      
      voters.forEach(voter => {
        if (voter.id !== resource.uploader_id) { // Don't let users vote on their own resources
          votes.push({
            resource_id: resource.id,
            voter_id: voter.id,
            value: Math.random() > 0.3 ? 1 : -1 // 70% upvotes, 30% downvotes
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

    // 9. Create comments
    console.log('Creating comments...')
    const comments: Array<{ resource_id: string; author_id: string; body: string }> = []
    createdResources.forEach(resource => {
      // Random number of comments for each resource
      const numComments = Math.floor(Math.random() * 5) + 1
      
      for (let i = 0; i < numComments; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]
        const randomComment = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)]
        
        comments.push({
          resource_id: resource.id,
          author_id: randomUser.id,
          body: randomComment
        })
      }
    })

    const { data: createdComments, error: commentsError } = await supabase
      .from('comments')
      .insert(comments)
      .select()

    if (commentsError) throw commentsError
    console.log(`✅ Created ${createdComments.length} comments`)

    // 10. Create points ledger entries
    console.log('Creating points ledger...')
    const pointsEntries: Array<{ user_id: string; delta: number; reason: string }> = []
    
    // Award points for uploads
    createdUsers.forEach(user => {
      const userResources = createdResources.filter(r => r.uploader_id === user.id)
      userResources.forEach(resource => {
        pointsEntries.push({
          user_id: user.id,
          delta: 5,
          reason: 'upload'
        })
      })
    })

    // Award points for net upvotes
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
    console.log('Summary:')
    console.log(`- ${schools.length} schools`)
    console.log(`- ${subjects.length} subjects`)
    console.log(`- ${createdUsers.length} users`)
    console.log(`- ${createdTeachers.length} teachers`)
    console.log(`- ${createdClasses.length} classes`)
    console.log(`- ${createdResources.length} resources`)
    console.log(`- ${createdDerivatives.length} AI derivatives`)
    console.log(`- ${createdVotes.length} votes`)
    console.log(`- ${createdComments.length} comments`)
    console.log(`- ${createdPoints.length} points entries`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Function to check if database is empty
export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const { count } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })

    return (count || 0) === 0
  } catch (error) {
    console.error('Error checking if database is empty:', error)
    return false
  }
}
