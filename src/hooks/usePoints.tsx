import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PointsTransaction {
  id: string;
  action_type: string;
  points_amount: number;
  source_id?: string;
  source_type?: string;
  metadata: any;
  created_at: string;
}

interface UserTier {
  current_tier: number;
  total_light: number;
  tier_achieved_at: string;
}

interface DailyActivity {
  activity_date: string;
  activities_completed: any;
  daily_light_earned: number;
  streak_bonus: number;
}

export const usePoints = () => {
  const { user } = useAuth();
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's current points and tier data
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get user tier
      const { data: tierData, error: tierError } = await supabase
        .from('user_tiers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (tierError && tierError.code !== 'PGRST116') {
        throw tierError;
      }

      // Get recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      setUserTier(tierData);
      setRecentTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Award points for an action
  const awardLight = useCallback(async (
    actionType: string,
    pointsAmount: number,
    sourceId?: string,
    sourceType?: string,
    metadata: any = {}
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // Create points transaction
      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          action_type: actionType,
          points_amount: pointsAmount,
          source_id: sourceId,
          source_type: sourceType,
          metadata
        });

      if (transactionError) throw transactionError;

      // Update user tier with new total
      const newTotal = (userTier?.total_light || 0) + pointsAmount;
      const { error: tierError } = await supabase
        .from('user_tiers')
        .upsert({
          user_id: user.id,
          total_light: newTotal
        });

      if (tierError) throw tierError;

      // Check for achievements
      await checkAchievements(actionType, pointsAmount, metadata);

      // Refresh data
      await fetchUserData();

      // Show success toast
      toast({
        title: "Light Earned!",
        description: `+${pointsAmount} Light for ${getActionTitle(actionType)}`,
        duration: 3000,
      });

      return { success: true };
    } catch (error) {
      console.error('Error awarding light:', error);
      return { success: false, error: error.message };
    }
  }, [user, userTier, fetchUserData]);

  // Check for achievement unlocks
  const checkAchievements = useCallback(async (
    actionType: string,
    pointsAmount: number,
    metadata: any
  ) => {
    if (!user) return;

    try {
      // Get user's current achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];

      // Get all achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(${unlockedIds.join(',') || 'null'})`);

      // Check each achievement
      for (const achievement of achievements || []) {
        const shouldUnlock = await checkAchievementCondition(achievement, actionType, metadata);
        
        if (shouldUnlock) {
          await unlockAchievement(achievement.id, achievement.points_reward);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  }, [user]);

  // Check if achievement condition is met
  const checkAchievementCondition = async (achievement: any, actionType: string, metadata: any) => {
    // Implementation depends on achievement type
    switch (achievement.requirement_type) {
      case 'login_streak':
        return metadata.streak >= achievement.requirement_value;
      case 'tips_shared':
        return actionType === 'forbidden_knowledge';
      case 'profile_completion':
        return actionType === 'forge_armor' && metadata.completion_percentage >= achievement.requirement_value;
      default:
        return false;
    }
  };

  // Unlock an achievement
  const unlockAchievement = async (achievementId: string, pointsReward: number) => {
    try {
      // Add achievement to user
      const { error: achievementError } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId
        });

      if (achievementError) throw achievementError;

      // Award points for achievement
      await awardLight('achievement_unlock', pointsReward, achievementId, 'achievement');

      toast({
        title: "Achievement Unlocked! 🏆",
        description: `You've earned +${pointsReward} Light!`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  // Get human-readable action titles
  const getActionTitle = (actionType: string): string => {
    const titles: Record<string, string> = {
      'daily_defiance': 'Daily Login',
      'forbidden_knowledge': 'Sharing Knowledge',
      'beacon_hope': 'Supporting Others',
      'silence_whispers': 'Community Engagement',
      'forge_armor': 'Profile Completion',
      'achievement_unlock': 'Achievement Unlock'
    };
    return titles[actionType] || actionType;
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userTier,
    recentTransactions,
    loading,
    awardLight,
    fetchUserData,
    getActionTitle
  };
};