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
  return (
    <div className="job-card">
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
