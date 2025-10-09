// Enhanced error logging utility for Supabase and other errors
export function logError(context: string, error: unknown) {
  // Try multiple ways to extract error information
  const errorInfo: Record<string, unknown> = {
    context,
    timestamp: new Date().toISOString()
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    errorInfo.name = error.name
    errorInfo.message = error.message
    errorInfo.stack = error.stack
  }

  // Handle Supabase PostgrestError objects
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, unknown>
    // Try to extract common Supabase error properties
    if (errorObj.message) errorInfo.message = errorObj.message
    if (errorObj.code) errorInfo.code = errorObj.code
    if (errorObj.details) errorInfo.details = errorObj.details
    if (errorObj.hint) errorInfo.hint = errorObj.hint
    if (errorObj.status) errorInfo.status = errorObj.status
    if (errorObj.statusText) errorInfo.statusText = errorObj.statusText
    
    // Try to get all enumerable properties
    try {
      const keys = Object.keys(error)
      if (keys.length > 0) {
        const properties: Record<string, unknown> = {}
        keys.forEach(key => {
          properties[key] = (error as Record<string, unknown>)[key]
        })
        errorInfo.properties = properties
      }
    } catch {
      // Ignore
    }

    // Try to get all properties including non-enumerable
    try {
      const allProps = Object.getOwnPropertyNames(error)
      if (allProps.length > 0) {
        const allProperties: Record<string, unknown> = {}
        allProps.forEach(prop => {
          try {
            allProperties[prop] = (error as Record<string, unknown>)[prop]
          } catch {
            allProperties[prop] = '[Unable to access]'
          }
        })
        errorInfo.allProperties = allProperties
      }
    } catch {
      // Ignore
    }
  }

  // Try JSON.stringify with error handling
  try {
    errorInfo.stringified = JSON.stringify(error, null, 2)
  } catch {
    errorInfo.stringified = '[Unable to stringify]'
  }

  // If we still don't have much info, try toString
  if (!errorInfo.message && !errorInfo.code && !errorInfo.details) {
    try {
      errorInfo.toStringValue = (error as { toString?: () => string })?.toString?.() || String(error)
    } catch {
      errorInfo.toStringValue = '[Unable to convert to string]'
    }
  }

  // Avoid noisy Next.js dev overlay by downgrading to warnings in development
  const isDev = process.env.NODE_ENV !== 'production'
  if (isDev) {
    try {
      const pretty = JSON.stringify(errorInfo, null, 2)
      console.warn(`[dev] Enhanced error logging: ${pretty}`)
    } catch {
      console.warn('[dev] Enhanced error logging:', errorInfo)
    }
    console.warn('[dev] Raw error object:', error)
  } else {
    console.error('Enhanced error logging:', errorInfo)
    // Also log the raw error for comparison
    console.error('Raw error object:', error)
  }
  
  return errorInfo
}
