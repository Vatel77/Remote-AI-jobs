export type AffiliatePartner = {
  id: string;
  name: string;
  tagline: string;
  cta: string;
  // TODO: replace with your real affiliate tracking link once you're approved
  // for each program. Until then these point at the partners' plain
  // homepages (no commission is earned on clicks through these URLs).
  url: string;
};

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  {
    id: 'standout-cv',
    name: 'StandOut CV',
    tagline: 'Build an ATS-friendly resume that gets past the filters.',
    cta: 'Build your resume',
    // TODO: swap for your StandOut CV affiliate link (standout-cv.com/about/cv-builder-affiliate-program)
    url: 'https://standout-cv.com/',
  },
  {
    id: 'visualcv',
    name: 'VisualCV',
    tagline: 'Resume templates recruiters actually stop to read.',
    cta: 'Try VisualCV',
    // TODO: swap for your VisualCV affiliate link (visualcv.com/affiliates)
    url: 'https://www.visualcv.com/',
  },
  {
    id: 'careerio',
    name: 'Career.io',
    tagline: 'AI-assisted interview prep and career coaching.',
    cta: 'Explore Career.io',
    // TODO: swap for your Career.io affiliate link
    url: 'https://career.io/',
  },
];
