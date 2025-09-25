'use client';

import { useState, useRef, useEffect } from 'react';
import QrScanner from 'react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

type QrScannerComponentProps = {
  onScan: (data: string) => void;
  isLoading: boolean;
};

export default function QrScannerComponent({ onScan, isLoading }: QrScannerComponentProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    // Check for camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasCameraPermission(true))
      .catch(() => setHasCameraPermission(false));
  }, []);

  const handleScan = (data: any) => {
    if (data) {
      onScan(data.text);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Could not access the camera. Please ensure it is not being used by another application.',
      });
    }
  };
  
  const requestCameraPermission = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasCameraPermission(true))
      .catch(() => setHasCameraPermission(false));
  };


  if (!isClient) {
    return null; // Don't render on the server
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 border-2 border-dashed rounded-lg bg-card">
      {hasCameraPermission ? (
        <div className="w-full max-w-sm mx-auto">
           <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={{ video: { facingMode: "environment" } }}
          />
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <CameraOff className="mx-auto h-12 w-12" />
          <p className="mt-4 text-sm font-medium">Camera access is required</p>
          <p className="mt-1 text-xs">To scan QR codes, please grant permission to use your camera.</p>
          <Button onClick={requestCameraPermission} className="mt-4">
            <Camera className="mr-2 h-4 w-4" />
            Allow Camera Access
          </Button>
        </div>
      )}
    </div>
  );
}
