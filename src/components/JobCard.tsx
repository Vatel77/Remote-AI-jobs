import React from 'react';
import Link from 'next/link';

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

export default function JobCard({ job }: { job: Job }) {
  // Generate JSON-LD for Google for Jobs
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": `Remote ${job.title} position at ${job.company}. Required skills: ${job.tags.join(', ')}.`,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company,
    },
    "jobLocationType": "TELECOMMUTE",
    "applicantLocationRequirements": {
      "@type": "Country",
  isFeatured?: boolean;
}

export default function JobCard({ job, lang = 'en' }: { job: Job, lang?: string }) {
  return (
    <div className={`job-card ${job.isFeatured ? 'featured' : ''}`}>
      <div className="job-info">
        <Link href={job.url} target="_blank">
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
            return (
              <Link key={tag} href={`/${lang}/category/${encodeURIComponent(tag.toLowerCase())}`}>
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
        <Link href={job.url} target="_blank">
          <button className="apply-btn">Apply Now</button>
        </Link>
      </div>
    </div>
  );
}
