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
      if ((e as any).relatedTarget === null) {
        setIsDragging(false)
      }
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      // Don't process drops if we're already on the upload page
      // Let the upload wizard handle it directly
      if (window.location.pathname === '/upload') {
        return
      }
      
      const items = Array.from(e.dataTransfer?.files || [])
      if (items.length === 0) return

      const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
      // HEIC conversion removed - just block HEIC files for now
      const unsupportedFiles = items.filter(f => f.type === 'image/heic' || f.name.toLowerCase().endsWith('.heic'))
      
      if (unsupportedFiles.length > 0) {
        alert(`HEIC format is not supported. Please convert ${unsupportedFiles.map(f => f.name).join(', ')} to JPG or PNG.`)
        return
      }
      
      const files = items
        .filter(f => allowed.includes(f.type))
        .map(file => ({ id: generateId(), file }))
      if (files.length === 0) {
        alert('Only PDF, PNG, and JPG files are supported.')
        return
      }

      setPendingFiles(files)
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
        <div style={{ opacity: 0.9, marginTop: 8 }}>PDF, PNG, JPG</div>
      </div>
    </div>
  )
}


