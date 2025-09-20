import type { GoldenTemplate } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImageUrl = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const goldenTemplates: GoldenTemplate[] = [
  {
    id: 'ranchi_university_btech_cse_2024',
    universityName: 'Ranchi University',
    degreeName: 'B.Tech Computer Science',
    year: 2024,
    referenceSignatureUrl: getImageUrl('ranchi_signature'),
    referenceSealUrl: getImageUrl('ranchi_seal'),
    templateDescription: "The university logo is in the top-left corner at coordinates (50,50) with a size of 100x100 pixels. The student's name is in 18pt Times New Roman font. The footer contains the certificate number in 10pt Arial font.",
  },
  {
    id: 'delhi_university_ba_history_2023',
    universityName: 'Delhi University',
    degreeName: 'B.A. History',
    year: 2023,
    referenceSignatureUrl: getImageUrl('delhi_signature'),
    referenceSealUrl: getImageUrl('delhi_seal'),
    templateDescription: 'The university seal is centered at the top. The main text is justified. The signature is on the bottom right above the registrar title.',
  },
];
