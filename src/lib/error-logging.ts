// Enhanced error logging utility for Supabase and other errors
export function logError(context: string, error: any) {
  // Try multiple ways to extract error information
  const errorInfo: any = {
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
    // Try to extract common Supabase error properties
    if (error.message) errorInfo.message = error.message
    if (error.code) errorInfo.code = error.code
    if (error.details) errorInfo.details = error.details
    if (error.hint) errorInfo.hint = error.hint
    if (error.status) errorInfo.status = error.status
    if (error.statusText) errorInfo.statusText = error.statusText
    
    // Try to get all enumerable properties
    try {
      const keys = Object.keys(error)
      if (keys.length > 0) {
        errorInfo.properties = {}
        keys.forEach(key => {
          errorInfo.properties[key] = error[key]
        })
      }
    } catch (e) {
      // Ignore
    }

    // Try to get all properties including non-enumerable
    try {
      const allProps = Object.getOwnPropertyNames(error)
      if (allProps.length > 0) {
        errorInfo.allProperties = {}
        allProps.forEach(prop => {
          try {
            errorInfo.allProperties[prop] = error[prop]
          } catch (e) {
            errorInfo.allProperties[prop] = '[Unable to access]'
          }
        })
      }
    } catch (e) {
      // Ignore
    }
  }

  // Try JSON.stringify with error handling
  try {
    errorInfo.stringified = JSON.stringify(error, null, 2)
  } catch (e) {
    errorInfo.stringified = '[Unable to stringify]'
  }

  // If we still don't have much info, try toString
  if (!errorInfo.message && !errorInfo.code && !errorInfo.details) {
    try {
      errorInfo.toString = error?.toString?.() || String(error)
    } catch (e) {
      errorInfo.toString = '[Unable to convert to string]'
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
