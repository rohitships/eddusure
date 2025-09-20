'use server';

/**
 * @fileOverview This flow takes the analysis result from Gemini and prepares it for display.
 *
 * - displayDetailedAnalysis - A function that prepares the detailed analysis for display.
 * - DisplayDetailedAnalysisInput - The input type for the displayDetailedAnalysis function.
 * - DisplayDetailedAnalysisOutput - The return type for the displayDetailedAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayDetailedAnalysisInputSchema = z.object({
  analysisResult: z
    .any()
    .describe('The full JSON object returned by the Gemini API.'),
});
export type DisplayDetailedAnalysisInput = z.infer<
  typeof DisplayDetailedAnalysisInputSchema
>;

const DisplayDetailedAnalysisOutputSchema = z.object({
  structuralScore: z.number().describe('A float between 0.0 and 1.0.'),
  signatureScore: z.number().describe('A float between 0.0 and 1.0.'),
  typographicalScore: z.number().describe('A float between 0.0 and 1.0.'),
  TrustScore: z.number().describe('The final, weighted-average confidence score.'),
  summary: z.string().describe('A brief summary of the findings.'),
  flags: z.array(z.string()).describe('An array of strings describing any detected issues.'),
});
export type DisplayDetailedAnalysisOutput = z.infer<
  typeof DisplayDetailedAnalysisOutputSchema
>;

export async function displayDetailedAnalysis(
  input: DisplayDetailedAnalysisInput
): Promise<DisplayDetailedAnalysisOutput> {
  return displayDetailedAnalysisFlow(input);
}

const displayDetailedAnalysisFlow = ai.defineFlow(
  {
    name: 'displayDetailedAnalysisFlow',
    inputSchema: DisplayDetailedAnalysisInputSchema,
    outputSchema: DisplayDetailedAnalysisOutputSchema,
  },
  async input => {
    // Directly return the analysis result, assuming it matches the output schema.
    // In a real application, you might want to add error handling and
    // transformation logic here to ensure the data is in the expected format.
    return input.analysisResult as DisplayDetailedAnalysisOutput;
  }
);
