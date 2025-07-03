import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Flame, 
  Lightbulb, 
  Building,
  Shield, 
  Bird, 
  Star, 
  Heart 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: number;
  className?: string;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TIER_CONFIG = {
  1: {
    title: 'The Spark',
    description: 'A faint, glowing ember of hope',
    icon: Flame,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300'
  },
  2: {
    title: 'The Lamplighter',
    description: 'A steady, warm flame spreading light',
    icon: Lightbulb,
    gradient: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300'
  },
  3: {
    title: 'The Beacon',
    description: 'A lighthouse casting powerful beams',
    icon: Building,
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300'
  },
  4: {
    title: 'The Sentinel',
    description: 'A radiant shield protecting others',
    icon: Shield,
    gradient: 'from-purple-400 to-indigo-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300'
  },
  5: {
    title: 'The Guardian',
    description: 'Glowing wings uplifting the community',
    icon: Bird,
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300'
  },
  6: {
    title: 'The Luminary',
    description: 'A constellation guiding others',
    icon: Star,
    gradient: 'from-violet-400 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-950',
    border: 'border-violet-200 dark:border-violet-800',
    text: 'text-violet-700 dark:text-violet-300'
  },
  7: {
    title: 'The Citadel Heart',
    description: 'The beating heart of hope itself',
    icon: Heart,
    gradient: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-950',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300'
  }
};

export const TierBadge = ({ tier, className, showTitle = true, size = 'md' }: TierBadgeProps) => {
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG[1];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (!showTitle) {
    return (
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-lg border-2',
          `bg-gradient-to-br ${config.gradient}`,
          config.border,
          sizeClasses[size],
          className
        )}
      >
        <Icon className={cn('text-white drop-shadow-sm', iconSizes[size])} />
        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
      </div>
    );
  }

  return (
    <Card className={cn('p-4', config.bg, config.border, className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'relative rounded-full flex items-center justify-center',
            'bg-gradient-to-br shadow-lg border-2',
            `bg-gradient-to-br ${config.gradient}`,
            config.border,
            sizeClasses[size]
          )}
        >
          <Icon className={cn('text-white drop-shadow-sm', iconSizes[size])} />
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn('font-bold text-lg', config.text)}>
              {config.title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              Tier {tier}
            </Badge>
          </div>
          <p className={cn('text-sm opacity-80', config.text)}>
            {config.description}
          </p>
        </div>
      </div>
    </Card>
  );
};