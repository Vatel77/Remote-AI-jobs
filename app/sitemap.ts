import { MetadataRoute } from 'next'
import jobsData from '../../data/jobs.json';
 
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
    ...categoryUrls
  ]
}
