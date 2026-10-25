-- ============================================================================
-- PARVARISH — University Social Magazine
-- Supabase Database Schema & Row Level Security (RLS) Policies
-- Supports normal Google accounts (@gmail.com) & institutional accounts
-- ============================================================================

-- 1. Enable pgcrypto / uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('STUDENT', 'FACULTY', 'ADMIN')),
  designation TEXT DEFAULT 'Student',
  department TEXT DEFAULT 'Computer Science & Engineering',
  institution TEXT DEFAULT 'PARVARISH',
  profile_image TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id TEXT NOT NULL DEFAULT 'academic',
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  attachment_url TEXT,
  status TEXT DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED')),
  is_pinned BOOLEAN DEFAULT FALSE,
  comments_enabled BOOLEAN DEFAULT TRUE,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REPORTED', 'REMOVED')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Likes Table
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6. Bookmarks / Saved Posts Table
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 7. Audit Logs Table (Administrative Actions)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if current authenticated user is an ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND is_verified = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------

-- Authenticated users can view public profiles
DROP POLICY IF EXISTS "University members can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update only their own profile attributes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile (e.g., status, verification)
DROP POLICY IF EXISTS "Admins can manage any profile" ON public.profiles;
CREATE POLICY "Admins can manage any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- POSTS POLICIES
-- ----------------------------------------------------------------------------

-- Authenticated users can view published posts
DROP POLICY IF EXISTS "University members can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON public.posts;
CREATE POLICY "Authenticated users can view published posts"
  ON public.posts FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    (status = 'PUBLISHED' OR author_id = auth.uid() OR public.is_admin())
  );

-- Only verified Admins can insert or publish official posts
DROP POLICY IF EXISTS "Admins can create posts" ON public.posts;
CREATE POLICY "Admins can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (public.is_admin() AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- COMMENTS POLICIES
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "University members can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated' AND status != 'REMOVED');

DROP POLICY IF EXISTS "University users can post comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can post comments" ON public.comments;
CREATE POLICY "Authenticated users can post comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

DROP POLICY IF EXISTS "Users and Admins can delete comments" ON public.comments;
CREATE POLICY "Users and Admins can delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- LIKES & SAVED POSTS POLICIES
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view all likes" ON public.post_likes;
CREATE POLICY "Users can view all likes"
  ON public.post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can manage own likes" ON public.post_likes;
CREATE POLICY "Users can manage own likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view own saved posts"
  ON public.saved_posts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert/delete own saved posts" ON public.saved_posts;
CREATE POLICY "Users can insert/delete own saved posts"
  ON public.saved_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- AUTO-SYNC USER PROFILE TRIGGER (Allows any normal Google account or email)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := LOWER(TRIM(NEW.email));

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    designation,
    institution,
    profile_image,
    is_verified
  )
  VALUES (
    NEW.id,
    user_email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      SPLIT_PART(user_email, '@', 1)
    ),
    'STUDENT',
    'Student',
    'PARVARISH',
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    profile_image = COALESCE(EXCLUDED.profile_image, public.profiles.profile_image),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger without domain restriction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
