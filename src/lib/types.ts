import type { GenerateTrustScoreOutput } from '@/ai/flows/generate-trust-score';

export type AnalysisResult = GenerateTrustScoreOutput;

export type Activity = {
  id: string;
  fileName: string;
  trustScore: number;
  status: 'success' | 'failure' | 'fraud';
  timestamp: Date;
};

export type GoldenTemplate = {
  id: string;
  universityName: string;
  degreeName: string;
  year: number;
  referenceSignatureUrl: string;
  referenceSealUrl: string;
  templateDescription: string;
};
