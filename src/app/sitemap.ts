import { MetadataRoute } from 'next'
import jobsData from '../../data/jobs.json';
import postsData from '../../data/posts.json';
import { getEligibleCategories, getEligibleZonesForCategory, getAllJobs } from '../lib/pseo';
export default function sitemap(): MetadataRoute.Sitemap {
  const tags = new Set<string>();
  jobsData.jobs.forEach(job => {
    job.tags.forEach(tag => tags.add(tag.toLowerCase()));
  });

  const categoryUrls = Array.from(tags).map(tag => ({
    url: `https://remote-ai-jobs-rust.vercel.app/category/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const eligibleCategories = getEligibleCategories();

  const remoteJobsCategoryUrls = eligibleCategories.map(category => ({
    url: `https://remote-ai-jobs-rust.vercel.app/en/remote-jobs/${category}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const remoteJobsZoneUrls = eligibleCategories.flatMap(category =>
    getEligibleZonesForCategory(category).map(zone => ({
      url: `https://remote-ai-jobs-rust.vercel.app/en/remote-jobs/${category}/${zone.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  );

  const jobUrls = getAllJobs().map(job => ({
    url: `https://remote-ai-jobs-rust.vercel.app/en/jobs/${job.id}`,
    lastModified: job.postedAtISO ? new Date(job.postedAtISO) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogUrls = postsData.posts.map(post => ({
    url: `https://remote-ai-jobs-rust.vercel.app/en/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://remote-ai-jobs-rust.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://remote-ai-jobs-rust.vercel.app/post-job',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://remote-ai-jobs-rust.vercel.app/en/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...categoryUrls,
    ...remoteJobsCategoryUrls,
    ...remoteJobsZoneUrls,
    ...jobUrls,
    ...blogUrls
  ]
}
