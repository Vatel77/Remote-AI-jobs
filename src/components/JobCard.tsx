import React from 'react';
import Link from 'next/link';
import TrackedOutboundLink from './TrackedOutboundLink';
import { jobCategory, formatCategoryLabel } from '@/lib/pseo';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  postedAt: string;
  postedAtISO?: string;
  url: string;
  isFeatured?: boolean;
};

export default function JobCard({ job, lang = 'en' }: { job: Job, lang?: string }) {
  const category = jobCategory(job);

  return (
    <div className={`job-card ${job.isFeatured ? 'featured' : ''}`}>
      <div className="job-info">
        <Link href={`/${lang}/jobs/${job.id}`}>
          <h3>
            {job.title}
            {job.isFeatured && <span className="featured-badge">PROMOTED</span>}
          </h3>
        </Link>
        <div className="job-company">
          <strong>{job.company}</strong>
          <span>•</span>
          <span>{job.location}</span>
        </div>

        <div className="job-tags">
          {job.tags.map(tag => {
            const isAI = ['machine learning', 'ai', 'prompt', 'llm'].some(k => tag.toLowerCase().includes(k));
            const isCategoryTag = category && formatCategoryLabel(category) === tag;
            const href = isCategoryTag
              ? `/${lang}/remote-jobs/${category}`
              : `/${lang}/category/${encodeURIComponent(tag.toLowerCase())}`;
            return (
              <Link key={tag} href={href}>
                <span className={`tag ${isAI ? 'ai' : ''}`}>
                  {tag}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="job-meta">
        <div className="job-salary">{job.salary}</div>
        <div className="job-time">{job.postedAt}</div>
        <TrackedOutboundLink
          href={job.url}
          target="_blank"
          eventName="Job Click"
          eventProps={{ jobId: job.id, company: job.company, source: job.id.split('-')[0], clickSource: 'apply_button' }}
        >
          <button className="apply-btn">Apply Now</button>
        </TrackedOutboundLink>
      </div>
    </div>
  );
}
