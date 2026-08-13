import React from 'react';
import JobCard from '@/components/JobCard';
import AffiliateCard from '@/components/AffiliateCard';
import Link from 'next/link';
import { Metadata } from 'next';
import { dictionaries, Locale } from '../../../../../i18n/dictionaries';
import {
  getEligibleCategoryZonePairs,
  getJobsForCategoryAndZone,
  formatCategoryLabel,
  getZoneLabel,
} from '../../../../../lib/pseo';

// Category x zone combos with too few jobs are thin/duplicate content — don't build or serve them.
export const dynamicParams = false;

type Props = {
  params: Promise<{ category: string; zone: string; lang: string }>;
};

export async function generateStaticParams() {
  return getEligibleCategoryZonePairs();
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const category = decodeURIComponent(params.category).toLowerCase();
  const zone = decodeURIComponent(params.zone).toLowerCase();
  const categoryLabel = formatCategoryLabel(category);
  const zoneLabel = getZoneLabel(zone);
  const count = getJobsForCategoryAndZone(category, zone).length;
  return {
    title: `Remote ${categoryLabel} Jobs in ${zoneLabel} - 100% Remote`,
    description: `Browse ${count} remote ${categoryLabel} jobs open to candidates in ${zoneLabel}. Curated 100% remote opportunities, updated daily.`,
  };
}

export default async function CategoryZonePage(props: Props) {
  const params = await props.params;
  const category = decodeURIComponent(params.category).toLowerCase();
  const zone = decodeURIComponent(params.zone).toLowerCase();
  const lang = (params.lang as Locale) || 'en';
  const fullDict = dictionaries[lang] || dictionaries['en'];
  const dict = fullDict.remoteJobs;

  const jobs = getJobsForCategoryAndZone(category, zone);
  const categoryLabel = formatCategoryLabel(category);
  const zoneLabel = getZoneLabel(zone);

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0' }}>
        <h1>{dict.titleZone.replace('{category}', categoryLabel).replace('{zone}', zoneLabel)}</h1>
        <p>{dict.subtitleZone.replace('{count}', jobs.length.toString()).replace('{category}', categoryLabel).replace('{zone}', zoneLabel)}</p>
      </section>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Link href={`/${lang}/remote-jobs/${category}`} style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
          ← {dict.backToCategory.replace('{category}', categoryLabel)}
        </Link>
      </div>

      <div className="job-list">
        {jobs.map(job => <JobCard key={job.id} job={job} lang={lang} />)}
      </div>

      <AffiliateCard heading={fullDict.affiliates.heading} page={`remote-jobs/${category}/${zone}`} />
    </main>
  );
}
