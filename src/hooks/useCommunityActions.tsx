import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePoints } from '@/hooks/usePoints';
import { supabase } from '@/integrations/supabase/client';

interface CommunityAction {
  action_type: string;
  daily_count: number;
  max_daily: number;
  light_per_action: number;
  description: string;
}

const COMMUNITY_ACTIONS: Record<string, CommunityAction> = {
  beacon_hope: {
    action_type: 'beacon_hope',
    daily_count: 0,
    max_daily: 5,
    light_per_action: 10,
    description: 'Send support to users in symptom flare'
  },
  silence_whispers: {
    action_type: 'silence_whispers', 
    daily_count: 0,
    max_daily: 10,
    light_per_action: 5,
    description: 'React to posts in vent channel'
  },
  reinforce_resistance: {
    action_type: 'reinforce_resistance',
    daily_count: 0,
    max_daily: 3,
    light_per_action: 25,
    description: 'Welcome new members (first 3 welcomes)'
  },
  expose_deceit: {
    action_type: 'expose_deceit',
    daily_count: 0,
    max_daily: 10,
    light_per_action: 5,
    description: 'Upvote helpful research links'
  }
};

export const useCommunityActions = () => {
  const { user } = useAuth();
  const { awardLight } = usePoints();
  const [actions, setActions] = useState<Record<string, CommunityAction>>(COMMUNITY_ACTIONS);
  const [loading, setLoading] = useState(false);

  // Fetch today's community actions
  const fetchTodaysActions = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todaysActions, error } = await supabase
        .from('community_actions')
        .select('action_type, daily_count')
        .eq('user_id', user.id)
        .eq('action_date', today);

      if (error) throw error;

      // Update action counts
      const updatedActions = { ...COMMUNITY_ACTIONS };
      todaysActions?.forEach(action => {
        if (updatedActions[action.action_type]) {
          updatedActions[action.action_type].daily_count = action.daily_count;
        }
      });

      setActions(updatedActions);
    } catch (error) {
      console.error('Error fetching community actions:', error);
    }
  }, [user]);

  // Perform a community action
  const performAction = useCallback(async (
    actionType: string,
    targetUserId?: string,
    targetContentId?: string,
    metadata: any = {}
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    const action = actions[actionType];
    if (!action) {
      return { success: false, error: 'Invalid action type' };
    }

    if (action.daily_count >= action.max_daily) {
      return { success: false, error: 'Daily limit reached for this action' };
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Record the community action
      const { data: existingAction } = await supabase
        .from('community_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('action_type', actionType)
        .eq('action_date', today)
        .maybeSingle();

      if (existingAction) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('community_actions')
          .update({
            daily_count: existingAction.daily_count + 1,
            light_earned: existingAction.light_earned + action.light_per_action
          })
          .eq('id', existingAction.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('community_actions')
          .insert({
            user_id: user.id,
            action_type: actionType,
            target_user_id: targetUserId,
            target_content_id: targetContentId,
            light_earned: action.light_per_action,
            daily_count: 1,
            action_date: today
          });

        if (insertError) throw insertError;
      }

      // Award light points
      await awardLight(
        actionType,
        action.light_per_action,
        targetContentId,
        'community_action',
        {
          target_user_id: targetUserId,
          daily_count: (existingAction?.daily_count || 0) + 1,
          ...metadata
        }
      );

      // Refresh action counts
      await fetchTodaysActions();

      return { success: true, pointsEarned: action.light_per_action };
    } catch (error) {
      console.error('Error performing community action:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user, actions, awardLight, fetchTodaysActions]);

  // Check if action is available
  const canPerformAction = (actionType: string): boolean => {
    const action = actions[actionType];
    return action && action.daily_count < action.max_daily;
  };

  // Get remaining actions for today
  const getRemainingActions = (actionType: string): number => {
    const action = actions[actionType];
    return action ? Math.max(0, action.max_daily - action.daily_count) : 0;
  };

  // Special actions for specific features
  const supportUser = useCallback(async (targetUserId: string, supportType: string = 'general') => {
    return await performAction('beacon_hope', targetUserId, undefined, { support_type: supportType });
  }, [performAction]);

  const reactToVent = useCallback(async (postId: string, reactionType: string = 'support') => {
    return await performAction('silence_whispers', undefined, postId, { reaction_type: reactionType });
  }, [performAction]);

  const welcomeNewMember = useCallback(async (newUserId: string) => {
    return await performAction('reinforce_resistance', newUserId, undefined, { welcome_type: 'new_member' });
  }, [performAction]);

  const upvoteResearch = useCallback(async (researchId: string) => {
    return await performAction('expose_deceit', undefined, researchId, { vote_type: 'upvote' });
  }, [performAction]);

  useEffect(() => {
    if (user) {
      fetchTodaysActions();
    }
  }, [user, fetchTodaysActions]);

  return {
    actions,
    loading,
    performAction,
    canPerformAction,
    getRemainingActions,
    supportUser,
    reactToVent,
    welcomeNewMember,
    upvoteResearch,
    fetchTodaysActions
  };
};