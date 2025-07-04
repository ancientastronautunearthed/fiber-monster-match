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
      // Check for secure context first
      if (!window.isSecureContext) {
        throw new Error('Camera requires HTTPS. Please use HTTPS or localhost.');
      }

      // Check if media devices are supported
      if (!navigator.mediaDevices) {
        throw new Error('Media devices not supported in this browser');
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser');
      }

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Start with basic constraints for better compatibility
      const constraints = {
        video: {
          facingMode: state.facingMode,
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: false
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Simplified video loading - just wait for loadedmetadata and play
        const video = videoRef.current;
        
        try {
          // Wait for metadata to load
          if (video.readyState < 1) {
            await new Promise((resolve, reject) => {
              const onLoadedMetadata = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                resolve(true);
              };
              
              const onError = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                reject(new Error('Video failed to load'));
              };
              
              video.addEventListener('loadedmetadata', onLoadedMetadata);
              video.addEventListener('error', onError);
            });
          }
          
          // Start playing
          await video.play();
          
          console.log('Video loaded and playing:', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState
          });
          
        } catch (playError) {
          console.warn('Video play failed, but continuing:', playError);
          // Don't fail here - some browsers auto-play, some don't
        }
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
      
      // Handle different types of errors
      if (error.message.includes('HTTPS') || error.message.includes('secure context')) {
        errorMessage = 'Camera requires HTTPS. Please access this site over HTTPS or use localhost for development.';
      } else if (error.message.includes('not supported')) {
        errorMessage = 'Camera not supported in this browser. Try Chrome, Firefox, or Safari.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please connect a camera and try again.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera not supported on this device or browser.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is being used by another application. Close other apps and try again.';
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        // Try again with very basic constraints
        try {
          console.log('Trying basic camera constraints...');
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          streamRef.current = basicStream;
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            await videoRef.current.play().catch(() => {
              // Ignore play errors for basic setup
            });
          }
          
          setState(prev => ({
            ...prev,
            isActive: true,
            isLoading: false,
            hasPermission: true,
            error: null
          }));
          console.log('Camera started successfully with basic constraints');
          return;
        } catch (basicError) {
          console.error('Basic camera setup also failed:', basicError);
          errorMessage = 'Camera could not be started with any settings. Please check your camera and permissions.';
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
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {
          // Ignore play errors
        });
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
        ended: video.ended,
        currentTime: video.currentTime
      });

      // Simplified readiness check
      if (video.readyState < 1) {
        reject(new Error('Video metadata not loaded yet'));
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Video has no dimensions - camera may not be working properly'));
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