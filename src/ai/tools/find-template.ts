'use server';
/**
 * @fileOverview A tool for the AI to find golden templates in Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}
const db = getFirestore();

const GoldenTemplateSchema = z.object({
    id: z.string(),
    universityName: z.string(),
    degreeName: z.string(),
    year: z.number(),
    referenceSignatureUrl: z.string(),
    referenceSealUrl: z.string(),
    templateDescription: z.string(),
});

const defaultTemplate: z.infer<typeof GoldenTemplateSchema> = {
    id: 'not-found',
    universityName: 'N/A',
    degreeName: 'N/A',
    year: 0,
    referenceSignatureUrl: 'N/A',
    referenceSealUrl: 'N/A',
    templateDescription: 'No template found. Analyze based on general document properties.',
};

export const findGoldenTemplate = ai.defineTool(
  {
    name: 'findGoldenTemplate',
    description: 'Finds the golden template for a given university name. Returns a default if not found.',
    input: z.object({
      universityName: z.string().describe('The name of the university to search for. Should be an exact match.'),
    }),
    output: GoldenTemplateSchema,
  },
  async (input) => {
    // Add a guard clause to prevent invalid queries
    if (!input.universityName || typeof input.universityName !== 'string') {
      console.log('Invalid or missing universityName provided. Returning default template.');
      return defaultTemplate;
    }

    console.log(`Searching for template with universityName: ${input.universityName}`);
    
    const templatesRef = collection(db, 'golden_templates');
    const q = query(
        templatesRef, 
        where('universityName', '==', input.universityName),
        limit(1)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No matching documents found. Returning default template.');
            return {
                ...defaultTemplate,
                universityName: input.universityName, // Keep the searched name for context
            };
        }
        
        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Validate data with Zod schema
        const validationResult = GoldenTemplateSchema.safeParse({
            id: doc.id,
            ...data,
        });

        if (validationResult.success) {
             console.log('Found and validated template:', validationResult.data);
            return validationResult.data;
        } else {
            console.error('Firestore data validation error:', validationResult.error);
            // Return default if data is malformed
            return defaultTemplate;
        }

    } catch (error) {
        console.error("Error in findGoldenTemplate tool:", error);
        // If there's an error during the query, return the default
        return defaultTemplate;
    }
  }
);
