# **App Name**: TrustCheck

## Core Features:

- Document Upload: Allow users to upload academic certificate PDF files.
- AI-Powered Forensic Analysis: Utilize the Gemini 1.5 Pro API to analyze uploaded certificates, cross-referencing with reference signature/seal images and template descriptions to determine authenticity using the prompt I provided. The tool uses an LLM to evaluate the evidence from the uploaded document when forming its determination.
- TrustScore Generation: Generate a TrustScore based on structural, signature, and typographical analysis by Gemini. It also returns the complete JSON.
- Real-time Result Display: Display the TrustScore, detailed forensic breakdown, and any flags raised by the analysis in real-time via a Firestore listener.
- Admin Configuration: Enable administrative roles to add or edit accepted certificate layouts and templates.
- Template Management: Store university-specific degree templates, including reference signature and seal image URLs, and a detailed description in the `golden_templates` collection in Cloud Firestore.
- Activity Tracking: Track successful uploads and fraudulent document submissions

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey trust, security, and a connection to technology. The choice of hue is based on the academic context and conveys tradition without being dated.
- Background color: Very light blue (#E8EAF6), visibly the same hue as the primary, but much lighter and desaturated for a clean, professional feel.
- Accent color: Amber (#FFC107), an analogous color providing a contrast and a feel of institutional prestige.
- Font: 'Inter', a grotesque-style sans-serif that provides a modern, machined, objective, neutral, and highly readable appearance appropriate for both headlines and body text. No other font is required.
- Use crisp, professional icons to represent different aspects of the certificate validation process and data display, ensuring clarity and ease of understanding.
- Maintain a clean and organized layout to present the TrustScore, forensic breakdown, and flags, making the information easily digestible.
- Implement subtle animations to reflect processing status and highlight key results.