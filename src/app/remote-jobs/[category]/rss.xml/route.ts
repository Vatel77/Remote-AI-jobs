import { NextResponse } from 'next/server';
import { getEligibleCategories, getJobsForCategory, formatCategoryLabel } from '@/lib/pseo';
import { buildJobsRss } from '@/lib/rss';

// Same eligibility rule as the category hub page — no feed for thin categories.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getEligibleCategories().map(category => ({ category }));
}

export async function GET(request: Request, props: { params: Promise<{ category: string }> }) {
  const { category } = await props.params;
  const label = formatCategoryLabel(category);
  const xml = buildJobsRss(getJobsForCategory(category), {
    title: `RemoteAI Jobs — Remote ${label} Jobs`,
    description: `The latest 100% remote ${label} jobs, updated daily.`,
    feedPath: `/remote-jobs/${category}/rss.xml`,
  });
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
