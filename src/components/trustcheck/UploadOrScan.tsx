'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UploadForm from './UploadForm';
import QrScannerComponent from './QrScanner';
import type { GoldenTemplate } from '@/lib/types';
import { UploadCloud, QrCode } from 'lucide-react';

type UploadOrScanProps = {
  onAnalyze: (data: { file: File; template: GoldenTemplate }) => void;
  isLoading: boolean;
  onScan: (data: string) => void;
};

export default function UploadOrScan({ onAnalyze, isLoading, onScan }: UploadOrScanProps) {
  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload Document
        </TabsTrigger>
        <TabsTrigger value="scan">
          <QrCode className="mr-2 h-4 w-4" />
          Scan QR Code
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <UploadForm onAnalyze={onAnalyze} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="scan">
        <QrScannerComponent onScan={onScan} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
