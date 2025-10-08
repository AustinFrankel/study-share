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
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer) return
      e.preventDefault()
      
      // Don't show drag overlay on upload page - let local handler manage it
      if (window.location.pathname === '/upload') {
        return
      }
      
      setIsDragging(true)
      e.dataTransfer.dropEffect = 'copy'
    }

    const onDragLeave = (e: DragEvent) => {
      // Only hide when leaving the window entirely
      if ((e as DragEvent & { relatedTarget?: EventTarget | null }).relatedTarget === null) {
        setIsDragging(false)
      }
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      // Don't process drops if we're already on the upload page
      // Let the upload wizard handle it directly
      if (window.location.pathname === '/upload') {
        console.log('GlobalDropzone: On upload page, skipping')
        return
      }
      
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

      console.log('GlobalDropzone: Setting pending files and navigating')
      setPendingFiles(files)
      
      // Navigate immediately - files are now stored in global singleton
      console.log('GlobalDropzone: Navigating to /upload')
      router.push('/upload')
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


