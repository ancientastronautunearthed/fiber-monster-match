-- Complete database schema for the photo challenge and symptom tracking system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (enhanced)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  monster_personality TEXT DEFAULT 'supportive',
  monster_voice_tone TEXT DEFAULT 'encouraging',
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  streak_count INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  privacy_settings JSONB DEFAULT '{"profile_visible": true, "allow_connections": true}',
  notification_preferences JSONB DEFAULT '{"daily_reminders": true, "streak_alerts": true, "ai_feedback": true}',
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_date DATE DEFAULT CURRENT_DATE;

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

-- Enhanced relief strategies with better categorization
ALTER TABLE public.relief_strategies ADD COLUMN IF NOT EXISTS 
  symptom_tags TEXT[],
  body_areas TEXT[], -- 'hands', 'face', 'legs', 'torso', 'full_body'
  treatment_category TEXT, -- 'topical', 'oral', 'lifestyle', 'alternative', 'medical'
  evidence_level TEXT DEFAULT 'anecdotal', -- 'anecdotal', 'clinical', 'peer_reviewed'
  helpful_votes INTEGER DEFAULT 0,
  not_helpful_votes INTEGER DEFAULT 0,
  last_updated_by UUID,
  version_number INTEGER DEFAULT 1;

-- User connections and compatibility
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS 
  compatibility_score DECIMAL(3,2), -- 0.00 to 1.00
  match_reason TEXT[], -- reasons for the match
  connection_status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'blocked'
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  notes TEXT;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('timelapse-videos', 'timelapse-videos', false),
  ('challenge-templates', 'challenge-templates', true),
  ('achievement-icons', 'achievement-icons', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all new tables
ALTER TABLE public.challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timelapse_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_templates (public read, admin write)
CREATE POLICY "Anyone can view challenge templates" 
ON public.challenge_templates FOR SELECT USING (true);

-- RLS policies for ai_analysis
CREATE POLICY "Users can view their own AI analysis" 
ON public.ai_analysis FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.challenge_entries ce 
  WHERE ce.id = ai_analysis.entry_id AND ce.user_id = auth.uid()
));

-- RLS policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" 
ON public.achievements FOR SELECT USING (true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for timelapse_videos
CREATE POLICY "Users can view their own timelapses" 
ON public.timelapse_videos FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timelapses" 
ON public.timelapse_videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timelapses" 
ON public.timelapse_videos FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view public timelapses" 
ON public.timelapse_videos FOR SELECT USING (is_public = true);

-- RLS policies for user_reminders
CREATE POLICY "Users can manage their own reminders" 
ON public.user_reminders FOR ALL USING (auth.uid() = user_id);

-- RLS policies for user_feedback
CREATE POLICY "Users can create feedback" 
ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for challenge_shares
CREATE POLICY "Users can create their own shares" 
ON public.challenge_shares FOR INSERT WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can view their own shares" 
ON public.challenge_shares FOR SELECT USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Anyone can view public shares" 
ON public.challenge_shares FOR SELECT USING (share_type = 'public_gallery');

-- RLS policies for community_interactions
CREATE POLICY "Users can create interactions" 
ON public.community_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view interactions on their content" 
ON public.community_interactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.challenge_shares cs 
    WHERE cs.id = target_id AND cs.shared_by_user_id = auth.uid()
  ) OR 
  EXISTS (
    SELECT 1 FROM public.relief_strategies rs 
    WHERE rs.id = target_id AND rs.user_id = auth.uid()
  )
);

-- Storage policies for new buckets
CREATE POLICY "Users can upload their own timelapse videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'timelapse-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own timelapse videos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'timelapse-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view challenge templates" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'challenge-templates');

CREATE POLICY "Anyone can view achievement icons" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'achievement-icons');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_entry_id ON public.ai_analysis(entry_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_timelapse_videos_user_id ON public.timelapse_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_timelapse_videos_challenge_id ON public.timelapse_videos(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON public.user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_shares_shared_by ON public.challenge_shares(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_community_interactions_target ON public.community_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_relief_strategies_symptom_tags ON public.relief_strategies USING GIN(symptom_tags);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_challenge_templates_updated_at
BEFORE UPDATE ON public.challenge_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_timelapse_videos_updated_at
BEFORE UPDATE ON public.timelapse_videos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reminders_updated_at
BEFORE UPDATE ON public.user_reminders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_feedback_updated_at
BEFORE UPDATE ON public.user_feedback
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default challenge templates
INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) VALUES
('Hand Tracking', 'Track changes in your hands over time', 'skin_condition', 
 ARRAY['Place both hands flat on a clean surface', 'Keep fingers naturally spread', 'Use consistent lighting', 'Take photo from same angle daily'], 10),
('Face Progress', 'Monitor facial symptoms and changes', 'skin_condition',
 ARRAY['Look directly at camera with neutral expression', 'Use natural lighting from front', 'Keep hair away from face', 'No makeup or filters'], 15),
('Posture Check', 'Track posture improvements over time', 'posture',
 ARRAY['Stand against a wall', 'Keep feet shoulder-width apart', 'Look straight ahead', 'Relax shoulders naturally'], 10),
('Joint Mobility', 'Document joint flexibility and range of motion', 'joint_pain',
 ARRAY['Perform specific movement as instructed', 'Hold position for 3 seconds', 'Ensure full body is visible', 'Use consistent background'], 12);

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) VALUES
('First Steps', 'Take your first challenge photo', 'progress', 'total_photos', 1, 50, 'common'),
('Week Warrior', 'Maintain a 7-day streak', 'streak', 'days_streak', 7, 100, 'common'),
('Consistency Champion', 'Complete 30 photos in any challenge', 'consistency', 'total_photos', 30, 300, 'rare'),
('Monthly Master', 'Maintain a 30-day streak', 'streak', 'days_streak', 30, 500, 'epic'),
('Progress Pioneer', 'Complete your first full challenge', 'progress', 'challenges_completed', 1, 200, 'common'),
('Legendary Streak', 'Maintain a 100-day streak', 'streak', 'days_streak', 100, 1000, 'legendary');