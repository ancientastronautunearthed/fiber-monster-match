-- Create demo profiles for testing the connections feature
INSERT INTO public.profiles (user_id, display_name, username, bio, monster_keywords, symptoms, likes, dislikes) VALUES
(
  'demo-user-1',
  'Sarah Chen',
  'sarah_storm',
  'Love finding beauty in the chaos. Storm-watcher and tea enthusiast.',
  ARRAY['Hypersensitive to Texture', 'Mind Palace Builder', 'Storm Chaser', 'Pattern Seeker', 'Night Owl'],
  ARRAY['skin sensitivity', 'texture awareness'],
  ARRAY['storms', 'tea', 'patterns'],
  ARRAY['loud noises', 'synthetic fabrics']
),
(
  'demo-user-2', 
  'Maya Rivers',
  'maya_moonlight',
  'Finding connections through shared experiences. Artist and dreamer.',
  ARRAY['Phantom Pain Chronicler', 'Boundary Guardian', 'Moonlight Dancer', 'Color Collector', 'Comfort Ritual Master'],
  ARRAY['phantom sensations', 'pain sensitivity'],
  ARRAY['art', 'moonlight', 'colors'],
  ARRAY['bright lights', 'crowds']
),
(
  'demo-user-3',
  'Alex Storm',
  'alex_patterns',
  'Pattern recognition specialist. Love puzzles and quiet spaces.',
  ARRAY['Micro-Movement Detective', 'Mind Palace Builder', 'Storm Chaser', 'Detail Archaeologist', 'Silent Communicator'],
  ARRAY['movement sensitivity', 'visual processing'],
  ARRAY['puzzles', 'storms', 'details'],
  ARRAY['chaos', 'unpredictability']
),
(
  'demo-user-4',
  'River Thompson', 
  'river_flows',
  'Finding flow in life. Nature lover and mindfulness practitioner.',
  ARRAY['Sensory Conductor', 'Boundary Guardian', 'Nature Whisperer', 'Healing Ritual Keeper', 'Comfort Ritual Master'],
  ARRAY['sensory overload', 'boundary issues'],
  ARRAY['nature', 'meditation', 'rituals'],
  ARRAY['synthetic materials', 'rushed schedules']
),
(
  'demo-user-5',
  'Jordan Wells',
  'jordan_deep',
  'Deep thinker and creative soul. Love connecting with kindred spirits.',
  ARRAY['Reality Questioner', 'Mind Palace Builder', 'Depth Seeker', 'Connection Catalyst', 'Night Owl'],
  ARRAY['existential questioning', 'deep thinking'],
  ARRAY['philosophy', 'deep conversations', 'night'],
  ARRAY['small talk', 'surface level interactions']
);