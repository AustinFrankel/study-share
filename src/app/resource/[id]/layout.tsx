import { Metadata } from 'next'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  // Return default metadata if Supabase is not configured
  if (!isSupabaseConfigured) {
    return {
      title: 'Study Resource',
      description: 'View this study resource on StudyShare',
    }
  }

  try {
    // Fetch resource data for metadata
    const { data: resource, error } = await supabase
      .from('resources')
      .select(`
        id,
        title,
        subtitle,
        type,
        created_at,
        vote_count,
        average_rating,
        rating_count,
        difficulty,
        uploader_id,
        class:classes(
          id,
          title,
          code,
          school:schools(id, name),
          subject:subjects(id, name),
          teacher:teachers(id, name)
        ),
        uploader:users(id, handle, avatar_url),
        files(id, mime, original_filename)
      `)
      .eq('id', id)
      .single()

    if (error || !resource) {
      return {
        title: 'Resource Not Found | StudyShare',
        description: 'The requested study resource could not be found.',
      }
    }

    // Build rich title with context
    const className = resource.class?.title || 'Study Resource'
    const schoolName = resource.class?.school?.name || ''
    const resourceType = resource.type?.charAt(0).toUpperCase() + resource.type?.slice(1) || 'Resource'

    const title = `${resource.title} - ${className} ${resourceType}`

    // Build description
    const subtitle = resource.subtitle ? `${resource.subtitle}. ` : ''
    const uploaderInfo = resource.uploader?.handle ? `Uploaded by ${resource.uploader.handle}. ` : ''
    const schoolInfo = schoolName ? `${schoolName}. ` : ''
    const ratingInfo = resource.rating_count && resource.rating_count > 0
      ? `Rated ${resource.average_rating?.toFixed(1)}/5 by ${resource.rating_count} students. `
      : ''

    const description = `${subtitle}${uploaderInfo}${schoolInfo}${ratingInfo}Access this ${resourceType.toLowerCase()} and more study materials on StudyShare.`

    // Get first image file for OG image if available
    const imageFile = resource.files?.find((f: any) => f.mime?.startsWith('image/'))
    const ogImage = imageFile
      ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app'}/api/file/${imageFile.id}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://studyshare.app'}/og-image.png`

    return {
      title,
      description: description.slice(0, 160), // Ensure we don't exceed meta description length
      keywords: [
        resource.title,
        className,
        schoolName,
        resource.class?.subject?.name || '',
        resource.type || '',
        'study resource',
        'class notes',
        'study guide',
        resource.class?.teacher?.name || ''
      ].filter(Boolean),
      openGraph: {
        title: resource.title,
        description: subtitle || `${resourceType} for ${className}`,
        url: `/resource/${id}`,
        type: 'article',
        images: [{
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${resource.title} - ${className}`
        }],
        siteName: 'StudyShare',
        publishedTime: resource.created_at,
      },
      twitter: {
        card: 'summary_large_image',
        title: resource.title,
        description: subtitle || `${resourceType} for ${className}`,
        images: [ogImage],
      },
      alternates: {
        canonical: `/resource/${id}`
      }
    }
  } catch (error) {
    console.error('Error generating metadata for resource:', error)
    return {
      title: 'Study Resource | StudyShare',
      description: 'View study resources and materials on StudyShare',
    }
  }
}

export default function ResourceLayout({ children }: Props) {
  return <>{children}</>
}
