-- Create table for relief strategies/treatments
CREATE TABLE public.relief_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_type TEXT NOT NULL CHECK (strategy_type IN ('medical', 'lifestyle', 'mental_health', 'alternative', 'dietary', 'environmental', 'social', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  duration_used TEXT, -- e.g., "3 months", "1 year", "ongoing"
  cost_level TEXT CHECK (cost_level IN ('free', 'low', 'moderate', 'high')),
  accessibility TEXT CHECK (accessibility IN ('very_easy', 'easy', 'moderate', 'difficult', 'very_difficult')),
  side_effects TEXT,
  additional_notes TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.relief_strategies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view approved strategies" 
ON public.relief_strategies 
FOR SELECT 
USING (is_approved = true);

CREATE POLICY "Users can insert their own strategies" 
ON public.relief_strategies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" 
ON public.relief_strategies 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategies" 
ON public.relief_strategies 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_relief_strategies_updated_at
  BEFORE UPDATE ON public.relief_strategies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo data for testing
INSERT INTO public.relief_strategies (user_id, strategy_type, title, description, effectiveness_rating, duration_used, cost_level, accessibility, side_effects, additional_notes, is_approved) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'lifestyle',
  'Cool, Damp Washcloths',
  'Applying cool, damp washcloths to affected areas during flare-ups provides immediate relief from itching and burning sensations.',
  4,
  '2 years',
  'free',
  'very_easy',
  'None noted',
  'Works best with distilled water. Keep multiple washcloths in rotation.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'environmental',
  'Air Purifier with HEPA Filter',
  'Using a high-quality HEPA air purifier reduced the frequency of sensations and improved overall skin comfort.',
  5,
  '1 year',
  'moderate',
  'easy',
  'None',
  'Noticed improvement within 2 weeks. Run continuously in bedroom.',
  true
),
(
  '33333333-3333-3333-3333-333333333333',
  'mental_health',
  'Mindfulness Meditation',
  'Daily 20-minute mindfulness sessions helped manage the anxiety and stress that seemed to worsen symptoms.',
  3,
  '6 months',
  'free',
  'moderate',
  'None',
  'Used apps like Headspace. Consistency is key for benefits.',
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'dietary',
  'Elimination Diet',
  'Removing processed foods, sugar, and dairy for 3 months significantly reduced inflammation and skin sensitivity.',
  4,
  '3 months',
  'low',
  'moderate',
  'Initial fatigue during adjustment',
  'Worked with nutritionist. Reintroduced foods slowly to identify triggers.',
  true
),
(
  '55555555-5555-5555-5555-555555555555',
  'alternative',
  'Epsom Salt Baths',
  'Weekly Epsom salt baths with a few drops of tea tree oil provided relief and seemed to calm skin reactions.',
  4,
  '8 months',
  'low',
  'easy',
  'Slight skin dryness if used too frequently',
  'Use 1-2 cups per bath, lukewarm water works best.',
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'lifestyle',
  'Cotton-Only Clothing',
  'Switching to 100% cotton clothing and bedding eliminated contact-related irritation and itching.',
  5,
  'ongoing',
  'moderate',
  'easy',
  'None',
  'Avoid fabric softeners. Pre-wash everything twice before first use.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'medical',
  'Gentle Moisturizer Routine',
  'Using fragrance-free, hypoallergenic moisturizer twice daily created a protective barrier and reduced dryness.',
  3,
  '1 year',
  'low',
  'very_easy',
  'None',
  'CeraVe and Vanicream brands worked best. Apply to slightly damp skin.',
  true
);