import jobsData from '../../data/jobs.json';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  postedAt: string;
  url: string;
};

const allJobs = jobsData.jobs as Job[];

// Below this many jobs, a category/zone page is thin content — skip generating it.
export const MIN_JOBS_PER_PAGE = 3;

type Zone = { slug: string; label: string; keywords: string[] };

export const ZONES: Zone[] = [
  { slug: 'worldwide', label: 'Worldwide', keywords: ['worldwide'] },
  { slug: 'usa', label: 'USA', keywords: ['usa', 'united states'] },
  { slug: 'canada', label: 'Canada', keywords: ['canada'] },
  { slug: 'europe', label: 'Europe', keywords: ['europe', 'emea', 'uk', 'united kingdom', 'germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'poland'] },
  { slug: 'latam', label: 'LATAM', keywords: ['latam', 'latin america', 'brazil', 'mexico', 'argentina', 'uruguay', 'colombia', 'chile', 'peru'] },
  { slug: 'apac', label: 'APAC', keywords: ['asia', 'oceania', 'australia', 'apac', 'india', 'japan', 'singapore', 'new zealand'] },
  { slug: 'africa', label: 'Africa', keywords: ['africa'] },
];

// Canonical category vocabulary. Must stay in sync with CATEGORY_LABELS in
// scripts/scraper.mjs, which tags every scraped job with one of these labels
// regardless of source, so category detection here doesn't depend on any
// one source's URL shape.
const CATEGORY_LABELS: Record<string, string> = {
  'sales': 'Sales',
  'information-technology': 'Information Technology',
  'customer-service': 'Customer Service',
  'writing': 'Writing',
  'design': 'Design',
  'data-and-analytics': 'Data and Analytics',
  'all-others': 'All others',
  'medical': 'Medical',
  'software-development': 'Software Development',
  'marketing': 'Marketing',
  'devops': 'Devops',
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCategoryLabel(slug: string): string {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function getZoneSlugsForLocation(location: string): string[] {
  const loc = location.toLowerCase();
  return ZONES.filter(z => z.keywords.some(k => loc.includes(k))).map(z => z.slug);
}

export function getZoneLabel(slug: string): string {
  return ZONES.find(z => z.slug === slug)?.label ?? formatCategoryLabel(slug);
}

// The scraper tags every job with its category label (see CATEGORY_LABELS
// above); find the tag that matches our known vocabulary.
function jobCategory(job: Job): string | null {
  for (const tag of job.tags) {
    const slug = slugify(tag);
    if (CATEGORY_LABELS[slug]) return slug;
  }
  return null;
}

function jobZones(job: Job): string[] {
  return getZoneSlugsForLocation(job.location);
}

export function getJobsForCategory(category: string): Job[] {
  return allJobs.filter(job => jobCategory(job) === category);
}

export function getJobsForCategoryAndZone(category: string, zone: string): Job[] {
  return allJobs.filter(job => jobCategory(job) === category && jobZones(job).includes(zone));
}

function getCategoryZoneCounts(): Map<string, Map<string, number>> {
  const map = new Map<string, Map<string, number>>();
  allJobs.forEach(job => {
    const cat = jobCategory(job);
    if (!cat) return;
    if (!map.has(cat)) map.set(cat, new Map());
    const zoneMap = map.get(cat)!;
    // Count the category total under a sentinel key, and each zone the job matches.
    zoneMap.set('__total__', (zoneMap.get('__total__') ?? 0) + 1);
    jobZones(job).forEach(zone => {
      zoneMap.set(zone, (zoneMap.get(zone) ?? 0) + 1);
    });
  });
  return map;
}

export function getEligibleCategories(): string[] {
  const map = getCategoryZoneCounts();
  return Array.from(map.entries())
    .filter(([, zoneMap]) => (zoneMap.get('__total__') ?? 0) >= MIN_JOBS_PER_PAGE)
    .map(([cat]) => cat);
}

export function getEligibleZonesForCategory(category: string): { slug: string; label: string; count: number }[] {
  const zoneMap = getCategoryZoneCounts().get(category);
  if (!zoneMap) return [];
  return Array.from(zoneMap.entries())
    .filter(([slug, count]) => slug !== '__total__' && count >= MIN_JOBS_PER_PAGE)
    .map(([slug, count]) => ({ slug, label: getZoneLabel(slug), count }))
    .sort((a, b) => b.count - a.count);
}

export function getEligibleCategoryZonePairs(): { category: string; zone: string }[] {
  const map = getCategoryZoneCounts();
  const pairs: { category: string; zone: string }[] = [];
  map.forEach((zoneMap, category) => {
    zoneMap.forEach((count, zone) => {
      if (zone !== '__total__' && count >= MIN_JOBS_PER_PAGE) pairs.push({ category, zone });
    });
  });
  return pairs;
}
