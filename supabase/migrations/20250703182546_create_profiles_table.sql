-- Final part: indexes, triggers and default data (simplified)

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_entry_id ON public.ai_analysis(entry_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_timelapse_videos_user_id ON public.timelapse_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_timelapse_videos_challenge_id ON public.timelapse_videos(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_user_id ON public.user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_shares_shared_by ON public.challenge_shares(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_community_interactions_target ON public.community_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON public.profiles(total_points DESC);

-- Insert default challenge templates (only if table is empty)
INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) 
SELECT 'Hand Tracking', 'Track changes in your hands over time', 'skin_condition', 
       ARRAY['Place both hands flat on a clean surface', 'Keep fingers naturally spread', 'Use consistent lighting', 'Take photo from same angle daily'], 10
WHERE NOT EXISTS (SELECT 1 FROM public.challenge_templates LIMIT 1);

INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) 
SELECT 'Face Progress', 'Monitor facial symptoms and changes', 'skin_condition',
       ARRAY['Look directly at camera with neutral expression', 'Use natural lighting from front', 'Keep hair away from face', 'No makeup or filters'], 15
WHERE NOT EXISTS (SELECT 1 FROM public.challenge_templates WHERE name = 'Face Progress');

INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) 
SELECT 'Posture Check', 'Track posture improvements over time', 'posture',
       ARRAY['Stand against a wall', 'Keep feet shoulder-width apart', 'Look straight ahead', 'Relax shoulders naturally'], 10
WHERE NOT EXISTS (SELECT 1 FROM public.challenge_templates WHERE name = 'Posture Check');

INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo) 
SELECT 'Joint Mobility', 'Document joint flexibility and range of motion', 'joint_pain',
       ARRAY['Perform specific movement as instructed', 'Hold position for 3 seconds', 'Ensure full body is visible', 'Use consistent background'], 12
WHERE NOT EXISTS (SELECT 1 FROM public.challenge_templates WHERE name = 'Joint Mobility');

-- Insert default achievements (only if table is empty)
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'First Steps', 'Take your first challenge photo', 'progress', 'total_photos', 1, 50, 'common'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements LIMIT 1);

INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'Week Warrior', 'Maintain a 7-day streak', 'streak', 'days_streak', 7, 100, 'common'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Week Warrior');

INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'Consistency Champion', 'Complete 30 photos in any challenge', 'consistency', 'total_photos', 30, 300, 'rare'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Consistency Champion');

INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'Monthly Master', 'Maintain a 30-day streak', 'streak', 'days_streak', 30, 500, 'epic'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Monthly Master');

INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'Progress Pioneer', 'Complete your first full challenge', 'progress', 'challenges_completed', 1, 200, 'common'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Progress Pioneer');

INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity) 
SELECT 'Legendary Streak', 'Maintain a 100-day streak', 'streak', 'days_streak', 100, 1000, 'legendary'
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE name = 'Legendary Streak');