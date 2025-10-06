'use client'

import { createContext, useContext, useCallback, useState } from 'react'

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

  // Use useCallback to memoize functions instead of useMemo
  const setPendingFiles = useCallback((files: PendingUploadFile[]) => {
    setPendingFilesState(files)
  }, [])

  const clearPendingFiles = useCallback(() => {
    setPendingFilesState([])
  }, [])

  // No need to memoize the value object since the functions are now stable
  const value = { pendingFiles, setPendingFiles, clearPendingFiles }

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export function useUploadContext() {
  const ctx = useContext(UploadContext)
  if (!ctx) throw new Error('useUploadContext must be used within UploadProvider')
  return ctx
}


