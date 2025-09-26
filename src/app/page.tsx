'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateTrustScore, type GenerateTrustScoreInput } from '@/ai/flows/generate-trust-score';
import type { AnalysisResult, Activity, GoldenTemplate } from '@/lib/types';

import Header from '@/components/trustcheck/Header';
import UploadOrScan from '@/components/trustcheck/UploadOrScan';
import ResultsDisplay from '@/components/trustcheck/ResultsDisplay';
import ActivityTracker from '@/components/trustcheck/ActivityTracker';
import AnalyticsDashboard from '@/components/trustcheck/AnalyticsDashboard';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { addDoc } from 'firebase/firestore';
import { collection } from 'firebase/firestore';
import { Sidebar, SidebarContent, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '@/components/ui/sidebar';
import Auth from '@/components/trustcheck/Auth';
import { ShieldCheck } from 'lucide-react';


export default function TrustCheckPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const verificationsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/verifications`);
  }, [firestore, user]);


  const handleAnalysis = async (data: { file: File; template: GoldenTemplate }) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to perform an analysis.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const certificateDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(data.file);
      });

      const input: GenerateTrustScoreInput = {
        certificateDataUri,
        universityName: data.template.universityName,
        degreeName: data.template.degreeName,
        year: data.template.year,
        referenceSignatureUrl: data.template.referenceSignatureUrl,
        referenceSealUrl: data.template.referenceSealUrl,
        templateDescription: data.template.templateDescription,
      };

      const result = await generateTrustScore(input);
      if (result.TrustScore === undefined || result.TrustScore === null) {
        throw new Error('AI analysis failed to return a valid result. Please try a different file.');
      }
      
      const resultWithMetadata: AnalysisResult = {
        ...result,
        fileName: data.file.name,
        universityName: data.template.universityName,
      };
      setAnalysisResult(resultWithMetadata);

      if (verificationsCollection) {
        const newActivity: Omit<Activity, 'id'> = {
          fileName: data.file.name,
          trustScore: result.TrustScore,
          status: result.TrustScore < 0.7 ? 'fraud' : 'success',
          analysisResult: result.analysisResult,
          universityName: data.template.universityName,
          studentName: result.studentName,
          certificateId: result.certificateId,
          createdAt: new Date().toISOString(),
        };
        await addDoc(verificationsCollection, newActivity);
      }

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      if (verificationsCollection) {
        const failedActivity = {
          fileName: data.file.name,
          trustScore: 0,
          status: 'failure' as const,
          createdAt: new Date().toISOString(),
          universityName: data.template.universityName,
          studentName: 'N/A',
          certificateId: 'N/A',
          analysisResult: {},
        };
        await addDoc(verificationsCollection, failedActivity);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScannedData = (scannedData: string) => {
    try {
      const result: AnalysisResult = JSON.parse(scannedData);
      setAnalysisResult(result);
      setError(null);
      setIsLoading(false);

       toast({
        title: 'Scan Successful',
        description: `Successfully loaded verification data for ${result.fileName}.`,
      });

    } catch (e) {
       console.error("Failed to parse scanned QR code data", e);
       const errorMessage = "The scanned QR code contains invalid data.";
       setError(errorMessage);
       setAnalysisResult(null);
       toast({
        title: 'Scan Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="bg-muted/40">
      <Sidebar>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton href="#" isActive>
                    <ShieldCheck />
                    TrustCheck
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Auth />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <AnalyticsDashboard />
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <UploadOrScan onAnalyze={handleAnalysis} isLoading={isLoading} onScan={handleScannedData} />
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <ResultsDisplay
                  isLoading={isLoading}
                  result={analysisResult}
                  error={error}
                />
              </div>
            </div>
            <ActivityTracker />
        </main>
      </SidebarInset>
    </div>
  );
}
