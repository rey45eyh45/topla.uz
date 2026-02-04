'use server'

import { createClient } from '@/lib/supabase/server'
import { getVendorShopId } from '../dashboard/actions'

export type AnalyticsData = {
  salesOverview: {
    totalRevenue: number
    previousRevenue: number
    totalOrders: number
    previousOrders: number
    averageOrderValue: number
  }
  topProducts: {
    id: string
    name: string
    quantity: number
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
  customerStats: {
    totalCustomers: number
    returningCustomers: number
  }
}

export async function getAnalyticsData(period: 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsData> {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) {
    return {
      salesOverview: {
        totalRevenue: 0,
        previousRevenue: 0,
        totalOrders: 0,
        previousOrders: 0,
        averageOrderValue: 0
      },
      topProducts: [],
      ordersByStatus: [],
      revenueByDay: [],
      customerStats: { totalCustomers: 0, returningCustomers: 0 }
    }
  }

  // Calculate date ranges
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
    .select('id, total_amount, status, created_at, user_id')
    .eq('shop_id', shopId)
    .gte('created_at', startDate.toISOString())

  // Get previous period orders
  const { data: previousOrders } = await supabase
    .from('orders')
    .select('id, total_amount')
    .eq('shop_id', shopId)
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

  // Customer stats
  const uniqueCustomers = new Set(orders.map(o => o.user_id).filter(Boolean))
  
  // Get all-time orders for returning customer calculation
  const { data: allOrders } = await supabase
    .from('orders')
    .select('user_id')
    .eq('shop_id', shopId)

  const customerOrderCounts: Record<string, number> = {}
  allOrders?.forEach(o => {
    if (o.user_id) {
      customerOrderCounts[o.user_id] = (customerOrderCounts[o.user_id] || 0) + 1
    }
  })
  const returningCustomers = Object.values(customerOrderCounts).filter(c => c > 1).length

  // Get top products
  let topProducts: AnalyticsData['topProducts'] = []
  try {
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        product_id,
        product:products!inner(name, shop_id)
      `)
      .eq('product.shop_id', shopId)
      .limit(500)

    if (orderItems) {
      const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderItems.forEach((item: any) => {
        const productData = item.product ? (Array.isArray(item.product) ? item.product[0] : item.product) : null
        if (item.product_id && productData) {
          if (!productStats[item.product_id]) {
            productStats[item.product_id] = { name: productData.name, quantity: 0, revenue: 0 }
          }
          productStats[item.product_id].quantity += item.quantity || 1
          productStats[item.product_id].revenue += (item.price || 0) * (item.quantity || 1)
        }
      })

      topProducts = Object.entries(productStats)
        .map(([id, stats]) => ({ id, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
    }
  } catch {
    // order_items might not exist or have different structure
  }

  return {
    salesOverview: {
      totalRevenue,
      previousRevenue,
      totalOrders: orders.length,
      previousOrders: prevOrders.length,
      averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    },
    topProducts,
    ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    revenueByDay: Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    customerStats: {
      totalCustomers: uniqueCustomers.size,
      returningCustomers
    }
  }
}
