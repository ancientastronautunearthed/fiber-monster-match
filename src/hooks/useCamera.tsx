import { useState, useRef, useCallback, useEffect } from 'react';

export interface CameraState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  facingMode: 'user' | 'environment';
  isReady: boolean;
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
    isReady: false,
  });

  // Helper to wait for video element to be available
  const waitForVideoElement = useCallback((): Promise<HTMLVideoElement> => {
    return new Promise((resolve, reject) => {
      const checkVideo = () => {
        if (videoRef.current) {
          resolve(videoRef.current);
        } else {
          // Retry after a short delay
          const retryCount = 20; // Max 2 seconds
          let attempts = 0;
          
          const interval = setInterval(() => {
            attempts++;
            if (videoRef.current) {
              clearInterval(interval);
              resolve(videoRef.current);
            } else if (attempts >= retryCount) {
              clearInterval(interval);
              reject(new Error('Video element not found after waiting'));
            }
          }, 100);
        }
      };
      
      // Initial check
      checkVideo();
    });
  }, []);

  const requestPermission = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isReady: false }));
    
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        throw new Error('Camera requires HTTPS. Please use HTTPS or localhost.');
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported in this browser.');
      }

      // Wait for video element to be available
      let video: HTMLVideoElement;
      try {
        video = await waitForVideoElement();
        console.log('Video element found:', video);
      } catch (err) {
        throw new Error('Video element not found');
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped track:', track.kind, track.label);
        });
        streamRef.current = null;
      }

      // Request camera with constraints
      const constraints = {
        video: {
          facingMode: state.facingMode,
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      };

      console.log('Requesting camera with constraints:', constraints);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        
        console.log('Got media stream:', stream);
        console.log('Stream tracks:', stream.getTracks().map(t => ({ kind: t.kind, label: t.label, enabled: t.enabled, muted: t.muted })));
        
        // Clear any existing source
        video.srcObject = null;
        
        // Set up video element properly
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        // Attach the stream
        video.srcObject = stream;
        
        // Force load the video
        video.load();
        
        // Wait for video to be ready with multiple fallback events
        await new Promise<void>((resolve, reject) => {
          let resolved = false;
          const timeoutId = setTimeout(() => {
            if (!resolved) {
              reject(new Error('Video loading timeout'));
            }
          }, 15000);

          const cleanup = () => {
            clearTimeout(timeoutId);
            video.onloadedmetadata = null;
            video.oncanplay = null;
            video.onplaying = null;
            video.onerror = null;
          };

          const handleReady = () => {
            if (resolved) return;
            resolved = true;
            
            console.log('Video ready:', {
              readyState: video.readyState,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              currentTime: video.currentTime,
              paused: video.paused,
              srcObject: video.srcObject,
            });
            
            cleanup();
            resolve();
          };

          // Try multiple events for better compatibility
          video.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            video.play().then(() => {
              console.log('Video play started');
              handleReady();
            }).catch(err => {
              console.error('Play failed:', err);
              // Try to continue anyway
              handleReady();
            });
          };

          video.oncanplay = () => {
            console.log('Video can play');
            if (!resolved) {
              video.play().then(() => {
                handleReady();
              }).catch(() => {
                handleReady();
              });
            }
          };

          video.onplaying = () => {
            console.log('Video is playing');
            handleReady();
          };

          video.onerror = (e) => {
            console.error('Video error:', e);
            cleanup();
            reject(new Error('Video failed to load'));
          };

          // Fallback: if video is already ready
          if (video.readyState >= 3) {
            console.log('Video already ready');
            video.play().then(() => {
              handleReady();
            }).catch(() => {
              handleReady();
            });
          }
        });
        
        // Final check that video is actually displaying
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.warn('Video dimensions are 0, but continuing anyway');
        }
        
        setState(prev => ({
          ...prev,
          isActive: true,
          isLoading: false,
          hasPermission: true,
          error: null,
          isReady: true,
        }));

        console.log('Camera started successfully');
        
      } catch (mediaError: any) {
        console.error('Media error details:', mediaError);
        let errorMessage = 'Failed to access camera';
        
        if (mediaError.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (mediaError.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please check your camera is connected.';
        } else if (mediaError.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application. Please close other apps using the camera.';
        } else if (mediaError.name === 'OverconstrainedError') {
          errorMessage = 'Camera does not support the requested settings.';
        } else if (mediaError.name === 'SecurityError') {
          errorMessage = 'Camera access blocked due to security settings.';
        } else {
          errorMessage = `Camera error: ${mediaError.message || mediaError.name || 'Unknown error'}`;
        }
        
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      console.error('Camera request failed:', error);
      
      setState(prev => ({
        ...prev,
        isActive: false,
        isLoading: false,
        hasPermission: false,
        error: error.message || 'Failed to start camera',
        isReady: false,
      }));
      
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [state.facingMode, waitForVideoElement]);

  const stopCamera = useCallback(() => {
    console.log('Stopping camera');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Reset the video element
    }
    
    setState(prev => ({
      ...prev,
      isActive: false,
      error: null,
      isReady: false,
    }));
  }, []);

  const switchCamera = useCallback(async () => {
    if (!state.isActive || state.isLoading) return;
    
    const newFacingMode = state.facingMode === 'user' ? 'environment' : 'user';
    console.log('Switching camera to:', newFacingMode);
    
    setState(prev => ({ 
      ...prev, 
      facingMode: newFacingMode,
      isReady: false,
      isLoading: true,
    }));
    
    stopCamera();
    
    // Wait a bit before restarting to ensure clean switch
    setTimeout(() => {
      setState(prev => ({ ...prev, facingMode: newFacingMode }));
      requestPermission();
    }, 100);
  }, [state.isActive, state.isLoading, state.facingMode, stopCamera, requestPermission]);

  const capturePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current || !streamRef.current) {
        reject(new Error('Camera not initialized'));
        return;
      }

      const video = videoRef.current;
      
      // Check if video is actually playing
      if (video.paused || video.ended) {
        reject(new Error('Video is not playing'));
        return;
      }
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        // Try to capture anyway, some devices report 0 but still work
        console.warn('Video dimensions are 0, attempting capture anyway');
      }

      try {
        const canvas = document.createElement('canvas');
        const width = video.videoWidth || video.clientWidth || 1280;
        const height = video.videoHeight || video.clientHeight || 720;
        
        canvas.width = width;
        canvas.height = height;
        
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Failed to create canvas context'));
          return;
        }

        // Handle mirroring for front camera
        if (state.facingMode === 'user') {
          context.translate(width, 0);
          context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            console.log('Photo captured:', blob.size, 'bytes');
            resolve(blob);
          } else {
            reject(new Error('Failed to create photo - blob is empty'));
          }
        }, 'image/jpeg', 0.92);
        
      } catch (error: any) {
        console.error('Capture error:', error);
        reject(new Error(`Photo capture failed: ${error.message}`));
      }
    });
  }, [state.facingMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    state,
    requestPermission,
    stopCamera,
    switchCamera,
    capturePhoto,
  };
};