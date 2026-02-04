'use server'

import { createClient } from '@/lib/supabase/server'
import { getVendorShopId } from '../dashboard/actions'

export type BalanceInfo = {
  currentBalance: number
  pendingBalance: number
  totalEarnings: number
  totalWithdrawn: number
  commissionRate: number
}

export type Transaction = {
  id: string
  type: 'earning' | 'payout' | 'commission'
  amount: number
  description: string | null
  status: string
  created_at: string
  order_id: string | null
}

export type PayoutRequest = {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  bank_name: string | null
  account_number: string | null
  notes: string | null
  created_at: string
  processed_at: string | null
}

export async function getBalanceInfo(): Promise<BalanceInfo> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) {
    return {
      currentBalance: 0,
      pendingBalance: 0,
      totalEarnings: 0,
      totalWithdrawn: 0,
      commissionRate: 10
    }
  }

  // Get shop balance
  const { data: shop } = await supabase
    .from('shops')
    .select('balance, pending_balance, commission_rate')
    .eq('id', shopId)
    .single()

  // Calculate total earnings from completed orders
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount, delivery_fee')
    .eq('shop_id', shopId)
    .eq('status', 'delivered')

  const totalEarnings = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0) - (o.delivery_fee || 0), 0)

  // Get total withdrawn
  const { data: payouts } = await supabase
    .from('payout_requests')
    .select('amount')
    .eq('shop_id', shopId)
    .eq('status', 'completed')

  const totalWithdrawn = (payouts || []).reduce((sum, p) => sum + (p.amount || 0), 0)

  return {
    currentBalance: shop?.balance || 0,
    pendingBalance: shop?.pending_balance || 0,
    totalEarnings,
    totalWithdrawn,
    commissionRate: shop?.commission_rate || 10
  }
}

export async function getTransactions(limit = 50): Promise<Transaction[]> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return []

  // Since we may not have a transactions table, we'll derive from orders and payouts
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .eq('shop_id', shopId)
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })
    .limit(limit)

  return (orders || []).map(o => ({
    id: o.id,
    type: 'earning' as const,
    amount: o.total_amount || 0,
    description: `Buyurtma #${o.id.slice(0, 8)}`,
    status: 'completed',
    created_at: o.created_at,
    order_id: o.id
  }))
}

export async function getPayoutRequests(): Promise<PayoutRequest[]> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return []

  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payout requests:', error)
    return []
  }

  return data as PayoutRequest[]
}

export async function createPayoutRequest(data: {
  amount: number
  bank_name?: string
  account_number?: string
}) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  // Check balance
  const balance = await getBalanceInfo()
  if (data.amount > balance.currentBalance) {
    throw new Error('Yetarli mablag\' yo\'q')
  }

  if (data.amount < 100000) {
    throw new Error('Minimal summa 100,000 so\'m')
  }

  const { error } = await supabase.from('payout_requests').insert({
    shop_id: shopId,
    amount: data.amount,
    bank_name: data.bank_name,
    account_number: data.account_number,
    status: 'pending'
  })

  if (error) throw error

  // Update shop balance (move to pending)
  await supabase
    .from('shops')
    .update({
      balance: balance.currentBalance - data.amount,
      pending_balance: (balance.pendingBalance || 0) + data.amount
    })
    .eq('id', shopId)
}
