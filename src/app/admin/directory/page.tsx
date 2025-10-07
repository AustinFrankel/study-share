'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, School, Users, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface School {
  id: string
  name: string
  type: string
  location: string
}

interface Teacher {
  id: string
  name: string
  school_id: string
  department: string
}

export default function DirectoryManagement() {
  const { user } = useAuth()
  const [schools, setSchools] = useState<School[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Add School Form State
  const [newSchool, setNewSchool] = useState({
    name: '',
    type: 'university',
    location: ''
  })

  // Add Teacher Form State
  const [newTeachers, setNewTeachers] = useState<Array<{ name: string, department: string }>>([
    { name: '', department: '' }
  ])
  const [selectedSchoolForTeachers, setSelectedSchoolForTeachers] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schoolsRes, teachersRes] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('teachers').select('*').order('name')
      ])

      if (schoolsRes.data) setSchools(schoolsRes.data)
      if (teachersRes.data) setTeachers(teachersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      showMessage('error', 'Failed to load directory data')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAddSchool = async () => {
    if (!newSchool.name.trim()) {
      showMessage('error', 'School name is required')
      return
    }

    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{
          name: newSchool.name.trim(),
          type: newSchool.type,
          location: newSchool.location.trim()
        }])
        .select()
        .single()

      if (error) throw error

      setSchools([...schools, data])
      setSelectedSchoolForTeachers(data.id)
      setNewSchool({ name: '', type: 'university', location: '' })

      showMessage('success', `School "${data.name}" added! Now add teachers below.`)

      // Scroll to teacher section
      setTimeout(() => {
        document.getElementById('teachers-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error: any) {
      console.error('Error adding school:', error)
      showMessage('error', error.message || 'Failed to add school')
    }
  }

  const handleAddTeachers = async () => {
    if (!selectedSchoolForTeachers) {
      showMessage('error', 'Please select a school first')
      return
    }

    const validTeachers = newTeachers.filter(t => t.name.trim())

    if (validTeachers.length === 0) {
      showMessage('error', 'Please add at least one teacher')
      return
    }

    try {
      const teachersToInsert = validTeachers.map(t => ({
        name: t.name.trim(),
        school_id: selectedSchoolForTeachers,
        department: t.department.trim() || 'General'
      }))

      const { data, error } = await supabase
        .from('teachers')
        .insert(teachersToInsert)
        .select()

      if (error) throw error

      setTeachers([...teachers, ...data])
      setNewTeachers([{ name: '', department: '' }])

      const schoolName = schools.find(s => s.id === selectedSchoolForTeachers)?.name
      showMessage('success', `Added ${data.length} teacher(s) to ${schoolName}!`)
    } catch (error: any) {
      console.error('Error adding teachers:', error)
      showMessage('error', error.message || 'Failed to add teachers')
    }
  }

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Are you sure you want to delete "${schoolName}"? This will also delete all associated teachers.`)) {
      return
    }

    try {
      const { error } = await supabase.from('schools').delete().eq('id', schoolId)
      if (error) throw error

      setSchools(schools.filter(s => s.id !== schoolId))
      setTeachers(teachers.filter(t => t.school_id !== schoolId))
      showMessage('success', `Deleted "${schoolName}"`)
    } catch (error: any) {
      console.error('Error deleting school:', error)
      showMessage('error', error.message || 'Failed to delete school')
    }
  }

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Are you sure you want to delete "${teacherName}"?`)) {
      return
    }

    try {
      const { error } = await supabase.from('teachers').delete().eq('id', teacherId)
      if (error) throw error

      setTeachers(teachers.filter(t => t.id !== teacherId))
      showMessage('success', `Deleted "${teacherName}"`)
    } catch (error: any) {
      console.error('Error deleting teacher:', error)
      showMessage('error', error.message || 'Failed to delete teacher')
    }
  }

  const addTeacherRow = () => {
    setNewTeachers([...newTeachers, { name: '', department: '' }])
  }

  const removeTeacherRow = (index: number) => {
    setNewTeachers(newTeachers.filter((_, i) => i !== index))
  }

  const updateTeacherRow = (index: number, field: 'name' | 'department', value: string) => {
    const updated = [...newTeachers]
    updated[index][field] = value
    setNewTeachers(updated)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Directory Management</h1>
          <p className="text-gray-600">Add and manage schools and teachers in the directory</p>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Add School Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                Add School
              </CardTitle>
              <CardDescription>Add a new school to the directory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="school-name">School Name *</Label>
                <Input
                  id="school-name"
                  placeholder="e.g., Blind Brook High School"
                  value={newSchool.name}
                  onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="school-type">Type</Label>
                <Select value={newSchool.type} onValueChange={(value) => setNewSchool({ ...newSchool, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="school-location">Location</Label>
                <Input
                  id="school-location"
                  placeholder="e.g., Rye Brook, NY"
                  value={newSchool.location}
                  onChange={(e) => setNewSchool({ ...newSchool, location: e.target.value })}
                />
              </div>

              <Button onClick={handleAddSchool} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add School
              </Button>
            </CardContent>
          </Card>

          {/* Add Teachers Card */}
          <Card id="teachers-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Add Teachers
              </CardTitle>
              <CardDescription>Add teachers to a school</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="teacher-school">Select School *</Label>
                <Select value={selectedSchoolForTeachers} onValueChange={setSelectedSchoolForTeachers}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a school..." />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {newTeachers.map((teacher, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Teacher name (e.g., Prof. John Smith)"
                        value={teacher.name}
                        onChange={(e) => updateTeacherRow(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        placeholder="Department"
                        value={teacher.department}
                        onChange={(e) => updateTeacherRow(index, 'department', e.target.value)}
                      />
                    </div>
                    {newTeachers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeacherRow(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={addTeacherRow} className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Teacher
                </Button>
                <Button onClick={handleAddTeachers} className="flex-1">
                  Save Teachers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        <Card>
          <CardHeader>
            <CardTitle>Schools ({schools.length})</CardTitle>
            <CardDescription>All schools in the directory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schools.map((school) => {
                const schoolTeachers = teachers.filter(t => t.school_id === school.id)
                return (
                  <div key={school.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{school.name}</h3>
                        <p className="text-sm text-gray-600">
                          {school.location} • {school.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {schoolTeachers.length} teacher{schoolTeachers.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchool(school.id, school.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {schoolTeachers.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {schoolTeachers.map((teacher) => (
                            <div key={teacher.id} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                              <span className="text-gray-700">
                                {teacher.name}
                                {teacher.department && <span className="text-gray-500"> • {teacher.department}</span>}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                                className="text-red-600 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {schools.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No schools added yet. Add your first school above!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
