'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateTrustScore, type GenerateTrustScoreInput } from '@/ai/flows/generate-trust-score';
import type { AnalysisResult, Activity, GoldenTemplate } from '@/lib/types';

import Header from '@/components/trustcheck/Header';
import UploadForm from '@/components/trustcheck/UploadForm';
import ResultsDisplay from '@/components/trustcheck/ResultsDisplay';
import ActivityTracker from '@/components/trustcheck/ActivityTracker';

export default function TrustCheckPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { toast } = useToast();

  const handleAnalysis = async (data: { file: File; template: GoldenTemplate }) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

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

      setAnalysisResult(result);
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        fileName: data.file.name,
        trustScore: result.TrustScore,
        status: result.TrustScore < 0.7 ? 'fraud' : 'success',
        timestamp: new Date(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        fileName: data.file.name,
        trustScore: 0,
        status: 'failure',
        timestamp: new Date(),
      };
      setActivities((prev) => [newActivity, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-3">
            <UploadForm onAnalyze={handleAnalysis} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-4">
            <ResultsDisplay
              isLoading={isLoading}
              result={analysisResult}
              error={error}
            />
          </div>
        </div>
        <ActivityTracker activities={activities} />
      </main>
    </div>
  );
}
