'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
    <div className="space-y-3 sm:space-y-4">
      {/* Filter Dropdowns - Stack on Mobile, Row on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3">
        <Select value={selectedSchool} onValueChange={(value) => {
          setSelectedSchool(value)
          updateFilters('school', value)
        }}>
          <SelectTrigger className="w-full lg:w-[200px] xl:w-[220px] h-10 sm:h-11 rounded-lg sm:rounded-xl border-2 shadow-sm bg-blue-50 sm:bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-100 sm:hover:bg-blue-200 text-sm sm:text-base">
            <SelectValue placeholder="Select School" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
            <div className="p-2 border-t">
              <Dialog open={showAddSchool} onOpenChange={setShowAddSchool}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
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
            </div>
          </SelectContent>
        </Select>

        <Select value={selectedSubject} onValueChange={(value) => {
          setSelectedSubject(value)
          updateFilters('subject', value)
        }}>
          <SelectTrigger className="w-full lg:w-[180px] xl:w-[200px] h-10 sm:h-11 rounded-lg sm:rounded-xl border-2 shadow-sm bg-green-50 sm:bg-green-100 border-green-200 text-green-800 hover:bg-green-100 sm:hover:bg-green-200 text-sm sm:text-base">
            <SelectValue placeholder="Select Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedTeacher} 
          onValueChange={(value) => {
            setSelectedTeacher(value)
            updateFilters('teacher', value)
          }}
        >
          <SelectTrigger className="w-full lg:w-[180px] xl:w-[200px] h-10 sm:h-11 rounded-lg sm:rounded-xl border-2 shadow-sm bg-purple-50 sm:bg-purple-100 border-purple-200 text-purple-800 hover:bg-purple-100 sm:hover:bg-purple-200 text-sm sm:text-base">
            <SelectValue 
              placeholder={"Select Teacher"} 
            />
          </SelectTrigger>
          <SelectContent>
            {filteredTeachers.length > 0 && filteredTeachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
            <div className="p-2 border-t">
              <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm"
                    disabled={!selectedSchool}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {selectedSchool ? 'Add Teacher' : 'Select School First'}
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
            </div>
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={(value) => {
          setSelectedType(value)
          updateFilters('type', value)
        }}>
          <SelectTrigger className="w-full lg:w-[160px] xl:w-[180px] h-10 sm:h-11 rounded-lg sm:rounded-xl border-2 shadow-sm bg-yellow-50 sm:bg-yellow-100 border-yellow-200 text-yellow-800 hover:bg-yellow-100 sm:hover:bg-yellow-200 text-sm sm:text-base">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearAllFilters} className="text-sm">
            Clear All
          </Button>
        )}
      </div>

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
