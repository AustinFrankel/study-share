'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Upload, Plus, X, FileText, Image, HelpCircle, ImageOff } from 'lucide-react'
import { ResourceType, School, Subject, Teacher, Class } from '@/lib/types'
import { generateSuggestions } from '@/lib/suggestions'
import { generateSchoolsWithUUIDs, COMPREHENSIVE_SUBJECTS, generateClassesWithUUIDs } from '@/lib/comprehensive-data'
import { awardPoints } from '@/lib/gamification'
import { logActivity } from '@/lib/activity'
import { containsProfanity, sanitizeText } from '@/lib/profanity-filter'
import { grantViewsForUpload } from '@/lib/access-gate'
import { triggerUserUpload } from '@/lib/zapier-webhooks'
// Use Web Crypto for UUIDs to avoid bundling server-only uuid in client
const generateId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
import { useUploadContext } from '@/contexts/UploadContext'

interface UploadFile {
  id: string
  file: File
  progress: number
  uploaded: boolean
  error?: string
  preview?: string
}

interface UploadWizardProps {
  onUnsavedChanges?: (hasChanges: boolean) => void
}

export default function UploadWizard({ onUnsavedChanges }: UploadWizardProps = {}) {
  const { user } = useAuth()
  const router = useRouter()
  const { pendingFiles, clearPendingFiles } = useUploadContext()
  const pendingFilesProcessedRef = useRef<string[]>([]) // Track processed pending files by ID
  
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Step 1: School, Teacher, Class selection
  const [schools, setSchools] = useState<School[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  
  const [selectedSchool, setSelectedSchool] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  
  // Quick add modals
  const [showAddSchool, setShowAddSchool] = useState(false)
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [showAddClass, setShowAddClass] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [newSchoolCity, setNewSchoolCity] = useState('')
  const [newSchoolState, setNewSchoolState] = useState('')
  const [newTeacherName, setNewTeacherName] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [newClassCode, setNewClassCode] = useState('')
  const [newClassSubject, setNewClassSubject] = useState('')
  const [newClassTerm, setNewClassTerm] = useState('')
  
  // Step 2: Resource details
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ResourceType>('notes')
  const [difficulty, setDifficulty] = useState(3) // 1-5 scale
  const [studyTime, setStudyTime] = useState(30) // minutes
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Step 3: File upload
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('')
  const [diagnostics, setDiagnostics] = useState<{ running: boolean; results: Array<{ id: string; ok: boolean; url: string; filename: string }> }>({ running: false, results: [] })
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  
  // Text upload state
  const [showTextUpload, setShowTextUpload] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [textFileName, setTextFileName] = useState('')

  // Help toggles for inline guidance
  const [showTitleHelp, setShowTitleHelp] = useState(false)
  const [showDescHelp, setShowDescHelp] = useState(false)
  const [showTypeHelp, setShowTypeHelp] = useState(false)
  const [showDifficultyHelp, setShowDifficultyHelp] = useState(false)
  const [showStudyTimeHelp, setShowStudyTimeHelp] = useState(false)

  // Track unsaved changes and notify parent
  useEffect(() => {
    const hasUnsavedChanges = !!(
      selectedSchool || 
      selectedTeacher || 
      selectedClass || 
      title.trim() ||
      description.trim() ||
      files.length > 0
    ) && !uploadComplete
    
    onUnsavedChanges?.(hasUnsavedChanges)
  }, [selectedSchool, selectedTeacher, selectedClass, title, description, files.length, uploadComplete, onUnsavedChanges])

  const handleTitleChange = async (value: string) => {
    setTitle(value)
    
    if (value.length > 2) {
      try {
        const suggestions = await generateSuggestions(value, selectedClass || 'general')
        setTitleSuggestions(suggestions)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error generating suggestions:', error)
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  // Restore from sessionStorage when arriving via global drop and handle pending files
  useEffect(() => {
    console.log('UploadWizard: pendingFiles changed', {
      hasPendingFiles: !!pendingFiles,
      pendingFilesCount: pendingFiles?.length || 0,
      filesCount: files.length,
      currentStep,
      processedIds: pendingFilesProcessedRef.current
    })
    
    // Session restore: when coming from global drop, rebuild File objects from data URLs
    // and inject them as if selected manually. This ensures previews and step auto-advance.
    try {
      const url = new URL(window.location.href)
      const shouldRestore = url.searchParams.get('restore') === '1'
      if (shouldRestore) {
        const raw = sessionStorage.getItem('uploadQueueV1')
        if (raw) {
          const parsed = JSON.parse(raw) as { createdAt: number; items: Array<{ id: string; name: string; type: string; lastModified: number; dataUrl: string | null }> }
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            const restored: UploadFile[] = []
            parsed.items.forEach((it) => {
              try {
                if (!it.dataUrl) return
                // Reconstruct a File from the data URL for consistent behavior
                const arr = it.dataUrl.split(',')
                const mime = arr[0].match(/:(.*?);/)?.[1] || it.type || 'application/octet-stream'
                const bstr = atob(arr[1] || '')
                let n = bstr.length
                const u8arr = new Uint8Array(n)
                while (n--) u8arr[n] = bstr.charCodeAt(n)
                const file = new File([u8arr], it.name, { type: mime, lastModified: it.lastModified || Date.now() })
                restored.push({ id: generateId(), file, progress: 0, uploaded: false })
              } catch (e) {
                console.warn('Failed to restore file from session:', e)
              }
            })
            if (restored.length > 0) {
              setFiles(prev => [...prev, ...restored])
              // Clear query param so refresh does not keep restoring
              url.searchParams.delete('restore')
              window.history.replaceState({}, '', url.toString())
              // Clear session storage after use
              sessionStorage.removeItem('uploadQueueV1')
            }
          }
        }
      }
    } catch (e) {
      console.warn('UploadWizard restore error:', e)
    }

    if (pendingFiles && pendingFiles.length > 0) {
      // Check if we've already processed these exact files to prevent duplicates
      const unprocessedFiles = pendingFiles.filter(file => 
        !pendingFilesProcessedRef.current.includes(file.id)
      )
      
      console.log('Unprocessed files:', unprocessedFiles.length)
      
      if (unprocessedFiles.length === 0) {
        console.log('All files already processed, clearing')
        clearPendingFiles() // Clear them since we've already processed
        return
      }
      
      console.log('Processing pending files:', unprocessedFiles.map(f => f.file.name))
      
      const uploadFiles = unprocessedFiles.map((pendingFile) => ({
        id: generateId(),
        file: pendingFile.file,
        progress: 0,
        uploaded: false
      }))
      
      // Mark these files as processed
      pendingFilesProcessedRef.current.push(...unprocessedFiles.map(f => f.id))
      
      setFiles(prev => {
        console.log('Adding files to state:', uploadFiles.length, 'existing:', prev.length)
        return [...prev, ...uploadFiles]
      })
      
      // Auto-generate title from first file if no title is set
      if (!title.trim() && unprocessedFiles[0]) {
        const fileName = unprocessedFiles[0].file.name.replace(/\.[^/.]+$/, '') // Remove extension
        const cleanedName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        console.log('Setting auto-generated title:', cleanedName)
        setTitle(cleanedName)
      }
      
      // Clear pending files after processing
      clearPendingFiles()
      
      // Go to step 2 (resource details) so user can review/edit the title
      if (currentStep < 2) {
        console.log('Advancing to step 2')
        setCurrentStep(2)
      }
    }
  }, [pendingFiles, clearPendingFiles, title, currentStep])

  const loadSchools = async () => {
    try {
      console.log('Loading schools...')
      setError('') // Clear any previous errors
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - using comprehensive fallback data')
        const comprehensiveSchools = generateSchoolsWithUUIDs()
        setSchools(comprehensiveSchools)
        console.log('Using comprehensive fallback schools:', comprehensiveSchools.length)
        return
      }
      
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name')
      
      if (error) {
        console.warn('Database error loading schools, using fallback:', error.message)
        throw error
      }
      
      console.log('Schools loaded:', data?.length || 0)
      
      if (data && data.length > 0) {
        setSchools(data)
      } else {
        // If no schools in database, use comprehensive fallback
        console.log('No schools found in database, using comprehensive fallback')
        const comprehensiveSchools = generateSchoolsWithUUIDs()
        setSchools(comprehensiveSchools)
      }
    } catch (error) {
      console.error('Error loading schools:', error)
      try {
        // Always provide fallback data
        console.log('Using fallback schools due to error')
        const comprehensiveSchools = generateSchoolsWithUUIDs()
        setSchools(comprehensiveSchools)
      } catch (fallbackError) {
        console.error('Error loading fallback schools:', fallbackError)
        setError('Unable to load schools. Please refresh the page.')
        setSchools([])
      }
    }
  }

  const loadSubjects = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - using comprehensive fallback subjects')
        setSubjects(COMPREHENSIVE_SUBJECTS)
        return
      }
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setSubjects(data)
      } else {
        // Use fallback subjects if none in database
        console.log('No subjects found in database, using fallback')
        setSubjects(COMPREHENSIVE_SUBJECTS)
      }
    } catch (error) {
      console.error('Error loading subjects:', error)
      // Always provide fallback subjects
      setSubjects(COMPREHENSIVE_SUBJECTS)
    }
  }

  const loadTeachers = async (schoolId: string) => {
    if (!schoolId) {
      setTeachers([])
      return
    }
    
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - using fallback teachers')
        const fallbackTeachers = [
          { id: generateId(), name: 'Dr. Sarah Johnson', school_id: schoolId },
          { id: generateId(), name: 'Prof. Michael Chen', school_id: schoolId },
          { id: generateId(), name: 'Dr. Emily Rodriguez', school_id: schoolId },
          { id: generateId(), name: 'Prof. David Kim', school_id: schoolId },
          { id: generateId(), name: 'Dr. Jennifer Smith', school_id: schoolId }
        ]
        setTeachers(fallbackTeachers)
        return
      }
      
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId)
        .order('name')
      
      if (error) throw error
      
      if (data && data.length > 0) {
        setTeachers(data)
      } else {
        // Generate fallback teachers if none in database
        const fallbackTeachers = [
          { id: generateId(), name: 'Dr. Sarah Johnson', school_id: schoolId },
          { id: generateId(), name: 'Prof. Michael Chen', school_id: schoolId },
          { id: generateId(), name: 'Dr. Emily Rodriguez', school_id: schoolId },
          { id: generateId(), name: 'Prof. David Kim', school_id: schoolId },
          { id: generateId(), name: 'Dr. Jennifer Smith', school_id: schoolId }
        ]
        setTeachers(fallbackTeachers)
      }
    } catch (error) {
      console.error('Error loading teachers:', error)
      // Always provide fallback teachers on error
      const fallbackTeachers = [
        { id: generateId(), name: 'Dr. Sarah Johnson', school_id: schoolId },
        { id: generateId(), name: 'Prof. Michael Chen', school_id: schoolId }
      ]
      setTeachers(fallbackTeachers)
    }
  }

  const loadClasses = async (teacherId: string) => {
    if (!teacherId) {
      setClasses([])
      return
    }
    
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured - using fallback classes')
        const fallbackClasses = []
        const selectedSchoolId = selectedSchool
        
        // Generate classes for common subjects
        const commonSubjects = COMPREHENSIVE_SUBJECTS.slice(0, 5)
        for (const subject of commonSubjects) {
          fallbackClasses.push({
            id: generateId(),
            title: `${subject.name} 101`,
            code: `${subject.name.substring(0, 3).toUpperCase()}101`,
            subject_id: subject.id,
            subject: subject,
            teacher_id: teacherId,
            school_id: selectedSchoolId,
            term: 'Fall 2024'
          })
        }
        
        setClasses(fallbackClasses)
        return
      }
      
      const { data, error } = await supabase
        .from('classes')
        .select('*, subject:subjects(*)')
        .eq('teacher_id', teacherId)
        .order('title')
      
      if (error) {
        console.warn('Database query failed, using fallback data:', error.message)
      }

      if (data && data.length > 0) {
        setClasses(data)
      } else {
        // No classes in database, use fallback classes in memory only
        console.log('No existing classes found, using fallback classes...')
        const fallbackClasses = []
        const selectedSchoolId = selectedSchool
        
        // Generate classes for common subjects
        const commonSubjects = COMPREHENSIVE_SUBJECTS.slice(0, 5)
        for (const subject of commonSubjects) {
          fallbackClasses.push({
            id: generateId(),
            title: `${subject.name} 101`,
            code: `${subject.name.substring(0, 3).toUpperCase()}101`,
            subject_id: subject.id,
            subject: subject,
            teacher_id: teacherId,
            school_id: selectedSchoolId,
            term: 'Fall 2024'
          })
        }
        
        setClasses(fallbackClasses)
        return
      }
    } catch (error) {
      console.error('Error loading classes:', error)
      // Always provide fallback classes on error
      console.log('Using fallback classes due to error...')
      const fallbackClasses = []
      const selectedSchoolId = selectedSchool
      
      // Generate classes for common subjects  
      const commonSubjects = COMPREHENSIVE_SUBJECTS.slice(0, 5)
      for (const subject of commonSubjects) {
        fallbackClasses.push({
          id: generateId(),
          title: `${subject.name} 101`,
          code: `${subject.name.substring(0, 3).toUpperCase()}101`,
          subject_id: subject.id,
          subject: subject,
          teacher_id: teacherId,
          school_id: selectedSchoolId,
          term: 'Fall 2024'
        })
      }
      
      setClasses(fallbackClasses)
    }
  }

  // Quick add functions
  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) {
      setError('School name is required')
      return
    }
    
    // Check for profanity but still allow the school to be added
    if (containsProfanity(newSchoolName.trim()) || 
        (newSchoolCity && containsProfanity(newSchoolCity.trim())) ||
        (newSchoolState && containsProfanity(newSchoolState.trim()))) {
      setError('School name contains inappropriate content, but it has been added')
      // Continue with adding the school despite profanity
    }
    
    const newSchool: School = {
      id: generateId(),
      name: newSchoolName.trim(),
      city: newSchoolCity.trim() || undefined,
      state: newSchoolState.trim() || undefined
    }
    
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('schools').insert(newSchool)
        if (error) throw error
      }
      
      setSchools(prev => [...prev, newSchool])
      setSelectedSchool(newSchool.id)
      setNewSchoolName('')
      setNewSchoolCity('')
      setNewSchoolState('')
      setShowAddSchool(false)
      setError('')
    } catch (error) {
      console.error('Error adding school:', error)
      // Still add to local state even if database insert fails
      setSchools(prev => [...prev, newSchool])
      setSelectedSchool(newSchool.id)
      setNewSchoolName('')
      setNewSchoolCity('')
      setNewSchoolState('')
      setShowAddSchool(false)
      setError('')
    }
  }

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim() || !selectedSchool) return
    
    // Check for profanity but still allow the teacher to be added
    if (containsProfanity(newTeacherName.trim())) {
      setError('Teacher name contains inappropriate content, but it has been added')
      // Continue with adding the teacher despite profanity
    }
    
    const newTeacher: Teacher = {
      id: generateId(),
      name: newTeacherName.trim(),
      school_id: selectedSchool
    }
    
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('teachers').insert(newTeacher)
        if (error) throw error
      }
      
      setTeachers(prev => [...prev, newTeacher])
      setSelectedTeacher(newTeacher.id)
      setNewTeacherName('')
      setShowAddTeacher(false)
      setError('')
    } catch (error) {
      console.error('Error adding teacher:', error)
      // Still add to local state even if database insert fails
      setTeachers(prev => [...prev, newTeacher])
      setSelectedTeacher(newTeacher.id)
      setNewTeacherName('')
      setShowAddTeacher(false)
      setError('')
    }
  }

  const handleAddClass = async () => {
    if (!newClassName.trim() || !selectedTeacher || !newClassSubject) return
    
    // Check for profanity but still allow the class to be added
    if (containsProfanity(newClassName.trim()) || 
        (newClassCode && containsProfanity(newClassCode.trim()))) {
      setError('Class name contains inappropriate content, but it has been added')
      // Continue with adding the class despite profanity
    }
    
    const subject = subjects.find(s => s.id === newClassSubject)
    const newClass: Class = {
      id: generateId(),
      title: newClassName.trim(),
      code: newClassCode.trim() || undefined,
      subject_id: newClassSubject,
      subject: subject || { id: newClassSubject, name: 'Unknown' },
      teacher_id: selectedTeacher,
      school_id: selectedSchool,
      term: newClassTerm.trim() || 'Current Term'
    }
    
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('classes').insert({
          id: newClass.id,
          title: newClass.title,
          code: newClass.code,
          subject_id: newClass.subject_id,
          teacher_id: newClass.teacher_id,
          school_id: newClass.school_id,
          term: newClass.term
        })
        if (error) throw error
      }
      
      setClasses(prev => [...prev, newClass])
      setSelectedClass(newClass.id)
      setNewClassName('')
      setNewClassCode('')
      setNewClassSubject('')
      setNewClassTerm('')
      setShowAddClass(false)
      setError('')
    } catch (error) {
      console.error('Error adding class:', error)
      // Still add to local state even if database insert fails
      setClasses(prev => [...prev, newClass])
      setSelectedClass(newClass.id)
      setNewClassName('')
      setNewClassCode('')
      setNewClassSubject('')
      setNewClassTerm('')
      setShowAddClass(false)
      setError('')
    }
  }

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    
    if (selectedFiles.length === 0) return
    
    // Check for duplicates and add new files (using name, size, and lastModified for better detection)
    const existingFiles = files.map(f => ({ 
      name: f.file.name, 
      size: f.file.size,
      lastModified: f.file.lastModified 
    }))
    
    const newFiles = selectedFiles.filter(file => 
      !existingFiles.some(existing => 
        existing.name === file.name && 
        existing.size === file.size &&
        existing.lastModified === file.lastModified
      )
    )
    
    if (newFiles.length === 0) {
      setError('All selected files are already added')
      return
    }
    
    const uploadFiles = newFiles.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      uploaded: false
    }))
    
    setFiles(prev => [...prev, ...uploadFiles])
    
    // Auto-generate title from first file if no title is set
    if (!title.trim() && newFiles[0]) {
      const fileName = newFiles[0].name.replace(/\.[^/.]+$/, '') // Remove extension
      const cleanedName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      setTitle(cleanedName)
    }
    
    // Do NOT start upload immediately - files will be uploaded on final submit
    // Just advance to step 2 so user can add resource details
    if (currentStep === 1) {
      setCurrentStep(2)
      setError('')
    }
    
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = ''
  }, [files, title, currentStep])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFiles = Array.from(e.dataTransfer.files || [])

    if (droppedFiles.length === 0) return

    // Check for duplicates
    const existingFiles = files.map(f => ({
      name: f.file.name,
      size: f.file.size,
      lastModified: f.file.lastModified
    }))

    const newFiles = droppedFiles.filter(file =>
      !existingFiles.some(existing =>
        existing.name === file.name &&
        existing.size === file.size &&
        existing.lastModified === file.lastModified
      )
    )

    if (newFiles.length === 0) {
      setError('All dropped files are already added')
      return
    }

    const uploadFiles = newFiles.map((file) => ({
      id: generateId(),
      file,
      progress: 0,
      uploaded: false
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Auto-generate title from first file if no title is set
    if (!title.trim() && newFiles[0]) {
      const fileName = newFiles[0].name.replace(/\.[^/.]+$/, '')
      const cleanedName = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      setTitle(cleanedName)
    }

    // Advance to step 2 if on step 1
    if (currentStep === 1) {
      setCurrentStep(2)
      setError('')
    }
  }, [files, title, currentStep])

  const removeFile = (fileId: string) => {
    console.log(`Removing file: ${fileId}`)
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      console.log(`Files after removal: ${newFiles.length}`)
      return newFiles
    })
  }

  const createFilePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file)
  }

  const handleImageClick = (file: File) => {
    if (file.type.startsWith('image/')) {
      const previewUrl = createFilePreviewUrl(file)
      setExpandedImage(previewUrl)
    }
  }

  // Handle text upload
  const handleTextUpload = () => {
    if (!textContent.trim()) {
      setError('Please enter some text content')
      return
    }
    
    if (!textFileName.trim()) {
      setError('Please enter a filename')
      return
    }

    // Create a text file from the content
    const blob = new Blob([textContent], { type: 'text/plain' })
    const fileName = textFileName.endsWith('.txt') ? textFileName : `${textFileName}.txt`
    const file = new File([blob], fileName, { type: 'text/plain' })
    
    const uploadFile: UploadFile = {
      id: generateId(),
      file,
      progress: 0,
      uploaded: false
    }
    
    setFiles(prev => [...prev, uploadFile])
    
    // Auto-generate title from filename if no title is set
    if (!title.trim()) {
      const cleanedName = textFileName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      setTitle(cleanedName)
    }
    
    // Reset text upload state
    setTextContent('')
    setTextFileName('')
    setShowTextUpload(false)
    setError('')
    
    // Advance to step 2
    if (currentStep === 1) {
      setCurrentStep(2)
    }
  }
  
  // Start immediate upload when files are added
  const startImmediateUpload = async (newUploadFiles: UploadFile[]) => {
    if (!user || isUploading) return
    
    setIsUploading(true)
    setError('')
    setUploadProgress(5)
    setProcessingStatus('🚀 Processing your files...')
    
    try {
      // Update file progress immediately
      const fileUploadPromises = newUploadFiles.map(async (uploadFile, index) => {
        try {
          console.log(`Processing file: ${uploadFile.file.name}`)
          
          // Start file upload progress
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 10 } : f
          ))
          
          // Generate file path
          const fileExt = uploadFile.file.name.split('.').pop()
          const fileName = `${user.id}/${generateId()}.${fileExt}`
          
          // Mid upload progress
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 50 } : f
          ))
          
          // Do NOT upload to storage or create DB records yet.
          // This step only prepares UI state; real upload happens on submit.
          
          // Brief delay for UI feedback
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Mark file as completed
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 100, uploaded: true } : f
          ))
          
          console.log(`File processed: ${uploadFile.file.name}`)
        } catch (error) {
          console.error(`Error processing ${uploadFile.file.name}:`, error)
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, error: 'Processing failed', progress: 0 } : f
          ))
        }
      })
      
      // Wait for all files to process
      await Promise.all(fileUploadPromises)
      
      setUploadProgress(100)
      setProcessingStatus('✅ Files ready! Complete your upload by clicking "Post".')
      
    } catch (error) {
      console.error('File processing error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred while processing files')
    } finally {
      setIsUploading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadSchools()
    loadSubjects()
  }, [])

  // If any files are present, ensure we auto-advance to step 2
  useEffect(() => {
    if (files.length > 0 && currentStep < 2) {
      setCurrentStep(2)
      setError('')
    }
  }, [files.length])

  // Debug: Track file changes
  useEffect(() => {
    console.log(`Files state changed. Count: ${files.length}, Step: ${currentStep}`)
  }, [files.length, currentStep])

  // Load teachers when school changes
  useEffect(() => {
    if (selectedSchool) {
      loadTeachers(selectedSchool)
      setSelectedTeacher('')
      setSelectedClass('')
    }
  }, [selectedSchool])

  // Load classes when teacher changes
  useEffect(() => {
    if (selectedTeacher) {
      loadClasses(selectedTeacher)
      setSelectedClass('')
    }
  }, [selectedTeacher])

  // Final submission
  const handleSubmit = async () => {
    if (!user || !canProceedStep1 || !canProceedStep2 || !canProceedStep3) {
      console.log('Submit validation failed:', {
        user: !!user,
        canProceedStep1,
        canProceedStep2,
        canProceedStep3,
        filesCount: files.length
      })
      const missingFields = []
      if (!user) missingFields.push('user authentication')
      if (!canProceedStep1) {
        missingFields.push('files')
        // If files are missing, go back to step 1
        setCurrentStep(1)
      }
      if (!canProceedStep2) {
        missingFields.push('resource details')
        // If title is missing, go back to step 2
        if (canProceedStep1 && currentStep !== 2) setCurrentStep(2)
      }
      if (!canProceedStep3) {
        missingFields.push('school/teacher/class selection')
        // If class info is missing, go back to step 3
        if (canProceedStep1 && canProceedStep2 && currentStep !== 3) setCurrentStep(3)
      }

      setError(`Please complete all required fields: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(5)
    setProcessingStatus('🚀 Creating resource...')

    try {
      console.log('Creating resource with data:', {
        title: title.trim(),
        type,
        class_id: selectedClass,
        uploader_id: user.id,
        difficulty,
        study_time: studyTime
      })

      let resource: {
        id: string
        title: string
        type: string
        class_id: string
        uploader_id: string
        created_at: string
      }
      
      // Ensure subject, school, teacher, and class exist in the database
      if (isSupabaseConfigured) {
        try {
          const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)

          const ensureSubject = async (subjectId?: string, subjectName?: string): Promise<string> => {
            if (!subjectId && !subjectName) throw new Error('Subject is required')
            // If looks like a UUID and exists, use it
            if (subjectId && isUuid(subjectId)) {
              const { data, error } = await supabase
                .from('subjects')
                .select('id')
                .eq('id', subjectId)
                .single()
              if (!error && data?.id) return data.id
            }
            const name = (subjectName || '').trim() || 'General'
            // Try by name
            const { data: byName, error: byNameErr } = await supabase
              .from('subjects')
              .select('id')
              .eq('name', name)
              .limit(1)
            if (!byNameErr && byName && byName.length > 0) return byName[0].id
            // Create
            const { data: created, error: createErr } = await supabase
              .from('subjects')
              .insert({ name })
              .select('id')
              .single()
            if (createErr || !created) throw createErr || new Error('Failed to create subject')
            return created.id
          }

          const ensureSchool = async (schoolId: string): Promise<string> => {
            const { data, error } = await supabase
              .from('schools')
              .select('id')
              .eq('id', schoolId)
              .single()
            if (!error && data?.id) return data.id
            const sch = schools.find(s => s.id === schoolId)
            if (!sch) throw new Error('Selected school is invalid')
            const { error: insErr } = await supabase.from('schools').insert({
              id: sch.id,
              name: sch.name,
              city: sch.city,
              state: sch.state
            })
            if (insErr) throw insErr
            return sch.id
          }

          const ensureTeacher = async (teacherId: string, schoolId: string): Promise<string> => {
            const { data, error } = await supabase
              .from('teachers')
              .select('id')
              .eq('id', teacherId)
              .single()
            if (!error && data?.id) return data.id
            const t = teachers.find(tch => tch.id === teacherId)
            if (!t) throw new Error('Selected teacher is invalid')
            const { error: insErr } = await supabase.from('teachers').insert({
              id: t.id,
              name: t.name,
              school_id: schoolId
            })
            if (insErr) throw insErr
            return t.id
          }

          const ensureClass = async (classId: string): Promise<void> => {
            const { data, error } = await supabase
              .from('classes')
              .select('id')
              .eq('id', classId)
              .single()
            if (!error && data?.id) return
            const cls = classes.find(c => c.id === classId) as { id: string; school_id: string; subject_id: string; subject?: { name: string }; teacher_id: string; title: string; code: string; term?: string } | undefined
            if (!cls) throw new Error('Selected class is invalid. Please select a valid class or create one.')
            const ensuredSchoolId = await ensureSchool(cls.school_id)
            const ensuredSubjectId = await ensureSubject(cls.subject_id, cls.subject?.name)
            const ensuredTeacherId = await ensureTeacher(cls.teacher_id, ensuredSchoolId)
            const { error: insertErr } = await supabase.from('classes').insert({
              id: cls.id,
              title: cls.title,
              code: cls.code,
              subject_id: ensuredSubjectId,
              teacher_id: ensuredTeacherId,
              school_id: ensuredSchoolId,
              term: cls.term || 'Current Term'
            })
            if (insertErr) throw insertErr
          }

          await ensureClass(selectedClass)
        } catch (e) {
          console.error('Error ensuring related entities:', e)
          setError(`Failed to prepare class information: ${(e as Error)?.message || 'unknown error'}`)
          setLoading(false)
          setUploadProgress(0)
          setProcessingStatus('')
          return
        }
      }

      // Create resource in database (required for a valid upload)
      if (isSupabaseConfigured) {
        // Enforce unique title per class across all users to avoid duplicates
        try {
          const { data: existing } = await supabase
            .from('resources')
            .select('id')
            .ilike('title', title.trim())
            .limit(1)
          if (existing && existing.length > 0) {
            setLoading(false)
            setUploadProgress(0)
            setProcessingStatus('')
            setError('A resource with this title already exists. Please choose a different title.')
            return
          }
        } catch (e) {
          // If uniqueness check fails for any reason, continue but surface a friendly error later
        }
        // Use API route which also enforces global unique title atomically
        const apiResp = await fetch('/api/resource/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            subtitle: description.trim() || null,
            type,
            class_id: selectedClass,
            uploader_id: user.id,
            public: true,
            difficulty,
            study_time: studyTime
          })
        })
        if (!apiResp.ok) {
          const { error } = await apiResp.json().catch(() => ({ error: 'Failed to create resource' }))
          throw new Error(error)
        }
        const data = await apiResp.json()
        
        if (!data) {
          setError('Failed to create resource: unknown error')
          setLoading(false)
          setUploadProgress(0)
          setProcessingStatus('')
          return
        }
        resource = data
      } else {
        // Demo mode fallback
        resource = {
          id: generateId(),
          title: title.trim(),
          type,
          class_id: selectedClass,
          uploader_id: user.id,
          created_at: new Date().toISOString()
        }
      }
      console.log('Resource created successfully:', resource.id)
      setUploadProgress(15)
      setProcessingStatus('📁 Uploading files...')

      // Upload files with detailed progress tracking
      let uploadedCount = 0
      const baseProgress = 15 // Starting progress after resource creation
      const uploadProgressRange = 65 // 80% - 15% = 65% for file uploads
      
      for (let i = 0; i < files.length; i++) {
        const uploadFile = files[i]
        try {
          console.log(`Starting upload for file ${i + 1}/${files.length}: ${uploadFile.file.name}`)
          
          // Start file upload progress
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 10 } : f
          ))
          setUploadProgress(baseProgress + (i / files.length) * uploadProgressRange * 0.2)

          const fileExt = uploadFile.file.name.split('.').pop()
          // Sanitize file extension to prevent storage errors
          const sanitizedExt = fileExt?.replace(/[^a-zA-Z0-9]/g, '') || 'file'
          const fileName = `${resource.id}/${uploadFile.id}.${sanitizedExt}`
          
          // Mid upload progress
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 50 } : f
          ))
          setUploadProgress(baseProgress + (i / files.length) * uploadProgressRange * 0.5)

          // Upload to Supabase storage with fallback bucket
          let uploadedOk = false
          if (isSupabaseConfigured) {
            try {
              const result = await supabase.storage
                .from('resources')
                .upload(fileName, uploadFile.file)
              if (!result.error) {
                uploadedOk = true
                console.log(`File uploaded to 'resources': ${uploadFile.file.name}`)
              }
            } catch (e) {
              // ignore here; try fallback bucket below
            }
            if (!uploadedOk) {
              try {
                const result2 = await supabase.storage
                  .from('resource-files')
                  .upload(fileName, uploadFile.file)
                if (!result2.error) {
                  uploadedOk = true
                  console.log(`File uploaded to fallback bucket 'resource-files': ${uploadFile.file.name}`)
                }
              } catch (e) {
                // still failed
              }
            }
            if (!uploadedOk) {
              throw new Error(`Upload failed for ${uploadFile.file.name} in all buckets`)
            }
          } else {
            console.log(`File would be uploaded in production: ${uploadFile.file.name}`)
            uploadedOk = true
          }
          
          // Brief delay for UI feedback
          await new Promise(resolve => setTimeout(resolve, 200))

          // Update progress after storage upload
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 80 } : f
          ))
          setUploadProgress(baseProgress + (i / files.length) * uploadProgressRange * 0.8)

          // Create file record in database (only after successful storage upload)
          if (isSupabaseConfigured) {
            const { error: recordError } = await supabase.from('files').insert({
              id: uploadFile.id,
              resource_id: resource.id,
              storage_path: fileName,
              original_filename: uploadFile.file.name,
              mime: uploadFile.file.type,
              name: uploadFile.file.name,
              size: uploadFile.file.size,
              type: uploadFile.file.type,
              path: fileName
            })
            
            if (recordError) {
              throw new Error(`File record creation failed for ${uploadFile.file.name}: ${recordError.message}`)
            } else {
              console.log(`File record created for ${uploadFile.file.name}`)
            }
          } else {
            console.log(`File record would be created in production for ${uploadFile.file.name}`)
          }

          // Mark file as completed
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress: 100, uploaded: true } : f
          ))

          uploadedCount++
          const fileUploadProgress = baseProgress + ((uploadedCount / files.length) * uploadProgressRange)
          setUploadProgress(fileUploadProgress)
          
          console.log(`File ${i + 1}/${files.length} uploaded successfully`)
        } catch (error) {
          console.error(`Error uploading ${uploadFile.file.name}:`, error)
          setFiles(prev => prev.map(f =>
            f.id === uploadFile.id ? { ...f, error: 'Upload failed', progress: 0, uploaded: false } : f
          ))
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          setError(`Failed to upload ${uploadFile.file.name}: ${errorMsg}. Please try removing and re-adding the file.`)
          setLoading(false)
          setUploadProgress(0)
          setProcessingStatus('')
          // Don't reset to step 1 - stay on step 4 so user can see the error and retry
          return
        }
      }

      setUploadProgress(85)
      setProcessingStatus('🧠 Processing with AI...')

      // AI processing simulation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUploadProgress(95)
      setProcessingStatus('✅ Finishing up...')

      // Award points and log activity
      try {
        if (isSupabaseConfigured) {
          await awardPoints(user.id, 'UPLOAD')
          await logActivity({
            userId: user.id,
            action: 'upload',
            resourceId: resource.id,
            resourceTitle: resource.title,
            pointsChange: 1,
            metadata: {
              file_count: files.length
            }
          })
          console.log(`Awarded points and logged activity for upload "${resource.title}"`)
        } else {
          console.log(`Points and activity would be logged in production for upload "${resource.title}"`)
        }
      } catch (activityError) {
        console.warn('Error with points/activity logging:', activityError)
      }

      // Grant view bonus for upload
      try {
        await grantViewsForUpload(user.id)
        console.log('Granted 5 bonus views for upload')
      } catch (viewError) {
        console.warn('Error granting view bonus:', viewError)
      }

      setUploadProgress(100)
      setProcessingStatus('🎉 Upload complete!')

      // Final delay for user experience
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Upload process completed successfully')
      
      // Trigger Zapier webhook for upload
      try {
        await triggerUserUpload(
          {
            id: user.id,
            email: user.email,
            handle: user.handle,
          },
          {
            id: resource.id,
            title: resource.title,
            file_count: files.length,
          }
        )
      } catch (webhookError) {
        console.error('Zapier webhook error (non-critical):', webhookError)
      }
      
      // Show success message on screen and redirect
      setUploadSuccessMessage(`🎉 Upload successful! Resource "${resource.title}" has been uploaded successfully and is now shareable with your classmates.`)
      setUploadComplete(true)

      // Diagnostics: verify storage objects are accessible via API route and expose direct links
      try {
        setDiagnostics({ running: true, results: [] })
        const results: Array<{ id: string; ok: boolean; url: string; filename: string }> = []
        for (const f of files) {
          const url = `/api/file/${f.id}?v=${Date.now()}`
          try {
            const resp = await fetch(url, { cache: 'no-store' })
            results.push({ id: f.id, ok: resp.ok, url, filename: f.file.name })
          } catch (e) {
            results.push({ id: f.id, ok: false, url, filename: f.file.name })
          }
        }
        setDiagnostics({ running: false, results })
      } catch (e) {
        setDiagnostics({ running: false, results: [] })
      }

      // Redirect user to the new resource page so they can see their file immediately
      setTimeout(() => {
        router.push(`/resource/${resource.id}?refresh=${Date.now()}&from=upload`)
      }, 1500)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setLoading(false)
      setUploadProgress(0)
      setProcessingStatus('')
    }
  }

  // Validation helpers
  const canProceedStep1 = files.length > 0
  const canProceedStep2 = title.trim().length > 0
  const canProceedStep3 = selectedSchool && selectedTeacher && selectedClass

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return canProceedStep1
      case 2: return canProceedStep2
      case 3: return canProceedStep3
      default: return false
    }
  }

  const nextStep = () => {
    if (canProceed(currentStep)) {
      console.log(`Moving from step ${currentStep} to ${currentStep + 1}. Files: ${files.length}`)
      setCurrentStep(prev => Math.min(prev + 1, 4))
      setError('')
    } else {
      console.log(`Cannot proceed from step ${currentStep}. Validation failed.`)
      if (currentStep === 1 && files.length === 0) {
        setError('Please add at least one file to continue')
      } else if (currentStep === 2 && !title.trim()) {
        setError('Please enter a title to continue')
      } else if (currentStep === 3 && !canProceedStep3) {
        setError('Please select school, teacher, and class to continue')
      }
    }
  }

  const prevStep = () => {
    console.log(`Moving from step ${currentStep} to ${currentStep - 1}. Files: ${files.length}`)
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log('Files dropped:', acceptedFiles)
      const uploadFiles = acceptedFiles.map(file => ({
        id: generateId(),
        file,
        progress: 0,
        uploaded: false
      }))
      setFiles(prev => {
        const next = [...prev, ...uploadFiles]
        return next
      })
      // Auto-advance to step 2 so users immediately see details after dropping
      if (currentStep < 2 && acceptedFiles.length > 0) {
        setCurrentStep(2)
        setError('')
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold">Step 1: Upload Your Files</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          {...getRootProps()} 
          className={`relative p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-200 
            ${isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="bg-gray-100 p-4 rounded-full">
              <Upload className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Drop files here or click to browse
            </p>
          </div>
          {isDragActive && (
            <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 flex items-center justify-center rounded-lg">
              <p className="text-xl font-bold text-indigo-800">Drop to upload</p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Supports PDF, images (including HEIC), and documents
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected Files:</h4>
            {files.map((file) => {
              const isHeic = file.file.type === 'image/heic' || file.file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.file.name)
              const isImage = file.file.type.startsWith('image/') && !isHeic
              const nameNoExt = file.file.name.replace(/\.[^/.]+$/, '')
              return (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isImage ? (
                      <div 
                        className="relative w-12 h-12 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleImageClick(file.file)}
                      >
                        <img 
                          src={createFilePreviewUrl(file.file)} 
                          alt={file.file.name}
                          className="w-full h-full object-cover rounded border"
                        />
                      </div>
                    ) : file.file.type === 'application/pdf' ? (
                      <div className="relative w-12 h-12">
                        <iframe
                          src={createFilePreviewUrl(file.file)}
                          title={file.file.name}
                          className="w-full h-full rounded border bg-white"
                        />
                      </div>
                    ) : isHeic ? (
                      <div className="w-12 h-12 rounded border bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
                        <ImageOff className="w-5 h-5" />
                      </div>
                    ) : (
                      <FileText className="w-12 h-12 text-blue-500 p-2 bg-blue-50 rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate max-w-[22rem]" title={file.file.name}>{nameNoExt}</p>
                      <div className="flex items-center space-x-4">
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {file.error ? (
                          <p className="text-xs text-red-500">{file.error}</p>
                        ) : file.uploaded ? (
                          <p className="text-xs text-green-600">Ready</p>
                        ) : file.progress > 0 ? (
                          <div className="flex items-center space-x-2">
                            <Progress value={file.progress} className="w-16 h-2" />
                            <span className="text-xs text-blue-500">{file.progress}%</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
            {isUploading && (
              <div className="text-center py-2">
                <div className="text-sm text-blue-600 font-medium">{processingStatus}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Step 2: Resource Details</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Tell us about your study material so others can easily find and use it
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
            <button type="button" aria-label="Help: title" className="text-gray-500 hover:text-gray-700" onClick={() => setShowTitleHelp(v => !v)}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          {showTitleHelp && (
            <p className="text-xs text-gray-600">Give your resource a clear, descriptive title</p>
          )}
          <div className="relative">
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g., Chapter 5 Biology Notes - Cell Structure"
              className="w-full text-base h-12"
              maxLength={60}
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/60 characters
            </div>
            {showSuggestions && titleSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                {titleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    onClick={() => {
                      setTitle(suggestion)
                      setShowSuggestions(false)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* Description */}
          <div className="flex items-center gap-2">
            <Label htmlFor="description" className="text-base font-semibold">Description (Optional)</Label>
            <button type="button" aria-label="Help: description" className="text-gray-500 hover:text-gray-700" onClick={() => setShowDescHelp(v => !v)}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          {showDescHelp && (
            <p className="text-xs text-gray-600">Add details to help others understand what this covers</p>
          )}
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a detailed description to help classmates understand what this resource covers..."
            className="w-full min-h-[100px] resize-vertical text-base"
            maxLength={2000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {description.length}/2000 characters
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            {/* Resource Type */}
            <div className="flex items-center gap-2">
              <Label htmlFor="type" className="text-base font-semibold">Resource Type</Label>
              <button type="button" aria-label="Help: type" className="text-gray-500 hover:text-gray-700" onClick={() => setShowTypeHelp(v => !v)}>
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {showTypeHelp && (
              <p className="text-xs text-gray-600 mb-2">What kind of material is this?</p>
            )}
            <Select value={type} onValueChange={(value: ResourceType) => setType(value)}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="notes">Class Notes</SelectItem>
                <SelectItem value="past_material">Past Exam/Assignment</SelectItem>
                <SelectItem value="study_guide">Study Guide</SelectItem>
                <SelectItem value="practice_set">Practice Problems</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <Label htmlFor="difficulty" className="text-base font-semibold">Difficulty: {difficulty} / 5</Label>
              <button type="button" aria-label="Help: difficulty" className="text-gray-500 hover:text-gray-700" onClick={() => setShowDifficultyHelp(v => !v)}>
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {showDifficultyHelp && (
              <p className="text-xs text-gray-600 mb-1">Rate how challenging this material is</p>
            )}
            <div className="px-2 pt-1">
              <input
                type="range"
                id="difficulty"
                min="1"
                max="5"
                step="1"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Very Easy</span>
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
                <span>Very Hard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* Study Time */}
          <div className="flex items-center gap-2">
            <Label htmlFor="study-time" className="text-base font-semibold">Estimated Study Time</Label>
            <button type="button" aria-label="Help: study time" className="text-gray-500 hover:text-gray-700" onClick={() => setShowStudyTimeHelp(v => !v)}>
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          {showStudyTimeHelp && (
            <p className="text-xs text-gray-600 mb-1">How long does it take to review this material?</p>
          )}
          <div className="space-y-3">
            <Input
              id="study-time"
              type="number"
              value={studyTime}
              onChange={(e) => setStudyTime(Math.min(1440, Math.max(0, parseInt(e.target.value) || 0)))}
              min="0"
              max="1440"
              placeholder="Enter minutes (0-1440)"
              className="h-12 text-base"
            />
            <div className="text-sm text-gray-600 font-medium">
              Current: {studyTime === 0 ? '0 minutes' : studyTime < 60 ? `${studyTime} minutes` : `${Math.floor(studyTime / 60)}h ${studyTime % 60 === 0 ? '' : ` ${studyTime % 60}m`}`} (Max: 24 hours)
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={studyTime === 0 ? "default" : "outline"}
                onClick={() => setStudyTime(0)}
                className={`h-11 rounded-md font-medium ${studyTime === 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                0 min
              </Button>
              <Button
                type="button"
                variant={studyTime === 30 ? "default" : "outline"}
                onClick={() => setStudyTime(30)}
                className={`h-11 rounded-md font-medium ${studyTime === 30 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                30 min
              </Button>
              <Button
                type="button"
                variant={studyTime === 60 ? "default" : "outline"}
                onClick={() => setStudyTime(60)}
                className={`h-11 rounded-md font-medium ${studyTime === 60 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                1 hr
              </Button>
              <Button
                type="button"
                variant={studyTime === 120 ? "default" : "outline"}
                onClick={() => setStudyTime(120)}
                className={`h-11 rounded-md font-medium ${studyTime === 120 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                2 hrs
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Button
                type="button"
                variant={studyTime === 180 ? "default" : "outline"}
                onClick={() => setStudyTime(180)}
                className={`h-11 rounded-md font-medium ${studyTime === 180 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                3 hrs
              </Button>
              <Button
                type="button"
                variant={studyTime === 240 ? "default" : "outline"}
                onClick={() => setStudyTime(240)}
                className={`h-11 rounded-md font-medium ${studyTime === 240 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                4 hrs
              </Button>
              <Button
                type="button"
                variant={studyTime === 480 ? "default" : "outline"}
                onClick={() => setStudyTime(480)}
                className={`h-11 rounded-md font-medium ${studyTime === 480 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                8 hrs
              </Button>
              <Button
                type="button"
                variant={studyTime === 1440 ? "default" : "outline"}
                onClick={() => setStudyTime(1440)}
                className={`h-11 rounded-md font-medium ${studyTime === 1440 ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
              >
                24 hrs
              </Button>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Step 3: Class Information</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Select your school, teacher, and class
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="school">School *</Label>
          <div className="flex gap-2">
            <Select value={selectedSchool} onValueChange={setSelectedSchool}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select your school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name} {school.city && `- ${school.city}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showAddSchool} onOpenChange={setShowAddSchool}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>Add New School</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-school-name">School Name *</Label>
                    <Input
                      id="new-school-name"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      placeholder="Enter school name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-school-city">City</Label>
                    <Input
                      id="new-school-city"
                      value={newSchoolCity}
                      onChange={(e) => setNewSchoolCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-school-state">State</Label>
                    <Input
                      id="new-school-state"
                      value={newSchoolState}
                      onChange={(e) => setNewSchoolState(e.target.value)}
                      placeholder="Enter state"
                    />
                  </div>
                  <Button onClick={handleAddSchool} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add School'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedSchool && (
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            <div className="flex gap-2">
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select your teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-teacher-name">Teacher Name *</Label>
                        <Input
                          id="new-teacher-name"
                          value={newTeacherName}
                          onChange={(e) => setNewTeacherName(e.target.value)}
                          placeholder="Enter teacher name"
                        />
                      </div>
                      <Button onClick={handleAddTeacher} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                            Adding...
                          </div>
                        ) : (
                          'Add Teacher'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {selectedTeacher && (
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.title} {cls.code && `(${cls.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddClass} onOpenChange={setShowAddClass}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4 sm:mx-auto rounded-xl">
                  <DialogHeader>
                    <DialogTitle>Add New Class</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-class-name">Class Name *</Label>
                      <Input
                        id="new-class-name"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Enter class name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-class-code">Class Code</Label>
                      <Input
                        id="new-class-code"
                        value={newClassCode}
                        onChange={(e) => setNewClassCode(e.target.value)}
                        placeholder="Enter class code (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-class-subject">Subject *</Label>
                      <Select value={newClassSubject} onValueChange={setNewClassSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="new-class-term">Term</Label>
                      <Input
                        id="new-class-term"
                        value={newClassTerm}
                        onChange={(e) => setNewClassTerm(e.target.value)}
                        placeholder="Enter term (e.g., Fall 2024)"
                      />
                    </div>
                    <Button onClick={handleAddClass} className="w-full">
                      Add Class
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Upload Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadComplete && uploadSuccessMessage && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {uploadSuccessMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center space-y-4">
          <div className="text-lg font-medium">{processingStatus}</div>
          <Progress value={uploadProgress} className="w-full" />
          <div className="text-sm text-gray-600">{uploadProgress}% complete</div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">File Progress:</h4>
            {files.map((file) => {
              const isHeic = file.file.type === 'image/heic' || file.file.type === 'image/heif' || /(\.heic|\.heif)$/i.test(file.file.name)
              const isImage = file.file.type.startsWith('image/') && !isHeic
              const nameNoExt = file.file.name.replace(/\.[^/.]+$/, '')
              return (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {isImage ? (
                      <div 
                        className="relative w-12 h-12 cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => handleImageClick(file.file)}
                      >
                        <img 
                          src={createFilePreviewUrl(file.file)} 
                          alt={file.file.name}
                          className="w-full h-full object-cover rounded border"
                        />
                      </div>
                    ) : file.file.type === 'application/pdf' ? (
                      <div className="relative w-12 h-12">
                        <iframe
                          src={createFilePreviewUrl(file.file)}
                          title={file.file.name}
                          className="w-full h-full rounded border bg-white"
                        />
                      </div>
                    ) : isHeic ? (
                      <div className="w-12 h-12 rounded border bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
                        <ImageOff className="w-5 h-5" />
                      </div>
                    ) : (
                      <FileText className="w-12 h-12 text-blue-500 p-2 bg-blue-50 rounded" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate max-w-[22rem]" title={file.file.name}>{nameNoExt}</p>
                      <div className="flex items-center space-x-4">
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {file.error ? (
                          <p className="text-xs text-red-500">{file.error}</p>
                        ) : file.uploaded ? (
                          <p className="text-xs text-green-600">✅ Uploaded</p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Progress value={file.progress} className="w-20 h-2" />
                            <span className="text-xs text-gray-500">{file.progress}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Diagnostics after upload */}
        {uploadComplete && diagnostics && (
          <div className="mt-4 border rounded-lg p-3 bg-gray-50">
            <div className="font-medium mb-2">Upload Diagnostics</div>
            {diagnostics.running ? (
              <div className="text-sm text-gray-600">Verifying storage objects...</div>
            ) : diagnostics.results.length > 0 ? (
              <div className="space-y-1">
                {diagnostics.results.map(r => (
                  <div key={r.id} className="text-sm flex items-center justify-between">
                    <span className="truncate mr-2">{r.filename}</span>
                    <a className={`underline ${r.ok ? 'text-green-700' : 'text-red-700'}`} href={r.url} target="_blank" rel="noreferrer">
                      {r.ok ? 'Open served URL' : 'Not reachable'}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">No diagnostics available.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-medium
              ${currentStep >= step 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {step}
            </div>
            {step < 4 && (
              <div className={`
                w-20 h-1 mx-2
                ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: File Upload */}
      {currentStep === 1 && renderStep1()}

      {/* Step 2: Resource Details */}
      {currentStep === 2 && renderStep2()}

      {/* Step 3: School/Teacher/Class Selection */}
      {currentStep === 3 && renderStep3()}

      {/* Step 4: Upload Progress */}
      {currentStep === 4 && renderStep4()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
          className="border-indigo-200 hover:bg-indigo-50"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {currentStep < 4 ? (
          <Button
            onClick={nextStep}
            disabled={loading || !canProceed(currentStep)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Loading...
              </div>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading || !canProceedStep1 || !canProceedStep2 || !canProceedStep3 || uploadComplete}

            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                Uploading...
              </div>
            ) : uploadComplete ? (
              'Complete ✓'
            ) : (
              'Upload & Share'
            )}
          </Button>
        )}
      </div>

      {/* Image Expansion Modal */}
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center max-h-[80vh] overflow-hidden">
            {expandedImage && (
              <img 
                src={expandedImage} 
                alt="Expanded preview"
                className="max-w-full max-h-full object-contain rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Text Upload Modal */}
      <Dialog open={showTextUpload} onOpenChange={setShowTextUpload}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Text Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-filename">Filename *</Label>
              <Input
                id="text-filename"
                value={textFileName}
                onChange={(e) => setTextFileName(e.target.value)}
                placeholder="Enter filename (e.g., 'My Notes')"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Text Content *</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste or type your text content here..."
                className="min-h-[200px] w-full font-mono text-sm"
                style={{ whiteSpace: 'pre-wrap' }}
              />
              <div className="text-xs text-gray-500">
                {textContent.length} characters
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowTextUpload(false)
                  setTextContent('')
                  setTextFileName('')
                  setError('')
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleTextUpload}
                disabled={!textContent.trim() || !textFileName.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Upload Text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
