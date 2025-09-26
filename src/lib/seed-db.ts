// A standalone script to seed the Firestore database with golden templates.
// To run this script, use the command: `npm run seed`

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config'; // Adjust the import path as necessary
import { goldenTemplates } from './templates'; // Adjust the import path as necessary

async function seedDatabase() {
  console.log('Initializing Firebase connection...');
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Preparing to seed "golden_templates" collection...');

  // Get a new write batch
  const batch = writeBatch(db);
  const templatesCollection = collection(db, 'golden_templates');

  goldenTemplates.forEach((template) => {
    // Note: We use the `id` from our static data as the document ID in Firestore.
    // This makes it easy to reference these templates.
    const docRef = collection(db, 'golden_templates', template.id);
    batch.set(docRef, template);
  });

  try {
    // Commit the batch
    await batch.commit();
    console.log(`Successfully seeded ${goldenTemplates.length} documents into the "golden_templates" collection.`);
    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Firebase does not require an explicit disconnect for Node.js scripts.
    // The script will exit automatically when the async operations are done.
    // For long-running apps, you would manage the connection differently.
    process.exit(0);
  }
}

seedDatabase();
