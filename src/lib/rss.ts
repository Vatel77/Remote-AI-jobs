import { Job } from './pseo';

const SITE_URL = 'https://remote-ai-jobs-rust.vercel.app';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildJobsRss(jobs: Job[], opts: { title: string; description: string; feedPath: string }): string {
  const items = jobs.map(job => {
    const link = `${SITE_URL}/en/jobs/${job.id}`;
    const pubDate = job.postedAtISO ? new Date(job.postedAtISO).toUTCString() : new Date().toUTCString();
    return `
    <item>
      <title>${escapeXml(`${job.title} at ${job.company}`)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(`${job.title} — ${job.company} — ${job.location} — ${job.salary}`)}</description>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(opts.title)}</title>
<link>${SITE_URL}${opts.feedPath}</link>
<description>${escapeXml(opts.description)}</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
</channel>
</rss>`;
}
