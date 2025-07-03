-- Final part: Storage policies, indexes, triggers and default data

-- Storage policies for new buckets (only create if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE policy_name = 'Users can upload their own timelapse videos'
  ) THEN
    CREATE POLICY "Users can upload their own timelapse videos" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'timelapse-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE policy_name = 'Users can view their own timelapse videos'
  ) THEN
    CREATE POLICY "Users can view their own timelapse videos" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'timelapse-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE policy_name = 'Anyone can view challenge templates'
  ) THEN
    CREATE POLICY "Anyone can view challenge templates" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'challenge-templates');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM storage.policies 
    WHERE policy_name = 'Anyone can view achievement icons'
  ) THEN
    CREATE POLICY "Anyone can view achievement icons" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'achievement-icons');
  END IF;
END $$;

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

-- Add triggers for updated_at timestamps (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_challenge_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_challenge_templates_updated_at
    BEFORE UPDATE ON public.challenge_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_timelapse_videos_updated_at'
  ) THEN
    CREATE TRIGGER update_timelapse_videos_updated_at
    BEFORE UPDATE ON public.timelapse_videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_user_reminders_updated_at'
  ) THEN
    CREATE TRIGGER update_user_reminders_updated_at
    BEFORE UPDATE ON public.user_reminders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_user_feedback_updated_at'
  ) THEN
    CREATE TRIGGER update_user_feedback_updated_at
    BEFORE UPDATE ON public.user_feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Insert default challenge templates (only if they don't exist)
INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) 
SELECT * FROM (VALUES
  ('Hand Tracking', 'Track changes in your hands over time', 'skin_condition', 
   ARRAY['Place both hands flat on a clean surface', 'Keep fingers naturally spread', 'Use consistent lighting', 'Take photo from same angle daily'], 10),
  ('Face Progress', 'Monitor facial symptoms and changes', 'skin_condition',
   ARRAY['Look directly at camera with neutral expression', 'Use natural lighting from front', 'Keep hair away from face', 'No makeup or filters'], 15),
  ('Posture Check', 'Track posture improvements over time', 'posture',
   ARRAY['Stand against a wall', 'Keep feet shoulder-width apart', 'Look straight ahead', 'Relax shoulders naturally'], 10),
  ('Joint Mobility', 'Document joint flexibility and range of motion', 'joint_pain',
   ARRAY['Perform specific movement as instructed', 'Hold position for 3 seconds', 'Ensure full body is visible', 'Use consistent background'], 12)
) AS v(name, description, category, pose_instructions, points_per_photo)
WHERE NOT EXISTS (SELECT 1 FROM public.challenge_templates WHERE challenge_templates.name = v.name);

-- Insert default achievements (only if they don't exist)
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT * FROM (VALUES
  ('First Steps', 'Take your first challenge photo', 'progress', 'total_photos', 1, 50, 'common'),
  ('Week Warrior', 'Maintain a 7-day streak', 'streak', 'days_streak', 7, 100, 'common'),
  ('Consistency Champion', 'Complete 30 photos in any challenge', 'consistency', 'total_photos', 30, 300, 'rare'),
  ('Monthly Master', 'Maintain a 30-day streak', 'streak', 'days_streak', 30, 500, 'epic'),
  ('Progress Pioneer', 'Complete your first full challenge', 'progress', 'challenges_completed', 1, 200, 'common'),
  ('Legendary Streak', 'Maintain a 100-day streak', 'streak', 'days_streak', 100, 1000, 'legendary')
) AS v(name, description, category, requirement_type, requirement_value, points_reward, rarity)
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE achievements.name = v.name);