import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TierBadge } from '@/components/TierBadge';
import { LightCounter } from '@/components/LightCounter';
import { TierProgress } from '@/components/TierProgress';
import { AchievementCard } from '@/components/AchievementCard';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Trophy, Zap, Star, Target } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  rarity: string;
  icon_url?: string;
}

interface UserTier {
  current_tier: number;
  total_light: number;
  tier_achieved_at: string;
}

const Achievements = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user tier
      const { data: tierData, error: tierError } = await supabase
        .from('user_tiers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (tierError && tierError.code !== 'PGRST116') throw tierError;

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id);

      if (userAchievementsError) throw userAchievementsError;

      setAchievements(achievementsData || []);
      setUserTier(tierData);
      setUserAchievements(userAchievementsData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementProgress = (achievement: Achievement) => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return userAchievement?.progress_value || 0;
  };

  const isAchievementUnlocked = (achievement: Achievement) => {
    return userAchievements.some(ua => ua.achievement_id === achievement.id);
  };

  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const categoryLabels = {
    'community_support': 'Community & Support',
    'direct_interaction': 'Direct Interaction',
    'personal_growth': 'Personal Growth',
    'active_gamification': 'Active Gamification'
  };

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <header className="bg-background/80 backdrop-blur border-b border-border p-4">
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
              <Trophy className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Resistance Achievements</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LightCounter 
            totalLight={userTier?.total_light || 0}
            variant="detailed"
          />
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Achievement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {unlockedCount}/{totalCount}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {Math.round(completionPercentage)}% Complete
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {totalCount - unlockedCount} remaining
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <TierProgress 
            currentTier={userTier?.current_tier || 1}
            totalLight={userTier?.total_light || 0}
          />
        </div>

        {/* Achievements by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="community_support">Community</TabsTrigger>
                <TabsTrigger value="direct_interaction">Social</TabsTrigger>
                <TabsTrigger value="personal_growth">Growth</TabsTrigger>
                <TabsTrigger value="active_gamification">Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-6">
                  {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold mb-3">
                        {categoryLabels[category as keyof typeof categoryLabels] || category}
                      </h3>
                      <div className="grid gap-4">
                        {categoryAchievements.map((achievement) => (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            progress={getAchievementProgress(achievement)}
                            isUnlocked={isAchievementUnlocked(achievement)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
                <TabsContent key={category} value={category} className="mt-6">
                  <div className="grid gap-4">
                    {categoryAchievements.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        achievement={achievement}
                        progress={getAchievementProgress(achievement)}
                        isUnlocked={isAchievementUnlocked(achievement)}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Achievements;