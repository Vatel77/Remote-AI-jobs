import React from 'react';
import JobCard from '@/components/JobCard';
import Link from 'next/link';
import { Metadata } from 'next';
import { dictionaries, Locale } from '../../../../i18n/dictionaries';
import {
  getEligibleCategories,
  getJobsForCategory,
  getEligibleZonesForCategory,
  formatCategoryLabel,
} from '../../../../lib/pseo';

// Categories with too few jobs are thin/duplicate content — don't build or serve them.
export const dynamicParams = false;

type Props = {
  params: Promise<{ category: string; lang: string }>;
};

export async function generateStaticParams() {
  return getEligibleCategories().map(category => ({ category }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const category = decodeURIComponent(params.category).toLowerCase();
  const label = formatCategoryLabel(category);
  const count = getJobsForCategory(category).length;
  return {
    title: `Remote ${label} Jobs - 100% Remote`,
    description: `Browse ${count} remote ${label} jobs. Curated 100% remote opportunities, updated daily.`,
  };
}

export default async function CategoryHubPage(props: Props) {
  const params = await props.params;
  const category = decodeURIComponent(params.category).toLowerCase();
  const lang = (params.lang as Locale) || 'en';
  const dict = (dictionaries[lang] || dictionaries['en']).remoteJobs;

  const jobs = getJobsForCategory(category);
  const label = formatCategoryLabel(category);
  const zones = getEligibleZonesForCategory(category);

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0' }}>
        <h1>{dict.title.replace('{category}', label)}</h1>
        <p>{dict.subtitle.replace('{count}', jobs.length.toString()).replace('{category}', label)}</p>
      </section>

      {zones.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>{dict.browseByLocation}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {zones.map(zone => (
              <Link key={zone.slug} href={`/${lang}/remote-jobs/${category}/${zone.slug}`}>
                <span className="tag ai">{zone.label} ({zone.count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="job-list">
        {jobs.map(job => <JobCard key={job.id} job={job} lang={lang} />)}
      </div>
    </main>
  );
}
