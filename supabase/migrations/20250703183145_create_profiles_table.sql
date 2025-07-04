-- Update challenge templates with body part specific options
UPDATE public.challenge_templates 
SET 
  name = 'Hand Tracking (One-Hand Operation)',
  description = 'Track changes in one hand while using the other to take photos',
  pose_instructions = ARRAY[
    'Use your non-dominant hand as the subject',
    'Place hand flat on a clean, contrasting surface',
    'Keep fingers naturally spread but relaxed',
    'Use your dominant hand to hold the phone',
    'Maintain consistent lighting and angle',
    'Take photo from same position daily'
  ]
WHERE name = 'Hand Tracking';

-- Insert additional body part challenge templates
INSERT INTO public.challenge_templates (name, description, category, pose_instructions, points_per_photo, default_duration) 
VALUES
  ('Leg/Knee Tracking', 'Monitor leg or knee symptoms with easy one-handed photos', 'skin_condition', 
   ARRAY['Sit comfortably with leg extended', 'Rest leg on stable surface', 'Use phone with free hand', 'Keep same leg position daily', 'Ensure good lighting on target area'], 10, 30),
   
  ('Arm/Elbow Tracking', 'Track arm or elbow changes with phone in opposite hand', 'skin_condition',
   ARRAY['Extend arm on flat surface', 'Keep arm straight and relaxed', 'Hold phone with other hand', 'Use consistent background', 'Maintain same distance daily'], 10, 30),
   
  ('Torso/Chest Tracking', 'Document torso symptoms with front-facing camera', 'skin_condition',
   ARRAY['Sit or stand against plain wall', 'Hold phone at chest level', 'Use front camera for visibility', 'Wear consistent clothing or none', 'Maintain same posture daily'], 15, 30),
   
  ('Face Tracking (Self-Operated)', 'Monitor facial symptoms using front camera', 'skin_condition',
   ARRAY['Use front-facing camera for visibility', 'Hold phone at arm length', 'Look directly at camera', 'Use natural lighting from front', 'Keep hair away from target areas'], 15, 30),
   
  ('Scalp/Hair Tracking', 'Track scalp or hair changes with one-handed operation', 'skin_condition',
   ARRAY['Part hair to expose target area', 'Use phone mirror or front camera', 'Hold phone above head if needed', 'Ensure good lighting on scalp', 'Use same parting pattern daily'], 12, 30),
   
  ('Foot/Ankle Tracking', 'Monitor foot or ankle symptoms with easy positioning', 'skin_condition',
   ARRAY['Sit with foot elevated on surface', 'Rest foot in stable position', 'Hold phone with free hand', 'Use consistent angle and distance', 'Ensure clear view of target area'], 10, 30),
   
  ('Back/Shoulder Tracking', 'Document back or shoulder changes using mirrors', 'skin_condition',
   ARRAY['Use a mirror for back visibility', 'Position yourself consistently', 'Hold phone steady with one hand', 'Mark your position with tape for consistency', 'Use same mirror and angle daily'], 12, 30);

-- Update existing challenge templates to be more one-hand friendly
UPDATE public.challenge_templates 
SET 
  pose_instructions = ARRAY[
    'Use front-facing camera for better control',
    'Hold phone at comfortable arm length',
    'Look directly at camera with neutral expression',
    'Use natural lighting from front window',
    'Keep hair styled consistently'
  ]
WHERE name = 'Face Progress';

UPDATE public.challenge_templates 
SET 
  pose_instructions = ARRAY[
    'Stand with back against wall for support',
    'Hold phone at shoulder height',
    'Use front camera to see posture',
    'Keep feet shoulder-width apart',
    'Relax shoulders naturally'
  ]
WHERE name = 'Posture Check';