import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, Lock, CheckCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AchievementCardProps {
  achievement: Achievement;
  progress?: number;
  isUnlocked?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY_CONFIG = {
  common: {
    bg: 'bg-slate-50 dark:bg-slate-950',
    border: 'border-slate-200 dark:border-slate-800',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    icon: 'text-slate-600'
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300',
    icon: 'text-blue-600'
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300',
    icon: 'text-purple-600'
  },
  legendary: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300',
    icon: 'text-amber-600'
  }
};

export const AchievementCard = ({ 
  achievement, 
  progress = 0, 
  isUnlocked = false,
  className,
  size = 'md'
}: AchievementCardProps) => {
  const rarity = achievement.rarity as keyof typeof RARITY_CONFIG;
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  
  const progressPercentage = Math.min((progress / achievement.requirement_value) * 100, 100);
  
  const isLocked = !isUnlocked && progress < achievement.requirement_value;
  const isComplete = isUnlocked || progress >= achievement.requirement_value;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        config.bg,
        config.border,
        isLocked && 'opacity-60',
        isComplete && 'ring-2 ring-primary/20',
        className
      )}
    >
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start gap-3">
          {/* Achievement Icon */}
          <div className={cn(
            'flex-shrink-0 rounded-full p-2 border-2',
            config.border,
            isComplete ? 'bg-primary/10 border-primary/30' : 'bg-muted/50'
          )}>
            {isComplete ? (
              <CheckCircle className={cn(iconSizes[size], 'text-primary')} />
            ) : isLocked ? (
              <Lock className={cn(iconSizes[size], 'text-muted-foreground')} />
            ) : (
              <Award className={cn(iconSizes[size], config.icon)} />
            )}
          </div>

          {/* Achievement Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className={cn(
                  'font-semibold',
                  size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
                  isLocked && 'text-muted-foreground'
                )}>
                  {achievement.name}
                </h3>
                <p className={cn(
                  'text-muted-foreground',
                  size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                  {achievement.description}
                </p>
              </div>
              
              {/* Rarity Badge */}
              <Badge variant="secondary" className={cn('text-xs flex-shrink-0', config.badge)}>
                {achievement.rarity}
              </Badge>
            </div>

            {/* Progress Bar */}
            {!isComplete && (
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-1.5" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{progress} / {achievement.requirement_value}</span>
                  <span>{Math.round(progressPercentage)}% complete</span>
                </div>
              </div>
            )}

            {/* Reward */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary" />
                <span className={cn(
                  'font-medium text-primary',
                  size === 'sm' ? 'text-xs' : 'text-sm'
                )}>
                  +{achievement.points_reward} Light
                </span>
              </div>
              
              {isComplete && (
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                  ✓ Unlocked
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};