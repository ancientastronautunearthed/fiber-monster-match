-- Create points transactions table to track all Light earned/spent
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'forbidden_knowledge', 'beacon_hope', 'daily_defiance', etc.
  points_amount INTEGER NOT NULL, -- Can be negative for spending
  source_id UUID, -- ID of related content (post, challenge, etc.)
  source_type TEXT, -- 'challenge_entry', 'relief_strategy', 'community_post', etc.
  metadata JSONB DEFAULT '{}', -- Additional context data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user tiers table for progression tracking
CREATE TABLE public.user_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_tier INTEGER NOT NULL DEFAULT 1, -- 1-7 (Spark to Citadel Heart)
  total_light INTEGER NOT NULL DEFAULT 0, -- Total Light accumulated
  tier_achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily activities table for streak tracking
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activities_completed JSONB NOT NULL DEFAULT '{}', -- Track what was done each day
  daily_light_earned INTEGER NOT NULL DEFAULT 0,
  streak_bonus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create community actions table for social engagement tracking
CREATE TABLE public.community_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'beacon_hope', 'silence_whispers', 'reinforce_resistance', etc.
  target_user_id UUID, -- User being helped/welcomed
  target_content_id UUID, -- Post/content being interacted with
  light_earned INTEGER NOT NULL DEFAULT 0,
  daily_count INTEGER NOT NULL DEFAULT 1, -- Track daily limits
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly challenges table for coordinated activities
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'alpha_monster_hunt', 'synchronized_strike', etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  base_reward INTEGER NOT NULL DEFAULT 5,
  completion_bonus INTEGER NOT NULL DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user challenge participation table
CREATE TABLE public.user_challenge_participation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL,
  actions_completed INTEGER DEFAULT 0,
  light_earned INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Create citadel upgrades table for point spending
CREATE TABLE public.citadel_upgrades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  upgrade_type TEXT NOT NULL, -- 'defensive', 'research', 'community', etc.
  current_level INTEGER DEFAULT 0,
  max_level INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user citadel contributions table
CREATE TABLE public.user_citadel_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upgrade_id UUID NOT NULL,
  light_spent INTEGER NOT NULL,
  contributed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update existing achievements table with new categories
INSERT INTO public.achievements (name, description, category, requirement_type, requirement_value, points_reward, rarity, icon_url) VALUES
-- Community & Support
('Forbidden Knowledge', 'Share valuable wisdom in What Works', 'community_support', 'tips_shared', 1, 150, 'epic', '/achievement-icons/forbidden-knowledge.svg'),
('Beacon of Hope', 'Support users during their darkest moments', 'community_support', 'support_sent', 5, 50, 'rare', '/achievement-icons/beacon-hope.svg'),
('Silence the Whispers', 'Bring light to the Vent Channel', 'community_support', 'vent_reactions', 10, 50, 'common', '/achievement-icons/silence-whispers.svg'),
('Reinforce the Resistance', 'Welcome new members to the fight', 'community_support', 'welcomes_sent', 3, 75, 'rare', '/achievement-icons/reinforce-resistance.svg'),

-- Direct Interaction  
('Breach the Interference', 'Solve riddles and break barriers', 'direct_interaction', 'riddles_solved', 1, 50, 'rare', '/achievement-icons/breach-interference.svg'),
('Forge an Alliance', 'Initiate meaningful connections', 'direct_interaction', 'first_messages', 5, 100, 'rare', '/achievement-icons/forge-alliance.svg'),
('The Support Pact', 'Form lasting bonds of mutual aid', 'direct_interaction', 'support_pacts', 1, 100, 'epic', '/achievement-icons/support-pact.svg'),

-- Personal Growth
('Forge Your Armor', 'Complete your resistance profile', 'personal_growth', 'profile_completion', 100, 250, 'legendary', '/achievement-icons/forge-armor.svg'),
('Daily Defiance', 'Show up every day to fight the monster', 'personal_growth', 'login_streak', 7, 70, 'common', '/achievement-icons/daily-defiance.svg'),
('War Paint', 'Express your identity with detailed bio', 'personal_growth', 'bio_length', 200, 40, 'common', '/achievement-icons/war-paint.svg'),

-- Active Gamification
('Alpha Hunter', 'Participate in weekly monster hunts', 'active_gamification', 'hunts_joined', 1, 500, 'legendary', '/achievement-icons/alpha-hunter.svg'),
('Shatter Illusions', 'Break the monster''s curses quickly', 'active_gamification', 'curses_broken', 1, 75, 'rare', '/achievement-icons/shatter-illusions.svg'),
('Synchronized Warrior', 'Join coordinated strikes against darkness', 'active_gamification', 'strikes_joined', 5, 250, 'epic', '/achievement-icons/synchronized-warrior.svg');

