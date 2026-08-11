import React from 'react';
import jobsData from '../../../../../data/jobs.json';
import JobCard from '@/components/JobCard';
import { Metadata } from 'next';
import { dictionaries, Locale } from "../../../../i18n/dictionaries";

type Props = {
  params: Promise<{ tag: string, lang: string }>
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
  const lang = (params.lang as Locale) || 'en';
  const dict = (dictionaries[lang] || dictionaries['en']).category;
  
  const jobs = jobsData.jobs.filter(job => 
    job.tags.some(t => t.toLowerCase() === tag)
  );

  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0' }}>
        <h1>{dict.title.replace('{tag}', displayTag)}</h1>
        <p>{dict.subtitle.replace('{count}', jobs.length.toString()).replace('{tag}', displayTag)}</p>
      </section>
      
      <div className="job-list">
        {jobs.length > 0 ? (
          jobs.map(job => <JobCard key={job.id} job={job} lang={lang} />)
        ) : (
          <p style={{ textAlign: 'center', color: '#888' }}>{dict.empty}</p>
        )}
      </div>
    </main>
  );
}
