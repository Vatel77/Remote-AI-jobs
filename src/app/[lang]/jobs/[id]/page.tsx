import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TrackedOutboundLink from '@/components/TrackedOutboundLink';
import {
  getAllJobs,
  getJobById,
  jobCategory,
  jobZones,
  getJobsForCategory,
  formatCategoryLabel,
  getZoneLabel,
} from '@/lib/pseo';
import { buildJobPostingJsonLd } from '@/lib/jobSchema';

const SITE_URL = 'https://remote-ai-jobs-rust.vercel.app';

// Jobs age out of jobs.json after 45 days without being re-observed by any
// source (see scripts/scraper.mjs) — once that happens this page should stop
// existing rather than keep serving stale content, per Google's guidance to
// remove JobPosting markup for expired postings.
export const dynamicParams = false;

type Props = {
  params: Promise<{ id: string; lang: string }>;
};

export async function generateStaticParams() {
  return getAllJobs().map(job => ({ id: job.id }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const job = getJobById(decodeURIComponent(params.id));
  if (!job) return {};
  return {
    title: `${job.title} at ${job.company} - Remote - RemoteAI Jobs`,
    description: `${job.title} at ${job.company}. 100% remote, open to candidates in ${job.location}. ${job.salary !== 'Competitive' ? job.salary + '.' : ''}`,
  };
}

export default async function JobDetailPage(props: Props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const job = getJobById(decodeURIComponent(params.id));
  if (!job) notFound();

  const category = jobCategory(job);
  const zones = jobZones(job);
  const categoryLabel = category ? formatCategoryLabel(category) : null;
  const canonicalUrl = `${SITE_URL}/${lang}/jobs/${job.id}`;
  const jsonLd = buildJobPostingJsonLd(job, canonicalUrl);

  const relatedJobs = category
    ? getJobsForCategory(category).filter(j => j.id !== job.id).slice(0, 3)
    : [];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ padding: '20px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <Link href={`/${lang}`}>Home</Link>
        {category && (
          <>
            {' / '}
            <Link href={`/${lang}/remote-jobs/${category}`}>{categoryLabel}</Link>
          </>
        )}
        {category && zones[0] && (
          <>
            {' / '}
            <Link href={`/${lang}/remote-jobs/${category}/${zones[0]}`}>{getZoneLabel(zones[0])}</Link>
          </>
        )}
      </div>

      <section className="hero" style={{ padding: '30px 0', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2.2rem' }}>{job.title}</h1>
        <p style={{ margin: 0 }}>
          <strong>{job.company}</strong> · {job.location}
        </p>
      </section>

      <div className="job-card" style={{ marginBottom: '30px' }}>
        <div className="job-info">
          <div className="job-tags">
            {job.tags.map(tag => (
              <span key={tag} className={`tag ${tag === 'AI' || tag === 'Machine Learning' ? 'ai' : ''}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="job-meta">
          <div className="job-salary">{job.salary}</div>
          <div className="job-time">{job.postedAt}</div>
          <TrackedOutboundLink
            href={job.url}
            target="_blank"
            eventName="Job Click"
            eventProps={{ jobId: job.id, company: job.company, source: job.id.split('-')[0], clickSource: 'detail_page' }}
          >
            <button className="apply-btn">Apply Now</button>
          </TrackedOutboundLink>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
        This 100% remote {categoryLabel ?? ''} position at {job.company} is open to candidates in {job.location}.
        Applications are handled directly by {job.company} on their original job listing — click Apply Now above to continue.
      </p>

      {relatedJobs.length > 0 && (
        <div className="affiliate-strip">
          <p className="affiliate-strip-heading">More {categoryLabel} jobs</p>
          <div className="job-list">
            {relatedJobs.map(related => (
              <Link key={related.id} href={`/${lang}/jobs/${related.id}`} className="job-card" style={{ display: 'block' }}>
                <div className="job-info">
                  <h3 style={{ margin: 0 }}>{related.title}</h3>
                  <div className="job-company">
                    <strong>{related.company}</strong>
                    <span>•</span>
                    <span>{related.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