-- Enable Row Level Security on new tables
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citadel_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_citadel_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for points_transactions
CREATE POLICY "Users can view their own point transactions" 
ON public.points_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own point transactions" 
ON public.points_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_tiers
CREATE POLICY "Users can view all tier information" 
ON public.user_tiers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own tier progress" 
ON public.user_tiers 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for daily_activities
CREATE POLICY "Users can manage their own daily activities" 
ON public.daily_activities 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for community_actions
CREATE POLICY "Users can view their own community actions" 
ON public.community_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create community actions" 
ON public.community_actions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for weekly_challenges
CREATE POLICY "Anyone can view active challenges" 
ON public.weekly_challenges 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for user_challenge_participation
CREATE POLICY "Users can manage their challenge participation" 
ON public.user_challenge_participation 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for citadel_upgrades
CREATE POLICY "Anyone can view available upgrades" 
ON public.citadel_upgrades 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for user_citadel_contributions
CREATE POLICY "Users can view all citadel contributions" 
ON public.user_citadel_contributions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can make their own contributions" 
ON public.user_citadel_contributions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_tiers_updated_at
BEFORE UPDATE ON public.user_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_points_transactions_user_id ON public.points_transactions(user_id);
CREATE INDEX idx_points_transactions_action_type ON public.points_transactions(action_type);
CREATE INDEX idx_points_transactions_created_at ON public.points_transactions(created_at);

CREATE INDEX idx_daily_activities_user_date ON public.daily_activities(user_id, activity_date);
CREATE INDEX idx_community_actions_user_date ON public.community_actions(user_id, action_date);
CREATE INDEX idx_community_actions_type ON public.community_actions(action_type);

CREATE INDEX idx_user_challenge_participation_user ON public.user_challenge_participation(user_id);
CREATE INDEX idx_user_challenge_participation_challenge ON public.user_challenge_participation(challenge_id);

-- Insert initial citadel upgrades
INSERT INTO public.citadel_upgrades (name, description, cost, upgrade_type, max_level) VALUES
('Beacon Tower', 'Increases visibility of community posts', 100, 'community', 5),
('Research Archive', 'Improves tip discovery algorithms', 150, 'research', 5),
('Healing Gardens', 'Reduces symptom tracking fatigue', 200, 'wellness', 3),
('Alert System', 'Better notifications for community support', 120, 'defensive', 4),
('Connection Hub', 'Improved matching algorithms', 300, 'social', 3);

-- Insert initial weekly challenge
INSERT INTO public.weekly_challenges (title, description, challenge_type, start_date, end_date, target_participants, base_reward, completion_bonus) VALUES
('The First Alpha Hunt', 'Unite against the Alpha Monster''s influence on our community', 'alpha_monster_hunt', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 50, 5, 500);

-- Create function to update user tier based on total light
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier INTEGER;
BEGIN
  -- Determine tier based on total light
  CASE 
    WHEN NEW.total_light >= 30000 THEN new_tier := 7; -- Citadel Heart
    WHEN NEW.total_light >= 15000 THEN new_tier := 6; -- Luminary
    WHEN NEW.total_light >= 7000 THEN new_tier := 5;  -- Guardian
    WHEN NEW.total_light >= 3000 THEN new_tier := 4;  -- Sentinel
    WHEN NEW.total_light >= 1000 THEN new_tier := 3;  -- Beacon
    WHEN NEW.total_light >= 250 THEN new_tier := 2;   -- Lamplighter
    ELSE new_tier := 1; -- Spark
  END CASE;
  
  -- Update tier if it changed
  IF new_tier > NEW.current_tier THEN
    NEW.current_tier := new_tier;
    NEW.tier_achieved_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic tier updates
CREATE TRIGGER update_tier_on_light_change
BEFORE UPDATE ON public.user_tiers
FOR EACH ROW
WHEN (OLD.total_light IS DISTINCT FROM NEW.total_light)
EXECUTE FUNCTION public.update_user_tier();

-- Create function to handle new user tier initialization
CREATE OR REPLACE FUNCTION public.initialize_user_tier()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tiers (user_id, current_tier, total_light)
  VALUES (NEW.user_id, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to initialize tier when profile is created
CREATE TRIGGER initialize_tier_on_profile_creation
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_tier();