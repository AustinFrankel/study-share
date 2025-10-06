import { supabase } from './supabase'
import { logError } from './error-logging'

// Access gating configuration
export const ACCESS_GATE_CONFIG = {
  ENABLED: true, // Toggle to enable/disable access gating
  FREE_VIEWS_PER_MONTH: 5, // Number of free resource views per month
  MAX_ADS_PER_MONTH: 3, // Maximum ads that can be watched per month
  VIEWS_PER_AD: 1, // Additional views granted per ad watched
  MAX_VIEWS_WITH_ADS: 8, // Maximum views possible with ads (5 base + 3 ads)
}

interface UserAccessInfo {
  viewsThisMonth: number
  maxViewsThisMonth: number
  adsWatchedThisMonth: number
  canView: boolean
  canWatchAd: boolean
  resetTime: Date
  requiresAction: boolean
  actionOptions: ('upload' | 'ad')[]
}

// Get user's monthly access info
export async function getUserAccessInfo(userId: string): Promise<UserAccessInfo> {
  if (!userId) {
    throw new Error('User ID is required')
  }
  
  if (!ACCESS_GATE_CONFIG.ENABLED) {
    return {
      viewsThisMonth: 0,
      maxViewsThisMonth: ACCESS_GATE_CONFIG.FREE_VIEWS_PER_MONTH,
      adsWatchedThisMonth: 0,
      canView: true,
      canWatchAd: true,
      resetTime: new Date(),
      requiresAction: false,
      actionOptions: []
    }
  }

  try {
    // Calculate current month
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Get or create monthly view limit record
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('monthly_view_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single()

    let viewsThisMonth = 0
    let adsWatchedThisMonth = 0

    if (monthlyData) {
      viewsThisMonth = monthlyData.views_used || 0
      adsWatchedThisMonth = monthlyData.ads_watched || 0
    } else if (monthlyError?.code !== 'PGRST116') {
      // Error other than "not found"
      throw monthlyError
    }

    // Get upload bonus views from points ledger
    const { data: uploadBonusData } = await supabase
      .from('points_ledger')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('reason', 'upload_view_cap_increase')
      .gte('created_at', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
      .lt('created_at', `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-01`)

    const uploadBonusCount = uploadBonusData?.length || 0
    const uploadBonusViews = uploadBonusCount * 5 // 5 views per upload

    // Calculate max views (base + ads bonus + upload bonus, with minimum cap of 8)
    const maxViewsThisMonth = Math.max(
      ACCESS_GATE_CONFIG.FREE_VIEWS_PER_MONTH + (adsWatchedThisMonth * ACCESS_GATE_CONFIG.VIEWS_PER_AD) + uploadBonusViews,
      ACCESS_GATE_CONFIG.MAX_VIEWS_WITH_ADS
    )

    const canView = viewsThisMonth < maxViewsThisMonth
    const canWatchAd = adsWatchedThisMonth < ACCESS_GATE_CONFIG.MAX_ADS_PER_MONTH
    const requiresAction = !canView

    // Calculate next month for reset time
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return {
      viewsThisMonth,
      maxViewsThisMonth,
      adsWatchedThisMonth,
      canView,
      canWatchAd,
      resetTime: nextMonth,
      requiresAction,
      actionOptions: requiresAction ? (canWatchAd ? ['upload', 'ad'] : ['upload']) : []
    }
  } catch (error: any) {
    logError('Error getting user access info', error)
    // Default to allowing access on error
    return {
      viewsThisMonth: 0,
      maxViewsThisMonth: ACCESS_GATE_CONFIG.FREE_VIEWS_PER_MONTH,
      adsWatchedThisMonth: 0,
      canView: true,
      canWatchAd: true,
      resetTime: new Date(),
      requiresAction: false,
      actionOptions: []
    }
  }
}

// Record a resource view
export async function recordResourceView(userId: string, resourceId: string): Promise<void> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return

  try {
    // Check if user can view
    const accessInfo = await getUserAccessInfo(userId)
    if (!accessInfo.canView) {
      throw new Error('Monthly view limit exceeded')
    }

    // Get current month
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Update or create monthly view limit record
    const { error: upsertError } = await supabase
      .from('monthly_view_limits')
      .upsert({
        user_id: userId,
        month_year: monthYear,
        views_used: accessInfo.viewsThisMonth + 1,
        ads_watched: accessInfo.adsWatchedThisMonth,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false 
      })
    
    if (upsertError) {
      logError('Error recording resource view', upsertError)
      throw upsertError
    }

    // Also record in points ledger for backwards compatibility
    await supabase
      .from('points_ledger')
      .insert({
        user_id: userId,
        resource_id: resourceId,
        delta: 0,
        reason: 'resource_view',
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error recording resource view:', error)
    throw error
  }
}

// Get user's viewed resources (for purple text marking)
export async function getUserViewedResources(userId: string): Promise<string[]> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return []

  try {
    const { data, error } = await supabase
      .from('points_ledger')
      .select('resource_id')
      .eq('user_id', userId)
      .eq('reason', 'resource_view')
      .not('resource_id', 'is', null)

    if (error) throw error

    return data?.map(row => row.resource_id).filter(Boolean) || []
  } catch (error) {
    console.error('Error getting viewed resources:', error)
    return []
  }
}

// Check if user has viewed a specific resource
export async function hasUserViewedResource(userId: string, resourceId: string): Promise<boolean> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return false

  try {
    const { count, error } = await supabase
      .from('points_ledger')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('resource_id', resourceId)
      .eq('reason', 'resource_view')

    if (error) throw error
    return (count || 0) > 0
  } catch (error) {
    console.error('Error checking if user viewed resource:', error)
    return false
  }
}

// Grant additional views for uploading a resource
export async function grantViewsForUpload(userId: string): Promise<void> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return

  try {
    // Get current month
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Get current access info before granting bonus
    const accessInfo = await getUserAccessInfo(userId)
    
    // Record the bonus views grant in points ledger first
    await supabase
      .from('points_ledger')
      .insert({
        user_id: userId,
        delta: 0,
        reason: 'upload_view_cap_increase',
        created_at: new Date().toISOString()
      })

    // The max views calculation will automatically include this new upload bonus
    // when getUserAccessInfo is called again, so no need to manually update monthly_view_limits
    console.log(`Granted +5 view bonus for user ${userId}. New max will be ${accessInfo.maxViewsThisMonth + 5}`)
    
  } catch (error: any) {
    logError('Error granting views for upload', error)
  }
}

