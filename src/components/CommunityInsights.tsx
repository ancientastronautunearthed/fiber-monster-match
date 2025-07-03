import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Pill, 
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';

interface CommunityInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  data_summary: any;
  participant_count: number;
  date_range_start: string;
  date_range_end: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'demographic_correlation': return Users;
    case 'climate_analysis': return MapPin;
    case 'treatment_effectiveness': return Pill;
    case 'trigger_patterns': return AlertTriangle;
    default: return BarChart3;
  }
};

const getInsightColor = (type: string) => {
  switch (type) {
    case 'demographic_correlation': return 'bg-blue-100 text-blue-800';
    case 'climate_analysis': return 'bg-green-100 text-green-800';
    case 'treatment_effectiveness': return 'bg-purple-100 text-purple-800';
    case 'trigger_patterns': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const CommunityInsights = () => {
  const [insights, setInsights] = useState<CommunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAnalytics, setProcessingAnalytics] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('community_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load community insights.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = async () => {
    setProcessingAnalytics(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-analytics');

      if (error) throw error;

      toast({
        title: "Analytics Updated",
        description: `Generated ${data.insights_generated} new insights from ${data.participant_count} participants.`
      });

      // Refresh insights
      await fetchInsights();
    } catch (error) {
      console.error('Error processing analytics:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process community analytics.",
        variant: "destructive"
      });
    } finally {
      setProcessingAnalytics(false);
    }
  };

  const renderDataSummary = (insight: CommunityInsight) => {
    const data = insight.data_summary;
    
    switch (insight.insight_type) {
      case 'treatment_effectiveness':
        return (
          <div className="space-y-3">
            {data.most_helpful_supplements && (
              <div>
                <h4 className="text-sm font-medium mb-2">Most Helpful Supplements:</h4>
                <div className="space-y-1">
                  {data.most_helpful_supplements.slice(0, 5).map(([name, count]: [string, number]) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span>{name}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / data.most_helpful_supplements[0][1]) * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'trigger_patterns':
        return (
          <div className="space-y-3">
            {data.most_common_food_triggers && (
              <div>
                <h4 className="text-sm font-medium mb-2">Most Common Food Triggers:</h4>
                <div className="flex flex-wrap gap-1">
                  {data.most_common_food_triggers.slice(0, 6).map(([name, count]: [string, number]) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      {name} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'demographic_correlation':
        return (
          <div className="space-y-3">
            {data.top_symptoms && (
              <div>
                <h4 className="text-sm font-medium mb-2">
                  Top Symptoms for {data.demographic_factor}:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {data.top_symptoms.slice(0, 5).map(([symptom, count]: [string, number]) => (
                    <Badge key={symptom} variant="secondary" className="text-xs">
                      {symptom} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'climate_analysis':
        return (
          <div className="space-y-3">
            {data.common_weather_triggers && (
              <div>
                <h4 className="text-sm font-medium mb-2">Weather Triggers by Climate:</h4>
                <div className="flex flex-wrap gap-1">
                  {data.common_weather_triggers.slice(0, 4).map(([trigger, count]: [string, number]) => (
                    <Badge key={trigger} variant="outline" className="text-xs">
                      {trigger} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Detailed analysis available with {insight.participant_count} participants
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading community insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Insights</h2>
          <p className="text-muted-foreground">
            Anonymous patterns and trends from our community data
          </p>
        </div>
        <Button 
          onClick={processAnalytics}
          disabled={processingAnalytics}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${processingAnalytics ? 'animate-spin' : ''}`} />
          {processingAnalytics ? 'Processing...' : 'Refresh Analytics'}
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Insights Available Yet</h3>
            <p className="text-muted-foreground mb-4">
              Community insights will be generated once we have enough anonymized data from consenting users.
            </p>
            <Button onClick={processAnalytics} disabled={processingAnalytics}>
              <RefreshCw className={`h-4 w-4 mr-2 ${processingAnalytics ? 'animate-spin' : ''}`} />
              Generate Analytics
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {insights.map((insight) => {
            const Icon = getInsightIcon(insight.insight_type);
            
            return (
              <Card key={insight.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    {insight.is_featured && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{insight.participant_count} participants</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getInsightColor(insight.insight_type)}
                      >
                        {insight.insight_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {renderDataSummary(insight)}

                  <div className="flex flex-wrap gap-1 pt-2">
                    {insight.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Privacy & Ethics</h3>
              <p className="text-sm text-blue-800 mb-3">
                All insights are generated from completely anonymized data. Individual users cannot be 
                identified from these patterns. Only participants who have explicitly consented to data 
                sharing are included in these analyses.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-white">Anonymous</Badge>
                <Badge variant="outline" className="text-xs bg-white">Consented</Badge>
                <Badge variant="outline" className="text-xs bg-white">Aggregated</Badge>
                <Badge variant="outline" className="text-xs bg-white">Research Use</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};