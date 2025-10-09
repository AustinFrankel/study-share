'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
const generateId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
import { useUploadContext } from '@/contexts/UploadContext'

export default function GlobalDropzone() {
  const router = useRouter()
  const { setPendingFiles } = useUploadContext()
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Restrict global drag-and-drop to only operate as a visual helper that
    // routes to `/upload`. On all other routes we should suppress drag overlay
    // and navigation entirely so users cannot drop anywhere except Upload.
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer) return
      // Only activate global overlay when NOT on upload page, but still
      // prevent the browser from opening the file.
      e.preventDefault()
      const pathname = window.location.pathname
      // If not on `/upload`, show a subtle hint but we will not accept the drop here
      if (pathname !== '/upload') {
        setIsDragging(true)
        e.dataTransfer.dropEffect = 'none'
        return
      }
    }

    const onDragLeave = (e: DragEvent) => {
      // Only hide when leaving the window entirely
      if ((e as DragEvent & { relatedTarget?: EventTarget | null }).relatedTarget === null) {
        setIsDragging(false)
      }
    }

    const serializeFilesToSession = async (fileEntries: { id: string; file: File }[]) => {
      try {
        const data = await Promise.all(
          fileEntries.map(async ({ id, file }) => {
            const dataUrl: string | null = await new Promise((resolve) => {
              try {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result || ''))
                reader.onerror = () => resolve(null)
                reader.readAsDataURL(file)
              } catch { resolve(null) }
            })
            return {
              id,
              name: file.name,
              type: file.type,
              lastModified: file.lastModified,
              dataUrl
            }
          })
        )
        sessionStorage.setItem('uploadQueueV1', JSON.stringify({ createdAt: Date.now(), items: data }))
      } catch {}
    }

    const onDrop = async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      // Only allow drop to trigger navigation when NOT on `/upload`.
      // Actual file processing must happen exclusively on `/upload`.
      if (window.location.pathname === '/upload') return
      
      const items = Array.from(e.dataTransfer?.files || [])
      console.log('GlobalDropzone: Files dropped:', items.length)
      
      if (items.length === 0) {
        console.log('GlobalDropzone: No files found')
        return
      }

      // Accept the same set as UploadWizard input accepts. If in doubt, pass through
      // and let the UploadWizard perform any further validation.
      const allowedMimePrefixes = ['image/', 'application/', 'text/']
      const allowedExtensions = [/\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|heic|heif)$/i]

      const files = items
        .filter(f => {
          const nameOk = allowedExtensions.some(rx => rx.test(f.name))
          const mimeOk = allowedMimePrefixes.some(p => (f.type || '').startsWith(p))
          return nameOk || mimeOk
        })
        .map(file => ({ id: generateId(), file }))

      console.log('GlobalDropzone: Filtered files:', files.length)

      // If nothing usable, do not navigate away or show alerts
      if (files.length === 0) {
        console.log('GlobalDropzone: No valid files after filtering')
        return
      }

      // Persist then navigate to /upload where the wizard takes over
      setPendingFiles(files)
      await serializeFilesToSession(files)
      router.push('/upload?restore=1')
    }

    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [router, setPendingFiles])

  if (!isDragging) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60
      }}
    >
      <div style={{
        border: '2px dashed white',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Drop files to upload</div>
        <div style={{ opacity: 0.9, marginTop: 8 }}>PDF, Images, Docs, Text</div>
      </div>
    </div>
  )
}


