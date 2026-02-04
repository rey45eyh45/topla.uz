'use server'

import { createClient } from '@/lib/supabase/server'

export type ActivityLog = {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: {
    email: string
    full_name: string | null
  }
}

export async function getActivityLogs(limit = 100) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:profiles!activity_logs_user_id_fkey(email:id, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching activity logs:', error)
    // Fallback without join if foreign key doesn't exist
    const { data: logsOnly } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return (logsOnly || []) as ActivityLog[]
  }

  return data as ActivityLog[]
}

export async function getLogStats() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: total } = await supabase.from('activity_logs').select('id', { count: 'exact', head: true })
  const { count: today_count } = await supabase.from('activity_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Get action breakdown
  const { data: actions } = await supabase
    .from('activity_logs')
    .select('action')
    .limit(1000)

  const actionCounts: Record<string, number> = {}
  actions?.forEach(a => {
    actionCounts[a.action] = (actionCounts[a.action] || 0) + 1
  })

  return {
    total: total || 0,
    today: today_count || 0,
    topActions: Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }))
  }
}

export async function logActivity(data: {
  action: string
  entity_type?: string
  entity_id?: string
  details?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { error } = await supabase.from('activity_logs').insert({
    user_id: user.user?.id,
    action: data.action,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    details: data.details
  })

  if (error) throw error
}

export async function clearOldLogs(daysToKeep = 30) {
  const supabase = await createClient()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const { error } = await supabase
    .from('activity_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString())

  if (error) throw error
}
