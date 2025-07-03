export const registrationOptions = {
  triggerFoods: [
    'Gluten', 'Dairy', 'Sugar', 'Processed foods', 'Fried foods', 'Spicy foods',
    'Citrus fruits', 'Tomatoes', 'Onions', 'Garlic', 'Caffeine', 'Alcohol',
    'Chocolate', 'Nuts', 'Shellfish', 'Red meat', 'Artificial sweeteners',
    'Food additives', 'High sodium foods', 'Raw vegetables', 'Beans/legumes'
  ],

  safeFoods: [
    'Rice', 'Quinoa', 'Sweet potatoes', 'Bananas', 'Oatmeal', 'Chicken breast',
    'Fish', 'Eggs', 'Avocado', 'Leafy greens', 'Broccoli', 'Carrots',
    'Blueberries', 'Ginger', 'Turmeric', 'Bone broth', 'Coconut oil',
    'Olive oil', 'Herbal teas', 'Plain yogurt', 'Steamed vegetables'
  ],

  supplements: [
    'Vitamin D', 'Omega-3', 'Probiotics', 'Magnesium', 'Zinc', 'Vitamin B12',
    'Iron', 'Turmeric/Curcumin', 'CBD oil', 'Collagen', 'Vitamin C',
    'Digestive enzymes', 'L-Glutamine', 'Ashwagandha', 'Melatonin',
    'Coenzyme Q10', 'Glucosamine', 'MSM', 'Biotin', 'Folate', 'Calcium'
  ],

  medications: [
    'NSAIDs (Ibuprofen, etc.)', 'Corticosteroids', 'Immunosuppressants',
    'Biologics', 'Antidepressants', 'Antihistamines', 'Proton pump inhibitors',
    'Antibiotics', 'Muscle relaxants', 'Sleep aids', 'Pain medication',
    'Anti-anxiety medication', 'Topical treatments', 'Injections',
    'Alternative therapies', 'Herbal remedies'
  ],

  diagnoses: [
    'Autoimmune condition', 'Fibromyalgia', 'Chronic fatigue syndrome',
    'IBS/IBD', 'Arthritis', 'Lupus', 'Multiple sclerosis', 'Thyroid disorder',
    'Depression', 'Anxiety', 'ADHD', 'Migraines', 'Eczema/Psoriasis',
    'Food allergies', 'Celiac disease', 'Diabetes', 'Heart condition',
    'Sleep disorder', 'Hormonal imbalance', 'Vitamin deficiency'
  ],

  weatherTriggers: [
    'High humidity', 'Low humidity', 'Barometric pressure changes',
    'Cold weather', 'Hot weather', 'Rainy days', 'Sunny/bright light',
    'Seasonal changes', 'Wind', 'Snow', 'Temperature fluctuations',
    'Dry air', 'Pollution/smog', 'Pollen/allergens'
  ],

  stressTriggers: [
    'Work stress', 'Financial stress', 'Relationship issues', 'Family stress',
    'Social situations', 'Travel', 'Schedule changes', 'Deadlines',
    'Conflict', 'Major life events', 'Health concerns', 'Sleep disruption',
    'Technology/screen time', 'Noise', 'Crowds'
  ],

  lifestyleFactors: [
    'Irregular sleep schedule', 'Poor diet', 'Lack of exercise',
    'Excessive exercise', 'Smoking', 'Alcohol consumption', 'Dehydration',
    'Sitting too long', 'Poor posture', 'Overworking', 'Social isolation',
    'Lack of sunlight', 'Too much screen time', 'Irregular meals'
  ],

  exerciseTypes: [
    'Walking', 'Swimming', 'Yoga', 'Pilates', 'Strength training',
    'Cardio/aerobics', 'Stretching', 'Tai chi', 'Dancing', 'Cycling',
    'Low-impact exercises', 'Physical therapy', 'Aqua therapy',
    'Resistance bands', 'Balance exercises'
  ],

  sleepPatterns: [
    'Difficulty falling asleep', 'Frequent wake-ups', 'Early morning waking',
    'Irregular bedtime', 'Less than 6 hours', '6-7 hours', '7-8 hours',
    'More than 8 hours', 'Daytime napping', 'Sleep aids needed',
    'Sleep apnea', 'Restless sleep', 'Nightmares/vivid dreams'
  ],

  environmentalTriggers: [
    'Dust', 'Pet dander', 'Mold', 'Chemical odors', 'Perfumes/fragrances',
    'Cleaning products', 'Cigarette smoke', 'Air pollution',
    'Fluorescent lights', 'Loud noises', 'EMF/electronic devices',
    'Poor air quality', 'Pollen', 'Fabric softeners'
  ],

  treatmentApproaches: [
    'Traditional medicine', 'Integrative medicine', 'Functional medicine',
    'Naturopathy', 'Acupuncture', 'Massage therapy', 'Chiropractic',
    'Physical therapy', 'Cognitive behavioral therapy', 'Meditation',
    'Mindfulness', 'Nutrition counseling', 'Support groups',
    'Alternative therapies', 'Lifestyle modifications'
  ],

  primarySymptoms: [
    'Chronic pain', 'Fatigue', 'Brain fog', 'Sleep issues', 'Digestive problems',
    'Skin issues', 'Joint pain', 'Muscle aches', 'Headaches/migraines',
    'Mood changes', 'Anxiety', 'Depression', 'Memory problems',
    'Concentration issues', 'Inflammation', 'Allergic reactions',
    'Hormonal symptoms', 'Respiratory issues', 'Heart palpitations'
  ],

  secondarySymptoms: [
    'Hair loss', 'Weight changes', 'Temperature sensitivity', 'Dizziness',
    'Nausea', 'Sensitivity to light/sound', 'Dry eyes/mouth',
    'Numbness/tingling', 'Swelling', 'Bruising easily', 'Slow healing',
    'Frequent infections', 'Night sweats', 'Restless legs',
    'Muscle weakness', 'Balance issues', 'Vision changes'
  ],

  severityLevels: [
    { value: 'mild', label: 'Mild - Minimal impact on daily life' },
    { value: 'moderate', label: 'Moderate - Some limitations in activities' },
    { value: 'severe', label: 'Severe - Significant impact on quality of life' },
    { value: 'debilitating', label: 'Debilitating - Major limitations in daily activities' }
  ],

  durationOptions: [
    'Less than 6 months', '6 months - 1 year', '1-2 years', '2-5 years',
    '5-10 years', 'More than 10 years', 'Since childhood', 'Comes and goes'
  ],

  // Demographic data for analytics
  ageRanges: [
    '18-24', '25-34', '35-44', '45-54', '55-64', '65-74', '75+', 'Prefer not to say'
  ],

  sexOptions: [
    'Female', 'Male', 'Non-binary', 'Other', 'Prefer not to say'
  ],

  countries: [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
    'Japan', 'South Korea', 'Brazil', 'Mexico', 'Argentina', 'India', 'Other'
  ],

  climateTypes: [
    'Tropical', 'Dry/Desert', 'Temperate', 'Continental', 'Polar', 
    'Mediterranean', 'Humid subtropical', 'Oceanic', 'Highland/Mountain'
  ],

  occupationCategories: [
    'Healthcare', 'Education', 'Technology', 'Business/Finance', 'Retail',
    'Manufacturing', 'Construction', 'Transportation', 'Government', 
    'Non-profit', 'Arts/Entertainment', 'Agriculture', 'Retired', 
    'Student', 'Unemployed', 'Homemaker', 'Other'
  ],

  educationLevels: [
    'High school or less', 'Some college', 'Associate degree', 
    'Bachelor degree', 'Master degree', 'Doctoral degree', 'Trade school',
    'Prefer not to say'
  ],

  incomeRanges: [
    'Under $25,000', '$25,000-$49,999', '$50,000-$74,999', 
    '$75,000-$99,999', '$100,000-$149,999', '$150,000+', 'Prefer not to say'
  ],

  dataSharingLevels: [
    { 
      value: 'none', 
      label: 'No data sharing', 
      description: 'Your data will not be included in community analytics' 
    },
    { 
      value: 'anonymous', 
      label: 'Anonymous analytics only', 
      description: 'Share anonymized data for community pattern analysis' 
    },
    { 
      value: 'research', 
      label: 'Research participation', 
      description: 'Include data in approved research studies (still anonymous)' 
    },
    { 
      value: 'full', 
      label: 'Full community contribution', 
      description: 'Share data for all community insights and research' 
    }
  ]
};