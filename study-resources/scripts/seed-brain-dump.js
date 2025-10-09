// This script adds sample data for the Brain Dump feature

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedBrainDumpData() {
  console.log('🧠 Seeding Brain Dump data...')

  try {
    // Get existing classes and users for reference
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id')
      .limit(5)

    if (classesError) throw classesError
    if (!classes || classes.length === 0) {
      console.error('No classes found. Please run the main seed script first.')
      process.exit(1)
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(5)

    if (usersError) throw usersError
    if (!users || users.length === 0) {
      console.error('No users found. Please run the main seed script first.')
      process.exit(1)
    }

    // Sample brain dumps data
    const brainDumps = [
      {
        id: uuidv4(),
        class_id: classes[0].id,
        title: 'Lecture Notes - Introduction to Calculus',
        content: 'Today we covered the basics of limits and derivatives. Key points:\n\n- Limits are the foundation of calculus\n- A derivative measures the rate of change\n- The power rule: d/dx(x^n) = nx^(n-1)\n\nExamples we worked through:\n1. Find the limit of (x^2-1)/(x-1) as x approaches 1\n2. Calculate the derivative of f(x) = x^3 + 2x^2 - 5x + 3',
        contributor_id: users[0].id,
        status: 'approved',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        class_id: classes[0].id,
        title: 'Study Guide for Midterm',
        content: 'MIDTERM STUDY GUIDE\n\nTopics to review:\n- Limits and continuity\n- Derivatives and their applications\n- Implicit differentiation\n- Related rates\n\nPractice problems:\n- Pages 45-47 in the textbook\n- Online homework sets 3-5\n- Previous quiz questions (especially #4 and #7)',
        contributor_id: users[1].id,
        status: 'approved',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        class_id: classes[0].id,
        title: 'Today\'s Lecture on Integration',
        content: 'Integration Techniques:\n\n1. Substitution method (u-substitution)\n2. Integration by parts: ∫u dv = uv - ∫v du\n3. Partial fractions\n\nWe worked through several examples in class. The professor emphasized that the midterm will focus heavily on u-substitution problems.',
        contributor_id: users[2].id,
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: uuidv4(),
        class_id: classes[1].id,
        title: 'Literary Analysis Techniques',
        content: 'LITERARY ANALYSIS FRAMEWORKS\n\n1. Close Reading\n   - Focus on specific passages\n   - Analyze word choice, imagery, and syntax\n   - Connect micro-analysis to broader themes\n\n2. Historical Context\n   - Consider when the work was written\n   - Research relevant social/political events\n   - Identify how context influences the text\n\n3. Theoretical Approaches\n   - Feminist criticism\n   - Marxist analysis\n   - Psychoanalytic reading\n   - Post-colonial interpretation',
        contributor_id: users[0].id,
        status: 'approved',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Sample master notes data
    const masterNotes = [
      {
        id: uuidv4(),
        class_id: classes[0].id,
        content: '# Calculus I - Comprehensive Notes\n\n## Limits and Continuity\n\nA limit describes the behavior of a function as its input approaches a specific value.\n\nKey concepts:\n- Limit definition: lim(x→a) f(x) = L\n- One-sided limits: left-hand and right-hand limits\n- Properties of limits: sum, product, quotient rules\n- Continuity: a function is continuous at a point if the limit exists and equals the function value\n\n## Derivatives\n\nThe derivative represents the rate of change of a function.\n\nKey formulas:\n- Power rule: d/dx(x^n) = nx^(n-1)\n- Product rule: d/dx(f(x)g(x)) = f\'(x)g(x) + f(x)g\'(x)\n- Quotient rule: d/dx(f(x)/g(x)) = (f\'(x)g(x) - f(x)g\'(x))/[g(x)]^2\n- Chain rule: d/dx(f(g(x))) = f\'(g(x)) · g\'(x)\n\n## Applications of Derivatives\n\n- Finding slopes of tangent lines\n- Rate of change problems\n- Optimization (finding maxima and minima)\n- Related rates\n- L\'Hôpital\'s rule for evaluating limits\n\n## Integration Basics\n\nIntegration is the reverse process of differentiation.\n\nKey concepts:\n- Indefinite integrals: ∫f(x)dx = F(x) + C\n- Definite integrals: ∫[a,b]f(x)dx = F(b) - F(a)\n- Fundamental Theorem of Calculus\n- Basic integration rules\n\n## Integration Techniques\n\n1. Substitution method (u-substitution)\n2. Integration by parts: ∫u dv = uv - ∫v du\n3. Partial fractions for rational functions',
        last_contributor_id: users[1].id,
        version: 3,
        last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: uuidv4(),
        class_id: classes[1].id,
        content: '# English Literature - Course Notes\n\n## Literary Analysis Techniques\n\n1. Close Reading\n   - Focus on specific passages\n   - Analyze word choice, imagery, and syntax\n   - Connect micro-analysis to broader themes\n\n2. Historical Context\n   - Consider when the work was written\n   - Research relevant social/political events\n   - Identify how context influences the text\n\n3. Theoretical Approaches\n   - Feminist criticism\n   - Marxist analysis\n   - Psychoanalytic reading\n   - Post-colonial interpretation\n\n## Key Literary Movements\n\n1. Romanticism (late 18th - mid 19th century)\n   - Emphasis on emotion, individualism, and nature\n   - Reaction against rationalism and industrialization\n   - Key authors: Wordsworth, Coleridge, Shelley, Keats\n\n2. Realism (mid to late 19th century)\n   - Accurate depiction of everyday life\n   - Focus on middle/working class experiences\n   - Key authors: Dickens, Eliot, Hardy\n\n3. Modernism (early to mid 20th century)\n   - Experimentation with form and style\n   - Stream of consciousness technique\n   - Fragmentation and alienation themes\n   - Key authors: Joyce, Woolf, Eliot, Faulkner',
        last_contributor_id: users[0].id,
        version: 1,
        last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      }
    ]

    // Insert brain dumps
    const { error: brainDumpsError } = await supabase
      .from('brain_dumps')
      .insert(brainDumps)

    if (brainDumpsError) throw brainDumpsError
    console.log(`✅ Added ${brainDumps.length} brain dumps`)

    // Insert master notes
    const { error: masterNotesError } = await supabase
      .from('master_notes')
      .insert(masterNotes)

    if (masterNotesError) throw masterNotesError
    console.log(`✅ Added ${masterNotes.length} master notes`)

    console.log('🎉 Brain Dump data seeded successfully!')
  } catch (error) {
    console.error('Error seeding Brain Dump data:', error)
    process.exit(1)
  }
}

seedBrainDumpData()