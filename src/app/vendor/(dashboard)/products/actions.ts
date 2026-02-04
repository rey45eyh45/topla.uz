'use server'

import { createClient } from '@/lib/supabase/server'
import { getVendorShopId } from '../dashboard/actions'

export type VendorProduct = {
  id: string
  name: string
  description: string | null
  price: number
  sale_price: number | null
  image_url: string | null
  category_id: string | null
  is_available: boolean
  stock_quantity: number
  created_at: string
  category?: {
    name: string
  }
}

export async function getVendorProducts() {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return []

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      sale_price,
      image_url,
      category_id,
      is_available,
      stock_quantity,
      created_at,
      category:categories(name)
    `)
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vendor products:', error)
    return []
  }

  return (data || []).map((p: {
    id: string
    name: string
    description: string | null
    price: number
    sale_price: number | null
    image_url: string | null
    category_id: string | null
    is_available: boolean
    stock_quantity: number
    created_at: string
    category: { name: string } | { name: string }[] | null
  }) => ({
    ...p,
    category: p.category 
      ? (Array.isArray(p.category) ? p.category[0] : p.category) 
      : undefined
  })) as VendorProduct[]
}

export async function getVendorProductStats() {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) return { total: 0, active: 0, outOfStock: 0 }

  const { data } = await supabase
    .from('products')
    .select('id, is_available, stock_quantity')
    .eq('shop_id', shopId)

  const products = data || []

  return {
    total: products.length,
    active: products.filter(p => p.is_available).length,
    outOfStock: products.filter(p => p.stock_quantity <= 0).length
  }
}

export async function createVendorProduct(productData: {
  name: string
  description?: string
  price: number
  sale_price?: number
  image_url?: string
  category_id?: string
  stock_quantity?: number
}) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase.from('products').insert({
    shop_id: shopId,
    name: productData.name,
    description: productData.description,
    price: productData.price,
    sale_price: productData.sale_price,
    image_url: productData.image_url,
    category_id: productData.category_id,
    stock_quantity: productData.stock_quantity || 0,
    is_available: true
  })

  if (error) throw error
}

export async function updateVendorProduct(id: string, productData: Partial<VendorProduct>) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('products')
    .update({
      ...productData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('shop_id', shopId)

  if (error) throw error
}

export async function toggleProductAvailability(id: string, isAvailable: boolean) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('products')
    .update({ 
      is_available: isAvailable,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('shop_id', shopId)

  if (error) throw error
}

export async function deleteVendorProduct(id: string) {
  const supabase = await createClient()
  const shopId = await getVendorShopId()

  if (!shopId) throw new Error('Do\'kon topilmadi')

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
    .eq('shop_id', shopId)

  if (error) throw error
}

export async function getCategories() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return data || []
}
