-- Temporarily remove foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Create demo profiles for testing the connections feature  
INSERT INTO public.profiles (user_id, display_name, username, bio, monster_keywords, symptoms, likes, dislikes) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Sarah Chen',
  'sarah_storm',
  'Love finding beauty in the chaos. Storm-watcher and tea enthusiast.',
  ARRAY['Hypersensitive to Texture', 'Mind Palace Builder', 'Storm Chaser', 'Pattern Seeker', 'Night Owl'],
  ARRAY['skin sensitivity', 'texture awareness'],
  ARRAY['storms', 'tea', 'patterns'],
  ARRAY['loud noises', 'synthetic fabrics']
),
(
  '22222222-2222-2222-2222-222222222222', 
  'Maya Rivers',
  'maya_moonlight',
  'Finding connections through shared experiences. Artist and dreamer.',
  ARRAY['Phantom Pain Chronicler', 'Boundary Guardian', 'Moonlight Dancer', 'Color Collector', 'Comfort Ritual Master'],
  ARRAY['phantom sensations', 'pain sensitivity'],
  ARRAY['art', 'moonlight', 'colors'],
  ARRAY['bright lights', 'crowds']
),
(
  '33333333-3333-3333-3333-333333333333',
  'Alex Storm',
  'alex_patterns',
  'Pattern recognition specialist. Love puzzles and quiet spaces.',
  ARRAY['Micro-Movement Detective', 'Mind Palace Builder', 'Storm Chaser', 'Detail Archaeologist', 'Silent Communicator'],
  ARRAY['movement sensitivity', 'visual processing'],
  ARRAY['puzzles', 'storms', 'details'],
  ARRAY['chaos', 'unpredictability']
),
(
  '44444444-4444-4444-4444-444444444444',
  'River Thompson', 
  'river_flows',
  'Finding flow in life. Nature lover and mindfulness practitioner.',
  ARRAY['Sensory Conductor', 'Boundary Guardian', 'Nature Whisperer', 'Healing Ritual Keeper', 'Comfort Ritual Master'],
  ARRAY['sensory overload', 'boundary issues'],
  ARRAY['nature', 'meditation', 'rituals'],
  ARRAY['synthetic materials', 'rushed schedules']
),
(
  '55555555-5555-5555-5555-555555555555',
  'Jordan Wells',
  'jordan_deep',
  'Deep thinker and creative soul. Love connecting with kindred spirits.',
  ARRAY['Reality Questioner', 'Mind Palace Builder', 'Depth Seeker', 'Connection Catalyst', 'Night Owl'],
  ARRAY['existential questioning', 'deep thinking'],
  ARRAY['philosophy', 'deep conversations', 'night'],
  ARRAY['small talk', 'surface level interactions']
);

-- Add foreign key constraint back (but don't validate existing data)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;