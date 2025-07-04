-- Add detailed profile fields for comprehensive matching
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trigger_foods text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS safe_foods text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS helpful_supplements text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unhelpful_supplements text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS helpful_medications text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unhelpful_medications text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS previous_diagnoses text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weather_triggers text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stress_triggers text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifestyle_factors text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS exercise_types text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_patterns text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS environmental_triggers text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS treatment_approaches text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS symptom_severity text DEFAULT 'moderate';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS condition_duration text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_symptoms text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS secondary_symptoms text[] DEFAULT '{}';

-- Add indexes for better performance on array searches
CREATE INDEX IF NOT EXISTS idx_profiles_trigger_foods ON public.profiles USING GIN(trigger_foods);
CREATE INDEX IF NOT EXISTS idx_profiles_safe_foods ON public.profiles USING GIN(safe_foods);
CREATE INDEX IF NOT EXISTS idx_profiles_helpful_supplements ON public.profiles USING GIN(helpful_supplements);
CREATE INDEX IF NOT EXISTS idx_profiles_helpful_medications ON public.profiles USING GIN(helpful_medications);
CREATE INDEX IF NOT EXISTS idx_profiles_previous_diagnoses ON public.profiles USING GIN(previous_diagnoses);
CREATE INDEX IF NOT EXISTS idx_profiles_weather_triggers ON public.profiles USING GIN(weather_triggers);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_symptoms ON public.profiles USING GIN(primary_symptoms);