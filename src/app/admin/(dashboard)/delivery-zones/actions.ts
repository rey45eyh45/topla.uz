'use server'

import { createClient } from '@/lib/supabase/server'

export type DeliveryZone = {
  id: string
  name: string
  region: string | null
  districts: string[]
  delivery_fee: number
  min_order_amount: number
  estimated_time: string | null
  is_active: boolean
  created_at: string
}

export async function getDeliveryZones() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching delivery zones:', error)
    return []
  }

  return data as DeliveryZone[]
}

export async function getDeliveryZoneStats() {
  const supabase = await createClient()

  const { data: all } = await supabase.from('delivery_zones').select('id, is_active')
  
  const zones = all || []
  
  return {
    total: zones.length,
    active: zones.filter(z => z.is_active).length,
    inactive: zones.filter(z => !z.is_active).length
  }
}

export async function createDeliveryZone(data: {
  name: string
  region?: string
  districts?: string[]
  delivery_fee?: number
  min_order_amount?: number
  estimated_time?: string
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('delivery_zones').insert({
    name: data.name,
    region: data.region,
    districts: data.districts || [],
    delivery_fee: data.delivery_fee || 0,
    min_order_amount: data.min_order_amount || 0,
    estimated_time: data.estimated_time,
    is_active: true
  })

  if (error) throw error
}

export async function updateDeliveryZone(id: string, data: Partial<DeliveryZone>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_zones')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function toggleDeliveryZoneStatus(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_zones')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteDeliveryZone(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', id)

  if (error) throw error
}
