'use server'

import { createClient } from '@/lib/supabase/server'

export type PlatformSettings = {
  id: string
  key: string
  value: string
  description: string | null
  category: string
}

export type SettingsCategory = {
  category: string
  settings: PlatformSettings[]
}

const DEFAULT_SETTINGS: Record<string, { value: string; description: string; category: string }> = {
  'platform.name': { value: 'Topla', description: 'Platforma nomi', category: 'general' },
  'platform.tagline': { value: 'Yetkazib berish xizmati', description: 'Platforma shiori', category: 'general' },
  'platform.contact_phone': { value: '+998 99 999 99 99', description: 'Aloqa telefoni', category: 'general' },
  'platform.contact_email': { value: 'support@topla.uz', description: 'Aloqa emaili', category: 'general' },
  'order.min_amount': { value: '15000', description: 'Minimal buyurtma summasi', category: 'orders' },
  'order.default_delivery_fee': { value: '10000', description: 'Standart yetkazib berish narxi', category: 'orders' },
  'order.free_delivery_threshold': { value: '100000', description: 'Bepul yetkazib berish chegarasi', category: 'orders' },
  'vendor.commission_rate': { value: '10', description: 'Sotuvchi komissiyasi (%)', category: 'vendors' },
  'vendor.min_payout': { value: '100000', description: 'Minimal to\'lov summasi', category: 'vendors' },
  'vendor.payout_day': { value: 'monday', description: 'To\'lov kuni', category: 'vendors' },
  'notification.order_updates': { value: 'true', description: 'Buyurtma yangilanishlari', category: 'notifications' },
  'notification.promo_alerts': { value: 'true', description: 'Aksiya xabarnomalaari', category: 'notifications' }
}

export async function getSettings(): Promise<SettingsCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .order('key')

  if (error || !data || data.length === 0) {
    // Return default settings if table is empty or error
    const defaultSettings = Object.entries(DEFAULT_SETTINGS).map(([key, val]) => ({
      id: key,
      key,
      value: val.value,
      description: val.description,
      category: val.category
    }))

    const categories: Record<string, PlatformSettings[]> = {}
    defaultSettings.forEach(s => {
      if (!categories[s.category]) categories[s.category] = []
      categories[s.category].push(s)
    })

    return Object.entries(categories).map(([category, settings]) => ({ category, settings }))
  }

  const categories: Record<string, PlatformSettings[]> = {}
  data.forEach((s: PlatformSettings) => {
    if (!categories[s.category]) categories[s.category] = []
    categories[s.category].push(s)
  })

  return Object.entries(categories).map(([category, settings]) => ({ category, settings }))
}

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', key)
    .single()

  return data?.value || DEFAULT_SETTINGS[key]?.value || null
}

export async function updateSetting(key: string, value: string) {
  const supabase = await createClient()

  // Check if setting exists
  const { data: existing } = await supabase
    .from('platform_settings')
    .select('id')
    .eq('key', key)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('platform_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)

    if (error) throw error
  } else {
    // Insert new setting
    const defaultSetting = DEFAULT_SETTINGS[key]
    const { error } = await supabase
      .from('platform_settings')
      .insert({
        key,
        value,
        description: defaultSetting?.description || null,
        category: defaultSetting?.category || 'general'
      })

    if (error) throw error
  }
}

export async function updateSettings(settings: { key: string; value: string }[]) {
  for (const setting of settings) {
    await updateSetting(setting.key, setting.value)
  }
}

export async function initializeDefaultSettings() {
  const supabase = await createClient()

  for (const [key, setting] of Object.entries(DEFAULT_SETTINGS)) {
    const { data: existing } = await supabase
      .from('platform_settings')
      .select('id')
      .eq('key', key)
      .single()

    if (!existing) {
      await supabase.from('platform_settings').insert({
        key,
        value: setting.value,
        description: setting.description,
        category: setting.category
      })
    }
  }
}
