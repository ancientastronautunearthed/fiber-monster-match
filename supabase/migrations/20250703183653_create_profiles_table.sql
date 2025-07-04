-- Add demographic and analytics opt-in fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sex text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_country text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_region text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS climate_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation_category text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_income_range text;

-- Analytics consent and preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS analytics_consent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS research_participation_consent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_sharing_level text DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consent_date timestamp with time zone;

-- Create anonymous analytics aggregation table
CREATE TABLE IF NOT EXISTS public.analytics_patterns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type text NOT NULL,
  pattern_data jsonb NOT NULL,
  participant_count integer NOT NULL,
  confidence_score numeric,
  statistical_significance numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_published boolean DEFAULT false
);

-- Enable RLS on analytics patterns
ALTER TABLE public.analytics_patterns ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing published patterns
CREATE POLICY "Anyone can view published analytics patterns" 
ON public.analytics_patterns 
FOR SELECT 
USING (is_published = true);

-- Create policy for researchers/admins to manage patterns
CREATE POLICY "Admins can manage analytics patterns" 
ON public.analytics_patterns 
FOR ALL 
USING (false); -- Will be updated when admin roles are implemented

-- Create aggregated community insights table
CREATE TABLE IF NOT EXISTS public.community_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text,
  data_summary jsonb NOT NULL,
  participant_count integer NOT NULL,
  date_range_start date,
  date_range_end date,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_featured boolean DEFAULT false
);

-- Enable RLS on community insights
ALTER TABLE public.community_insights ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing community insights
CREATE POLICY "Anyone can view community insights" 
ON public.community_insights 
FOR SELECT 
USING (true);

-- Create research requests table for researchers to request specific analyses
CREATE TABLE IF NOT EXISTS public.research_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_name text NOT NULL,
  researcher_email text NOT NULL,
  institution text,
  research_title text NOT NULL,
  research_description text NOT NULL,
  requested_data_points text[] NOT NULL,
  ethical_approval_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on research requests
ALTER TABLE public.research_requests ENABLE ROW LEVEL SECURITY;

-- Basic policy - only researchers can view their own requests
CREATE POLICY "Researchers can view their own requests" 
ON public.research_requests 
FOR SELECT 
USING (researcher_email = auth.email());

CREATE POLICY "Anyone can submit research requests" 
ON public.research_requests 
FOR INSERT 
WITH CHECK (true);

-- Add indexes for analytics performance
CREATE INDEX IF NOT EXISTS idx_profiles_analytics_consent ON public.profiles(analytics_consent) WHERE analytics_consent = true;
CREATE INDEX IF NOT EXISTS idx_profiles_demographics ON public.profiles(age_range, sex, location_country) WHERE analytics_consent = true;
CREATE INDEX IF NOT EXISTS idx_analytics_patterns_type ON public.analytics_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_community_insights_type ON public.community_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_community_insights_tags ON public.community_insights USING GIN(tags);

-- Add trigger for analytics patterns updated_at
CREATE TRIGGER update_analytics_patterns_updated_at
  BEFORE UPDATE ON public.analytics_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for community insights updated_at  
CREATE TRIGGER update_community_insights_updated_at
  BEFORE UPDATE ON public.community_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for research requests updated_at
CREATE TRIGGER update_research_requests_updated_at
  BEFORE UPDATE ON public.research_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();