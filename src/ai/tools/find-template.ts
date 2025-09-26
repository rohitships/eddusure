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

export const findGoldenTemplate = ai.defineTool(
  {
    name: 'findGoldenTemplate',
    description: 'Finds the golden template for a given university name.',
    input: z.object({
      universityName: z.string().describe('The name of the university to search for. Should be an exact match.'),
    }),
    output: GoldenTemplateSchema.nullable(),
  },
  async (input) => {
    // Add a guard clause to prevent invalid queries
    if (!input.universityName || typeof input.universityName !== 'string') {
      console.log('Invalid or missing universityName provided to findGoldenTemplate tool. Returning null.');
      return null;
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
            console.log('No matching documents found.');
            return null;
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
            return null;
        }

    } catch (error) {
        console.error("Error querying Firestore for golden template:", error);
        return null;
    }
  }
);
