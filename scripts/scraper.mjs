import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JOBS_PATH = path.join(__dirname, '..', 'data', 'jobs.json');
const META_PATH = path.join(__dirname, '..', 'data', 'jobs-meta.json');

// A job not re-observed in any source fetch for this many days is considered
// closed/expired and is dropped from the accumulated set.
const ORPHAN_RETENTION_DAYS = 45;
// Hard ceiling so the accumulated file can't grow forever.
const MAX_JOBS = 300;
// Guard against publishing a broken scrape (e.g. a source's API changed
// shape and returns nothing): don't write jobs.json if the total drops by
// more than this fraction versus last run. Only armed once we have a
// meaningful baseline, so normal day-to-day churn on a small dataset never
// trips it.
const VOLUME_DROP_GUARD = { minBaseline: 15, maxDropFraction: 0.3 };

// Keywords to filter AI / Machine Learning jobs, applied to every source.
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'nlp', 'prompt', 'llm', 'data scientist', 'deep learning', 'pytorch', 'tensorflow'];
const AI_KEYWORD_PATTERNS = AI_KEYWORDS.map(keyword => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`);
});
function isAiJob(text) {
  const lower = text.toLowerCase();
  return AI_KEYWORD_PATTERNS.some(pattern => pattern.test(lower));
}

// Canonical category vocabulary, based on Remotive's own category taxonomy
// (its `category` field already matches this exactly once slugified). Other
// sources map their own taxonomy onto these same slugs so volume pools into
// the same category/zone pSEO pages instead of fragmenting.
const CATEGORY_LABELS = {
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

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function decodeEntities(str) {
  return str.replace(/&amp;/g, '&').replace(/&#8217;/g, "'");
}

function timeSince(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';
  const now = new Date();
  const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'Just now';
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function buildTags(title, categoryLabel) {
  const tags = new Set(['Remote', categoryLabel]);
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('machine learning') || /\bml\b/.test(lowerTitle)) tags.add('Machine Learning');
  if (lowerTitle.includes('ai') || lowerTitle.includes('artificial')) tags.add('AI');
  if (lowerTitle.includes('data')) tags.add('Data');
  if (tags.size === 2) tags.add('AI'); // Fallback so every job keeps a topical tag
  return Array.from(tags);
}

// --- Remotive ---------------------------------------------------------

async function fetchRemotiveJobs() {
  console.log('Fetching jobs from Remotive API...');
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs');
    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching Remotive jobs:', error);
    return [];
  }
}

function normalizeRemotiveJob(job) {
  const categorySlug = slugify(job.category || 'all-others');
  const categoryLabel = CATEGORY_LABELS[categorySlug] || job.category || 'All others';
  return {
    id: `remotive-${job.id}`,
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || 'Worldwide',
    salary: job.salary || 'Competitive',
    tags: buildTags(job.title, categoryLabel),
    postedAt: timeSince(job.publication_date),
    url: job.url,
    _text: `${job.title} ${job.description || ''}`,
    _publishedISO: job.publication_date || new Date().toISOString(),
  };
}

// --- Jobicy -------------------------------------------------------------

// Jobicy's own industries mapped onto Remotive's category taxonomy so both
// sources feed the same category/zone pSEO pages instead of splintering.
const JOBICY_CATEGORY_MAP = {
  'Software Engineering': 'software-development',
  'QA & Testing': 'software-development',
  'Cybersecurity': 'software-development',
  'DevOps & Infrastructure': 'devops',
  'Data Science & Analytics': 'data-and-analytics',
  'Sales': 'sales',
  'Business Development': 'sales',
  'Marketing & Sales': 'marketing',
  'Creative & Design': 'design',
  'Customer Support & Success': 'customer-service',
  'Technical Support': 'customer-service',
  'Admin & Virtual Assistance': 'all-others',
  'Product & Operations': 'all-others',
  'HR & Recruiting': 'all-others',
  'Legal & Compliance': 'all-others',
  'Finance & Accounting': 'all-others',
  'Healthcare & Medical': 'medical',
};

async function fetchJobicyJobs() {
  console.log('Fetching jobs from Jobicy API...');
  try {
    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=100');
    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error('Error fetching Jobicy jobs:', error);
    return [];
  }
}

function formatJobicySalary(job) {
  if (job.salaryMin && job.salaryMax) {
    const currency = job.salaryCurrency || 'USD';
    const period = (job.salaryPeriod || 'year').toLowerCase();
    return `${currency} ${job.salaryMin.toLocaleString('en-US')} - ${job.salaryMax.toLocaleString('en-US')}/${period}`;
  }
  return 'Competitive';
}

function normalizeJobicyJob(job) {
  const industry = decodeEntities((job.jobIndustry || [])[0] || '');
  const categorySlug = JOBICY_CATEGORY_MAP[industry] || 'all-others';
  const categoryLabel = CATEGORY_LABELS[categorySlug];
  // jobGeo is already zone-shaped (e.g. "Europe,  Netherlands,  UK"); just tidy the spacing.
  const location = (job.jobGeo || 'Worldwide').replace(/,\s+/g, ', ').trim();
  return {
    id: `jobicy-${job.id}`,
    title: job.jobTitle,
    company: job.companyName,
    location,
    salary: formatJobicySalary(job),
    tags: buildTags(job.jobTitle, categoryLabel),
    postedAt: timeSince(job.pubDate),
    url: job.url,
    _text: `${job.jobTitle} ${job.jobExcerpt || ''}`,
    _publishedISO: job.pubDate || new Date().toISOString(),
  };
}

// --- Merge, dedupe, expire ----------------------------------------------

function loadExisting() {
  if (!fs.existsSync(JOBS_PATH)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf-8'));
    return (raw.jobs || []).map(job => ({
      ...job,
      // Migrate pre-existing unprefixed ids from the days this script only used Remotive.
      id: job.id.startsWith('remotive-') || job.id.startsWith('jobicy-') ? job.id : `remotive-${job.id}`,
    }));
  } catch {
    return [];
  }
}

function loadMeta() {
  if (!fs.existsSync(META_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function dedupeKey(job) {
  return `${slugify(job.title)}|${slugify(job.company)}`;
}

async function runScraper() {
  const now = new Date();
  const meta = loadMeta();

  const [remotiveRaw, jobicyRaw] = await Promise.all([fetchRemotiveJobs(), fetchJobicyJobs()]);
  console.log(`Fetched ${remotiveRaw.length} Remotive jobs, ${jobicyRaw.length} Jobicy jobs.`);
  // A single source returning nothing is often a transient blip (rate limit,
  // brief outage) — log it, but don't fail the run over one bad day. The
  // volume-drop guard below is what catches a source staying broken.
  if (remotiveRaw.length === 0) console.warn('WARNING: Remotive returned 0 jobs this run.');
  if (jobicyRaw.length === 0) console.warn('WARNING: Jobicy returned 0 jobs this run.');

  const freshCandidates = [
    ...remotiveRaw.map(normalizeRemotiveJob),
    ...jobicyRaw.map(normalizeJobicyJob),
  ].filter(job => isAiJob(job._text));
  console.log(`${freshCandidates.length} candidates matched the AI/ML keyword filter.`);

  const freshById = new Map(freshCandidates.map(job => [job.id, job]));
  freshById.forEach((job, id) => {
    meta[id] = { lastSeen: now.toISOString(), publishedAt: job._publishedISO };
  });

  const existing = loadExisting();
  const combinedById = new Map();
  // Carry forward existing jobs not re-fetched today, unless they've expired.
  for (const job of existing) {
    if (freshById.has(job.id)) continue; // fresh version wins, added below
    if (!meta[job.id]) {
      // No bookkeeping yet for this id (first run, or meta got reset) — treat
      // it as just seen instead of infinitely old, so it gets one full
      // retention window rather than being dropped immediately.
      meta[job.id] = { lastSeen: now.toISOString(), publishedAt: now.toISOString() };
    }
    const ageDays = (now - new Date(meta[job.id].lastSeen)) / (1000 * 60 * 60 * 24);
    if (ageDays <= ORPHAN_RETENTION_DAYS) {
      combinedById.set(job.id, job);
    } else {
      delete meta[job.id];
    }
  }
  freshById.forEach((job, id) => combinedById.set(id, job));

  // Cross-source dedupe: same title + company, published within 10 days of each other.
  const byDedupeKey = new Map();
  for (const job of combinedById.values()) {
    const key = dedupeKey(job);
    const published = new Date(meta[job.id]?.publishedAt || job._publishedISO || now);
    const existingEntry = byDedupeKey.get(key);
    if (!existingEntry) {
      byDedupeKey.set(key, { job, published });
      continue;
    }
    const daysApart = Math.abs(existingEntry.published - published) / (1000 * 60 * 60 * 24);
    if (daysApart > 10) {
      // Different postings with the same title/company far apart in time — keep both under distinct keys.
      byDedupeKey.set(`${key}|${job.id}`, { job, published });
      continue;
    }
    // Same posting duplicated across sources: keep the richer one.
    const score = j => (j.salary !== 'Competitive' ? 2 : 0) + j.tags.length;
    if (score(job) > score(existingEntry.job)) {
      byDedupeKey.set(key, { job, published });
    }
  }

  let finalJobs = Array.from(byDedupeKey.values())
    .sort((a, b) => b.published - a.published)
    .map(entry => entry.job)
    .slice(0, MAX_JOBS);

  // Strip internal-only fields before writing the public jobs.json.
  finalJobs = finalJobs.map(({ _text, _publishedISO, ...job }) => job);

  // Prune meta entries for jobs that didn't make the final cut.
  const finalIds = new Set(finalJobs.map(job => job.id));
  Object.keys(meta).forEach(id => {
    if (!finalIds.has(id)) delete meta[id];
  });

  const previousCount = existing.length;
  const { minBaseline, maxDropFraction } = VOLUME_DROP_GUARD;
  if (previousCount >= minBaseline && finalJobs.length < previousCount * (1 - maxDropFraction)) {
    console.error(
      `ABORTING: job count dropped from ${previousCount} to ${finalJobs.length} ` +
      `(more than ${maxDropFraction * 100}%). Not writing data/jobs.json — a source is likely broken. ` +
      `Check the Remotive/Jobicy fetch logs above.`
    );
    process.exit(1);
  }

  fs.writeFileSync(JOBS_PATH, JSON.stringify({ jobs: finalJobs }, null, 2));
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
  console.log(`Saved ${finalJobs.length} jobs to data/jobs.json (${freshById.size} fresh this run).`);
}

runScraper();
