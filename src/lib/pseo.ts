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
  { slug: 'europe', label: 'Europe', keywords: ['europe', 'uk', 'united kingdom', 'germany', 'france', 'spain', 'italy', 'netherlands', 'ireland', 'portugal', 'poland'] },
  { slug: 'latam', label: 'LATAM', keywords: ['latam', 'latin america', 'brazil', 'mexico', 'argentina', 'uruguay', 'colombia', 'chile', 'peru'] },
  { slug: 'apac', label: 'APAC', keywords: ['asia', 'oceania', 'australia', 'apac', 'india', 'japan', 'singapore', 'new zealand'] },
  { slug: 'africa', label: 'Africa', keywords: ['africa'] },
];

// Job urls follow Remotive's own pattern: https://remotive.com/remote-jobs/{category}/{slug}
export function getCategorySlug(url: string): string | null {
  const match = url.match(/\/remote-jobs\/([a-z0-9-]+)\//i);
  return match ? match[1].toLowerCase() : null;
}

export function formatCategoryLabel(slug: string): string {
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

function jobCategory(job: Job): string | null {
  return getCategorySlug(job.url);
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
