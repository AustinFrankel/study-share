// Real 2025-2026 test dates with exact times
export const STANDARDIZED_TESTS_2025 = [
  // Custom on-demand SAT entry for admin-created practice content
  // Placed within the 31-day window so it shows at the very top under "Active Tests"
  {
    id: 'test',
    name: 'SAT',
    fullName: 'test',
    // Set ~31 days from Oct 11, 2025 so it remains in the active window and sorts to top
    date: new Date('2025-11-11T08:00:00'),
    description: 'Custom SAT practice content (admin uploaded)',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: true
  },
  // 2025 SAT Dates
  {
    id: 'sat-aug-2025',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - August 2025',
    date: new Date('2025-08-23T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-sep-2025',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - September 2025',
    date: new Date('2025-09-13T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-oct-2025',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - October 2025',
    date: new Date('2025-10-04T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-nov-2025',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - November 2025',
    date: new Date('2025-11-08T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-dec-2025',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - December 2025',
    date: new Date('2025-12-06T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  // 2026 SAT Dates
  {
    id: 'sat-mar-2026',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - March 2026',
    date: new Date('2026-03-14T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-may-2026',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - May 2026',
    date: new Date('2026-05-02T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'sat-jun-2026',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - June 2026',
    date: new Date('2026-06-06T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions',
    hasResources: false
  },
  // PSAT
  {
    id: 'psat-2025',
    name: 'PSAT',
    fullName: 'PSAT/NMSQT 2025',
    date: new Date('2025-10-15T08:00:00'),
    description: 'College Board preliminary exam for college admissions',
    color: 'from-indigo-500 to-indigo-600',
    icon: '📝',
    category: 'College Admissions',
    hasResources: false
  },
  // ACT 2025-2026 Dates
  {
    id: 'act-sep-2025',
    name: 'ACT',
    fullName: 'ACT Test - September 2025',
    date: new Date('2025-09-20T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-oct-2025',
    name: 'ACT',
    fullName: 'ACT Test - October 2025',
    date: new Date('2025-10-26T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-dec-2025',
    name: 'ACT',
    fullName: 'ACT Test - December 2025',
    date: new Date('2025-12-14T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-feb-2026',
    name: 'ACT',
    fullName: 'ACT Test - February 2026',
    date: new Date('2026-02-07T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-apr-2026',
    name: 'ACT',
    fullName: 'ACT Test - April 2026',
    date: new Date('2026-04-04T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-jun-2026',
    name: 'ACT',
    fullName: 'ACT Test - June 2026',
    date: new Date('2026-06-13T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  },
  {
    id: 'act-jul-2026',
    name: 'ACT',
    fullName: 'ACT Test - July 2026',
    date: new Date('2026-07-18T08:00:00'),
    description: 'ACT college admissions test',
    color: 'from-purple-500 to-purple-600',
    icon: '📊',
    category: 'College Admissions',
    hasResources: false
  }
]

// AP Exams 2025 & 2026 - Based on College Board official schedule
export const AP_EXAMS_2025 = [
  // Week 1: May 5-9, 2025
  { id: 'ap-biology-2025', name: 'Biology', fullName: 'AP Biology', date: new Date('2025-05-05T08:00:00'), time: '8 AM', color: 'from-green-400 to-green-500', icon: '🧬', hasResources: false },
  { id: 'ap-european-history-2025', name: 'European History', fullName: 'AP European History', date: new Date('2025-05-05T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '🏰', hasResources: false },
  { id: 'ap-microeconomics-2025', name: 'Microeconomics', fullName: 'AP Microeconomics', date: new Date('2025-05-05T08:00:00'), time: '8 AM', color: 'from-emerald-400 to-emerald-500', icon: '💰', hasResources: false },
  { id: 'ap-latin-2025', name: 'Latin', fullName: 'AP Latin', date: new Date('2025-05-05T12:00:00'), time: '12 PM', color: 'from-stone-400 to-stone-500', icon: '�️', hasResources: false },
  
  { id: 'ap-chemistry-2025', name: 'Chemistry', fullName: 'AP Chemistry', date: new Date('2025-05-06T08:00:00'), time: '8 AM', color: 'from-teal-400 to-teal-500', icon: '⚗️', hasResources: false },
  { id: 'ap-human-geography-2025', name: 'Human Geography', fullName: 'AP Human Geography', date: new Date('2025-05-06T08:00:00'), time: '8 AM', color: 'from-cyan-400 to-cyan-500', icon: '🗺️', hasResources: false },
  { id: 'ap-us-government-2025', name: 'US Government', fullName: 'AP United States Government and Politics', date: new Date('2025-05-06T12:00:00'), time: '12 PM', color: 'from-blue-400 to-blue-500', icon: '🏛️', hasResources: false },
  
  { id: 'ap-english-literature-2025', name: 'English Literature', fullName: 'AP English Literature and Composition', date: new Date('2025-05-07T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '📚', hasResources: false },
  { id: 'ap-comparative-government-2025', name: 'Comparative Government', fullName: 'AP Comparative Government and Politics', date: new Date('2025-05-07T12:00:00'), time: '12 PM', color: 'from-purple-400 to-purple-500', icon: '🌐', hasResources: false },
  { id: 'ap-computer-science-a-2025', name: 'Computer Science A', fullName: 'AP Computer Science A', date: new Date('2025-05-07T12:00:00'), time: '12 PM', color: 'from-slate-400 to-slate-500', icon: '💻', hasResources: false },
  
  { id: 'ap-african-american-studies-2025', name: 'African American Studies', fullName: 'AP African American Studies', date: new Date('2025-05-08T08:00:00'), time: '8 AM', color: 'from-red-400 to-red-500', icon: '�', hasResources: false },
  { id: 'ap-statistics-2025', name: 'Statistics', fullName: 'AP Statistics', date: new Date('2025-05-08T08:00:00'), time: '8 AM', color: 'from-indigo-400 to-indigo-500', icon: '📊', hasResources: false },
  { id: 'ap-japanese-2025', name: 'Japanese Language', fullName: 'AP Japanese Language and Culture', date: new Date('2025-05-08T12:00:00'), time: '12 PM', color: 'from-pink-400 to-pink-500', icon: '🇯🇵', hasResources: false },
  { id: 'ap-world-history-2025', name: 'World History', fullName: 'AP World History: Modern', date: new Date('2025-05-08T12:00:00'), time: '12 PM', color: 'from-orange-400 to-orange-500', icon: '🌍', hasResources: false },
  
  { id: 'ap-italian-2025', name: 'Italian Language', fullName: 'AP Italian Language and Culture', date: new Date('2025-05-09T08:00:00'), time: '8 AM', color: 'from-emerald-400 to-emerald-500', icon: '🇮🇹', hasResources: false },
  { id: 'ap-us-history-2025', name: 'US History', fullName: 'AP United States History', date: new Date('2025-05-09T08:00:00'), time: '8 AM', color: 'from-red-400 to-red-500', icon: '�', hasResources: false },
  { id: 'ap-chinese-2025', name: 'Chinese Language', fullName: 'AP Chinese Language and Culture', date: new Date('2025-05-09T12:00:00'), time: '12 PM', color: 'from-red-400 to-red-500', icon: '🇨🇳', hasResources: false },
  { id: 'ap-macroeconomics-2025', name: 'Macroeconomics', fullName: 'AP Macroeconomics', date: new Date('2025-05-09T12:00:00'), time: '12 PM', color: 'from-green-400 to-green-500', icon: '💵', hasResources: false },

  // Week 2: May 12-16, 2025
  { id: 'ap-calculus-ab-2025', name: 'Calculus AB', fullName: 'AP Calculus AB', date: new Date('2025-05-12T08:00:00'), time: '8 AM', color: 'from-blue-400 to-blue-500', icon: '📐', hasResources: false },
  { id: 'ap-calculus-bc-2025', name: 'Calculus BC', fullName: 'AP Calculus BC', date: new Date('2025-05-12T08:00:00'), time: '8 AM', color: 'from-indigo-400 to-indigo-500', icon: '∫', hasResources: false },
  { id: 'ap-music-theory-2025', name: 'Music Theory', fullName: 'AP Music Theory', date: new Date('2025-05-12T12:00:00'), time: '12 PM', color: 'from-violet-400 to-violet-500', icon: '�', hasResources: false },
  { id: 'ap-seminar-2025', name: 'Seminar', fullName: 'AP Seminar', date: new Date('2025-05-12T12:00:00'), time: '12 PM', color: 'from-fuchsia-400 to-fuchsia-500', icon: '🎓', hasResources: false },
  
  { id: 'ap-french-2025', name: 'French Language', fullName: 'AP French Language and Culture', date: new Date('2025-05-13T08:00:00'), time: '8 AM', color: 'from-blue-400 to-blue-500', icon: '🇫�', hasResources: false },
  { id: 'ap-precalculus-2025', name: 'Precalculus', fullName: 'AP Precalculus', date: new Date('2025-05-13T08:00:00'), time: '8 AM', color: 'from-cyan-400 to-cyan-500', icon: '📏', hasResources: false },
  { id: 'ap-environmental-science-2025', name: 'Environmental Science', fullName: 'AP Environmental Science', date: new Date('2025-05-13T12:00:00'), time: '12 PM', color: 'from-green-400 to-green-500', icon: '🌱', hasResources: false },
  { id: 'ap-physics-2-2025', name: 'Physics 2', fullName: 'AP Physics 2: Algebra-Based', date: new Date('2025-05-13T12:00:00'), time: '12 PM', color: 'from-sky-400 to-sky-500', icon: '⚡', hasResources: false },
  
  { id: 'ap-english-language-2025', name: 'English Language', fullName: 'AP English Language and Composition', date: new Date('2025-05-14T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '📖', hasResources: false },
  { id: 'ap-german-2025', name: 'German Language', fullName: 'AP German Language and Culture', date: new Date('2025-05-14T12:00:00'), time: '12 PM', color: 'from-gray-400 to-gray-500', icon: '🇩🇪', hasResources: false },
  { id: 'ap-physics-c-mechanics-2025', name: 'Physics C: Mechanics', fullName: 'AP Physics C: Mechanics', date: new Date('2025-05-14T12:00:00'), time: '12 PM', color: 'from-cyan-400 to-cyan-500', icon: '⚡', hasResources: false },
  
  { id: 'ap-art-history-2025', name: 'Art History', fullName: 'AP Art History', date: new Date('2025-05-15T08:00:00'), time: '8 AM', color: 'from-rose-400 to-rose-500', icon: '🎨', hasResources: false },
  { id: 'ap-spanish-language-2025', name: 'Spanish Language', fullName: 'AP Spanish Language and Culture', date: new Date('2025-05-15T08:00:00'), time: '8 AM', color: 'from-yellow-400 to-yellow-500', icon: '🇪🇸', hasResources: false },
  { id: 'ap-computer-science-principles-2025', name: 'Computer Science Principles', fullName: 'AP Computer Science Principles', date: new Date('2025-05-15T12:00:00'), time: '12 PM', color: 'from-blue-400 to-blue-500', icon: '💾', hasResources: false },
  { id: 'ap-physics-c-em-2025', name: 'Physics C: E&M', fullName: 'AP Physics C: Electricity and Magnetism', date: new Date('2025-05-15T12:00:00'), time: '12 PM', color: 'from-sky-400 to-sky-500', icon: '🔬', hasResources: false },
  
  { id: 'ap-physics-1-2025', name: 'Physics 1', fullName: 'AP Physics 1: Algebra-Based', date: new Date('2025-05-16T08:00:00'), time: '8 AM', color: 'from-indigo-400 to-indigo-500', icon: '🔭', hasResources: false },
  { id: 'ap-psychology-2025', name: 'Psychology', fullName: 'AP Psychology', date: new Date('2025-05-16T12:00:00'), time: '12 PM', color: 'from-purple-400 to-purple-500', icon: '�', hasResources: false },
  { id: 'ap-spanish-literature-2025', name: 'Spanish Literature', fullName: 'AP Spanish Literature and Culture', date: new Date('2025-05-16T12:00:00'), time: '12 PM', color: 'from-orange-400 to-orange-500', icon: '📖', hasResources: false },

  // 2026 AP Exams - Week 1: May 4-8, 2026
  { id: 'ap-biology-2026', name: 'Biology', fullName: 'AP Biology (2026)', date: new Date('2026-05-04T08:00:00'), time: '8 AM', color: 'from-green-400 to-green-500', icon: '🧬', hasResources: false },
  { id: 'ap-european-history-2026', name: 'European History', fullName: 'AP European History (2026)', date: new Date('2026-05-04T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '�', hasResources: false },
  { id: 'ap-latin-2026', name: 'Latin', fullName: 'AP Latin (2026)', date: new Date('2026-05-04T12:00:00'), time: '12 PM', color: 'from-stone-400 to-stone-500', icon: '�️', hasResources: false },
  { id: 'ap-microeconomics-2026', name: 'Microeconomics', fullName: 'AP Microeconomics (2026)', date: new Date('2026-05-04T12:00:00'), time: '12 PM', color: 'from-emerald-400 to-emerald-500', icon: '💰', hasResources: false },
  
  // Additional 2026 exams (Week 1 continued)
  { id: 'ap-chemistry-2026', name: 'Chemistry', fullName: 'AP Chemistry (2026)', date: new Date('2026-05-05T08:00:00'), time: '8 AM', color: 'from-teal-400 to-teal-500', icon: '⚗️', hasResources: false },
  { id: 'ap-human-geography-2026', name: 'Human Geography', fullName: 'AP Human Geography (2026)', date: new Date('2026-05-05T08:00:00'), time: '8 AM', color: 'from-cyan-400 to-cyan-500', icon: '🗺️', hasResources: false },
  { id: 'ap-us-government-2026', name: 'US Government', fullName: 'AP United States Government and Politics (2026)', date: new Date('2026-05-05T12:00:00'), time: '12 PM', color: 'from-blue-400 to-blue-500', icon: '🏛️', hasResources: false }
]

export const REGENTS_NY_2025 = [
  // June 2025 Administration
  { id: 'regents-algebra-1', name: 'Algebra I', fullName: 'NYS Regents Algebra I', date: new Date('2025-06-17T09:00:00'), time: '9 AM', color: 'from-blue-400 to-blue-500', icon: '➕' },
  { id: 'regents-english', name: 'English', fullName: 'NYS Regents English Language Arts', date: new Date('2025-06-17T09:00:00'), time: '9 AM', color: 'from-amber-400 to-amber-500', icon: '📝' },
  { id: 'regents-us-history', name: 'US History', fullName: 'NYS Regents US History and Government', date: new Date('2025-06-17T13:30:00'), time: '1:30 PM', color: 'from-red-400 to-red-500', icon: '🗽' },
  { id: 'regents-geometry', name: 'Geometry', fullName: 'NYS Regents Geometry', date: new Date('2025-06-18T09:00:00'), time: '9 AM', color: 'from-cyan-400 to-cyan-500', icon: '📐' },
  { id: 'regents-living-environment', name: 'Living Environment', fullName: 'NYS Regents Living Environment', date: new Date('2025-06-18T09:00:00'), time: '9 AM', color: 'from-green-400 to-green-500', icon: '🌿' },
  { id: 'regents-global-history', name: 'Global History', fullName: 'NYS Regents Global History and Geography', date: new Date('2025-06-18T13:30:00'), time: '1:30 PM', color: 'from-orange-400 to-orange-500', icon: '🌍' },
  { id: 'regents-algebra-2', name: 'Algebra II', fullName: 'NYS Regents Algebra II', date: new Date('2025-06-19T09:00:00'), time: '9 AM', color: 'from-indigo-400 to-indigo-500', icon: '∑' },
  { id: 'regents-chemistry', name: 'Chemistry', fullName: 'NYS Regents Chemistry', date: new Date('2025-06-19T09:00:00'), time: '9 AM', color: 'from-purple-400 to-purple-500', icon: '⚗️' },
  { id: 'regents-earth-science', name: 'Earth Science', fullName: 'NYS Regents Earth Science', date: new Date('2025-06-20T09:00:00'), time: '9 AM', color: 'from-teal-400 to-teal-500', icon: '🌎' },
  { id: 'regents-physics', name: 'Physics', fullName: 'NYS Regents Physics', date: new Date('2025-06-20T09:00:00'), time: '9 AM', color: 'from-sky-400 to-sky-500', icon: '⚡' },
  // August 2025 Administration
  { id: 'regents-algebra-1-aug', name: 'Algebra I (August)', fullName: 'NYS Regents Algebra I - August', date: new Date('2025-08-13T09:00:00'), time: '9 AM', color: 'from-blue-400 to-blue-500', icon: '➕' },
  { id: 'regents-english-aug', name: 'English (August)', fullName: 'NYS Regents English - August', date: new Date('2025-08-13T09:00:00'), time: '9 AM', color: 'from-amber-400 to-amber-500', icon: '📝' },
  { id: 'regents-geometry-aug', name: 'Geometry (August)', fullName: 'NYS Regents Geometry - August', date: new Date('2025-08-14T09:00:00'), time: '9 AM', color: 'from-cyan-400 to-cyan-500', icon: '📐' },
  { id: 'regents-living-environment-aug', name: 'Living Environment (August)', fullName: 'NYS Regents Living Environment - August', date: new Date('2025-08-14T09:00:00'), time: '9 AM', color: 'from-green-400 to-green-500', icon: '🌿' },
  { id: 'regents-us-history-aug', name: 'US History (August)', fullName: 'NYS Regents US History - August', date: new Date('2025-08-14T13:30:00'), time: '1:30 PM', color: 'from-red-400 to-red-500', icon: '🗽' }
]
