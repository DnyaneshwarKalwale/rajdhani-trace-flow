import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeService, IndividualProductQRData, MainProductQRData } from '@/lib/qrCode';

interface QRCodeDisplayProps {
  data: IndividualProductQRData | MainProductQRData;
  type: 'individual' | 'main';
  title?: string;
  className?: string;
}

export function QRCodeDisplay({ data, type, title, className }: QRCodeDisplayProps) {
  const [qrCodeURL, setQrCodeURL] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      setLoading(true);
      let qrURL: string;

      if (type === 'individual') {
        qrURL = await QRCodeService.generateIndividualProductQR(data as IndividualProductQRData);
      } else {
        qrURL = await QRCodeService.generateMainProductQR(data as MainProductQRData);
      }

      setQrCodeURL(qrURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [data, type]);

  const handleDownload = () => {
    if (qrCodeURL) {
      const filename = type === 'individual'
        ? `individual_product_${(data as IndividualProductQRData).serial_number}_qr`
        : `main_product_${(data as MainProductQRData).product_name.replace(/\s+/g, '_')}_qr`;

      QRCodeService.downloadQRCode(qrCodeURL, filename);
      toast({
        title: "Success",
        description: "QR code downloaded successfully"
      });
    }
  };

  const handlePrint = () => {
    if (qrCodeURL) {
      QRCodeService.printQRCode(qrCodeURL);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const qrData = type === 'individual'
        ? JSON.stringify({ type: 'individual_product', data, timestamp: new Date().toISOString() })
        : JSON.stringify({ type: 'main_product', data, timestamp: new Date().toISOString() });

      await navigator.clipboard.writeText(qrData);
      toast({
        title: "Success",
        description: "QR code data copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title || `${type === 'individual' ? 'Individual' : 'Main'} Product QR Code`}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={generateQRCode}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {loading ? (
            <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : qrCodeURL ? (
            <img
              src={qrCodeURL}
              alt="QR Code"
              className="w-64 h-64 border-2 border-gray-200 rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center w-64 h-64 bg-red-50 border-2 border-red-200 rounded-lg">
              <span className="text-red-500">Failed to generate QR code</span>
            </div>
          )}
        </div>

        {qrCodeURL && (
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy Data
            </Button>
          </div>
        )}

        {type === 'individual' && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Serial:</strong> {(data as IndividualProductQRData).serial_number}</p>
            <p><strong>Product:</strong> {(data as IndividualProductQRData).product_name}</p>
            <p><strong>Quality:</strong> {(data as IndividualProductQRData).quality_grade}</p>
            <p><strong>Inspector:</strong> {(data as IndividualProductQRData).inspector}</p>
            {(data as IndividualProductQRData).location && (
              <p><strong>Location:</strong> {(data as IndividualProductQRData).location}</p>
            )}
          </div>
        )}

        {type === 'main' && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Product:</strong> {(data as MainProductQRData).product_name}</p>
            <p><strong>Category:</strong> {(data as MainProductQRData).category}</p>
            <p><strong>Available:</strong> {(data as MainProductQRData).available_quantity}/{(data as MainProductQRData).total_quantity}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}