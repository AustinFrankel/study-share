import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { logError } from '@/lib/error-logging'

export interface Notification {
  id: string
  recipient_id: string
  sender_id?: string
  type: string
  title: string
  message: string
  resource_id?: string
  comment_id?: string
  read: boolean
  created_at: string
  sender?: {
    handle: string
  }
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!sender_id(handle)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        // If table doesn't exist or returns 404, silently fail
        const errorCode = (error as any)?.code
        const errorMessage = (error as any)?.message || ''
        const isNotFound = errorCode === 'PGRST116' || errorCode === '42P01' ||
                          errorMessage.includes('does not exist') ||
                          errorMessage.includes('schema cache') ||
                          errorMessage.includes('relation') ||
                          error.message === 'Not Found'

        if (isNotFound) {
          // Table doesn't exist yet - silently return empty state without logging
          setNotifications([])
          setUnreadCount(0)
          setLoading(false)
          return
        }
        throw error
      }

      const notificationList = data || []
      setNotifications(notificationList)
      setUnreadCount(notificationList.filter((n: any) => !n.read).length)
    } catch (error) {
      // Only log non-404 errors
      const errorCode = (error as any)?.code
      if (errorCode !== 'PGRST116' && errorCode !== '42P01') {
        logError('Error fetching notifications', error)
      }
      // Set empty state even on error to prevent repeated failures
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id)

      if (error) throw error

      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      logError('Error marking notification as read', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      if (error) throw error

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      logError('Error marking all notifications as read', error)
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Only subscribe to notifications if the table exists
    // We'll skip realtime subscriptions for now since the table doesn't exist
    // Uncomment this when the notifications table is created
    /*
    if (user) {
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`
          },
          () => {
            fetchNotifications()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    */
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
