import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trust-score.ts';
import '@/ai/flows/summarize-findings.ts';
import '@/ai/flows/display-detailed-analysis.ts';