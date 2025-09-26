'use server';

/**
 * @fileOverview A flow to analyze a certificate and generate a TrustScore using the Gemini API.
 *
 * - generateTrustScore - A function that takes a certificate file and returns a TrustScore.
 * - GenerateTrustScoreInput - The input type for the generateTrustScore function.
 * - GenerateTrustScoreOutput - The return type for the generateTrustScore function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { findGoldenTemplate } from '@/ai/tools/find-template';


const GenerateTrustScoreInputSchema = z.object({
  certificateDataUri: z
    .string()
    .describe(
      "A certificate file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateTrustScoreInput = z.infer<typeof GenerateTrustScoreInputSchema>;

const AnalysisResultSchema = z.object({
    structuralScore: z.number().describe('A float between 0.0 and 1.0.'),
    signatureScore: z.number().describe('A float between 0.0 and 1.0.'),
    typographicalScore: z.number().describe('A float between 0.0 and 1.0.'),
    TrustScore: z.number().describe('A final, weighted-average confidence score.'),
    summary: z.string().describe('A brief, one-sentence summary of your findings.'),
    flags: z.array(z.string()).describe('An array of strings describing any detected issues.'),
    studentName: z.string().describe("The full name of the student as it appears on the certificate."),
    certificateId: z.string().describe("The unique identification number of the certificate."),
    institutionName: z.string().describe("The name of the institution that issued the certificate."),
    grades: z.string().describe("The grades or marks obtained by the student."),
    dateOfBirth: z.string().describe("The student's date of birth as it appears on the certificate (if present)."),
    graduationDate: z.string().describe("The date of graduation or completion."),
});

const GenerateTrustScoreOutputSchema = AnalysisResultSchema.extend({
  analysisResult: AnalysisResultSchema.describe('The full JSON object returned by the Gemini API.'),
});

export type GenerateTrustScoreOutput = z.infer<typeof GenerateTrustScoreOutputSchema>;


export async function generateTrustScore(
  input: GenerateTrustScoreInput
): Promise<GenerateTrustScoreOutput> {
  return generateTrustScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTrustScorePrompt',
  input: {schema: GenerateTrustScoreInputSchema},
  output: {schema: GenerateTrustScoreOutputSchema},
  tools: [findGoldenTemplate],
  prompt: `You are an expert forensic document analyst AI, specialized in detecting forged academic certificates. Your task is to analyze an uploaded academic certificate and return a detailed analysis in a strict JSON format.

Your process is as follows:

1.  **Initial Data Extraction**: First, extract the 'institutionName' from the provided certificate.

2.  **Find Golden Template**: Use the extracted 'institutionName' to call the 'findGoldenTemplate' tool. This tool will return the reference signature URL, seal URL, and template description for that specific institution. If no template is found, you must stop and report an error.

3.  **Full Analysis**: Once you have the golden template, perform a full analysis of the certificate.
    *   **Data Extraction**: Extract all required fields: studentName, certificateId, institutionName, grades, dateOfBirth, and graduationDate.
    *   **Structural & Layout Validation**: Compare the certificate's structure against the 'templateDescription' from the golden template. Assign a 'structuralScore' from 0.0 to 1.0.
    *   **Signature & Seal Verification**: Compare the signature and seal on the certificate against the 'referenceSignatureUrl' and 'referenceSealUrl' from the golden template. Assign a 'signatureScore' from 0.0 to 1.0.
    *   **Typographical Anomaly Detection**: Analyze for font and text inconsistencies. Assign a 'typographicalScore' from 0.0 to 1.0.

4.  **Final Output**: Your final output MUST be a single JSON object. Do not include any other text or explanations outside of the JSON structure.
    *   Calculate the 'TrustScore' as a weighted average: (0.4 * structuralScore) + (0.4 * signatureScore) + (0.2 * typographicalScore).
    *   The JSON object must contain all extracted data fields and all analysis scores.

Here is the certificate to analyze: {{media url=certificateDataUri}}

Output the JSON:
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateTrustScoreFlow = ai.defineFlow(
  {
    name: 'generateTrustScoreFlow',
    inputSchema: GenerateTrustScoreInputSchema,
    outputSchema: GenerateTrustScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('AI analysis failed to return a valid result.');
    }

    try {
      // The entire output is the analysis result.
      // We return it directly and also nest it under the `analysisResult` key
      // to match the expected schema.
      return {
        ...output,
        analysisResult: output,
      };
    } catch (error) {
      console.error('Failed to process AI output:', error);
      // If processing fails, return a structured error response
      const errorResult = {
        structuralScore: 0,
        signatureScore: 0,
        typographicalScore: 0,
        TrustScore: 0,
        summary: 'Failed to process analysis.',
        flags: ['Error in AI response processing.'],
        studentName: 'N/A',
        certificateId: 'N/A',
        institutionName: 'N/A',
        grades: 'N/A',
        dateOfBirth: 'N/A',
        graduationDate: 'N/A',
      };
      return {
        ...errorResult,
        analysisResult: {
            ...errorResult,
            summary: "Raw output was not valid.",
            flags: []
        },
      };
    }
  }
);
