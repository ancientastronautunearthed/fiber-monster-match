import { useState, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { PoseGuide } from '@/components/PoseGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  RotateCcw, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
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
  const [showGuideOverlay, setShowGuideOverlay] = useState(true);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleStartCamera = async () => {
    setShowGuide(false);
    await requestPermission();
  };

  const handleRetryCamera = async () => {
    await requestPermission();
  };

  const handleCapture = async () => {
    if (!state.isActive || isCapturing) return;

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
        description: error instanceof Error ? error.message : "Failed to capture photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  const toggleGuideOverlay = () => {
    setShowGuideOverlay(!showGuideOverlay);
  };

  // Show pose guide first
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
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Day {dayNumber}
            </Badge>
            <span className="text-white text-sm font-medium">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {guideImageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleGuideOverlay}
                className="text-white hover:bg-white/20"
              >
                {showGuideOverlay ? 'Hide Guide' : 'Show Guide'}
              </Button>
            )}
            
            {state.isActive && (
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                disabled={state.isLoading}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {state.isActive ? (
          <>
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                transform: state.facingMode === 'user' ? 'scaleX(-1)' : 'none' 
              }}
            />
            
            {/* Guide Overlay */}
            {guideImageUrl && showGuideOverlay && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <img
                  src={guideImageUrl}
                  alt="Pose guide overlay"
                  className="max-w-full max-h-full object-contain opacity-30"
                  style={{ 
                    transform: state.facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
                  }}
                />
              </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-8xl font-bold text-white animate-pulse drop-shadow-lg">
                  {countdown}
                </div>
              </div>
            )}

            {/* Capture Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handleCapture}
                  disabled={isCapturing || !state.isActive}
                  className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 text-black"
                >
                  {isCapturing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </Button>
              </div>
              
              {!isCapturing && (
                <p className="text-center text-white/80 text-sm mt-3">
                  Tap to capture your Day {dayNumber} photo
                </p>
              )}
            </div>
          </>
        ) : state.isLoading ? (
          <div className="flex items-center justify-center h-full bg-black">
            <Card className="bg-black/80 border-white/20">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
                <p className="text-white">Starting camera...</p>
                <p className="text-white/60 text-sm mt-2">Please allow camera access</p>
              </CardContent>
            </Card>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center h-full bg-black p-6">
            <Card className="bg-black/80 border-red-500/50 max-w-md">
              <CardContent className="p-6">
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-white">
                    {state.error}
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={handleRetryCamera}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-white/10 rounded text-sm text-white/80">
                  <p className="font-medium mb-2">Troubleshooting tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Make sure camera permissions are enabled</li>
                    <li>• Close other apps using the camera</li>
                    <li>• Try refreshing the page</li>
                    <li>• Use a different browser if problems persist</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-black">
            <Card className="bg-black/80 border-white/20">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-white mx-auto mb-4" />
                <p className="text-white mb-4">Camera not started</p>
                <Button onClick={handleRetryCamera}>
                  Start Camera
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {state.isActive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-xs">Recording</span>
          </div>
        </div>
      )}
    </div>
  );
};