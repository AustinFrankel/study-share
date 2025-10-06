'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, Users, BookOpen } from 'lucide-react'

interface School {
  id: string
  name: string
  city?: string
  state?: string
  _count?: {
    teachers: number
    classes: number
    resources: number
  }
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      // For now, just fetch schools without counts
      // In a real implementation, you'd use a more complex query or API route
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name')

      if (error) throw error
      setSchools(data || [])
    } catch (error) {
      console.error('Error fetching schools:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schools</h1>
          <p className="text-gray-600">Browse study resources by school</p>
        </div>

        {schools.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Link key={school.id} href={`/schools/${school.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    {(school.city || school.state) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {[school.city, school.state].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {school._count?.teachers || 0} teachers
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {school._count?.resources || 0} resources
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schools yet</h3>
            <p className="text-gray-600">Schools will appear here as resources are uploaded</p>
          </div>
        )}
      </main>
    </div>
  )
}
