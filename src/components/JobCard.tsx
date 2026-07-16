import React from 'react';

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
    <div className="job-card">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="job-info">
        <h3>{job.title}</h3>
        <div className="job-company">
          <span>{job.company}</span> • <span>{job.location}</span>
        </div>
        <div className="job-tags">
          {job.tags.map((tag) => (
            <span key={tag} className={`tag ${tag.toLowerCase().includes('ai') || tag.toLowerCase().includes('machine learning') ? 'ai' : ''}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="job-meta">
        {job.salary && <div className="job-salary">{job.salary}</div>}
        <div className="job-time">{job.postedAt}</div>
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          <button className="apply-btn">Apply Now</button>
        </a>
      </div>
    </div>
  );
}
