import type { GenerateTrustScoreOutput } from '@/ai/flows/generate-trust-score';

export type WithId<T> = T & { id: string };

export type AnalysisResult = GenerateTrustScoreOutput & {
    fileName?: string;
    universityName?: string;
};

export type Activity = {
  fileName: string;
  trustScore: number;
  status: 'success' | 'failure' | 'fraud';
  createdAt: string;
  universityName: string;
  analysisResult: GenerateTrustScoreOutput['analysisResult'];
  studentName?: string;
  certificateId?: string;
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

export type User = {
    id: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
};
