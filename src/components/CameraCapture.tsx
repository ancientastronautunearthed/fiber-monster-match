import { useState, useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  RotateCcw, 
  X, 
  Loader2,
  RefreshCw,
  Upload,
  Info,
  Eye,
  EyeOff,
  Calendar
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showGuideOverlay, setShowGuideOverlay] = useState(false); // Default OFF so users see themselves
  const [showInstructions, setShowInstructions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Start camera immediately when component mounts
    requestPermission();
    
    return () => {
      stopCamera();
    };
  }, [requestPermission, stopCamera]);

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
      
      let errorMessage = "Failed to capture photo. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('not ready')) {
          errorMessage = "Camera is still loading. Please wait a moment and try again.";
        } else if (error.message.includes('not playing') || error.message.includes('paused')) {
          errorMessage = "Camera video paused. Please restart the camera.";
        } else if (error.message.includes('no dimensions')) {
          errorMessage = "Camera isn't working properly. Please restart or try upload.";
        } else if (error.message.includes('empty')) {
          errorMessage = "Camera isn't producing video. Please check permissions.";
        }
      }
      
      toast({
        title: "Capture Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  const handleRetryCamera = async () => {
    await requestPermission();
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
      error: state.error,
      videoState: videoRef.current ? {
        readyState: videoRef.current.readyState,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        paused: videoRef.current.paused
      } : null
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
- Video State: ${JSON.stringify(debugInfo.videoState, null, 2)}

Copy this information when reporting issues.
    `.trim();

    navigator.clipboard?.writeText(debugText).then(() => {
      toast({
        title: "Debug Info Copied",
        description: "Debug information has been copied to clipboard.",
      });
    }).catch(() => {
      alert(debugText);
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white">
              Day {dayNumber}
            </Badge>
            <span className="text-white text-sm font-medium">{title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Instructions Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-white hover:bg-white/20"
            >
              <Info className="h-4 w-4 mr-1" />
              {showInstructions ? 'Hide' : 'Show'} Tips
            </Button>

            {/* Guide Overlay Toggle - only show if we have a guide AND it's not day 1 */}
            {guideImageUrl && dayNumber > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuideOverlay(!showGuideOverlay)}
                className="text-white hover:bg-white/20"
              >
                {showGuideOverlay ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            
            {/* Camera Switch */}
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
            
            {/* Close */}
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

      {/* Main Camera View */}
      <div className="relative w-full h-full">
        {state.isActive ? (
          <>
            {/* Live Video Feed - This should be the PRIMARY view */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              className="w-full h-full object-cover"
              style={{ 
                transform: state.facingMode === 'user' ? 'scaleX(-1)' : 'none',
                zIndex: 1
              }}
            />
            
            {/* Guide Overlay - Only show if explicitly enabled and after day 1 */}
            {guideImageUrl && showGuideOverlay && dayNumber > 1 && (
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
                <img
                  src={guideImageUrl}
                  alt="Pose guide overlay"
                  className="w-full h-full object-contain opacity-30"
                  style={{ 
                    transform: state.facingMode === 'user' ? 'scaleX(-1)' : 'none',
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
                  }}
                />
              </div>
            )}
            
            {/* Countdown Overlay */}
            {countdown && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 10 }}>
                <div className="text-8xl font-bold text-white animate-pulse drop-shadow-lg">
                  {countdown}
                </div>
              </div>
            )}
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
                  <Info className="h-4 w-4 text-red-400" />
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
                    Upload
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

      {/* Instructions Panel */}
      {showInstructions && state.isActive && (
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <Card className="bg-black/80 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-white">Photo Tips</h3>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(false)}
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {instructions.slice(0, 3).map((instruction, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <p className="text-sm text-white/80">{instruction}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Capture Controls */}
      {state.isActive && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={handleCapture}
              disabled={isCapturing}
              className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 text-black disabled:opacity-50"
            >
              {isCapturing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
            </Button>
          </div>
          
          {!isCapturing && (
            <div className="text-center text-white/80 text-sm mt-3">
              <p>Tap to capture your Day {dayNumber} photo</p>
              {dayNumber === 1 && (
                <p className="text-xs text-yellow-400 mt-1">
                  Your first photo will create a pose guide for future days
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      {state.isActive && (
        <div className="absolute top-20 left-4 z-20">
          <div className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-white text-xs">Live</span>
          </div>
        </div>
      )}
    </div>
  );
};