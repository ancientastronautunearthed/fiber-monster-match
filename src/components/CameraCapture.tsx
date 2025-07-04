import { useState, useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { PoseGuide } from '@/components/PoseGuide';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Camera, 
  RotateCcw, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Info
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsCapturing(true);
      
      // Convert file to blob
      const blob = new Blob([file], { type: file.type });
      await onPhotoTaken(blob, dayNumber);
      
      toast({
        title: "Photo Uploaded!",
        description: `Day ${dayNumber} photo saved successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const showDebugModal = () => {
    const debugInfo = {
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      host: window.location.host,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      userAgent: navigator.userAgent,
      error: state.error
    };

    const debugText = `
Debug Information:
- Secure Context (HTTPS): ${debugInfo.isSecureContext}
- Protocol: ${debugInfo.protocol}
- Host: ${debugInfo.host}
- MediaDevices API: ${debugInfo.hasMediaDevices}
- getUserMedia API: ${debugInfo.hasGetUserMedia}
- Browser: ${debugInfo.userAgent.split(' ').slice(-2).join(' ')}
- Current Error: ${debugInfo.error}

Copy this information when reporting issues.
    `.trim();

    navigator.clipboard?.writeText(debugText).then(() => {
      toast({
        title: "Debug Info Copied",
        description: "Debug information has been copied to clipboard.",
      });
    }).catch(() => {
      // Fallback: show in alert
      alert(debugText);
    });
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
                <Alert className="border-red-500/50 bg-red-500/10 mb-4">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-white">
                    {state.error}
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handleRetryCamera}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button
                    onClick={triggerFileUpload}
                    className="flex-1"
                    variant="default"
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>

                  <Button
                    onClick={showDebugModal}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    title="Copy Debug Info"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                
                <div className="mt-4 p-3 bg-white/10 rounded text-sm text-white/80">
                  <p className="font-medium mb-2">Troubleshooting tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>HTTPS Required:</strong> Camera only works on HTTPS or localhost</li>
                    <li>• Allow camera permissions in your browser settings</li>
                    <li>• Close other apps using the camera (Zoom, Teams, etc.)</li>
                    <li>• Try refreshing the page</li>
                    <li>• Use Chrome, Firefox, or Safari for best support</li>
                    <li>• You can upload a photo instead if camera isn't working</li>
                    <li>• Click the ⓘ icon to copy debug info for support</li>
                  </ul>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-black">
            <Card className="bg-black/80 border-white/20">
              <CardContent className="p-6 text-center">
                <Camera className="h-12 w-12 text-white mx-auto mb-4" />
                <p className="text-white mb-4">Camera not started</p>
                <div className="flex gap-3">
                  <Button onClick={handleRetryCamera} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                  <Button onClick={triggerFileUpload} variant="outline" className="flex-1" disabled={isCapturing}>
                    {isCapturing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo
                  </Button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
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