'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IOSSelect } from '@/components/ui/ios-select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Plus, School, UserPlus } from 'lucide-react'
import { ResourceType } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface FacetFiltersProps {
  schools?: Array<{ id: string; name: string }>
  subjects?: Array<{ id: string; name: string }>
  teachers?: Array<{ id: string; name: string; school_id?: string }>
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'past_material', label: 'Past Material' },
  { value: 'study_guide', label: 'Study Guide' },
  { value: 'practice_set', label: 'Practice Set' },
]

function FacetFiltersContent({ schools = [], subjects = [], teachers = [] }: FacetFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedSchool, setSelectedSchool] = useState(searchParams.get('school') || '')
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '')
  const [selectedTeacher, setSelectedTeacher] = useState(searchParams.get('teacher') || '')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '')
  
  // Add school dialog
  const [showAddSchool, setShowAddSchool] = useState(false)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [addingSchool, setAddingSchool] = useState(false)
  
  // Add teacher dialog
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [newTeacherName, setNewTeacherName] = useState('')
  const [addingTeacher, setAddingTeacher] = useState(false)

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // If school changes, clear teacher filter since teachers belong to schools
    if (key === 'school') {
      params.delete('teacher')
      setSelectedTeacher('')
    } else if (key === 'teacher' && value) {
      const teacher = teachers.find(t => t.id === value)
      if (teacher?.school_id && !params.has('school')) {
        params.set('school', teacher.school_id)
        setSelectedSchool(teacher.school_id)
      }
    }
    
    router.push(`${window.location.pathname}?${params.toString()}`)
  }

  // Filter teachers by selected school
  const filteredTeachers = selectedSchool 
    ? teachers.filter(teacher => teacher.school_id === selectedSchool)
    : teachers

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    router.push(`${window.location.pathname}?${params.toString()}`)
    
    // Update local state
    switch (key) {
      case 'school':
        setSelectedSchool('')
        break
      case 'subject':
        setSelectedSubject('')
        break
      case 'teacher':
        setSelectedTeacher('')
        break
      case 'type':
        setSelectedType('')
        break
    }
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('school')
    params.delete('subject')
    params.delete('teacher')
    params.delete('type')
    router.push(`${window.location.pathname}?${params.toString()}`)
    
    setSelectedSchool('')
    setSelectedSubject('')
    setSelectedTeacher('')
    setSelectedType('')
  }

  const hasActiveFilters = selectedSchool || selectedSubject || selectedTeacher || selectedType

  const handleAddSchool = async () => {
    if (!newSchoolName.trim()) return

    setAddingSchool(true)
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert({ name: newSchoolName.trim() })
        .select()
        .single()

      if (error) {
        alert('Failed to add school. It might already exist.')
        return
      }

      // Refresh the page to get updated school list
      setNewSchoolName('')
      setShowAddSchool(false)
      window.location.reload()
    } catch (error) {
      console.error('Error adding school:', error)
      alert('Failed to add school. Please try again.')
    } finally {
      setAddingSchool(false)
    }
  }

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim() || !selectedSchool) return

    setAddingTeacher(true)
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert({ 
          name: newTeacherName.trim(),
          school_id: selectedSchool
        })
        .select()
        .single()

      if (error) {
        alert('Failed to add teacher. They might already exist at this school.')
        return
      }

      // Refresh the page to get updated teacher list
      setNewTeacherName('')
      setShowAddTeacher(false)
      window.location.reload()
    } catch (error) {
      console.error('Error adding teacher:', error)
      alert('Failed to add teacher. Please try again.')
    } finally {
      setAddingTeacher(false)
    }
  }

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Filter Dropdowns - Horizontal Mobile Layout */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {/* School Select */}
        <IOSSelect
          value={selectedSchool}
          onValueChange={(value) => {
            setSelectedSchool(value)
            updateFilters('school', value)
          }}
          placeholder="🏫 School"
          options={schools}
          triggerClassName="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-900 hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 focus:ring-blue-500 shadow-blue-100"
          footer={
            <Dialog open={showAddSchool} onOpenChange={setShowAddSchool}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-100 text-sm rounded-none py-3 font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New School
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <School className="w-5 h-5" />
                    Add New School
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="school-name">School Name</Label>
                    <Input
                      id="school-name"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                      placeholder="Enter school name..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !addingSchool) {
                          handleAddSchool()
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddSchool}
                      disabled={!newSchoolName.trim() || addingSchool}
                      className="flex-1"
                    >
                      {addingSchool ? 'Adding...' : 'Add School'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddSchool(false)
                        setNewSchoolName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Subject Select */}
        <IOSSelect
          value={selectedSubject}
          onValueChange={(value) => {
            setSelectedSubject(value)
            updateFilters('subject', value)
          }}
          placeholder="📚 Subject"
          options={subjects}
          triggerClassName="bg-gradient-to-r from-green-50 to-emerald-100 border-green-300 text-green-900 hover:from-green-100 hover:to-emerald-200 hover:border-green-400 focus:ring-green-500 shadow-green-100"
        />

        {/* Teacher Select */}
        <IOSSelect
          value={selectedTeacher}
          onValueChange={(value) => {
            setSelectedTeacher(value)
            updateFilters('teacher', value)
          }}
          placeholder={selectedSchool ? "👨‍🏫 Teacher" : "Teacher"}
          options={filteredTeachers}
          disabled={!selectedSchool}
          triggerClassName="bg-gradient-to-r from-purple-50 to-violet-100 border-purple-300 text-purple-900 hover:from-purple-100 hover:to-violet-200 hover:border-purple-400 focus:ring-purple-500 shadow-purple-100"
          footer={
            <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-purple-700 hover:text-purple-800 hover:bg-purple-100 text-sm rounded-none py-3 font-medium"
                  disabled={!selectedSchool}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {selectedSchool ? 'Add Teacher' : 'School First'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4 sm:mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <UserPlus className="w-5 h-5" />
                    Add New Teacher
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="teacher-name" className="text-sm">Teacher Name</Label>
                    <Input
                      id="teacher-name"
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="Enter teacher name..."
                      className="h-10 sm:h-11"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !addingTeacher) {
                          handleAddTeacher()
                        }
                      }}
                    />
                  </div>
                  {selectedSchool && (
                    <div className="text-sm text-gray-600">
                      Adding to: <strong>{schools.find(s => s.id === selectedSchool)?.name}</strong>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddTeacher}
                      disabled={!newTeacherName.trim() || !selectedSchool || addingTeacher}
                      className="flex-1"
                    >
                      {addingTeacher ? 'Adding...' : 'Add Teacher'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddTeacher(false)
                        setNewTeacherName('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Type Select */}
        <IOSSelect
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value)
            updateFilters('type', value)
          }}
          placeholder="📝 Type"
          options={RESOURCE_TYPES.map(t => ({ id: t.value, name: t.label }))}
          triggerClassName="bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-300 text-yellow-900 hover:from-yellow-100 hover:to-amber-200 hover:border-yellow-400 focus:ring-yellow-500 shadow-yellow-100"
        />
      </div>

      {/* Clear All Filters - Full Width Below */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={clearAllFilters} 
          className="w-full text-sm h-9 rounded-xl border-2 hover:bg-gray-100 hover:border-gray-400 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Clear All Filters
        </Button>
      )}

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedSchool && (
            <Badge variant="secondary" className="flex items-center gap-1">
              School: {schools.find(s => s.id === selectedSchool)?.name}
              <button onClick={() => clearFilter('school')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedSubject && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Subject: {subjects.find(s => s.id === selectedSubject)?.name}
              <button onClick={() => clearFilter('subject')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedTeacher && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Teacher: {teachers.find(t => t.id === selectedTeacher)?.name}
              <button onClick={() => clearFilter('teacher')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedType && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {RESOURCE_TYPES.find(t => t.value === selectedType)?.label}
              <button onClick={() => clearFilter('type')} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}

export default function FacetFilters(props: FacetFiltersProps) {
  return (
    <Suspense fallback={<div className="h-16 bg-gray-100 rounded-lg animate-pulse" />}>
      <FacetFiltersContent {...props} />
    </Suspense>
  )
}
