import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface PoseGuideProps {
  guideImageUrl?: string;
  title: string;
  instructions: string[];
  onNext: () => void;
}

export const PoseGuide = ({
  guideImageUrl,
  title,
  instructions,
  onNext
}: PoseGuideProps) => {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Guide Image */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/5">
        {guideImageUrl ? (
          <div className="relative max-w-md">
            <img
              src={guideImageUrl}
              alt="Pose guide"
              className="w-full h-auto rounded-lg shadow-lg border"
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 bg-background/90"
            >
              Guide
            </Badge>
          </div>
        ) : (
          <div className="text-center">
            <Camera className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No pose guide available for this challenge
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>
              Follow these tips for the best photo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Instructions List */}
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {instruction}
                  </p>
                </div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="bg-muted/50 rounded-lg p-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Pro Tips</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Good lighting helps create clearer progress photos</li>
                <li>• Try to take photos at the same time each day</li>
                <li>• Keep your phone steady for consistent results</li>
                <li>• Wear similar clothing to see changes better</li>
              </ul>
            </div>

            {/* Start Camera Button */}
            <Button 
              onClick={onNext} 
              className="w-full mt-6"
              size="lg"
            >
              Start Camera
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};