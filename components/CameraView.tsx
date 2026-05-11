
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraViewProps {
  onCapture?: (base64: string) => void;
  overlayContent?: React.ReactNode;
  isActive: boolean;
  facingMode?: 'user' | 'environment';
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, overlayContent, isActive, facingMode = 'environment' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isActive) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode }, 
            audio: false 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          setError("Could not access camera. Please check permissions.");
        }
      };
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, facingMode]);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current && onCapture) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {overlayContent}

      {onCapture && (
        <button
          onClick={capture}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-emerald-500 shadow-xl active:scale-95 transition-transform flex items-center justify-center"
        >
          <div className="w-12 h-12 bg-emerald-500 rounded-full" />
        </button>
      )}
    </div>
  );
};
