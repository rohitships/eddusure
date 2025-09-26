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

const GenerateTrustScoreInputSchema = z.object({
  certificateDataUri: z
    .string()
    .describe(
      "A certificate file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  universityName: z.string().describe('The name of the university.'),
  degreeName: z.string().describe('The name of the degree.'),
  year: z.number().describe('The year the degree was awarded.'),
  referenceSignatureUrl: z
    .string()
    .describe('Cloud Storage URL to the golden signature image.'),
  referenceSealUrl: z
    .string()
    .describe('Cloud Storage URL to the golden seal image.'),
  templateDescription: z
    .string()
    .describe(
      'A detailed text description of the expected layout for the Gemini prompt.'
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
  prompt: `You are an expert forensic document analyst AI, specialized in detecting forged academic certificates. Your task is to analyze an uploaded academic certificate against provided reference materials and return a detailed analysis in a strict JSON format.

Analysis Steps:

Data Extraction:
First, extract the following information from the certificate PDF:
- studentName: The full name of the student.
- certificateId: The unique identification number of the certificate.
- institutionName: The name of the institution that issued the certificate.
- grades: The grades, marks, or final result obtained.
- dateOfBirth: The student's date of birth (if present).
- graduationDate: The date of graduation or degree conferral.

Structural & Layout Validation:
Analyze the layout of the provided certificate PDF.
Compare its structure against the following description of the official template: "{{templateDescription}}".
Check for the correct positioning, size, and aspect ratio of key elements like the university logo, header, footer, and text blocks.
Assign a structuralScore from 0.0 (complete mismatch) to 1.0 (perfect match).

Signature & Seal Verification:
Locate the signature and the official seal on the certificate PDF.
Compare the located signature against the provided reference signature image.
Compare the located seal against the provided reference seal image.
Evaluate for signs of digital tampering, pixelation, or inconsistencies.
Assign a signatureScore from 0.0 (clear forgery) to 1.0 (perfect match).

Typographical Anomaly Detection:
Analyze the fonts used throughout the document.
Check for inconsistencies in font type, size, kerning, and color, especially between different sections (e.g., student's name vs. course names).
Flag any text that appears to be digitally inserted or altered.
Assign a typographicalScore from 0.0 (many anomalies) to 1.0 (perfectly consistent).

Final Output:
Your final output MUST be a single JSON object. Do not include any other text or explanations outside of the JSON structure.

The JSON object must contain all extracted data fields and all analysis scores. The TrustScore is a weighted-average confidence score calculated as (0.4 * structuralScore) + (0.4 * signatureScore) + (0.2 * typographicalScore).

Here is the certificate to analyze: {{media url=certificateDataUri}}
Here is the reference signature image: {{media url=referenceSignatureUrl}}
Here is the reference seal image: {{media url=referenceSealUrl}}


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
