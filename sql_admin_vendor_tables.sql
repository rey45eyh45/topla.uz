-- TOPLA.UZ Admin & Vendor uchun qo'shimcha jadvallar
-- Supabase SQL Editor'da ishga tushiring

-- =====================================================
-- 1. PROMO KODLAR
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promo kod ishlatilgan tarix
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  discount_amount DECIMAL(10,2),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. YETKAZIB BERISH ZONALARI
-- =====================================================
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  districts TEXT[], -- Array of district names
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  estimated_time VARCHAR(50), -- e.g., "30-60 min"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. BILDIRISHNOMALAR
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promo')),
  target_type VARCHAR(50) DEFAULT 'all' CHECK (target_type IN ('all', 'customers', 'vendors', 'specific')),
  target_users UUID[], -- Array of user IDs for specific targeting
  image_url TEXT,
  action_url TEXT,
  is_push BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foydalanuvchi bildirishnomalari (o'qilgan/o'qilmagan)
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- =====================================================
-- 4. TIZIM LOGLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- 'order', 'product', 'user', 'shop', etc.
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. VENDOR HUJJATLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS vendor_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'license', 'certificate', 'contract', 'other')),
  document_name VARCHAR(255),
  file_url TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PUL YECHISH SO'ROVLARI
-- =====================================================
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  card_number VARCHAR(20),
  card_holder VARCHAR(100),
  bank_name VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,
  processed_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. BANNERLAR (agar yo'q bo'lsa)
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_type VARCHAR(50), -- product | category | shop | external
  link_id UUID,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Existing banners table uchun moslashtirish
ALTER TABLE banners ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_type VARCHAR(50);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS link_id UUID;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE banners ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE banners ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE banners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =====================================================
-- 8. PLATFORM SOZLAMALARI
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default sozlamalar
INSERT INTO platform_settings (key, value, type, description) VALUES
  ('default_commission', '10', 'number', 'Default vendor komissiya foizi'),
  ('min_payout_amount', '100000', 'number', 'Minimal pul yechish summasi'),
  ('support_phone', '+998901234567', 'string', 'Yordam telefon raqami'),
  ('support_email', 'support@topla.uz', 'string', 'Yordam email'),
  ('order_auto_cancel_hours', '24', 'number', 'Buyurtma avtomatik bekor qilish vaqti (soat)')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Promo codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (true);

-- Delivery zones
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view delivery zones" ON delivery_zones FOR SELECT USING (true);
CREATE POLICY "Admins can manage delivery zones" ON delivery_zones FOR ALL USING (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (true);

-- Activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view logs" ON activity_logs FOR SELECT USING (true);

-- Vendor documents
ALTER TABLE vendor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view own documents" ON vendor_documents FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Vendors can insert own documents" ON vendor_documents FOR INSERT WITH CHECK (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Payout requests
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vendors can view own payouts" ON payout_requests FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "Vendors can request payouts" ON payout_requests FOR INSERT WITH CHECK (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active banners" ON banners FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage banners" ON banners FOR ALL USING (true);

-- Platform settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON platform_settings FOR UPDATE USING (true);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications(target_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_shop ON payout_requests(shop_id, status);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
