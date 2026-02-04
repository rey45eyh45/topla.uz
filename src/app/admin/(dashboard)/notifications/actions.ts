'use server'

import { createClient } from '@/lib/supabase/server'

export type Notification = {
  id: string
  title: string
  body: string
  type: 'system' | 'order' | 'promo' | 'news'
  target_type: 'all' | 'users' | 'vendors' | 'specific'
  target_user_ids: string[] | null
  data: Record<string, unknown> | null
  is_sent: boolean
  sent_at: string | null
  created_at: string
  created_by: string | null
}

export async function getNotifications() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as Notification[]
}

export async function getNotificationStats() {
  const supabase = await createClient()

  const { count: total } = await supabase.from('notifications').select('id', { count: 'exact', head: true })
  const { count: sent } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_sent', true)
  
  return {
    total: total || 0,
    sent: sent || 0,
    pending: (total || 0) - (sent || 0)
  }
}

export async function createNotification(data: {
  title: string
  body: string
  type: 'system' | 'order' | 'promo' | 'news'
  target_type: 'all' | 'users' | 'vendors' | 'specific'
  target_user_ids?: string[]
  data?: Record<string, unknown>
}) {
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()

  const { error } = await supabase.from('notifications').insert({
    title: data.title,
    body: data.body,
    type: data.type,
    target_type: data.target_type,
    target_user_ids: data.target_user_ids,
    data: data.data,
    is_sent: false,
    created_by: user.user?.id
  })

  if (error) throw error
}

export async function sendNotification(id: string) {
  const supabase = await createClient()

  // Mark as sent
  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_sent: true, 
      sent_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) throw error

  // TODO: Integrate with Firebase Cloud Messaging to actually send push notifications
  // This would call your Supabase Edge Function or Firebase Admin SDK
}

export async function deleteNotification(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)

  if (error) throw error
}
