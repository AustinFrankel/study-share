'use client'

import { createContext, useContext, useMemo, useState } from 'react'

export interface PendingUploadFile {
  id: string
  file: File
}

interface UploadContextType {
  pendingFiles: PendingUploadFile[]
  setPendingFiles: (files: PendingUploadFile[]) => void
  clearPendingFiles: () => void
}

const UploadContext = createContext<UploadContextType | null>(null)

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [pendingFiles, setPendingFilesState] = useState<PendingUploadFile[]>([])

  const setPendingFiles = (files: PendingUploadFile[]) => setPendingFilesState(files)
  const clearPendingFiles = () => setPendingFilesState([])

  const value = useMemo(
    () => ({ pendingFiles, setPendingFiles, clearPendingFiles }),
    [pendingFiles]
  )

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export function useUploadContext() {
  const ctx = useContext(UploadContext)
  if (!ctx) throw new Error('useUploadContext must be used within UploadProvider')
  return ctx
}


