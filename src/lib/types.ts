export interface User {
  id: string
  handle: string
  handle_version: number
  created_at: string
  avatar_url?: string
}

export interface School {
  id: string
  name: string
  city?: string
  state?: string
}

export interface Subject {
  id: string
  name: string
}

export interface Teacher {
  id: string
  school_id: string
  name: string
  school?: School
}

export interface Class {
  id: string
  school_id: string
  subject_id: string
  teacher_id: string
  code?: string
  title?: string
  term?: string
  school?: School
  subject?: Subject
  teacher?: Teacher
}

export type ResourceType = 'notes' | 'past_material' | 'study_guide' | 'practice_set'

export interface Resource {
  id: string
  class_id: string
  uploader_id: string
  type: ResourceType
  title: string
  subtitle?: string
  created_at: string
  // Aggregated ratings
  average_rating?: number
  rating_count?: number
  // Study metadata
  difficulty?: number // 1-5
  study_time?: number // minutes
  class?: Class
  uploader?: User
  files?: File[]
  ai_derivative?: AiDerivative
  vote_count?: number
  user_vote?: number
  tags?: Tag[]
}

export interface File {
  id: string
  resource_id: string
  storage_path: string
  original_filename?: string
  mime?: string
  pages_json?: Record<string, unknown>
}

export type AiStatus = 'pending' | 'ready' | 'blocked'

export interface AiDerivative {
  id: string
  resource_id: string
  status: AiStatus
  summary?: string
  structured_json?: StructuredContent
  html_render?: string
  reasons?: string[]
}

export interface StructuredContent {
  meta: {
    school: string
    class: string
    teacher: string
    approx_topic: string
    source_form: string
  }
  items: Array<{
    type: 'mcq' | 'short' | 'frq'
    prompt: string
    choices?: string[]
    answer: string
    explanation: string
  }>
  notes: string[]
}

export interface Comment {
  id: string
  resource_id: string
  author_id: string
  body: string
  created_at: string
  parent_id?: string
  reply_count?: number
  author?: User
  replies?: Comment[]
  // Optional client-computed fields for voting UI
  vote_count?: number
  user_vote?: number
}

export interface Vote {
  id: string
  resource_id: string
  voter_id: string
  value: -1 | 1
  created_at: string
}

export interface Tag {
  id: string
  name: string
}

export type FlagReason = 'wrong_info' | 'copyright' | 'live_exam' | 'spam'

export interface Flag {
  id: string
  resource_id: string
  flagger_id: string
  reason: FlagReason
  notes?: string
  created_at: string
}

export interface PointsLedger {
  id: string
  user_id: string
  delta: number
  reason?: string
  created_at: string
}

export interface UserPoints {
  user_id: string
  total_points: number
  transaction_count: number
}

export interface BrainDump {
  id: string
  class_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  contributor_id: string
  status: 'pending' | 'approved' | 'rejected'
  contributor?: User
  class?: Class
}

export interface MasterNote {
  id: string
  class_id: string
  content: string
  last_updated: string
  last_contributor_id: string
  version: number
  class?: Class
  last_contributor?: User
}
