import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';
import { supabase } from '@/integrations/supabase/client';

interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  todayCompleted: boolean;
}

export const useDailyStreak = () => {
  const { user } = useAuth();
  const { awardLight } = usePoints();
  const [streak, setStreak] = useState<DailyStreak>({
    currentStreak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    todayCompleted: false
  });
  const [loading, setLoading] = useState(false);

  // Calculate streak bonus (max +30 for 6+ days)
  const calculateStreakBonus = (streakDays: number): number => {
    return Math.min(streakDays * 5, 30);
  };

  // Check and update daily login
  const checkDailyLogin = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Get today's activity record
      const { data: todayActivity, error: todayError } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      if (todayError) throw todayError;

      // If already logged in today, just return current streak
      if (todayActivity) {
        await fetchStreakData();
        return { alreadyCompleted: true };
      }

      // Get yesterday's date to check streak continuity
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      // Get yesterday's activity to check streak
      const { data: yesterdayActivity } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', yesterdayDate)
        .maybeSingle();

      // Get current streak from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count, longest_streak')
        .eq('user_id', user.id)
        .single();

      let currentStreak = 1; // Starting fresh or continuing
      let longestStreak = profile?.longest_streak || 0;

      // If there was activity yesterday, continue the streak
      if (yesterdayActivity) {
        currentStreak = (profile?.streak_count || 0) + 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Calculate points: base 10 + streak bonus
      const basePoints = 10;
      const streakBonus = calculateStreakBonus(currentStreak - 1); // Previous days count for bonus
      const totalPoints = basePoints + streakBonus;

      // Create daily activity record
      const { error: activityError } = await supabase
        .from('daily_activities')
        .insert({
          user_id: user.id,
          activity_date: today,
          activities_completed: {
            daily_login: true,
            login_time: new Date().toISOString()
          },
          daily_light_earned: totalPoints,
          streak_bonus: streakBonus
        });

      if (activityError) throw activityError;

      // Update profile with new streak
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          streak_count: currentStreak,
          longest_streak: longestStreak,
          last_active_date: today
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Award light points
      await awardLight('daily_defiance', totalPoints, null, 'daily_login', {
        streak: currentStreak,
        streak_bonus: streakBonus,
        base_points: basePoints
      });

      // Update local state
      setStreak({
        currentStreak,
        longestStreak,
        lastLoginDate: today,
        todayCompleted: true
      });

      return {
        success: true,
        currentStreak,
        pointsEarned: totalPoints,
        streakBonus,
        isNewRecord: currentStreak > (profile?.longest_streak || 0)
      };

    } catch (error) {
      console.error('Error checking daily login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user, awardLight]);

  // Fetch current streak data
  const fetchStreakData = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('streak_count, longest_streak, last_active_date')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivity } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .maybeSingle();

      setStreak({
        currentStreak: profile?.streak_count || 0,
        longestStreak: profile?.longest_streak || 0,
        lastLoginDate: profile?.last_active_date || null,
        todayCompleted: !!todayActivity
      });
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  }, [user]);

  // Get streak status message
  const getStreakMessage = (): string => {
    if (streak.todayCompleted) {
      return `🔥 ${streak.currentStreak} day streak! Come back tomorrow to continue.`;
    }
    
    if (streak.currentStreak > 0) {
      return `🔥 ${streak.currentStreak} day streak. Log in to continue!`;
    }
    
    return "Start your daily resistance! Log in every day to earn bonus Light.";
  };

  // Check if user can claim daily bonus
  const canClaimDaily = (): boolean => {
    return !streak.todayCompleted && !!user;
  };

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user, fetchStreakData]);

  // Auto-check daily login when component mounts
  useEffect(() => {
    if (user && !streak.todayCompleted) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        checkDailyLogin();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, checkDailyLogin, streak.todayCompleted]);

  return {
    streak,
    loading,
    checkDailyLogin,
    fetchStreakData,
    getStreakMessage,
    canClaimDaily,
    calculateStreakBonus
  };
};