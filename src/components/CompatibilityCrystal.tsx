import { useState, useEffect } from 'react';

interface CompatibilityCrystalProps {
  matchScore: number;
  className?: string;
}

const CompatibilityCrystal = ({ matchScore, className = "" }: CompatibilityCrystalProps) => {
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    // Trigger charging animation when component mounts
    const timer = setTimeout(() => setIsCharging(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Determine crystal state based on match score
  const getCrystalState = () => {
    if (matchScore >= 80) return 'legendary';
    if (matchScore >= 60) return 'epic';
    if (matchScore >= 40) return 'rare';
    if (matchScore >= 20) return 'common';
    return 'dormant';
  };

  const crystalState = getCrystalState();

  const getGlowColor = () => {
    switch (crystalState) {
      case 'legendary': return 'shadow-[0_0_30px_rgba(255,215,0,0.8)]'; // Gold
      case 'epic': return 'shadow-[0_0_25px_rgba(147,51,234,0.7)]'; // Purple
      case 'rare': return 'shadow-[0_0_20px_rgba(59,130,246,0.6)]'; // Blue
      case 'common': return 'shadow-[0_0_15px_rgba(34,197,94,0.5)]'; // Green
      default: return 'shadow-[0_0_10px_rgba(156,163,175,0.3)]'; // Gray
    }
  };

  const getCrystalColor = () => {
    switch (crystalState) {
      case 'legendary': return 'from-yellow-300 via-yellow-400 to-yellow-600';
      case 'epic': return 'from-purple-300 via-purple-400 to-purple-600';
      case 'rare': return 'from-blue-300 via-blue-400 to-blue-600';
      case 'common': return 'from-green-300 via-green-400 to-green-600';
      default: return 'from-gray-200 via-gray-300 to-gray-400';
    }
  };

  const getChargeLevel = () => {
    return Math.min(100, Math.max(0, matchScore));
  };

  const getStateText = () => {
    switch (crystalState) {
      case 'legendary': return 'Soul Resonance';
      case 'epic': return 'Deep Connection';
      case 'rare': return 'Strong Match';
      case 'common': return 'Good Potential';
      default: return 'Faint Signal';
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Crystal Container */}
      <div className="relative">
        {/* Glow Effect */}
        <div 
          className={`absolute inset-0 rounded-full ${getGlowColor()} transition-all duration-1000 ${
            isCharging ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Main Crystal */}
        <div className={`
          relative w-16 h-16 rounded-full bg-gradient-to-br ${getCrystalColor()}
          border-2 border-white/50 backdrop-blur-sm
          transition-all duration-1000 transform
          ${isCharging ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
        `}>
          {/* Inner Glow */}
          <div className={`
            absolute inset-2 rounded-full bg-gradient-to-br ${getCrystalColor()}
            opacity-60 blur-sm animate-pulse
          `} />
          
          {/* Crystal Facets */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute top-2 left-2 w-3 h-3 bg-white/40 rounded-full blur-sm" />
            <div className="absolute top-4 right-3 w-2 h-2 bg-white/30 rounded-full blur-sm" />
            <div className="absolute bottom-3 left-4 w-2 h-2 bg-white/20 rounded-full blur-sm" />
          </div>

          {/* Charge Level Indicator */}
          <div className="absolute inset-1 rounded-full overflow-hidden">
            <div 
              className={`
                absolute bottom-0 left-0 right-0 bg-white/30 transition-all duration-2000 ease-out
                ${isCharging ? '' : 'transform translate-y-full'}
              `}
              style={{ 
                height: `${getChargeLevel()}%`,
                transitionDelay: '0.5s'
              }}
            />
          </div>

          {/* Sparkle Effects */}
          {crystalState !== 'dormant' && (
            <>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
              <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </>
          )}
        </div>
      </div>

      {/* State Text */}
      <div className="mt-2 text-center">
        <div className={`text-xs font-semibold ${
          crystalState === 'legendary' ? 'text-yellow-600' :
          crystalState === 'epic' ? 'text-purple-600' :
          crystalState === 'rare' ? 'text-blue-600' :
          crystalState === 'common' ? 'text-green-600' :
          'text-gray-500'
        }`}>
          {getStateText()}
        </div>
        <div className="text-xs text-muted-foreground">
          {matchScore}% charged
        </div>
      </div>

      {/* Floating Particles for high-level crystals */}
      {crystalState === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2 right-0 w-1 h-1 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-2 left-0 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
        </div>
      )}
    </div>
  );
};

export default CompatibilityCrystal;