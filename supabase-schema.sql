-- ============================================
-- Change Art Gallerie - Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Products Table
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL, -- stored in smallest currency unit (kobo/cents/pence)
  currency TEXT NOT NULL DEFAULT 'NGN',
  image_url TEXT NOT NULL DEFAULT '',
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'workbook' CHECK (category IN ('workbook', 'sketchbook', 'kit', 'digital')),
  age_range TEXT DEFAULT '4-12',
  is_featured BOOLEAN DEFAULT false,
  is_editors_choice BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 100,
  digital_download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Waitlist Signups Table
-- ============================================
CREATE TABLE waitlist_signups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'teacher', 'school', 'other')),
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Orders Table
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  flutterwave_tx_ref TEXT UNIQUE,
  flutterwave_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'refunded')),
  total_amount INTEGER NOT NULL, -- smallest currency unit
  currency TEXT NOT NULL DEFAULT 'NGN',
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Order Items Table
-- ============================================
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL
);

-- ============================================
-- 5. Admin Users Table
-- ============================================
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security Policies
-- ============================================

-- Products: anyone can read active products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "Service role full access to products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Waitlist: insert only from public, read from service role
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join waitlist" ON waitlist_signups
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads waitlist" ON waitlist_signups
  FOR SELECT USING (auth.role() = 'service_role');

-- Orders: service role only
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Order items: service role only
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to order_items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

-- Admin users: service role only
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_waitlist_email ON waitlist_signups(email);

-- ============================================
-- Seed Data: Your Books
-- ============================================
INSERT INTO products (name, slug, description, short_description, price, currency, image_url, category, age_range, is_featured, is_editors_choice) VALUES
  ('The Color Alchemist', 'the-color-alchemist', 'A deep dive into color theory through whimsical experiments and storytelling. Children learn to mix, blend, and create their own palette while following an enchanting narrative.', 'A deep dive into color theory through whimsical experiments and storytelling.', 350000, 'NGN', '/images/color-alchemist.jpg', 'workbook', '6-12', true, true),
  ('Shape Master', 'shape-master', 'Learning geometry through character design. Kids create their own cartoon characters using basic geometric shapes, building spatial awareness and creativity simultaneously.', 'Learning geometry through character design.', 280000, 'NGN', '/images/shape-master.jpg', 'workbook', '4-8', true, false),
  ('Nature Sketchbook', 'nature-sketchbook', 'Observe and draw the world around you. A guided sketchbook that takes children outdoors to study plants, insects, and landscapes through careful observation and drawing.', 'Observe and draw the world around you.', 320000, 'NGN', '/images/nature-sketchbook.jpg', 'sketchbook', '8-14', true, false);

-- Insert your admin user
INSERT INTO admin_users (email, role) VALUES
  ('victor@changeartgallerie.com', 'super_admin');

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
