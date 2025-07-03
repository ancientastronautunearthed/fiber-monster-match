import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Profile {
  id: string;
  age_range?: string;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
  location_country?: string;
  location_region?: string;
  climate_type?: string;
  occupation_category?: string;
  education_level?: string;
  household_income_range?: string;
  primary_symptoms?: string[];
  secondary_symptoms?: string[];
  trigger_foods?: string[];
  safe_foods?: string[];
  helpful_supplements?: string[];
  helpful_medications?: string[];
  weather_triggers?: string[];
  stress_triggers?: string[];
  symptom_severity?: string;
  condition_duration?: string;
  analytics_consent: boolean;
  data_sharing_level?: string;
}

interface AnalyticsPattern {
  pattern_type: string;
  pattern_data: any;
  participant_count: number;
  confidence_score?: number;
  statistical_significance?: number;
}

interface CommunityInsight {
  insight_type: string;
  title: string;
  description: string;
  data_summary: any;
  participant_count: number;
  tags: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting analytics processing...');

    // Get all consented profiles with their data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id, age_range, sex, height_cm, weight_kg, location_country, location_region,
        climate_type, occupation_category, education_level, household_income_range,
        primary_symptoms, secondary_symptoms, trigger_foods, safe_foods,
        helpful_supplements, helpful_medications, weather_triggers, stress_triggers,
        symptom_severity, condition_duration, analytics_consent, data_sharing_level
      `)
      .eq('analytics_consent', true)
      .not('data_sharing_level', 'eq', 'none');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length < 10) {
      console.log('Insufficient data for meaningful analytics (need at least 10 consented users)');
      return new Response(
        JSON.stringify({ 
          message: 'Insufficient data for analytics. Need at least 10 consented participants.',
          participant_count: profiles?.length || 0 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing analytics for ${profiles.length} consented participants`);

    const patterns: AnalyticsPattern[] = [];
    const insights: CommunityInsight[] = [];

    // 1. Demographic-Symptom Correlations
    const demographicSymptomAnalysis = analyzeDemographicSymptoms(profiles);
    if (demographicSymptomAnalysis.length > 0) {
      patterns.push(...demographicSymptomAnalysis);
      
      // Create insights from strongest correlations
      const strongCorrelations = demographicSymptomAnalysis
        .filter(p => (p.confidence_score || 0) > 0.7)
        .slice(0, 3);
      
      for (const correlation of strongCorrelations) {
        insights.push({
          insight_type: 'demographic_correlation',
          title: `${correlation.pattern_data.demographic_factor} and Symptom Patterns`,
          description: `Analysis reveals significant patterns between ${correlation.pattern_data.demographic_factor.toLowerCase()} and specific symptoms.`,
          data_summary: correlation.pattern_data,
          participant_count: correlation.participant_count,
          tags: ['demographics', 'symptoms', 'correlation']
        });
      }
    }

    // 2. Geographic Climate Analysis
    const climateAnalysis = analyzeClimatePatterns(profiles);
    if (climateAnalysis.length > 0) {
      patterns.push(...climateAnalysis);
      
      insights.push({
        insight_type: 'climate_analysis',
        title: 'Climate and Symptom Severity Patterns',
        description: 'Geographic and climate-based analysis reveals environmental factors that may influence symptom severity.',
        data_summary: climateAnalysis[0]?.pattern_data || {},
        participant_count: climateAnalysis[0]?.participant_count || 0,
        tags: ['climate', 'geography', 'environment', 'symptoms']
      });
    }

    // 3. Treatment Effectiveness Analysis
    const treatmentAnalysis = analyzeTreatmentEffectiveness(profiles);
    if (treatmentAnalysis.length > 0) {
      patterns.push(...treatmentAnalysis);
      
      insights.push({
        insight_type: 'treatment_effectiveness',
        title: 'Most Effective Treatment Combinations',
        description: 'Community data reveals which supplements and medications are most commonly reported as helpful.',
        data_summary: treatmentAnalysis[0]?.pattern_data || {},
        participant_count: treatmentAnalysis[0]?.participant_count || 0,
        tags: ['treatments', 'supplements', 'medications', 'effectiveness']
      });
    }

    // 4. Trigger Pattern Analysis
    const triggerAnalysis = analyzeTriggerPatterns(profiles);
    if (triggerAnalysis.length > 0) {
      patterns.push(...triggerAnalysis);
      
      insights.push({
        insight_type: 'trigger_patterns',
        title: 'Common Trigger Combinations',
        description: 'Identifies the most frequently reported trigger combinations across the community.',
        data_summary: triggerAnalysis[0]?.pattern_data || {},
        participant_count: triggerAnalysis[0]?.participant_count || 0,
        tags: ['triggers', 'patterns', 'foods', 'environment']
      });
    }

    // Save patterns to database
    if (patterns.length > 0) {
      const { error: patternsError } = await supabase
        .from('analytics_patterns')
        .upsert(patterns.map(pattern => ({
          ...pattern,
          is_published: true
        })));

      if (patternsError) {
        console.error('Error saving patterns:', patternsError);
      } else {
        console.log(`Saved ${patterns.length} analytics patterns`);
      }
    }

    // Save insights to database
    if (insights.length > 0) {
      const { error: insightsError } = await supabase
        .from('community_insights')
        .upsert(insights.map(insight => ({
          ...insight,
          date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          date_range_end: new Date().toISOString().split('T')[0],
          is_featured: true
        })));

      if (insightsError) {
        console.error('Error saving insights:', insightsError);
      } else {
        console.log(`Saved ${insights.length} community insights`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics processing completed successfully',
        patterns_generated: patterns.length,
        insights_generated: insights.length,
        participant_count: profiles.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Analytics processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Analytics processing failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeDemographicSymptoms(profiles: Profile[]): AnalyticsPattern[] {
  const patterns: AnalyticsPattern[] = [];
  
  // Age range analysis
  const ageGroups = groupBy(profiles, 'age_range');
  for (const [ageRange, ageProfiles] of Object.entries(ageGroups)) {
    if (ageProfiles.length < 5) continue; // Need minimum sample size
    
    const symptomCounts = countArrayItems(ageProfiles, 'primary_symptoms');
    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topSymptoms.length > 0) {
      patterns.push({
        pattern_type: 'age_symptom_correlation',
        pattern_data: {
          demographic_factor: `Age Range: ${ageRange}`,
          top_symptoms: topSymptoms,
          sample_demographics: {
            age_range: ageRange,
            participant_count: ageProfiles.length
          }
        },
        participant_count: ageProfiles.length,
        confidence_score: Math.min(ageProfiles.length / 20, 1) // Higher confidence with more data
      });
    }
  }
  
  // Sex-based analysis
  const sexGroups = groupBy(profiles, 'sex');
  for (const [sex, sexProfiles] of Object.entries(sexGroups)) {
    if (sexProfiles.length < 5 || sex === 'Prefer not to say') continue;
    
    const symptomCounts = countArrayItems(sexProfiles, 'primary_symptoms');
    const topSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topSymptoms.length > 0) {
      patterns.push({
        pattern_type: 'sex_symptom_correlation',
        pattern_data: {
          demographic_factor: `Sex: ${sex}`,
          top_symptoms: topSymptoms,
          sample_demographics: {
            sex: sex,
            participant_count: sexProfiles.length
          }
        },
        participant_count: sexProfiles.length,
        confidence_score: Math.min(sexProfiles.length / 20, 1)
      });
    }
  }
  
  return patterns;
}

function analyzeClimatePatterns(profiles: Profile[]): AnalyticsPattern[] {
  const climateGroups = groupBy(profiles, 'climate_type');
  const patterns: AnalyticsPattern[] = [];
  
  for (const [climate, climateProfiles] of Object.entries(climateGroups)) {
    if (climateProfiles.length < 5) continue;
    
    // Analyze symptom severity by climate
    const severityCounts = groupBy(climateProfiles, 'symptom_severity');
    const weatherTriggers = countArrayItems(climateProfiles, 'weather_triggers');
    
    patterns.push({
      pattern_type: 'climate_symptom_pattern',
      pattern_data: {
        climate_type: climate,
        severity_distribution: severityCounts,
        common_weather_triggers: Object.entries(weatherTriggers)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        geographic_data: {
          countries: [...new Set(climateProfiles.map(p => p.location_country).filter(Boolean))]
        }
      },
      participant_count: climateProfiles.length,
      confidence_score: Math.min(climateProfiles.length / 15, 1)
    });
  }
  
  return patterns;
}

function analyzeTreatmentEffectiveness(profiles: Profile[]): AnalyticsPattern[] {
  const helpfulSupplements = countArrayItems(profiles, 'helpful_supplements');
  const helpfulMedications = countArrayItems(profiles, 'helpful_medications');
  
  const topSupplements = Object.entries(helpfulSupplements)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  const topMedications = Object.entries(helpfulMedications)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  return [{
    pattern_type: 'treatment_effectiveness_ranking',
    pattern_data: {
      most_helpful_supplements: topSupplements,
      most_helpful_medications: topMedications,
      analysis_methodology: 'Frequency-based ranking of user-reported helpful treatments'
    },
    participant_count: profiles.length,
    confidence_score: Math.min(profiles.length / 30, 1)
  }];
}

function analyzeTriggerPatterns(profiles: Profile[]): AnalyticsPattern[] {
  const foodTriggers = countArrayItems(profiles, 'trigger_foods');
  const weatherTriggers = countArrayItems(profiles, 'weather_triggers');
  const stressTriggers = countArrayItems(profiles, 'stress_triggers');
  
  const topFoodTriggers = Object.entries(foodTriggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  const topWeatherTriggers = Object.entries(weatherTriggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const topStressTriggers = Object.entries(stressTriggers)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  return [{
    pattern_type: 'trigger_frequency_analysis',
    pattern_data: {
      most_common_food_triggers: topFoodTriggers,
      most_common_weather_triggers: topWeatherTriggers,
      most_common_stress_triggers: topStressTriggers,
      trigger_categories: {
        food: topFoodTriggers.length,
        weather: topWeatherTriggers.length,
        stress: topStressTriggers.length
      }
    },
    participant_count: profiles.length,
    confidence_score: Math.min(profiles.length / 25, 1)
  }];
}

// Utility functions
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = item[key];
    const groupKey = value?.toString() || 'Unknown';
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

function countArrayItems<T>(array: T[], key: keyof T): Record<string, number> {
  const counts: Record<string, number> = {};
  
  for (const item of array) {
    const values = item[key] as string[] | undefined;
    if (Array.isArray(values)) {
      for (const value of values) {
        counts[value] = (counts[value] || 0) + 1;
      }
    }
  }
  
  return counts;
}