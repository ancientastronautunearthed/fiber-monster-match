import { useState, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { PoseGuide } from '@/components/PoseGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  RotateCcw, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  challengeId: string;
  dayNumber: number;
  guideImageUrl?: string;
  title: string;
  instructions: string[];
  onPhotoTaken: (photo: Blob, dayNumber: number) => Promise<void>;
  onClose: () => void;
}

export const CameraCapture = ({
  challengeId,
  dayNumber,
  guideImageUrl,
  title,
  instructions,
  onPhotoTaken,
  onClose
}: CameraCaptureProps) => {
  const { videoRef, state, requestPermission, stopCamera, switchCamera, capturePhoto } = useCamera();
  const [showGuide, setShowGuide] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    setShowGuide(false);
    await requestPermission();
  };

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      
      // 3-second countdown
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setCountdown(null);
      
      const photo = await capturePhoto();
      await onPhotoTaken(photo, dayNumber);
      
      toast({
        title: "Photo Captured!",
        description: `Day ${dayNumber} photo saved successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  if (showGuide) {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="relative w-full h-full bg-gradient-to-br from-background to-muted/20">
          <PoseGuide
            guideImageUrl={guideImageUrl}
            title={title}
            instructions={instructions}
            onNext={handleStartCamera}
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-30"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="relative w-full h-full">
        {/* Camera View */}
        <div className="relative w-full h-full overflow-hidden">
          {state.isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Guide Overlay */}
              {guideImageUrl && (
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src={guideImageUrl}
                    alt="Pose guide overlay"
                    className="w-full h-full object-contain opacity-20"
                  />
                </div>
              )}
              
              {/* Countdown Overlay */}
              {countdown && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary animate-pulse">
                    {countdown}
                  </div>
                </div>
              )}
            </>
          ) : state.isLoading ? (
            <div className="flex items-center justify-center h-full bg-muted/10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Starting camera...</p>
              </div>
            </div>
          ) : state.error ? (
            <div className="flex items-center justify-center h-full bg-muted/10">
              <Card className="max-w-md mx-4">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Camera Access Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">{state.error}</p>
                  <Button onClick={requestPermission} className="w-full">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-background/80 to-transparent">
            <Badge variant="secondary" className="px-3 py-1">
              Day {dayNumber}
            </Badge>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-background/20 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        {state.isActive && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="flex items-center justify-center p-6 bg-gradient-to-t from-background/80 to-transparent">
              <div className="flex items-center gap-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  disabled={isCapturing}
                  className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                
                <Button
                  size="icon"
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90"
                >
                  {isCapturing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowGuide(true)}
                  disabled={isCapturing}
                  className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-sm"
                >
                  <CheckCircle className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};