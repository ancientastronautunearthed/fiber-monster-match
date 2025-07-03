import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LightCounterProps {
  totalLight: number;
  recentGain?: number;
  streak?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const LightCounter = ({ 
  totalLight, 
  recentGain = 0, 
  streak = 0, 
  className,
  variant = 'default'
}: LightCounterProps) => {
  const formatLight = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toLocaleString();
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-1 text-primary">
          <Zap className="h-4 w-4" />
          <span className="font-bold">{formatLight(totalLight)}</span>
        </div>
        {recentGain > 0 && (
          <Badge variant="secondary" className="text-xs text-emerald-600">
            +{recentGain}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Total Light</h3>
                <p className="text-sm text-muted-foreground">Power of the Resistance</p>
              </div>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatLight(totalLight)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">Light</span>
          </div>

          <div className="flex items-center gap-4">
            {recentGain > 0 && (
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{recentGain} today</span>
              </div>
            )}
            
            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{streak} day streak</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                {formatLight(totalLight)}
              </span>
              <span className="text-sm text-muted-foreground">Light</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              {recentGain > 0 && (
                <Badge variant="secondary" className="text-xs text-emerald-600">
                  +{recentGain} recent
                </Badge>
              )}
              {streak > 0 && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  🔥 {streak} days
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};