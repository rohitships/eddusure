'use client';

import { AlertTriangle, CheckCircle2, FileText, PenSquare, Scaling, Type, Download, QrCode } from 'lucide-react';
import type { AnalysisResult } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ScoreCircle from './ScoreCircle';
import QRCode from 'qrcode.react';
import { useRef } from 'react';

type ResultsDisplayProps = {
  isLoading: boolean;
  result: AnalysisResult | null;
  error: string | null;
};

const DetailItem = ({ icon: Icon, title, score }: { icon: React.ElementType, title: string, score: number }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm">{title}</span>
    </div>
    <span className="text-sm font-semibold">{`${(score * 100).toFixed(0)}%`}</span>
  </div>
);

export default function ResultsDisplay({ isLoading, result, error }: ResultsDisplayProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector('canvas');
      if (canvas) {
        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        let downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${result?.fileName}-trustcheck-qr.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis in Progress</CardTitle>
          <CardDescription>Cross-referencing document against trusted sources...</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <Skeleton className="h-40 w-40 rounded-full" />
          <div className="w-full space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Analysis Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <Card className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12" />
          <p className="mt-4 text-sm">Your analysis results will appear here.</p>
        </div>
      </Card>
    );
  }

  const scoreValue = Math.round(result.TrustScore * 100);
  const qrCodeValue = JSON.stringify(result);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Analysis Complete</CardTitle>
                <CardDescription>
                    {result.fileName} from {result.universityName}
                </CardDescription>
            </div>
             <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <QrCode className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Verification QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 py-4">
                       <div ref={qrCodeRef}>
                         <QRCode value={qrCodeValue} size={256} />
                       </div>
                        <p className="text-center text-sm text-muted-foreground">
                            Scan this code with the TrustCheck app to instantly verify this certificate's authenticity.
                        </p>
                        <Button onClick={downloadQRCode}>
                            <Download className="mr-2 h-4 w-4" />
                            Download QR Code
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ScoreCircle score={scoreValue} />
          <p className="text-center text-lg font-medium">{result.summary}</p>
        </div>
        <div className="space-y-4">
          {result.flags && result.flags.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Flags Raised</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {result.flags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {result.flags.length === 0 && (
             <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>No Flags Raised</AlertTitle>
              <AlertDescription>The analysis did not find any significant issues.</AlertDescription>
            </Alert>
          )}

          <Separator />
          <div className="space-y-3">
             <h4 className="font-medium">Forensic Breakdown</h4>
            <DetailItem icon={Scaling} title="Structural Score" score={result.structuralScore} />
            <DetailItem icon={PenSquare} title="Signature Score" score={result.signatureScore} />
            <DetailItem icon={Type} title="Typographical Score" score={result.typographicalScore} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
