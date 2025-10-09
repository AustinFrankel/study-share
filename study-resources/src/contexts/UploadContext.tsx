'use client'

import { createContext, useContext, useCallback, useState, useEffect, useRef } from 'react'

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

// Global in-memory storage that persists across component remounts
// This is a singleton that survives React's component lifecycle
const globalFileStorage = {
  files: [] as PendingUploadFile[],
  subscribers: new Set<(files: PendingUploadFile[]) => void>(),
  
  setFiles(files: PendingUploadFile[]) {
    console.log('GlobalStorage: Setting', files.length, 'files')
    this.files = files
    this.subscribers.forEach(cb => cb(files))
  },
  
  getFiles() {
    return this.files
  },
  
  clearFiles() {
    console.log('GlobalStorage: Clearing files')
    this.files = []
    this.subscribers.forEach(cb => cb([]))
  },
  
  subscribe(callback: (files: PendingUploadFile[]) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [pendingFiles, setPendingFilesState] = useState<PendingUploadFile[]>(() => {
    // Initialize with current global state
    console.log('UploadProvider: Initializing with', globalFileStorage.getFiles().length, 'files from global storage')
    return globalFileStorage.getFiles()
  })
  
  const isInitialMount = useRef(true)

  // Subscribe to global storage changes
  useEffect(() => {
    console.log('UploadProvider: Subscribing to global storage')
    const unsubscribe = globalFileStorage.subscribe((files) => {
      console.log('UploadProvider: Received update from global storage:', files.length, 'files')
      setPendingFilesState(files)
    })
    
    // On mount, sync with global storage
    if (isInitialMount.current) {
      const currentFiles = globalFileStorage.getFiles()
      if (currentFiles.length > 0) {
        console.log('UploadProvider: Syncing with global storage on mount:', currentFiles.length, 'files')
        setPendingFilesState(currentFiles)
      }
      isInitialMount.current = false
    }
    
    return () => {
      unsubscribe()
    }
  }, [])

  // Use useCallback to memoize functions
  const setPendingFiles = useCallback((files: PendingUploadFile[]) => {
    console.log('UploadContext: setPendingFiles called with', files.length, 'files')
    globalFileStorage.setFiles(files)
  }, [])

  const clearPendingFiles = useCallback(() => {
    console.log('UploadContext: clearPendingFiles called')
    globalFileStorage.clearFiles()
  }, [])

  // No need to memoize the value object since the functions are now stable
  const value = { pendingFiles, setPendingFiles, clearPendingFiles }

  return <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
}

export function useUploadContext() {
  const ctx = useContext(UploadContext)
  if (!ctx) {
    // This can happen if the context is used on a page without the provider,
    // which shouldn't occur in this app structure, but it's good practice.
    // We can return a default/empty state to prevent crashes.
    console.warn('useUploadContext called outside of UploadProvider. Returning a fallback context.');
    return {
      pendingFiles: globalFileStorage.getFiles(), // Attempt to get from global singleton
      setPendingFiles: (files: PendingUploadFile[]) => globalFileStorage.setFiles(files),
      clearPendingFiles: () => globalFileStorage.clearFiles(),
    };
  }
  return ctx
}


