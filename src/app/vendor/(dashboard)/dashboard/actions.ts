'use server'

import { createClient } from '@/lib/supabase/server'

export type VendorDashboardStats = {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  totalProducts: number
  activeProducts: number
  todayRevenue: number
  todayOrders: number
  averageRating: number
  reviewCount: number
}

export type RecentOrder = {
  id: string
  customer_name: string | null
  total_amount: number
  status: string
  created_at: string
}

export async function getVendorShopId() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) return null

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_id', user.user.id)
    .single()

  return shop?.id || null
}

export async function getVendorDashboardStats(): Promise<VendorDashboardStats> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      totalProducts: 0,
      activeProducts: 0,
      todayRevenue: 0,
      todayOrders: 0,
      averageRating: 0,
      reviewCount: 0
    }
  }

  // Get orders
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at')
    .eq('shop_id', shopId)

  const allOrders = orders || []
  
  // Today's orders
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today)

  // Get products
  const { data: products } = await supabase
    .from('products')
    .select('id, is_available')
    .eq('shop_id', shopId)

  const allProducts = products || []

  // Get shop rating
  const { data: shop } = await supabase
    .from('shops')
    .select('rating, review_count')
    .eq('id', shopId)
    .single()

  return {
    totalRevenue: allOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter(o => o.status === 'pending').length,
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter(p => p.is_available).length,
    todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    todayOrders: todayOrders.length,
    averageRating: shop?.rating || 0,
    reviewCount: shop?.review_count || 0
  }
}

export async function getRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return []

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      user:profiles!orders_user_id_fkey(full_name)
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent orders:', error)
    // Fallback without join
    const { data: ordersOnly } = await supabase
      .from('orders')
      .select('id, total_amount, status, created_at')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (ordersOnly || []).map(o => ({
      ...o,
      customer_name: null
    }))
  }

  return (data || []).map((order: { id: string; total_amount: number; status: string; created_at: string; user: { full_name: string | null } | { full_name: string | null }[] | null }) => ({
    id: order.id,
    total_amount: order.total_amount,
    status: order.status,
    created_at: order.created_at,
    customer_name: order.user 
      ? (Array.isArray(order.user) ? order.user[0]?.full_name : order.user?.full_name) 
      : null
  }))
}
