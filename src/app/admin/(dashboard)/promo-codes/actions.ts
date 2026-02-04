'use server'

import { createClient } from '@/lib/supabase/server'

export type PromoCode = {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

export async function getPromoCodes() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching promo codes:', error)
    return []
  }

  return data as PromoCode[]
}

export async function getPromoCodeStats() {
  const supabase = await createClient()

  const { data: all } = await supabase.from('promo_codes').select('id, is_active, used_count')
  
  const codes = all || []
  
  return {
    total: codes.length,
    active: codes.filter(c => c.is_active).length,
    inactive: codes.filter(c => !c.is_active).length,
    totalUsage: codes.reduce((sum, c) => sum + (c.used_count || 0), 0)
  }
}

export async function createPromoCode(data: {
  code: string
  description?: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  start_date?: string
  end_date?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('promo_codes').insert({
    code: data.code.toUpperCase(),
    description: data.description,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_order_amount: data.min_order_amount || 0,
    max_discount_amount: data.max_discount_amount,
    usage_limit: data.usage_limit,
    start_date: data.start_date,
    end_date: data.end_date,
    is_active: true
  })

  if (error) throw error
}

export async function updatePromoCode(id: string, data: Partial<PromoCode>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function togglePromoCodeStatus(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deletePromoCode(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
