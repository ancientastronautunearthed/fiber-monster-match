import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePoints } from '@/hooks/usePoints';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { useCommunityActions } from '@/hooks/useCommunityActions';
import { Trophy, Zap, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsSummaryProps {
  className?: string;
  showDetails?: boolean;
}

export const PointsSummary = ({ className, showDetails = true }: PointsSummaryProps) => {
  const { userTier, recentTransactions } = usePoints();
  const { streak } = useDailyStreak();
  const { actions } = useCommunityActions();

  // Calculate today's earnings
  const today = new Date().toISOString().split('T')[0];
  const todaysEarnings = recentTransactions
    .filter(t => t.created_at.startsWith(today))
    .reduce((sum, t) => sum + t.points_amount, 0);

  // Calculate community actions completed today
  const todaysCommunityActions = Object.values(actions)
    .reduce((sum, action) => sum + action.daily_count, 0);

  const todaysCommunityLight = Object.values(actions)
    .reduce((sum, action) => sum + (action.daily_count * action.light_per_action), 0);

  if (!showDetails) {
    return (
      <Card className={cn('bg-gradient-to-r from-primary/5 to-primary/10', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold text-primary">
                {userTier?.total_light || 0} Light
              </span>
            </div>
            {todaysEarnings > 0 && (
              <Badge variant="secondary" className="text-emerald-600">
                +{todaysEarnings} today
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Trophy className="h-5 w-5" />
          Today's Resistance Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Today's Earnings */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">Light Earned Today</span>
          </div>
          <Badge className="bg-emerald-600 text-white">
            +{todaysEarnings}
          </Badge>
        </div>

        {/* Streak Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="font-medium">Daily Streak</span>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            {streak.currentStreak} days
          </Badge>
        </div>

        {/* Community Actions */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="font-medium">Community Actions</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {todaysCommunityActions} actions
            </Badge>
            <Badge className="bg-purple-600 text-white">
              +{todaysCommunityLight}
            </Badge>
          </div>
        </div>

        {/* Recent Activities */}
        {recentTransactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Recent Activities</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/50">
                  <span className="capitalize">
                    {transaction.action_type.replace(/_/g, ' ')}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    +{transaction.points_amount}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Encouragement Message */}
        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/30">
          <p className="text-sm text-foreground">
            {todaysEarnings === 0 
              ? "Start earning Light by engaging with the community!"
              : `Great work! You've earned ${todaysEarnings} Light today.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};