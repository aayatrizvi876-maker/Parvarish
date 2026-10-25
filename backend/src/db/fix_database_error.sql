-- ============================================================================
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX: "Database error saving new user"
-- ============================================================================

-- 1. Remove the old trigger that blocked non-university domains
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create the new universal user profile trigger (accepts @gmail.com and any email)
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
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update Profile Read Policy so all authenticated users can view profiles
DROP POLICY IF EXISTS "University members can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');
