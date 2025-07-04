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
  const [showGuideOverlay, setShowGuideOverlay] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestPermission();
    return () => {
      stopCamera();
    };
  }, [requestPermission, stopCamera]);

  // Ensure video element is visible when stream is active
  useEffect(() => {
    if (state.isActive && videoRef.current) {
      const video = videoRef.current;
      // Force video to be visible
      video.style.display = 'block';
      video.style.visibility = 'visible';
      video.style.opacity = '1';
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.backgroundColor = 'transparent';
      video.style.zIndex = '1';
      
      // For front camera, apply mirror effect
      if (state.facingMode === 'user') {
        video.style.transform = 'scaleX(-1)';
      } else {
        video.style.transform = 'none';
      }
      
      console.log('Video element styles applied:', {
        display: video.style.display,
        visibility: video.style.visibility,
        opacity: video.style.opacity,
        width: video.clientWidth,
        height: video.clientHeight,
        parent: video.parentElement?.tagName,
      });
    }
  }, [state.isActive, state.facingMode, videoRef]);

  const handleCapture = async () => {
    if (!state.isReady || isCapturing) return;

    try {
      setIsCapturing(true);
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
        errorMessage = error.message;
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

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

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
      isActive: state.isActive,
      isReady: state.isReady,
      videoState: videoRef.current ? {
        readyState: videoRef.current.readyState,
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight,
        clientWidth: videoRef.current.clientWidth,
        clientHeight: videoRef.current.clientHeight,
        paused: videoRef.current.paused,
        srcObject: !!videoRef.current.srcObject,
        style: {
          display: videoRef.current.style.display,
          visibility: videoRef.current.style.visibility,
          opacity: videoRef.current.style.opacity,
        }
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
- Camera Active: ${debugInfo.isActive}
- Camera Ready: ${debugInfo.isReady}
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
    <div className="fixed inset-0 bg-black z-50" ref={containerRef}>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-white hover:bg-white/20"
            >
              <Info className="h-4 w-4 mr-1" />
              {showInstructions ? 'Hide' : 'Show'} Tips
            </Button>

            {guideImageUrl && dayNumber > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuideOverlay(!showGuideOverlay)}
                className="text-white hover:bg-white/20"
              >
                {showGuideOverlay ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide Guide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show Guide
                  </>
                )}
              </Button>
            )}

            {state.isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={switchCamera}
                disabled={state.isLoading}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera View / Error State */}
      <div className="h-full w-full relative">
        {state.isActive ? (
          <div className="absolute inset-0">
            {/* Video container with explicit positioning */}
            <div className="absolute inset-0 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: 'transparent',
                  zIndex: 1,
                  transform: state.facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />
            </div>

            {showGuideOverlay && guideImageUrl && dayNumber > 1 && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                <img
                  src={guideImageUrl}
                  alt="Pose guide"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    opacity: 0.3,
                    mixBlendMode: 'screen'
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
                  Align your pose with the guide
                </div>
              </div>
            )}

            {countdown !== null && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
                <div className="text-white text-9xl font-bold animate-pulse">
                  {countdown}
                </div>
              </div>
            )}
          </div>
        ) : state.isLoading ? (
          <div className="flex items-center justify-center h-full bg-black">
            <Card className="bg-black/80 border-white/20">
              <CardContent className="p-6 text-center">
                <Loader2 className="h-12 w-12 text-white animate-spin mx-auto mb-4" />
                <p className="text-white">Starting camera...</p>
              </CardContent>
            </Card>
          </div>
        ) : state.error ? (
          <div className="flex items-center justify-center h-full bg-black p-4">
            <Card className="bg-black/80 border-white/20 max-w-md w-full">
              <CardContent className="p-6">
                <Alert className="bg-red-900/20 border-red-900/50 text-white mb-4">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <Button onClick={handleRetryCamera} className="w-full bg-white text-black hover:bg-gray-200">
                    <Camera className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button onClick={triggerFileUpload} variant="outline" className="w-full text-white border-white/20 hover:bg-white/20" disabled={isCapturing}>
                    {isCapturing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Photo Instead
                  </Button>

                  <Button
                    onClick={showDebugModal}
                    variant="ghost"
                    size="sm"
                    className="w-full text-white hover:bg-white/20"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Copy Debug Info
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="w-full mt-2 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                
                <div className="mt-4 p-3 bg-white/10 rounded text-sm text-white/80">
                  <p className="font-medium mb-2">Troubleshooting tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Camera only works on HTTPS or localhost</li>
                    <li>• Allow camera permissions when prompted</li>
                    <li>• Close other apps using the camera</li>
                    <li>• Try refreshing the page</li>
                    <li>• Use Chrome, Firefox, or Safari</li>
                    <li>• Upload a photo if camera won't work</li>
                  </ul>
                </div>

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
              disabled={isCapturing || !state.isReady}
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
              {state.isReady ? (
                <p>Tap to capture your Day {dayNumber} photo</p>
              ) : (
                <p className="animate-pulse">Waiting for camera to be ready...</p>
              )}
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
            <div className={`w-2 h-2 rounded-full ${state.isReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
            <span className="text-white text-xs">{state.isReady ? 'Live' : 'Loading...'}</span>
          </div>
        </div>
      )}
    </div>
  );
};