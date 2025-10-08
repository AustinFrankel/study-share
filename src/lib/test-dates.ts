// Real 2025 test dates with exact times
export const STANDARDIZED_TESTS_2025 = [
  {
    id: 'sat-mar',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - March',
    date: new Date('2025-03-08T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions'
  },
  {
    id: 'sat-may',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - May',
    date: new Date('2025-05-03T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions'
  },
  {
    id: 'sat-jun',
    name: 'SAT',
    fullName: 'SAT Reasoning Test - June',
    date: new Date('2025-06-07T08:00:00'),
    description: 'College Board standardized test for college admissions',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    category: 'College Admissions'
  },
  {
    id: 'act-feb',
    name: 'ACT',
    fullName: 'ACT - February',
    date: new Date('2025-02-08T08:00:00'),
    description: 'Standardized test for college admissions in the US',
    color: 'from-green-500 to-green-600',
    icon: '✏️',
    category: 'College Admissions'
  },
  {
    id: 'act-apr',
    name: 'ACT',
    fullName: 'ACT - April',
    date: new Date('2025-04-12T08:00:00'),
    description: 'Standardized test for college admissions in the US',
    color: 'from-green-500 to-green-600',
    icon: '✏️',
    category: 'College Admissions'
  },
  {
    id: 'act-jun',
    name: 'ACT',
    fullName: 'ACT - June',
    date: new Date('2025-06-14T08:00:00'),
    description: 'Standardized test for college admissions in the US',
    color: 'from-green-500 to-green-600',
    icon: '✏️',
    category: 'College Admissions'
  },
  {
    id: 'psat',
    name: 'PSAT',
    fullName: 'PSAT/NMSQT',
    date: new Date('2025-10-15T08:00:00'),
    description: 'College Board preliminary exam for college admissions',
    color: 'from-indigo-500 to-indigo-600',
    icon: '📝',
    category: 'College Admissions'
  }
]

// AP Exams with multiple choice (excluding portfolio/performance-based APs like Art, Music Theory, etc.)
export const AP_EXAMS_2025 = [
  // Week 1: May 5-9, 2025
  { id: 'ap-chinese', name: 'Chinese Language', fullName: 'AP Chinese Language and Culture', date: new Date('2025-05-05T12:00:00'), time: '12 PM', color: 'from-red-400 to-red-500', icon: '🇨🇳' },
  { id: 'ap-environmental-science', name: 'Environmental Science', fullName: 'AP Environmental Science', date: new Date('2025-05-06T08:00:00'), time: '8 AM', color: 'from-green-400 to-green-500', icon: '🌱' },
  { id: 'ap-psychology', name: 'Psychology', fullName: 'AP Psychology', date: new Date('2025-05-06T12:00:00'), time: '12 PM', color: 'from-purple-400 to-purple-500', icon: '🧠' },
  { id: 'ap-calculus-ab', name: 'Calculus AB', fullName: 'AP Calculus AB', date: new Date('2025-05-07T08:00:00'), time: '8 AM', color: 'from-blue-400 to-blue-500', icon: '📐' },
  { id: 'ap-calculus-bc', name: 'Calculus BC', fullName: 'AP Calculus BC', date: new Date('2025-05-07T08:00:00'), time: '8 AM', color: 'from-indigo-400 to-indigo-500', icon: '∫' },
  { id: 'ap-computer-science-a', name: 'Computer Science A', fullName: 'AP Computer Science A', date: new Date('2025-05-07T12:00:00'), time: '12 PM', color: 'from-slate-400 to-slate-500', icon: '💻' },
  { id: 'ap-italian', name: 'Italian Language', fullName: 'AP Italian Language and Culture', date: new Date('2025-05-08T08:00:00'), time: '8 AM', color: 'from-emerald-400 to-emerald-500', icon: '🇮🇹' },
  { id: 'ap-english-literature', name: 'English Literature', fullName: 'AP English Literature and Composition', date: new Date('2025-05-09T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '📚' },
  { id: 'ap-japanese', name: 'Japanese Language', fullName: 'AP Japanese Language and Culture', date: new Date('2025-05-09T12:00:00'), time: '12 PM', color: 'from-pink-400 to-pink-500', icon: '🇯🇵' },

  // Week 2: May 12-16, 2025
  { id: 'ap-us-government', name: 'US Government', fullName: 'AP United States Government and Politics', date: new Date('2025-05-12T08:00:00'), time: '8 AM', color: 'from-blue-400 to-blue-500', icon: '🏛️' },
  { id: 'ap-comparative-government', name: 'Comparative Government', fullName: 'AP Comparative Government and Politics', date: new Date('2025-05-12T12:00:00'), time: '12 PM', color: 'from-purple-400 to-purple-500', icon: '🌐' },
  { id: 'ap-chemistry', name: 'Chemistry', fullName: 'AP Chemistry', date: new Date('2025-05-13T08:00:00'), time: '8 AM', color: 'from-teal-400 to-teal-500', icon: '⚗️' },
  { id: 'ap-spanish-literature', name: 'Spanish Literature', fullName: 'AP Spanish Literature and Culture', date: new Date('2025-05-13T12:00:00'), time: '12 PM', color: 'from-orange-400 to-orange-500', icon: '📖' },
  { id: 'ap-english-language', name: 'English Language', fullName: 'AP English Language and Composition', date: new Date('2025-05-14T08:00:00'), time: '8 AM', color: 'from-amber-400 to-amber-500', icon: '📖' },
  { id: 'ap-german', name: 'German Language', fullName: 'AP German Language and Culture', date: new Date('2025-05-14T12:00:00'), time: '12 PM', color: 'from-gray-400 to-gray-500', icon: '🇩🇪' },
  { id: 'ap-us-history', name: 'US History', fullName: 'AP United States History', date: new Date('2025-05-15T08:00:00'), time: '8 AM', color: 'from-red-400 to-red-500', icon: '🗽' },
  { id: 'ap-physics-c-mechanics', name: 'Physics C: Mechanics', fullName: 'AP Physics C: Mechanics', date: new Date('2025-05-15T12:00:00'), time: '12 PM', color: 'from-cyan-400 to-cyan-500', icon: '⚡' },
  { id: 'ap-physics-c-em', name: 'Physics C: E&M', fullName: 'AP Physics C: Electricity and Magnetism', date: new Date('2025-05-15T14:00:00'), time: '2 PM', color: 'from-sky-400 to-sky-500', icon: '🔬' },
  { id: 'ap-biology', name: 'Biology', fullName: 'AP Biology', date: new Date('2025-05-16T08:00:00'), time: '8 AM', color: 'from-green-400 to-green-500', icon: '🧬' },
  { id: 'ap-spanish-language', name: 'Spanish Language', fullName: 'AP Spanish Language and Culture', date: new Date('2025-05-16T12:00:00'), time: '12 PM', color: 'from-yellow-400 to-yellow-500', icon: '🇪🇸' },

  // Week 3: May 19-23, 2025 (if applicable)
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
