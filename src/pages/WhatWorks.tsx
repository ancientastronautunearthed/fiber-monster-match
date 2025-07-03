import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Heart, ArrowLeft, Search, Star, DollarSign, Clock, AlertTriangle, BookOpen, Plus } from 'lucide-react';

interface ReliefStrategy {
  id: string;
  strategy_type: string;
  title: string;
  description: string;
  effectiveness_rating: number;
  duration_used: string | null;
  cost_level: string | null;
  accessibility: string | null;
  side_effects: string | null;
  additional_notes: string | null;
  created_at: string;
}

const WhatWorks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<ReliefStrategy[]>([]);
  const [filteredStrategies, setFilteredStrategies] = useState<ReliefStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [effectivenessFilter, setEffectivenessFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');

  useEffect(() => {
    fetchStrategies();
  }, []);

  useEffect(() => {
    filterStrategies();
  }, [strategies, searchTerm, typeFilter, effectivenessFilter, costFilter]);

  const fetchStrategies = async () => {
    const { data, error } = await supabase
      .from('relief_strategies')
      .select('*')
      .eq('is_approved', true)
      .order('effectiveness_rating', { ascending: false });

    if (error) {
      console.error('Error fetching strategies:', error);
      toast({
        title: "Error",
        description: "Failed to load relief strategies. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setStrategies(data || []);
    setLoading(false);
  };

  const filterStrategies = () => {
    let filtered = strategies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(strategy =>
        strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        strategy.additional_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(strategy => strategy.strategy_type === typeFilter);
    }

    // Effectiveness filter
    if (effectivenessFilter !== 'all') {
      const rating = parseInt(effectivenessFilter);
      filtered = filtered.filter(strategy => strategy.effectiveness_rating >= rating);
    }

    // Cost filter
    if (costFilter !== 'all') {
      filtered = filtered.filter(strategy => strategy.cost_level === costFilter);
    }

    setFilteredStrategies(filtered);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      medical: '🏥',
      lifestyle: '🌱',
      mental_health: '🧠',
      alternative: '🌿',
      dietary: '🍎',
      environmental: '🏠',
      social: '👥',
      other: '💡'
    };
    return icons[type as keyof typeof icons] || '💡';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      medical: 'bg-blue-100 text-blue-700 border-blue-200',
      lifestyle: 'bg-green-100 text-green-700 border-green-200',
      mental_health: 'bg-purple-100 text-purple-700 border-purple-200',
      alternative: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dietary: 'bg-orange-100 text-orange-700 border-orange-200',
      environmental: 'bg-teal-100 text-teal-700 border-teal-200',
      social: 'bg-pink-100 text-pink-700 border-pink-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getCostIcon = (cost: string | null) => {
    const costs = {
      free: '🆓',
      low: '💸',
      moderate: '💰',
      high: '💳'
    };
    return costs[cost as keyof typeof costs] || '';
  };

  const getAccessibilityText = (accessibility: string | null) => {
    const texts = {
      very_easy: 'Very Easy',
      easy: 'Easy',
      moderate: 'Moderate',
      difficult: 'Difficult',
      very_difficult: 'Very Difficult'
    };
    return texts[accessibility as keyof typeof texts] || 'Unknown';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-pink-500" />
              <h1 className="text-xl font-bold">What Works</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">
              {filteredStrategies.length} relief strategies
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Community Relief Knowledge Base</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover what has genuinely helped others find relief. This anonymous collection of strategies, 
            treatments, and lifestyle changes comes from real community members sharing what works.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="medical">🏥 Medical</SelectItem>
                  <SelectItem value="lifestyle">🌱 Lifestyle</SelectItem>
                  <SelectItem value="mental_health">🧠 Mental Health</SelectItem>
                  <SelectItem value="alternative">🌿 Alternative</SelectItem>
                  <SelectItem value="dietary">🍎 Dietary</SelectItem>
                  <SelectItem value="environmental">🏠 Environmental</SelectItem>
                  <SelectItem value="social">👥 Social</SelectItem>
                  <SelectItem value="other">💡 Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={effectivenessFilter} onValueChange={setEffectivenessFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={costFilter} onValueChange={setCostFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Costs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Costs</SelectItem>
                  <SelectItem value="free">🆓 Free</SelectItem>
                  <SelectItem value="low">💸 Low Cost</SelectItem>
                  <SelectItem value="moderate">💰 Moderate Cost</SelectItem>
                  <SelectItem value="high">💳 High Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {filteredStrategies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters to find relief strategies.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStrategies.map((strategy) => (
              <Card key={strategy.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(strategy.strategy_type)}</span>
                        <CardTitle className="text-xl">{strategy.title}</CardTitle>
                        <Badge className={getTypeColor(strategy.strategy_type)}>
                          {strategy.strategy_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          {renderStars(strategy.effectiveness_rating)}
                          <span className="ml-1 text-muted-foreground">
                            ({strategy.effectiveness_rating}/5)
                          </span>
                        </div>
                        {strategy.cost_level && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <span>{getCostIcon(strategy.cost_level)}</span>
                            {strategy.cost_level}
                          </Badge>
                        )}
                        {strategy.duration_used && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {strategy.duration_used}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {strategy.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {strategy.accessibility && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Accessibility</h4>
                        <p className="text-sm text-muted-foreground">
                          {getAccessibilityText(strategy.accessibility)}
                        </p>
                      </div>
                    )}
                    
                    {strategy.side_effects && (
                      <div>
                        <h4 className="font-semibold text-sm mb-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Side Effects
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {strategy.side_effects}
                        </p>
                      </div>
                    )}
                  </div>

                  {strategy.additional_notes && (
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground italic">
                        "{strategy.additional_notes}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Strategy Button */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <Plus className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-semibold mb-2">Share What Works for You</h3>
              <p className="text-muted-foreground mb-6">
                Help others by sharing a strategy that has genuinely helped you find relief.
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                size="lg"
                onClick={() => {
                  toast({
                    title: "Coming Soon!",
                    description: "The ability to add new strategies will be available soon."
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your Strategy
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WhatWorks;