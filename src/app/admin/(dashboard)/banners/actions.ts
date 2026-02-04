'use server'

import { createClient } from '@/lib/supabase/server'

export type Banner = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  link_type: 'product' | 'category' | 'shop' | 'external' | null
  link_id: string | null
  position: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export async function getBanners() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching banners:', error)
    return []
  }

  return data as Banner[]
}

export async function getBannerStats() {
  const supabase = await createClient()

  const { data } = await supabase.from('banners').select('id, is_active')

  const banners = data || []

  return {
    total: banners.length,
    active: banners.filter(b => b.is_active).length,
    inactive: banners.filter(b => !b.is_active).length
  }
}

export async function createBanner(bannerData: {
  title: string
  description?: string
  image_url?: string
  link_url?: string
  link_type?: 'product' | 'category' | 'shop' | 'external'
  link_id?: string
  start_date?: string
  end_date?: string
}) {
  const supabase = await createClient()

  // Get max position
  const { data: existing } = await supabase
    .from('banners')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)

  const maxPosition = existing?.[0]?.position || 0

  const { error } = await supabase.from('banners').insert({
    title: bannerData.title,
    description: bannerData.description,
    image_url: bannerData.image_url,
    link_url: bannerData.link_url,
    link_type: bannerData.link_type,
    link_id: bannerData.link_id,
    position: maxPosition + 1,
    is_active: true,
    start_date: bannerData.start_date,
    end_date: bannerData.end_date
  })

  if (error) throw error
}

export async function updateBanner(id: string, data: Partial<Banner>) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('banners')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('banners')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function deleteBanner(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateBannerPositions(positions: { id: string; position: number }[]) {
  const supabase = await createClient()

  for (const { id, position } of positions) {
    await supabase
      .from('banners')
      .update({ position })
      .eq('id', id)
  }
}
