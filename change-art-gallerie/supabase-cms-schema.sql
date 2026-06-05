-- ============================================================
-- Change Art Gallerie — CMS Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Products table (replaces hardcoded lib/products.ts data)
CREATE TABLE IF NOT EXISTS products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null, -- stored in kobo (multiply Naira × 100)
  category text not null, -- 'workbooks' | 'homeschooling' | 'digital'
  image_url text,
  file_url text,           -- download link for digital products
  featured boolean default false,
  in_stock boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Book preview pages for the BookCarousel component
CREATE TABLE IF NOT EXISTS book_pages (
  id uuid primary key default gen_random_uuid(),
  book_level text not null, -- 'nursery1' | 'nursery2' | 'nursery3'
  image_url text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Gallery photos for the "Books in Action" RealTimeGrid section
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Customer testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  avatar_url text,
  featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- FAQ entries
CREATE TABLE IF NOT EXISTS faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Key-value site settings store
CREATE TABLE IF NOT EXISTS site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', '2348012345678'),
  ('youtube_video_id', 'YOUR_VIDEO_ID'),
  ('hero_title', 'Unlock Creativity in Every Child'),
  ('hero_subtitle', 'Fun and educational creative books for schools and homeschoolers.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Storage Buckets — create these in the Supabase Dashboard
-- under Storage > New Bucket (set each to Public)
-- ============================================================
-- bucket name: product-images   (product cover photos)
-- bucket name: book-pages       (nursery book page previews)
-- bucket name: gallery-photos   (Books in Action photos)
-- bucket name: avatars          (testimonial profile photos)
-- bucket name: digital-files    (downloadable PDF products)

-- ============================================================
-- Row Level Security (optional — service role key bypasses RLS)
-- ============================================================
-- The admin API routes use the service role key which bypasses
-- RLS automatically. Public read routes use the anon key, so
-- add RLS policies if you want fine-grained access control.

-- Allow public reads on all CMS tables:
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read book_pages" ON book_pages FOR SELECT USING (true);
CREATE POLICY "Public read gallery_photos" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Public read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
