'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Resource } from '@/lib/types'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface RelatedResourcesProps {
  currentResourceId: string
  classId?: string
  schoolId?: string
  subjectId?: string
  limit?: number
}

export default function RelatedResources({
  currentResourceId,
  classId,
  schoolId,
  subjectId,
  limit = 4
}: RelatedResourcesProps) {
  const [relatedResources, setRelatedResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedResources() {
      try {
        let query = supabase
          .from('resources')
          .select(`
            id,
            title,
            type,
            created_at,
            vote_count,
            average_rating,
            class:classes(
              id,
              title,
              code,
              school:schools(id, name),
              subject:subjects(id, name),
              teacher:teachers(id, name)
            )
          `)
          .neq('id', currentResourceId)
          .order('vote_count', { ascending: false })
          .limit(limit)

        // Prioritize: same class > same school + subject > same subject
        if (classId) {
          query = query.eq('class_id', classId)
        } else if (schoolId && subjectId) {
          query = query.eq('class.school_id', schoolId).eq('class.subject_id', subjectId)
        } else if (subjectId) {
          query = query.eq('class.subject_id', subjectId)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching related resources:', error)
          return
        }

        setRelatedResources(data || [])
      } catch (error) {
        console.error('Error in fetchRelatedResources:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedResources()
  }, [currentResourceId, classId, schoolId, subjectId, limit])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Related Study Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedResources.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Related Study Materials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedResources.map((resource) => (
            <Link
              key={resource.id}
              href={`/resource/${resource.id}`}
              className="block p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 line-clamp-1 mb-1">
                    {resource.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {resource.class?.title && (
                      <Badge variant="secondary" className="text-xs">
                        {resource.class.title}
                      </Badge>
                    )}
                    {resource.type && (
                      <Badge
                        className={`text-xs ${
                          resource.type === 'notes'
                            ? 'bg-blue-100 text-blue-800'
                            : resource.type === 'past_material'
                            ? 'bg-green-100 text-green-800'
                            : resource.type === 'study_guide'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {resource.type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {resource.vote_count !== undefined && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {resource.vote_count}
                      </span>
                    )}
                    {resource.average_rating && (
                      <span>⭐ {resource.average_rating.toFixed(1)}</span>
                    )}
                    <span>{formatDistanceToNow(new Date(resource.created_at))} ago</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
