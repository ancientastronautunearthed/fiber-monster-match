-- -- Create profiles table for user data
-- CREATE TABLE public.profiles (
--   id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
--   username TEXT UNIQUE,
--   display_name TEXT,
--   avatar_url TEXT,
--   bio TEXT,
--   monster_image_url TEXT,
--   monster_keywords TEXT[] DEFAULT '{}',
--   symptoms TEXT[] DEFAULT '{}',
--   likes TEXT[] DEFAULT '{}',
--   dislikes TEXT[] DEFAULT '{}',
--   subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'premium')),
--   subscription_expires_at TIMESTAMP WITH TIME ZONE,
--   monthly_searches_used INTEGER DEFAULT 0,
--   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
--   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
-- );

-- -- Enable RLS
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -- Create policies
-- CREATE POLICY "Users can view all profiles for matching"
-- ON public.profiles
-- FOR SELECT
-- USING (true);

-- CREATE POLICY "Users can update their own profile"
-- ON public.profiles
-- FOR UPDATE
-- USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own profile"
-- ON public.profiles
-- FOR INSERT
-- WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -- Create trigger for automatic timestamp updates
-- CREATE TRIGGER update_profiles_updated_at
--   BEFORE UPDATE ON public.profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- -- Trigger to create profile when user signs up
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();