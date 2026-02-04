'use server'

import { createClient } from '@/lib/supabase/server'

export type ReportData = {
  salesOverview: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    previousRevenue: number
    previousOrders: number
  }
  topProducts: {
    id: string
    name: string
    orders_count: number
    revenue: number
  }[]
  topShops: {
    id: string
    name: string
    orders_count: number
    revenue: number
  }[]
  ordersByStatus: {
    status: string
    count: number
  }[]
  revenueByDay: {
    date: string
    revenue: number
    orders: number
  }[]
  userStats: {
    totalUsers: number
    newUsersThisMonth: number
    activeUsers: number
  }
}

export async function getReportData(period: 'week' | 'month' | 'year' = 'month'): Promise<ReportData> {
  const supabase = await createClient()

  // Calculate date range
  const now = new Date()
  let startDate = new Date()
  let previousStartDate = new Date()
  
  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      previousStartDate.setDate(now.getDate() - 14)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      previousStartDate.setMonth(now.getMonth() - 2)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      previousStartDate.setFullYear(now.getFullYear() - 2)
      break
  }

  // Get current period orders
  const { data: currentOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at, shop_id')
    .gte('created_at', startDate.toISOString())

  // Get previous period orders
  const { data: previousOrders } = await supabase
    .from('orders')
    .select('id, total_amount')
    .gte('created_at', previousStartDate.toISOString())
    .lt('created_at', startDate.toISOString())

  const orders = currentOrders || []
  const prevOrders = previousOrders || []

  // Calculate sales overview
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const previousRevenue = prevOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

  // Orders by status
  const statusCounts: Record<string, number> = {}
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  })

  // Revenue by day
  const revenueByDay: Record<string, { revenue: number; orders: number }> = {}
  orders.forEach(o => {
    const date = new Date(o.created_at).toISOString().split('T')[0]
    if (!revenueByDay[date]) {
      revenueByDay[date] = { revenue: 0, orders: 0 }
    }
    revenueByDay[date].revenue += o.total_amount || 0
    revenueByDay[date].orders += 1
  })

  // Get shops data
  const { data: shops } = await supabase.from('shops').select('id, name')
  const shopsMap = new Map((shops || []).map(s => [s.id, s.name]))

  // Shop revenue
  const shopRevenue: Record<string, { orders: number; revenue: number }> = {}
  orders.forEach(o => {
    if (o.shop_id) {
      if (!shopRevenue[o.shop_id]) {
        shopRevenue[o.shop_id] = { orders: 0, revenue: 0 }
      }
      shopRevenue[o.shop_id].orders += 1
      shopRevenue[o.shop_id].revenue += o.total_amount || 0
    }
  })

  // Get top products (from order_items if exists)
  let topProducts: ReportData['topProducts'] = []
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price, product:products(name)')
      .limit(1000)

    if (orderItems) {
      const productStats: Record<string, { name: string; count: number; revenue: number }> = {}
      orderItems.forEach((item: { product_id: string; quantity: number; price: number; product: { name: string } | { name: string }[] | null }) => {
        if (item.product_id) {
          if (!productStats[item.product_id]) {
            const productData = item.product
            const productName = productData 
              ? (Array.isArray(productData) ? productData[0]?.name : productData?.name) || 'Unknown'
              : 'Unknown'
            productStats[item.product_id] = { name: productName, count: 0, revenue: 0 }
          }
          productStats[item.product_id].count += item.quantity || 1
          productStats[item.product_id].revenue += (item.price || 0) * (item.quantity || 1)
        }
      })

      topProducts = Object.entries(productStats)
        .map(([id, stats]) => ({ id, ...stats, orders_count: stats.count }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    }
  } catch {
    // order_items table might not exist
  }

  // User stats
  const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
  const monthStart = new Date()
  monthStart.setMonth(monthStart.getMonth() - 1)
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString())

  return {
    salesOverview: {
      totalRevenue,
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      previousRevenue,
      previousOrders: prevOrders.length
    },
    topProducts,
    topShops: Object.entries(shopRevenue)
      .map(([id, stats]) => ({
        id,
        name: shopsMap.get(id) || 'Noma\'lum',
        orders_count: stats.orders,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    revenueByDay: Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    userStats: {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsers || 0,
      activeUsers: 0 // Would need user activity tracking
    }
  }
}
