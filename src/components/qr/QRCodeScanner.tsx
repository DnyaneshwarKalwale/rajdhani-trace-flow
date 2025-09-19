import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeService, IndividualProductQRData, MainProductQRData } from '@/lib/qrCode';

interface QRCodeScannerProps {
  onScanSuccess: (data: IndividualProductQRData | MainProductQRData, type: 'individual' | 'main') => void;
  className?: string;
}

export function QRCodeScanner({ onScanSuccess, className }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    QrScanner.hasCamera().then(setHasCamera);

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || !hasCamera) return;

    try {
      setIsScanning(true);

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          handleScanResult(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Error starting QR scanner:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive"
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScanResult = (data: string) => {
    try {
      const parsed = QRCodeService.parseQRData(data);

      if (parsed) {
        if (parsed.type === 'individual_product' || parsed.type === 'main_product') {
          const type = parsed.type === 'individual_product' ? 'individual' : 'main';
          onScanSuccess(parsed.data, type);

          toast({
            title: "QR Code Scanned",
            description: `Successfully scanned ${type} product QR code`
          });

          stopScanning();
        } else {
          toast({
            title: "Invalid QR Code",
            description: "This QR code is not a valid product QR code",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid QR Code",
          description: "Unable to parse QR code data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error parsing QR code:', error);
      toast({
        title: "Scan Error",
        description: "Failed to process QR code",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      handleScanResult(result);
    } catch (error) {
      console.error('Error scanning image:', error);
      toast({
        title: "Scan Error",
        description: "Failed to scan QR code from image",
        variant: "destructive"
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>QR Code Scanner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full h-64 bg-gray-100 rounded-lg ${
              isScanning ? 'block' : 'hidden'
            }`}
            playsInline
          />

          {!isScanning && (
            <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Camera className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {hasCamera && (
            <>
              {!isScanning ? (
                <Button onClick={startScanning} className="gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" className="gap-2">
                  <CameraOff className="h-4 w-4" />
                  Stop Camera
                </Button>
              )}
            </>
          )}

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </Button>
        </div>

        {!hasCamera && (
          <div className="text-center text-sm text-muted-foreground">
            <p>Camera not available. Use the upload button to scan QR codes from images.</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="text-xs text-muted-foreground">
          <p><strong>Supported QR codes:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Individual Product QR codes</li>
            <li>Main Product QR codes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}