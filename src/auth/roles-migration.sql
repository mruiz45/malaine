-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (maps auth.users to our application users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('guest', 'Unauthenticated visitor'),
  ('user', 'Authenticated regular user'),
  ('admin', 'Site administrator')
ON CONFLICT (name) DO NOTHING;

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into user_profiles with auth_id from the new user
  INSERT INTO user_profiles (auth_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle new users in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to handle user email confirmation and set admin for specific emails
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the user has confirmed their email
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Check if the email is an admin email and update is_admin flag
    IF NEW.email LIKE '%@admin.company.com' THEN
      UPDATE user_profiles
      SET is_admin = TRUE
      WHERE auth_id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to handle user confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_confirmation();

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for user_profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = auth_id);

-- Only admins can create/delete profiles
CREATE POLICY "Only admins can create profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    ) OR 
    (SELECT COUNT(*) FROM user_profiles) = 0 -- Allow first user to be created
  );

CREATE POLICY "Only admins can delete profiles"
  ON user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE auth_id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user role (guest, user, admin)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 'guest';
  END IF;
  
  SELECT CASE WHEN is_admin THEN 'admin' ELSE 'user' END INTO user_role
  FROM user_profiles
  WHERE auth_id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 