import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupportActionsProps {
  targetUserId?: string;
  targetContentId?: string;
  contentType?: 'post' | 'strategy' | 'vent' | 'general';
  className?: string;
}

export const SupportActions = ({ 
  targetUserId, 
  targetContentId, 
  contentType = 'general',
  className 
}: SupportActionsProps) => {
  const { 
    supportUser, 
    reactToVent, 
    upvoteResearch,
    canPerformAction,
    getRemainingActions,
    loading 
  } = useCommunityActions();

  const handleSupportUser = async () => {
    if (!targetUserId) return;
    
    const result = await supportUser(targetUserId, contentType);
    if (result.success) {
      // Success feedback is handled by the hook
    }
  };

  const handleReactToVent = async () => {
    if (!targetContentId) return;
    
    const result = await reactToVent(targetContentId, 'support');
    if (result.success) {
      // Success feedback is handled by the hook
    }
  };

  const handleUpvoteStrategy = async () => {
    if (!targetContentId) return;
    
    const result = await upvoteResearch(targetContentId);
    if (result.success) {
      // Success feedback is handled by the hook
    }
  };

  if (contentType === 'vent') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleReactToVent}
        disabled={!canPerformAction('silence_whispers') || loading}
        className={cn('flex items-center gap-2', className)}
      >
        <MessageCircle className="h-4 w-4" />
        Silence Whispers
        {canPerformAction('silence_whispers') && (
          <Badge variant="secondary" className="text-xs ml-1">
            +5 Light ({getRemainingActions('silence_whispers')} left)
          </Badge>
        )}
      </Button>
    );
  }

  if (contentType === 'strategy') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={handleUpvoteStrategy}
        disabled={!canPerformAction('expose_deceit') || loading}
        className={cn('flex items-center gap-2', className)}
      >
        <HelpCircle className="h-4 w-4" />
        Expose Deceit
        {canPerformAction('expose_deceit') && (
          <Badge variant="secondary" className="text-xs ml-1">
            +5 Light ({getRemainingActions('expose_deceit')} left)
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleSupportUser}
      disabled={!canPerformAction('beacon_hope') || loading}
      className={cn('flex items-center gap-2', className)}
    >
      <Heart className="h-4 w-4" />
      Beacon of Hope
      {canPerformAction('beacon_hope') && (
        <Badge variant="secondary" className="text-xs ml-1">
          +10 Light ({getRemainingActions('beacon_hope')} left)
        </Badge>
      )}
    </Button>
  );
};