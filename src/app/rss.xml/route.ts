import { NextResponse } from 'next/server';
import { getAllJobs } from '@/lib/pseo';
import { buildJobsRss } from '@/lib/rss';

export async function GET() {
  const xml = buildJobsRss(getAllJobs(), {
    title: 'RemoteAI Jobs — All Remote AI Jobs',
    description: 'The latest 100% remote AI & Machine Learning jobs, updated daily.',
    feedPath: '/rss.xml',
  });
  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
