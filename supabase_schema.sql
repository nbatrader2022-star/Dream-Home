-- ==============================================================================
-- DREAM HOME (خانه آرمانی) - Supabase PostgreSQL Database Schema
-- Architecture: Backend-as-a-Service (PostgreSQL + RLS + Storage + Realtime)
-- ==============================================================================

-- 1. AGENTS (مشاوران و کارشناسان ارشد املاک)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  title_en TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  photo TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 5.0,
  deals_count INTEGER DEFAULT 0,
  sold_count INTEGER DEFAULT 0,
  active_listings_count INTEGER DEFAULT 0,
  experience_years INTEGER DEFAULT 5,
  specialty TEXT,
  areas_served TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY['فارسی']::TEXT[],
  bio TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROPERTIES (املاک و مستغلات لوکس)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'rent', 'presale', 'mortgage')),
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'villa', 'commercial', 'land', 'penthouse', 'garden')),
  price BIGINT NOT NULL, -- in Tomans
  rent_price BIGINT DEFAULT 0,
  deposit_price BIGINT DEFAULT 0,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'tehran',
  city_name_fa TEXT NOT NULL DEFAULT 'تهران',
  area NUMERIC(8,2) NOT NULL, -- in sq meters
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  parking INTEGER NOT NULL DEFAULT 1,
  floor INTEGER DEFAULT 1,
  total_floors INTEGER DEFAULT 1,
  building_age INTEGER DEFAULT 0, -- 0 = نوساز
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  agent_data JSONB, -- embedded agent snapshot
  coordinates JSONB NOT NULL DEFAULT '{"lat": 35.80, "lng": 51.42}'::JSONB,
  status TEXT NOT NULL DEFAULT 'sale',
  featured BOOLEAN DEFAULT FALSE,
  virtual_tour_available BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NEIGHBORHOODS (راهنمای محله‌های شاخص)
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  city_key TEXT NOT NULL,
  image TEXT NOT NULL,
  property_count INTEGER DEFAULT 0,
  avg_price_per_meter TEXT NOT NULL,
  price_range TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  lat NUMERIC(9,6) NOT NULL,
  lng NUMERIC(9,6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BLOG POSTS (مقالات و تحلیل بازار وبلاگ)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_time_minutes INTEGER DEFAULT 5,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VIEWING REQUESTS (درخواست‌های بازدید حضوری و مجازی)
CREATE TABLE IF NOT EXISTS viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  property_location TEXT NOT NULL,
  property_image TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  visit_type TEXT DEFAULT 'in_person' CHECK (visit_type IN ('in_person', 'virtual_tour')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEADS & INQUIRIES (لیدها، فرم‌های تماس و مشاوره اختصاصی)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  preferred_contact_method TEXT DEFAULT 'phone',
  budget_range TEXT,
  target_neighborhood TEXT,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRICE HISTORY (روند شاخص قیمت محله‌ها و املاک)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  neighborhood TEXT NOT NULL,
  period_label TEXT NOT NULL,
  price_per_meter BIGINT NOT NULL,
  recorded_at DATE DEFAULT CURRENT_DATE
);

-- 8. SITE SETTINGS (تنظیمات عمومی وب‌سایت)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.1 ADMIN USERS & RBAC ROLES (مدیران و سطوح دسترسی امنیتی)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- linked to auth.users(id)
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'مدیر سیستم',
  role TEXT NOT NULL DEFAULT 'superadmin' CHECK (role IN ('superadmin', 'admin', 'editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 ADMIN & SYSTEM AUDIT LOGS (گزارش و ردگیری وقایع حساس مدیریتی)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. VISUAL CMS & PAGE BUILDER TABLES (طراحی و ویرایشگر بصری)
-- ==============================================================================

-- 9.1 PAGES (صفحات وب‌سایت)
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.2 PAGE VERSIONS (تاریخچه نسخه‌ها و کنترل نگارش‌ها)
CREATE TABLE IF NOT EXISTS page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  snapshot JSONB NOT NULL, -- Full tree elements snapshot
  change_summary TEXT DEFAULT 'به‌روزرسانی محتوا و طراحی',
  created_by TEXT DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, version_number)
);

-- 9.3 PAGE ELEMENTS (عناصر سلسله‌مراتبی درخت صفحه)
CREATE TABLE IF NOT EXISTS page_elements (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES page_elements(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  editor_key TEXT NOT NULL,
  name TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.4 ELEMENT STYLES (استایل‌های پایه المان‌ها)
CREATE TABLE IF NOT EXISTS element_styles (
  element_id TEXT PRIMARY KEY REFERENCES page_elements(id) ON DELETE CASCADE,
  styles JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.5 ELEMENT RESPONSIVE STYLES (استایل‌های واکنش‌گرا: تبلت و موبایل)
CREATE TABLE IF NOT EXISTS element_responsive_styles (
  element_id TEXT PRIMARY KEY REFERENCES page_elements(id) ON DELETE CASCADE,
  tablet JSONB DEFAULT '{}'::JSONB,
  mobile JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.6 DESIGN TOKENS (توکن‌های طراحی و متغیرهای جهانی CSS)
CREATE TABLE IF NOT EXISTS design_tokens (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  variable_name TEXT UNIQUE NOT NULL, -- e.g. --color-gold
  value TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('color', 'font', 'radius', 'shadow', 'spacing')),
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.7 STYLE PRESETS (پریست‌های آماده و بازاستفاده استایل)
CREATE TABLE IF NOT EXISTS style_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_type TEXT NOT NULL,
  styles JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9.8 CMS AUDIT LOGS (گزارش و ردگیری تغییرات سیستمی)
CREATE TABLE IF NOT EXISTS cms_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all public tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE element_responsive_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- SECURITY DEFINER HELPER: VERIFY SUPER ADMIN PRIVILEGES
-- ==============================================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE (user_id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND role = 'superadmin'
      AND status = 'active'
  );
END;
$$;

-- Pre-seed Primary Super Admin Account
INSERT INTO admin_users (email, role, status, name)
VALUES ('nabikalandar0@gmail.com', 'superadmin', 'active', 'مدیر ارشد خانه آرمانی')
ON CONFLICT (email) DO UPDATE 
SET role = 'superadmin', status = 'active';

-- Trigger: Automatically link auth.users(id) to admin_users(user_id) upon signup/login
CREATE OR REPLACE FUNCTION public.handle_admin_auth_user_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.admin_users
  SET user_id = NEW.id, updated_at = NOW()
  WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_link_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_link_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_auth_user_link();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PUBLIC REAL ESTATE DATA (Anyone can read, ONLY Super Admin can write)
CREATE POLICY "Public properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Superadmin insert properties" ON properties FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "Superadmin update properties" ON properties FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Superadmin delete properties" ON properties FOR DELETE USING (is_super_admin());

CREATE POLICY "Public agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Superadmin insert agents" ON agents FOR INSERT WITH CHECK (is_super_admin());
CREATE POLICY "Superadmin update agents" ON agents FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Superadmin delete agents" ON agents FOR DELETE USING (is_super_admin());

CREATE POLICY "Public neighborhoods are viewable by everyone" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Superadmin write neighborhoods" ON neighborhoods FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Public blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Superadmin write blog posts" ON blog_posts FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Public site settings are viewable by everyone" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Superadmin write site settings" ON site_settings FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 2. LEADS & VIEWING REQUESTS (Public can SUBMIT, ONLY Super Admin can READ/MANAGE)
-- Sensitive user phone numbers, emails, and notes are never exposed publicly!
CREATE POLICY "Public can submit viewing requests" ON viewing_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Only Superadmin can view viewing requests" ON viewing_requests FOR SELECT USING (is_super_admin());
CREATE POLICY "Only Superadmin can update viewing requests" ON viewing_requests FOR UPDATE USING (is_super_admin());
CREATE POLICY "Only Superadmin can delete viewing requests" ON viewing_requests FOR DELETE USING (is_super_admin());

CREATE POLICY "Public can submit leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Only Superadmin can view leads" ON leads FOR SELECT USING (is_super_admin());
CREATE POLICY "Only Superadmin can update leads" ON leads FOR UPDATE USING (is_super_admin());
CREATE POLICY "Only Superadmin can delete leads" ON leads FOR DELETE USING (is_super_admin());

-- 3. CMS & PAGE BUILDER POLICIES
CREATE POLICY "Published pages are viewable by everyone" ON pages FOR SELECT USING (status = 'published' OR is_super_admin());
CREATE POLICY "Superadmin manage pages" ON pages FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Superadmin manage page_versions" ON page_versions FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Public page elements viewable" ON page_elements FOR SELECT USING (true);
CREATE POLICY "Superadmin manage page elements" ON page_elements FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Public element styles viewable" ON element_styles FOR SELECT USING (true);
CREATE POLICY "Superadmin manage element styles" ON element_styles FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Public responsive styles viewable" ON element_responsive_styles FOR SELECT USING (true);
CREATE POLICY "Superadmin manage responsive styles" ON element_responsive_styles FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Design tokens viewable by everyone" ON design_tokens FOR SELECT USING (true);
CREATE POLICY "Superadmin manage design tokens" ON design_tokens FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

CREATE POLICY "Style presets viewable by everyone" ON style_presets FOR SELECT USING (true);
CREATE POLICY "Superadmin manage style presets" ON style_presets FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 4. AUDIT LOGS (Only Super Admin can read and write)
CREATE POLICY "Superadmin full access to cms_audit_logs" ON cms_audit_logs FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Superadmin full access to admin_audit_logs" ON admin_audit_logs FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 5. ADMIN USERS (Users can view their own record; Only Superadmin can manage)
CREATE POLICY "Admins can view own record or superadmin view all" ON admin_users FOR SELECT USING (auth.uid() = user_id OR is_super_admin());
CREATE POLICY "Superadmin manage admin users" ON admin_users FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Indexes for lightning fast querying
CREATE INDEX IF NOT EXISTS idx_properties_city_type ON properties(city, property_type, transaction_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_page_elements_page_parent ON page_elements(page_id, parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_version ON page_versions(page_id, version_number);
CREATE INDEX IF NOT EXISTS idx_cms_audit_logs_timestamp ON cms_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_time ON admin_audit_logs(created_at DESC);
