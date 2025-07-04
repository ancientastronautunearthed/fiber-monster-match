import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  facingMode: 'user' | 'environment';
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    hasPermission: false,
    facingMode: 'user'
  });

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Check if media devices are supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode: state.facingMode,
          width: { ideal: 720, max: 1080 },
          height: { ideal: 1280, max: 1920 }
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video metadata to load
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          
          const onLoadedMetadata = () => {
            console.log('Video metadata loaded:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve();
          };

          const onError = (error: Event) => {
            console.error('Video error:', error);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Failed to load video'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          // Also check if already loaded
          if (video.readyState >= 1) {
            onLoadedMetadata();
          }
        });
      }
      
      setState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        hasPermission: true,
        error: null
      }));

      console.log('Camera started successfully');
    } catch (error: any) {
      console.error('Camera permission/access failed:', error);
      
      let errorMessage = 'Camera access failed. Please check your permissions.';
      
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device or browser.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is being used by another application.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = 'Camera constraints not satisfied. Trying with basic settings...';
        
        // Try again with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: state.facingMode },
            audio: false
          });
          
          streamRef.current = basicStream;
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
          }
          
          setState(prev => ({
            ...prev,
            isActive: true,
            isLoading: false,
            hasPermission: true,
            error: null
          }));
          return;
        } catch (basicError) {
          console.error('Basic camera setup also failed:', basicError);
        }
      }
      
      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        hasPermission: false,
        error: errorMessage
      }));
    }
  }, [state.facingMode]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.label);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState(prev => ({
      ...prev,
      isActive: false,
      error: null
    }));
  }, []);

  const switchCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !streamRef.current) return;

    try {
      const newFacingMode = state.facingMode === 'user' ? 'environment' : 'user';
      
      setState(prev => ({ 
        ...prev, 
        facingMode: newFacingMode,
        isLoading: true 
      }));

      // Stop current stream
      streamRef.current.getTracks().forEach(track => track.stop());
      
      // Start new stream with opposite camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 720, max: 1080 },
          height: { ideal: 1280, max: 1920 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
      
    } catch (error) {
      console.error('Error switching camera:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to switch camera'
      }));
    }
  }, [state.facingMode]);

  const capturePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !streamRef.current) {
        reject(new Error('Camera not available'));
        return;
      }

      const video = videoRef.current;
      
      console.log('Starting photo capture, video state:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        ended: video.ended
      });

      // Ensure video is playing and has valid dimensions
      if (video.readyState < 2) {
        reject(new Error('Video not ready for capture'));
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Video has no dimensions'));
        return;
      }

      try {
        // Create canvas for capture
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        console.log('Drawing video to canvas:', canvas.width, 'x', canvas.height);
        
        // Draw the current video frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            console.log('Photo captured successfully, size:', blob.size, 'bytes');
            resolve(blob);
          } else {
            reject(new Error('Failed to create photo - blob is empty'));
          }
        }, 'image/jpeg', 0.92);
        
      } catch (error: any) {
        console.error('Canvas capture error:', error);
        reject(new Error(`Photo capture failed: ${error.message}`));
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    state,
    requestPermission,
    stopCamera,
    switchCamera,
    capturePhoto,
  };
};