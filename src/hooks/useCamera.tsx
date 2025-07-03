import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    hasPermission: false,
  });

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // front camera by default
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        hasPermission: true
      }));
    } catch (error) {
      console.error('Camera permission denied:', error);
      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        hasPermission: false,
        error: 'Camera access denied. Please allow camera permission and try again.'
      }));
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    const currentFacingMode = videoTrack.getSettings().facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    try {
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setState(prev => ({ ...prev, isActive: true }));
    } catch (error) {
      console.error('Error switching camera:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to switch camera'
      }));
    }
  }, [stopCamera]);

  const capturePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Camera not available'));
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      }, 'image/jpeg', 0.9);
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