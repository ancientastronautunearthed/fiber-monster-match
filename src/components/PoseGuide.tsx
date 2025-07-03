import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Info } from 'lucide-react';
import sampleProgressPhoto from '@/assets/sample-progress-photo.jpg';

interface PoseGuideProps {
  guideImageUrl?: string;
  title: string;
  instructions: string[];
  onNext?: () => void;
}

export const PoseGuide = ({ 
  guideImageUrl, 
  title, 
  instructions,
  onNext 
}: PoseGuideProps) => {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="relative w-full h-full">
      {/* Guide Image Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src={guideImageUrl || sampleProgressPhoto}
            alt="Pose guide"
            className="w-full h-full object-contain opacity-30"
          />
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-2">
            <p className="text-xs text-muted-foreground">
              {guideImageUrl ? 'Guide overlay' : 'Sample photo guide'}
            </p>
          </div>
        </div>
      )}

      {/* Instructions Panel */}
      <Card className="absolute bottom-4 left-4 right-4 z-20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">{title}</h3>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOverlay(!showOverlay)}
              className="h-8 w-8 p-0"
            >
              {showOverlay ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="space-y-2 mb-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <p className="text-sm text-muted-foreground">{instruction}</p>
              </div>
            ))}
          </div>

          {onNext && (
            <Button onClick={onNext} className="w-full">
              Ready to Start
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};