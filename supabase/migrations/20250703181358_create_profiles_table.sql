-- Complete database schema for the photo challenge and symptom tracking system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (enhanced) - fix syntax by adding columns one by one
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'monster_personality') THEN
    ALTER TABLE public.profiles ADD COLUMN monster_personality TEXT DEFAULT 'supportive';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'monster_voice_tone') THEN
    ALTER TABLE public.profiles ADD COLUMN monster_voice_tone TEXT DEFAULT 'encouraging';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'total_points') THEN
    ALTER TABLE public.profiles ADD COLUMN total_points INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_level') THEN
    ALTER TABLE public.profiles ADD COLUMN current_level INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'streak_count') THEN
    ALTER TABLE public.profiles ADD COLUMN streak_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longest_streak') THEN
    ALTER TABLE public.profiles ADD COLUMN longest_streak INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'privacy_settings') THEN
    ALTER TABLE public.profiles ADD COLUMN privacy_settings JSONB DEFAULT '{"profile_visible": true, "allow_connections": true}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"daily_reminders": true, "streak_alerts": true, "ai_feedback": true}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_date') THEN
    ALTER TABLE public.profiles ADD COLUMN last_active_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Photo challenge categories and templates
CREATE TABLE IF NOT EXISTS public.challenge_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'skin_condition', 'joint_pain', 'posture', 'custom'
  default_duration INTEGER DEFAULT 30,
  pose_instructions TEXT[],
  guide_image_url TEXT,
  difficulty_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  points_per_photo INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI feedback and analysis
CREATE TABLE IF NOT EXISTS public.ai_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.challenge_entries(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL, -- 'visual_change', 'progress_assessment', 'encouragement'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  detected_changes JSONB, -- structured data about visual changes
  sentiment_analysis JSONB, -- mood analysis from image
  improvement_suggestions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievements and badges system
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT NOT NULL, -- 'streak', 'consistency', 'progress', 'community'
  requirement_type TEXT NOT NULL, -- 'days_streak', 'total_photos', 'challenges_completed'
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements tracking
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_value INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Time-lapse videos
CREATE TABLE IF NOT EXISTS public.timelapse_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  photo_count INTEGER,
  date_range_start DATE,
  date_range_end DATE,
  processing_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Daily reminders and notifications
CREATE TABLE IF NOT EXISTS public.user_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  reminder_time TIME NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  is_active BOOLEAN DEFAULT true,
  reminder_type TEXT DEFAULT 'photo_capture', -- 'photo_capture', 'review_progress'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User feedback and app improvements
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feedback_type TEXT NOT NULL, -- 'bug_report', 'feature_request', 'general'
  subject TEXT,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  app_version TEXT,
  device_info JSONB,
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenge sharing and community features
CREATE TABLE IF NOT EXISTS public.challenge_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL,
  share_type TEXT NOT NULL, -- 'public_gallery', 'specific_users', 'anonymized'
  share_settings JSONB DEFAULT '{"show_face": false, "show_username": true}',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community interactions (likes, comments)
CREATE TABLE IF NOT EXISTS public.community_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL, -- 'challenge_share', 'relief_strategy', 'profile'
  target_id UUID NOT NULL,
  interaction_type TEXT NOT NULL, -- 'like', 'comment', 'report'
  comment_text TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);