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
  {
    id: 'mumbai_university_bcom_2022',
    universityName: 'Mumbai University',
    degreeName: 'B.Com',
    year: 2022,
    referenceSignatureUrl: getImageUrl('mumbai_signature'),
    referenceSealUrl: getImageUrl('mumbai_seal'),
    templateDescription: 'The university logo is on the top right. The text is center-aligned. The seal overlaps the bottom-left corner of the student\'s photo.',
  },
  {
    id: 'maharashtra_board_hsc_2021',
    universityName: 'Maharashtra Board',
    degreeName: 'HSC',
    year: 2021,
    referenceSignatureUrl: getImageUrl('maharashtra_signature'),
    referenceSealUrl: getImageUrl('maharashtra_seal'),
    templateDescription: 'The board logo is a watermark in the center. The signature of the chairman is on the bottom-left.',
  },
    {
    id: 'pune_university_be_civil_2023',
    universityName: 'Pune University',
    degreeName: 'B.E. Civil',
    year: 2023,
    referenceSignatureUrl: getImageUrl('pune_signature'),
    referenceSealUrl: getImageUrl('pune_seal'),
    templateDescription: 'The seal is at the bottom center. The university name is in a gothic font. The student\'s name is highlighted in bold.',
  },
];
