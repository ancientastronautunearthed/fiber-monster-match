-- Continue with enhanced relief strategies and other tables

-- Enhanced relief strategies with better categorization
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'symptom_tags') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN symptom_tags TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'body_areas') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN body_areas TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'treatment_category') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN treatment_category TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'evidence_level') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN evidence_level TEXT DEFAULT 'anecdotal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'helpful_votes') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN helpful_votes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'not_helpful_votes') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN not_helpful_votes INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'last_updated_by') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN last_updated_by UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'relief_strategies' AND column_name = 'version_number') THEN
    ALTER TABLE public.relief_strategies ADD COLUMN version_number INTEGER DEFAULT 1;
  END IF;
END $$;

-- User connections and compatibility
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'compatibility_score') THEN
    ALTER TABLE public.matches ADD COLUMN compatibility_score DECIMAL(3,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'match_reason') THEN
    ALTER TABLE public.matches ADD COLUMN match_reason TEXT[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'connection_status') THEN
    ALTER TABLE public.matches ADD COLUMN connection_status TEXT DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'last_interaction_at') THEN
    ALTER TABLE public.matches ADD COLUMN last_interaction_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'notes') THEN
    ALTER TABLE public.matches ADD COLUMN notes TEXT;
  END IF;
END $$;

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