'use server'

import { createClient } from '@/lib/supabase/server'

export type PayoutRequest = {
  id: string
  shop_id: string
  amount: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  bank_name: string | null
  account_number: string | null
  notes: string | null
  admin_notes: string | null
  created_at: string
  processed_at: string | null
  shop?: {
    name: string
    balance: number
  }
}

export async function getPayoutRequests(status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('payout_requests')
    .select(`
      *,
      shop:shops(name, balance)
    `)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching payout requests:', error)
    // Fallback without join
    const { data: requestsOnly } = await supabase
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false })

    return requestsOnly as PayoutRequest[]
  }

  return (data || []).map((req: {
    id: string
    shop_id: string
    amount: number
    status: 'pending' | 'approved' | 'completed' | 'rejected'
    bank_name: string | null
    account_number: string | null
    notes: string | null
    admin_notes: string | null
    created_at: string
    processed_at: string | null
    shop: { name: string; balance: number } | { name: string; balance: number }[] | null
  }) => ({
    ...req,
    shop: req.shop ? (Array.isArray(req.shop) ? req.shop[0] : req.shop) : undefined
  })) as PayoutRequest[]
}

export async function getPayoutStats() {
  const supabase = await createClient()

  const { data } = await supabase.from('payout_requests').select('status, amount')

  const requests = data || []

  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    completed: requests.filter(r => r.status === 'completed').length,
    totalAmount: requests.reduce((sum, r) => sum + (r.amount || 0), 0),
    pendingAmount: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0)
  }
}

export async function approvePayoutRequest(id: string, adminNotes?: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: 'approved',
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error
}

export async function completePayoutRequest(id: string) {
  const supabase = await createClient()

  // Get request details
  const { data: request } = await supabase
    .from('payout_requests')
    .select('shop_id, amount')
    .eq('id', id)
    .single()

  if (!request) throw new Error('So\'rov topilmadi')

  // Update request status
  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error

  // Update shop pending balance
  const { data: shop } = await supabase
    .from('shops')
    .select('pending_balance')
    .eq('id', request.shop_id)
    .single()

  if (shop) {
    await supabase
      .from('shops')
      .update({
        pending_balance: Math.max(0, (shop.pending_balance || 0) - request.amount)
      })
      .eq('id', request.shop_id)
  }
}

export async function rejectPayoutRequest(id: string, adminNotes?: string) {
  const supabase = await createClient()

  // Get request details
  const { data: request } = await supabase
    .from('payout_requests')
    .select('shop_id, amount')
    .eq('id', id)
    .single()

  if (!request) throw new Error('So\'rov topilmadi')

  // Update request status
  const { error } = await supabase
    .from('payout_requests')
    .update({
      status: 'rejected',
      admin_notes: adminNotes,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) throw error

  // Return money to shop balance
  const { data: shop } = await supabase
    .from('shops')
    .select('balance, pending_balance')
    .eq('id', request.shop_id)
    .single()

  if (shop) {
    await supabase
      .from('shops')
      .update({
        balance: (shop.balance || 0) + request.amount,
        pending_balance: Math.max(0, (shop.pending_balance || 0) - request.amount)
      })
      .eq('id', request.shop_id)
  }
}
