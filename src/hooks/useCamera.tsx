import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  facingMode: 'user' | 'environment';
  isReady: boolean; // 👈 New state to track if the video is ready to be captured
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isActive: false,
    isLoading: false,
    error: null,
    hasPermission: false,
    facingMode: 'user',
    isReady: false, // 👈 Initial state
  });

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isReady: false }));
    
    try {
      if (!window.isSecureContext) {
        throw new Error('Camera requires HTTPS. Please use HTTPS or localhost.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode: state.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      console.log('Requesting camera with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        
        video.setAttribute('autoplay', 'true');
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');

        // 👇 This Promise now correctly waits for the 'canplay' event
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Video loading timeout')), 10000);

          video.oncanplay = () => {
            clearTimeout(timeoutId);
            video.play().then(() => {
              console.log('Video is ready and playing:', {
                readyState: video.readyState,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
              });
              setState(prev => ({ ...prev, isReady: true })); // 👈 Set isReady to true
              resolve();
            }).catch(err => {
              clearTimeout(timeoutId);
              reject(err);
            });
          };

          video.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Video failed to load'));
          };
        });
      }
      
      setState(prev => ({
        ...prev,
        isActive: true,
        isLoading: false,
        hasPermission: true,
        error: null,
      }));

      console.log('Camera started successfully');
      
    } catch (error: any) {
      // ... (rest of your error handling)
    }
  }, [state.facingMode]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setState(prev => ({
      ...prev,
      isActive: false,
      error: null,
      isReady: false, // 👈 Reset isReady state
    }));
  }, []);

  const switchCamera = useCallback(async () => {
    // ... (your existing switchCamera logic)
    // Be sure to reset isReady to false at the start of this function as well
    setState(prev => ({ ...prev, isReady: false, isLoading: true }));
    // ...
  }, [state.facingMode]);

  const capturePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !streamRef.current || !state.isReady) { // 👈 Check isReady state
        reject(new Error('Camera not ready for capture'));
        return;
      }

      const video = videoRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Video has no dimensions - camera may not be working properly'));
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create photo - blob is empty'));
          }
        }, 'image/jpeg', 0.92);
        
      } catch (error: any) {
        reject(new Error(`Photo capture failed: ${error.message}`));
      }
    });
  }, [state.isReady]); // 👈 Add isReady to dependency array

  useEffect(() => {
    return () => stopCamera();
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