import React from 'react';
import jobsData from '../../../../data/jobs.json';
import JobCard from '@/components/JobCard';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ tag: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag);
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: `${capitalizedTag} AI Jobs - 100% Remote`,
    description: `Find the best remote ${capitalizedTag} jobs in the Artificial Intelligence industry.`,
  }
}

export async function generateStaticParams() {
  const tags = new Set<string>();
  jobsData.jobs.forEach(job => {
    job.tags.forEach(tag => tags.add(tag.toLowerCase()));
  });
  return Array.from(tags).map(tag => ({
    tag: tag,
  }));
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag).toLowerCase();
  
  const jobs = jobsData.jobs.filter(job => 
    job.tags.some(t => t.toLowerCase() === tag)
  );

  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0' }}>
        <h1>Remote {displayTag} Jobs</h1>
        <p>Showing {jobs.length} remote opportunities for {displayTag} professionals.</p>
      </section>
      
      <div className="job-list">
        {jobs.length > 0 ? (
          jobs.map(job => <JobCard key={job.id} job={job} />)
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>No jobs found for this category at the moment.</p>
        )}
      </div>
    </main>
  );
}
