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

      // Check if any video input devices are available
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length === 0) {
          throw new Error('No camera found on this device');
        }
      } catch (enumError) {
        console.warn('Could not enumerate devices:', enumError);
        // Continue anyway, getUserMedia will give us a better error
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
        
        // Wait for video metadata to load and ensure it's playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          let resolved = false;
          
          const onLoadedMetadata = async () => {
            console.log('Video metadata loaded:', {
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight,
              readyState: video.readyState
            });
            
            // Ensure video starts playing
            try {
              await video.play();
              console.log('Video is now playing');
              
              // Wait a bit more to ensure the video is actually rendering frames
              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  video.removeEventListener('loadedmetadata', onLoadedMetadata);
                  video.removeEventListener('error', onError);
                  resolve();
                }
              }, 500); // Give 500ms for video to stabilize
              
            } catch (playError) {
              console.error('Video play failed:', playError);
              if (!resolved) {
                resolved = true;
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                reject(new Error('Video failed to start playing'));
              }
            }
          };

          const onError = (error: Event) => {
            console.error('Video error:', error);
            if (!resolved) {
              resolved = true;
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              video.removeEventListener('error', onError);
              reject(new Error('Failed to load video'));
            }
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          // Also check if already loaded
          if (video.readyState >= 1) {
            onLoadedMetadata();
          }
          
          // Timeout after 10 seconds
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              video.removeEventListener('loadedmetadata', onLoadedMetadata);
              video.removeEventListener('error', onError);
              reject(new Error('Timeout waiting for video to load'));
            }
          }, 10000);
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
        errorMessage = 'Camera settings not supported. Trying basic settings...';
        
        // Try again with very basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          
          streamRef.current = basicStream;
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            
            await new Promise<void>((resolve, reject) => {
              if (!videoRef.current) {
                reject(new Error('Video element not available'));
                return;
              }

              const video = videoRef.current;
              
              const onLoadedMetadata = () => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                resolve();
              };

              const onError = (error: Event) => {
                video.removeEventListener('loadedmetadata', onLoadedMetadata);
                video.removeEventListener('error', onError);
                reject(new Error('Failed to load video'));
              };

              video.addEventListener('loadedmetadata', onLoadedMetadata);
              video.addEventListener('error', onError);

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
          width: { ideal: 720, max: 1080 },
          height: { ideal: 1280, max: 1920 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready and playing
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }

          const video = videoRef.current;
          let resolved = false;
          
          const onReady = async () => {
            try {
              await video.play();
              console.log('Switched camera is now playing');
              
              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  video.removeEventListener('loadedmetadata', onReady);
                  video.removeEventListener('error', onError);
                  resolve();
                }
              }, 300);
              
            } catch (playError) {
              console.error('Switched video play failed:', playError);
              if (!resolved) {
                resolved = true;
                video.removeEventListener('loadedmetadata', onReady);
                video.removeEventListener('error', onError);
                reject(new Error('Switched video failed to start playing'));
              }
            }
          };

          const onError = (error: Event) => {
            if (!resolved) {
              resolved = true;
              video.removeEventListener('loadedmetadata', onReady);
              video.removeEventListener('error', onError);
              reject(new Error('Failed to load switched video'));
            }
          };

          video.addEventListener('loadedmetadata', onReady);
          video.addEventListener('error', onError);

          if (video.readyState >= 1) {
            onReady();
          }
          
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              video.removeEventListener('loadedmetadata', onReady);
              video.removeEventListener('error', onError);
              reject(new Error('Timeout waiting for switched video'));
            }
          }, 5000);
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

      // Enhanced readiness checks
      if (video.readyState < 2) {
        reject(new Error('Video not ready - still loading metadata'));
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        reject(new Error('Video has no dimensions - camera may not be working'));
        return;
      }

      if (video.paused || video.ended) {
        reject(new Error('Video is not playing - camera stream may have stopped'));
        return;
      }

      // Additional check: ensure we have recent video data
      if (video.currentTime === 0) {
        reject(new Error('Video has no time data - stream may not be active'));
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
        
        // Check if we actually drew something
        const imageData = context.getImageData(0, 0, 1, 1);
        if (imageData.data.every(value => value === 0)) {
          reject(new Error('Video frame appears to be empty - camera may not be working'));
          return;
        }
        
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