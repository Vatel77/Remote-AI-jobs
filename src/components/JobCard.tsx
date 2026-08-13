import React from 'react';
import Link from 'next/link';
import TrackedOutboundLink from './TrackedOutboundLink';

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  postedAt: string;
  url: string;
  isFeatured?: boolean;
};

export default function JobCard({ job, lang = 'en' }: { job: Job, lang?: string }) {
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
      "name": job.location === 'Worldwide' ? 'US' : job.location // Schema.org prefers specific countries, fallback to US for demo
    },
    "datePosted": new Date().toISOString().split('T')[0],
    "employmentType": "FULL_TIME",
    "baseSalary": job.salary ? {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": {
        "@type": "QuantitativeValue",
        "value": 100000, // Extracted value in a real app
        "unitText": "YEAR"
      }
    } : undefined
  };

  return (
    <div className={`job-card ${job.isFeatured ? 'featured' : ''}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="job-info">
        <TrackedOutboundLink
          href={job.url}
          target="_blank"
          eventName="Job Click"
          eventProps={{ jobId: job.id, company: job.company, source: job.id.split('-')[0], clickSource: 'title' }}
        >
          <h3>
            {job.title}
            {job.isFeatured && <span className="featured-badge">PROMOTED</span>}
          </h3>
        </TrackedOutboundLink>
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
