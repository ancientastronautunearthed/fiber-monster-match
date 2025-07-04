-- Create demo profiles for testing the connections feature
INSERT INTO public.profiles (user_id, display_name, username, bio, monster_keywords, symptoms, likes, dislikes) VALUES
(
  gen_random_uuid(),
  'Sarah Chen',
  'sarah_storm',
  'Love finding beauty in the chaos. Storm-watcher and tea enthusiast.',
  ARRAY['Hypersensitive to Texture', 'Mind Palace Builder', 'Storm Chaser', 'Pattern Seeker', 'Night Owl'],
  ARRAY['skin sensitivity', 'texture awareness'],
  ARRAY['storms', 'tea', 'patterns'],
  ARRAY['loud noises', 'synthetic fabrics']
),
(
  gen_random_uuid(), 
  'Maya Rivers',
  'maya_moonlight',
  'Finding connections through shared experiences. Artist and dreamer.',
  ARRAY['Phantom Pain Chronicler', 'Boundary Guardian', 'Moonlight Dancer', 'Color Collector', 'Comfort Ritual Master'],
  ARRAY['phantom sensations', 'pain sensitivity'],
  ARRAY['art', 'moonlight', 'colors'],
  ARRAY['bright lights', 'crowds']
),
(
  gen_random_uuid(),
  'Alex Storm',
  'alex_patterns',
  'Pattern recognition specialist. Love puzzles and quiet spaces.',
  ARRAY['Micro-Movement Detective', 'Mind Palace Builder', 'Storm Chaser', 'Detail Archaeologist', 'Silent Communicator'],
  ARRAY['movement sensitivity', 'visual processing'],
  ARRAY['puzzles', 'storms', 'details'],
  ARRAY['chaos', 'unpredictability']
),
(
  gen_random_uuid(),
  'River Thompson', 
  'river_flows',
  'Finding flow in life. Nature lover and mindfulness practitioner.',
  ARRAY['Sensory Conductor', 'Boundary Guardian', 'Nature Whisperer', 'Healing Ritual Keeper', 'Comfort Ritual Master'],
  ARRAY['sensory overload', 'boundary issues'],
  ARRAY['nature', 'meditation', 'rituals'],
  ARRAY['synthetic materials', 'rushed schedules']
),
(
  gen_random_uuid(),
  'Jordan Wells',
  'jordan_deep',
  'Deep thinker and creative soul. Love connecting with kindred spirits.',
  ARRAY['Reality Questioner', 'Mind Palace Builder', 'Depth Seeker', 'Connection Catalyst', 'Night Owl'],
  ARRAY['existential questioning', 'deep thinking'],
  ARRAY['philosophy', 'deep conversations', 'night'],
  ARRAY['small talk', 'surface level interactions']
);