-- Create photo challenges tables for symptom tracking

-- Main challenges table
CREATE TABLE public.photo_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'symptom_tracking', -- symptom_tracking, general, etc.
  target_area TEXT, -- body part or area being tracked
  pose_guide_url TEXT, -- reference image for consistent pose
  target_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' -- active, completed, paused
);

-- Individual photo entries for challenges
CREATE TABLE public.challenge_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  day_number INTEGER NOT NULL, -- which day of the challenge this represents
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ai_feedback TEXT, -- monster feedback on the photo
  ai_sentiment TEXT, -- proud, upset, neutral
  notes TEXT, -- user's own notes about the photo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User progress tracking
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.photo_challenges(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_photos INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  last_photo_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create storage bucket for challenge photos
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-photos', 'challenge-photos', false);

-- Enable RLS on all tables
ALTER TABLE public.photo_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_challenges
CREATE POLICY "Users can create their own challenges" 
ON public.photo_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenges" 
ON public.photo_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenges" 
ON public.photo_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenges" 
ON public.photo_challenges 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for challenge_entries
CREATE POLICY "Users can create their own challenge entries" 
ON public.challenge_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own challenge entries" 
ON public.challenge_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge entries" 
ON public.challenge_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge entries" 
ON public.challenge_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for user_challenge_progress
CREATE POLICY "Users can create their own progress" 
ON public.user_challenge_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" 
ON public.user_challenge_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_challenge_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Storage policies for challenge photos
CREATE POLICY "Users can upload their own challenge photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own challenge photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own challenge photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own challenge photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add indexes for performance
CREATE INDEX idx_photo_challenges_user_id ON public.photo_challenges(user_id);
CREATE INDEX idx_challenge_entries_challenge_id ON public.challenge_entries(challenge_id);
CREATE INDEX idx_challenge_entries_user_id ON public.challenge_entries(user_id);
CREATE INDEX idx_user_challenge_progress_user_id ON public.user_challenge_progress(user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_photo_challenges_updated_at
BEFORE UPDATE ON public.photo_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at
BEFORE UPDATE ON public.user_challenge_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();