// Grant additional views for watching an ad
export async function grantViewsForAd(userId: string): Promise<void> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return

  console.log('grantViewsForAd called with userId:', userId)

  try {
    // Check if user can watch more ads
    console.log('Getting access info...')
    const accessInfo = await getUserAccessInfo(userId)
    console.log('Access info:', accessInfo)
    
    if (!accessInfo.canWatchAd) {
      throw new Error('Maximum ads per month reached')
    }

    // Get current month
    const now = new Date()
    const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    console.log('Month year:', monthYear)

    // Prepare upsert data
    const upsertData = {
      user_id: userId,
      month_year: monthYear,
      views_used: accessInfo.viewsThisMonth,
      ads_watched: accessInfo.adsWatchedThisMonth + 1,
      updated_at: new Date().toISOString()
    }
    console.log('Upsert data:', upsertData)

    // Update ads watched count
    const { data: upsertResult, error: upsertError } = await supabase
      .from('monthly_view_limits')
      .upsert(upsertData, { 
        onConflict: 'user_id,month_year',
        ignoreDuplicates: false 
      })
      .select()
    
    console.log('Upsert result:', upsertResult)
    
    if (upsertError) {
      logError('Error upserting monthly view limits', upsertError)
      throw upsertError
    }

    // Record in points ledger for tracking
    console.log('Recording in points ledger...')
    const { error: ledgerError } = await supabase
      .from('points_ledger')
      .insert({
        user_id: userId,
        delta: 0,
        reason: 'ad_watched',
        created_at: new Date().toISOString()
      })

    if (ledgerError) {
      logError('Error inserting into points ledger', ledgerError)
      // Don't throw here - the main operation succeeded
    }

    console.log('grantViewsForAd completed successfully')
  } catch (error: any) {
    logError('Error granting views for ad', error)
    throw error
  }
}

// Calculate actual views this month (accounting for bonuses)
export async function getActualViewsThisMonth(userId: string): Promise<number> {
  if (!ACCESS_GATE_CONFIG.ENABLED) return 0

  try {
    const accessInfo = await getUserAccessInfo(userId)
    return accessInfo.viewsThisMonth
  } catch (error) {
    console.error('Error calculating actual views this month:', error)
    return 0
  }
}
