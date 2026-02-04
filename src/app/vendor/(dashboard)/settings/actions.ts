'use server'

import { createClient } from '@/lib/supabase/server'
import { getVendorShopId } from '../dashboard/actions'

export type ShopSettings = {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  logo_url: string | null
  cover_image_url: string | null
  min_order_amount: number
  delivery_fee: number
  estimated_delivery_time: string | null
  is_open: boolean
  opening_time: string | null
  closing_time: string | null
  working_days: string[] | null
}

export async function getShopSettings(): Promise<ShopSettings | null> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return null

  const { data, error } = await supabase
    .from('shops')
    .select(`
      id,
      name,
      description,
      phone,
      email,
      address,
      logo_url,
      cover_image_url,
      min_order_amount,
      delivery_fee,
      estimated_delivery_time,
      is_open,
      opening_time,
      closing_time,
      working_days
    `)
    .eq('id', shopId)
    .single()

  if (error) {
    console.error('Error fetching shop settings:', error)
    return null
  }

  return data as ShopSettings
}

export async function updateShopSettings(settings: Partial<ShopSettings>) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('shops')
    .update({
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', shopId)

  if (error) throw error
}

export async function toggleShopOpen(isOpen: boolean) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('shops')
    .update({
      is_open: isOpen,
      updated_at: new Date().toISOString()
    })
    .eq('id', shopId)

  if (error) throw error
}

export async function uploadShopImage(file: File, type: 'logo' | 'cover'): Promise<string> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const fileExt = file.name.split('.').pop()
  const fileName = `${shopId}/${type}_${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('shops')
    .upload(fileName, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('shops').getPublicUrl(fileName)

  // Update shop with new image URL
  const updateField = type === 'logo' ? 'logo_url' : 'cover_image_url'
  await supabase
    .from('shops')
    .update({ [updateField]: data.publicUrl })
    .eq('id', shopId)

  return data.publicUrl
}
