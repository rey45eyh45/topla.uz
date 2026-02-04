'use server'

import { createClient } from '@/lib/supabase/server'
import { getVendorShopId } from '../dashboard/actions'

export type VendorOrder = {
  id: string
  order_number: string | null
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  total_amount: number
  status: string
  payment_method: string | null
  payment_status: string | null
  delivery_fee: number
  notes: string | null
  created_at: string
  items?: OrderItem[]
}

export type OrderItem = {
  id: string
  product_name: string
  quantity: number
  price: number
}

export async function getVendorOrders(status?: string) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return []

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_amount,
      status,
      payment_method,
      payment_status,
      delivery_fee,
      notes,
      created_at,
      user:profiles!orders_user_id_fkey(full_name, phone),
      address:addresses!orders_address_id_fkey(full_address)
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query.limit(100)

  if (error) {
    console.error('Error fetching vendor orders:', error)
    // Fallback without joins
    const { data: ordersOnly } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      .limit(100)

    return (ordersOnly || []).map(o => ({
      ...o,
      customer_name: null,
      customer_phone: null,
      customer_address: null
    })) as VendorOrder[]
  }

  return (data || []).map((order: {
    id: string
    order_number: string | null
    total_amount: number
    status: string
    payment_method: string | null
    payment_status: string | null
    delivery_fee: number
    notes: string | null
    created_at: string
    user: { full_name: string | null; phone: string | null } | { full_name: string | null; phone: string | null }[] | null
    address: { full_address: string | null } | { full_address: string | null }[] | null
  }) => {
    const userData = order.user ? (Array.isArray(order.user) ? order.user[0] : order.user) : null
    const addressData = order.address ? (Array.isArray(order.address) ? order.address[0] : order.address) : null
    
    return {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      delivery_fee: order.delivery_fee,
      notes: order.notes,
      created_at: order.created_at,
      customer_name: userData?.full_name || null,
      customer_phone: userData?.phone || null,
      customer_address: addressData?.full_address || null
    }
  }) as VendorOrder[]
}

export async function getVendorOrderStats() {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return { total: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 }

  const { data } = await supabase
    .from('orders')
    .select('status')
    .eq('shop_id', shopId)

  const orders = data || []

  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'preparing', 'ready', 'delivering'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('order_items')
    .select(`
      id,
      quantity,
      price,
      product:products(name)
    `)
    .eq('order_id', orderId)

  if (error) {
    console.error('Error fetching order items:', error)
    return []
  }

  return (data || []).map((item: {
    id: string
    quantity: number
    price: number
    product: { name: string } | { name: string }[] | null
  }) => ({
    id: item.id,
    quantity: item.quantity,
    price: item.price,
    product_name: item.product 
      ? (Array.isArray(item.product) ? item.product[0]?.name : item.product?.name) || 'Noma\'lum'
      : 'Noma\'lum'
  }))
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('orders')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .eq('shop_id', shopId)

  if (error) throw error
}
