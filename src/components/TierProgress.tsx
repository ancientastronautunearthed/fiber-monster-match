import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from './TierBadge';
import { cn } from '@/lib/utils';

interface TierProgressProps {
  currentTier: number;
  totalLight: number;
  className?: string;
}

const TIER_THRESHOLDS = [
  { tier: 1, threshold: 0, title: 'The Spark' },
  { tier: 2, threshold: 250, title: 'The Lamplighter' },
  { tier: 3, threshold: 1000, title: 'The Beacon' },
  { tier: 4, threshold: 3000, title: 'The Sentinel' },
  { tier: 5, threshold: 7000, title: 'The Guardian' },
  { tier: 6, threshold: 15000, title: 'The Luminary' },
  { tier: 7, threshold: 30000, title: 'The Citadel Heart' }
];

export const TierProgress = ({ currentTier, totalLight, className }: TierProgressProps) => {
  const currentTierData = TIER_THRESHOLDS.find(t => t.tier === currentTier);
  const nextTierData = TIER_THRESHOLDS.find(t => t.tier === currentTier + 1);
  
  const currentThreshold = currentTierData?.threshold || 0;
  const nextThreshold = nextTierData?.threshold || currentThreshold;
  
  const progressInTier = totalLight - currentThreshold;
  const lightNeededForNext = nextThreshold - currentThreshold;
  const progressPercentage = nextTierData ? (progressInTier / lightNeededForNext) * 100 : 100;

  const formatLight = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toLocaleString();
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Resistance Rank</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Tier */}
        <TierBadge tier={currentTier} size="md" />
        
        {/* Progress to Next Tier */}
        {nextTierData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress to {nextTierData.title}
              </span>
              <span className="font-medium">
                {formatLight(progressInTier)} / {formatLight(lightNeededForNext)} Light
              </span>
            </div>
            
            <Progress 
              value={Math.min(progressPercentage, 100)} 
              className="h-2"
            />
            
            <div className="text-center text-sm text-muted-foreground">
              {nextThreshold - totalLight > 0 ? (
                <>
                  <span className="font-medium text-primary">
                    {formatLight(nextThreshold - totalLight)}
                  </span>
                  {' '}more Light needed for next tier
                </>
              ) : (
                <span className="font-medium text-emerald-600">
                  Ready for tier promotion!
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 border border-primary/20">
              <span className="text-primary font-bold">🏆 Maximum Tier Achieved!</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              You are the heart of the Citadel of Hope
            </p>
          </div>
        )}
        
        {/* Tier Preview */}
        {nextTierData && (
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-muted">
            <div className="flex items-center gap-3">
              <TierBadge tier={nextTierData.tier} size="sm" showTitle={false} />
              <div>
                <h4 className="font-medium text-sm">Next: {nextTierData.title}</h4>
                <p className="text-xs text-muted-foreground">
                  Unlocks at {formatLight(nextTierData.threshold)} Light
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};