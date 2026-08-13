import { Job } from './pseo';

// Parses our free-text salary field into a schema.org-safe numeric range.
// Returns null when the text can't be confidently parsed (e.g. "Competitive")
// — Google penalizes fabricated structured data, so omitting baseSalary is
// the correct move when we're not sure, not guessing a number.
export function parseSalaryForSchema(salary: string): { currency: string; unit: 'HOUR' | 'YEAR'; min: number; max: number } | null {
  if (!salary) return null;
  const text = salary.trim();
  if (/competitive|negotiable|\bdoe\b/i.test(text)) return null;

  const currencyCode = text.match(/\b(USD|CAD|EUR|GBP|AUD)\b/i);
  let currency = currencyCode ? currencyCode[1].toUpperCase() : null;
  if (!currency) {
    if (text.includes('$')) currency = 'USD';
    else if (text.includes('€')) currency = 'EUR';
    else if (text.includes('£')) currency = 'GBP';
  }
  if (!currency) return null;

  const unit: 'HOUR' | 'YEAR' = /\/\s*hr\b|\/\s*hour\b|per\s*hour/i.test(text) ? 'HOUR' : 'YEAR';

  const numbers = [...text.matchAll(/(\d[\d,]*\.?\d*)\s*(k)?/gi)]
    .map(m => {
      const raw = parseFloat(m[1].replace(/,/g, ''));
      return m[2] ? raw * 1000 : raw;
    })
    .filter(n => !isNaN(n) && n > 0);

  if (numbers.length === 0) return null;
  return { currency, unit, min: Math.min(...numbers), max: Math.max(...numbers) };
}

// Recognizable country tokens in our free-text location field, mapped to the
// full English country name schema.org expects. Only used to build
// applicantLocationRequirements — jobs where we can't confidently identify a
// country (e.g. "Worldwide", or a region-only string) simply omit that
// property rather than guess, which is valid for TELECOMMUTE postings.
const COUNTRY_KEYWORDS: [string, string][] = [
  ['united states', 'United States'], ['usa', 'United States'],
  ['canada', 'Canada'],
  ['united kingdom', 'United Kingdom'], ['uk', 'United Kingdom'],
  ['germany', 'Germany'], ['france', 'France'], ['ireland', 'Ireland'],
  ['spain', 'Spain'], ['italy', 'Italy'], ['netherlands', 'Netherlands'],
  ['poland', 'Poland'], ['portugal', 'Portugal'], ['ukraine', 'Ukraine'],
  ['türkiye', 'Turkey'], ['turkey', 'Turkey'], ['denmark', 'Denmark'],
  ['brazil', 'Brazil'], ['mexico', 'Mexico'], ['argentina', 'Argentina'],
  ['uruguay', 'Uruguay'], ['colombia', 'Colombia'], ['chile', 'Chile'], ['peru', 'Peru'],
  ['india', 'India'], ['japan', 'Japan'], ['singapore', 'Singapore'],
  ['australia', 'Australia'], ['new zealand', 'New Zealand'], ['israel', 'Israel'],
];

export function getCountriesForSchema(location: string): string[] {
  const loc = location.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, name] of COUNTRY_KEYWORDS) {
    if (loc.includes(keyword)) found.add(name);
  }
  return Array.from(found);
}

export function buildJobPostingJsonLd(job: Job, canonicalUrl: string) {
  const countries = getCountriesForSchema(job.location);
  const salary = parseSalaryForSchema(job.salary);
  const source = job.id.split('-')[0];

  return {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: `<p>Remote ${job.title} position at ${job.company}, open to candidates in ${job.location}.</p><p>Key skills: ${job.tags.filter(t => !['Remote'].includes(t)).join(', ')}.</p>`,
    identifier: {
      '@type': 'PropertyValue',
      name: source === 'jobicy' ? 'Jobicy' : 'Remotive',
      value: job.id,
    },
    datePosted: job.postedAtISO ? job.postedAtISO.split('T')[0] : undefined,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocationType: 'TELECOMMUTE',
    applicantLocationRequirements: countries.length > 0
      ? countries.map(name => ({ '@type': 'Country', name }))
      : undefined,
    employmentType: 'FULL_TIME',
    baseSalary: salary ? {
      '@type': 'MonetaryAmount',
      currency: salary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: salary.min,
        maxValue: salary.max,
        unitText: salary.unit,
      },
    } : undefined,
    url: canonicalUrl,
  };
}
