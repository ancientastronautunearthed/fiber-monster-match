import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { Flame, Zap, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStreakCardProps {
  className?: string;
  compact?: boolean;
}

export const DailyStreakCard = ({ className, compact = false }: DailyStreakCardProps) => {
  const { 
    streak, 
    loading, 
    checkDailyLogin, 
    getStreakMessage, 
    canClaimDaily,
    calculateStreakBonus 
  } = useDailyStreak();

  const handleClaimDaily = async () => {
    const result = await checkDailyLogin();
    if (result?.success) {
      // Success is handled by the hook's toast
    }
  };

  const nextStreakBonus = calculateStreakBonus(streak.currentStreak);
  const progressToNext = streak.currentStreak > 0 ? ((streak.currentStreak % 7) / 7) * 100 : 0;

  if (compact) {
    return (
      <Card className={cn('bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-bold text-orange-700 dark:text-orange-300">
                  {streak.currentStreak} Day Streak
                </div>
                <div className="text-xs text-muted-foreground">
                  Next: +{nextStreakBonus + 5} Light
                </div>
              </div>
            </div>
            
            {canClaimDaily() && (
              <Button 
                size="sm"
                onClick={handleClaimDaily}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {loading ? 'Claiming...' : 'Claim'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Flame className="h-5 w-5" />
          Daily Defiance
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <span className="text-4xl font-bold text-orange-700 dark:text-orange-300">
              {streak.currentStreak}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {streak.currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
          </p>
        </div>

        {/* Streak Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-medium">{streak.currentStreak % 7}/7 days</span>
          </div>
          <Progress value={progressToNext} className="h-2" />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">{streak.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-black/20">
            <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
            <div className="text-lg font-bold text-foreground">+{10 + nextStreakBonus}</div>
            <div className="text-xs text-muted-foreground">Next Reward</div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {getStreakMessage()}
          </p>
        </div>

        {/* Action Button */}
        {canClaimDaily() ? (
          <Button 
            onClick={handleClaimDaily}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            size="lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {loading ? 'Claiming Daily Light...' : `Claim +${10 + nextStreakBonus} Light`}
          </Button>
        ) : (
          <div className="text-center">
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              ✓ Today's Light Claimed
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Come back tomorrow to continue your streak!
            </p>
          </div>
        )}

        {/* Streak Bonus Info */}
        <div className="text-xs text-muted-foreground text-center">
          <p>Daily bonus increases by +5 Light per consecutive day (max +30)</p>
        </div>
      </CardContent>
    </Card>
  );
};