-- ==============================================================================
-- DREAM HOME (خانه آرمانی) - Super Admin & RBAC Migration for Supabase
-- Target Table: admin_users
-- Super Admin Account: nabikalandar0@gmail.com
-- Role: superadmin | Status: active
-- ==============================================================================

-- 1. Create or ensure admin_users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Foreign reference to auth.users(id)
  email TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT 'مدیر سیستم',
  role TEXT NOT NULL DEFAULT 'superadmin' CHECK (role IN ('superadmin', 'admin', 'editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index on email for fast authentication & lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Helper Function: is_super_admin()
CREATE OR REPLACE FUNCTION public.is_super_admin()
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
    SELECT 1 FROM public.admin_users
    WHERE (user_id = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND role = 'superadmin'
      AND status = 'active'
  );
END;
$$;

-- 5. RLS Policies for admin_users
DROP POLICY IF EXISTS "Public cannot see admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view own record or superadmin view all" ON public.admin_users;
DROP POLICY IF EXISTS "Superadmin manage admin users" ON public.admin_users;

-- Allow users to read their own record or let superadmin read all
CREATE POLICY "Admins can view own record or superadmin view all" 
ON public.admin_users 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  (auth.jwt() ->> 'email' IS NOT NULL AND LOWER(email) = LOWER(auth.jwt() ->> 'email')) OR
  public.is_super_admin()
);

-- Only Super Admin can insert/update/delete admin_users
CREATE POLICY "Superadmin manage admin users" 
ON public.admin_users 
FOR ALL 
USING (public.is_super_admin()) 
WITH CHECK (public.is_super_admin());

-- 6. Trigger: Automatically link auth.users(id) to admin_users(user_id) upon signup/login
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

-- 7. Insert or update the real Super Admin records
INSERT INTO public.admin_users (email, role, status, name)
VALUES 
  ('luxury.investor@gmail.com', 'superadmin', 'active', 'مدیر ارشد سامانه (Super Admin)'),
  ('nabikalandar0@gmail.com', 'superadmin', 'active', 'مدیر ارشد سامانه (Super Admin)')
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'superadmin',
  status = 'active',
  updated_at = NOW();

-- Also link to auth.users if the users already exist in auth.users
UPDATE public.admin_users a
SET user_id = u.id, updated_at = NOW()
FROM auth.users u
WHERE LOWER(a.email) = LOWER(u.email)
  AND LOWER(a.email) IN ('luxury.investor@gmail.com', 'nabikalandar0@gmail.com');
