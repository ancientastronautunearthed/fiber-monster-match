import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { Heart, MessageSquare, Users, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunityActionsCardProps {
  className?: string;
}

const ACTION_ICONS = {
  beacon_hope: Heart,
  silence_whispers: MessageSquare,
  reinforce_resistance: Users,
  expose_deceit: ThumbsUp
};

const ACTION_COLORS = {
  beacon_hope: 'text-pink-500',
  silence_whispers: 'text-blue-500', 
  reinforce_resistance: 'text-purple-500',
  expose_deceit: 'text-green-500'
};

export const CommunityActionsCard = ({ className }: CommunityActionsCardProps) => {
  const { 
    actions, 
    loading, 
    canPerformAction, 
    getRemainingActions,
    supportUser,
    reactToVent,
    welcomeNewMember,
    upvoteResearch
  } = useCommunityActions();

  const handleQuickAction = async (actionType: string) => {
    // These would typically be called from specific contexts
    // For demo purposes, we'll show how they could be used
    switch (actionType) {
      case 'beacon_hope':
        console.log('Would support a user in symptom flare');
        break;
      case 'silence_whispers':
        console.log('Would react to a vent post');
        break;
      case 'reinforce_resistance':
        console.log('Would welcome a new member');
        break;
      case 'expose_deceit':
        console.log('Would upvote research');
        break;
    }
  };

  return (
    <Card className={cn('bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <Users className="h-5 w-5" />
          Community Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center mb-4">
          Support the resistance through daily community engagement
        </div>

        {Object.entries(actions).map(([actionType, action]) => {
          const Icon = ACTION_ICONS[actionType as keyof typeof ACTION_ICONS];
          const iconColor = ACTION_COLORS[actionType as keyof typeof ACTION_COLORS];
          const remaining = getRemainingActions(actionType);
          const canPerform = canPerformAction(actionType);

          return (
            <div 
              key={actionType}
              className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-white/50 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icon className={cn('h-5 w-5 flex-shrink-0', iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{action.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      +{action.light_per_action} Light
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {action.daily_count}/{action.max_daily} today
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {remaining > 0 ? (
                  <Badge variant="secondary" className="text-xs">
                    {remaining} left
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Complete
                  </Badge>
                )}
                
                <Button
                  size="sm"
                  variant={canPerform ? "default" : "secondary"}
                  disabled={!canPerform || loading}
                  onClick={() => handleQuickAction(actionType)}
                  className="text-xs px-2"
                >
                  {canPerform ? 'Engage' : 'Done'}
                </Button>
              </div>
            </div>
          );
        })}

        {/* Quick Stats */}
        <div className="mt-6 p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
          <div className="text-center">
            <div className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
              Today's Community Impact
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  {Object.values(actions).reduce((sum, action) => sum + action.daily_count, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Actions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                  {Object.values(actions).reduce((sum, action) => sum + (action.daily_count * action.light_per_action), 0)}
                </div>
                <div className="text-xs text-muted-foreground">Light Earned</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Daily limits reset at midnight. Engage authentically to build the resistance!
        </div>
      </CardContent>
    </Card>
  );
};