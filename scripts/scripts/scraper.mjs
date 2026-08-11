import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keywords to filter AI / Machine Learning jobs
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'nlp', 'prompt', 'llm', 'data scientist', 'deep learning', 'pytorch', 'tensorflow'];

async function fetchRemotiveJobs() {
  console.log("Fetching jobs from Remotive API...");
  try {
    const response = await fetch('https://remotive.com/api/remote-jobs?category=software-dev');
    const data = await response.json();
    return data.jobs || [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

function isAiJob(job) {
  const text = (job.title + " " + job.description).toLowerCase();
  return AI_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
}

function timeSince(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

async function runScraper() {
  const jobs = await fetchRemotiveJobs();
  console.log(`Fetched ${jobs.length} remote software jobs.`);
  
  const aiJobs = jobs.filter(isAiJob);
  console.log(`Filtered down to ${aiJobs.length} AI-related jobs.`);

  const formattedJobs = aiJobs.map(job => {
    // Generate some tags
    const tags = ['Remote'];
    if (job.title.toLowerCase().includes('machine learning') || job.title.toLowerCase().includes('ml')) tags.push('Machine Learning');
    if (job.title.toLowerCase().includes('ai') || job.title.toLowerCase().includes('artificial')) tags.push('AI');
    if (job.title.toLowerCase().includes('data')) tags.push('Data');
    if (tags.length === 1) tags.push('AI'); // Fallback

    return {
      id: job.id.toString(),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Worldwide',
      salary: job.salary || 'Competitive',
      tags: tags,
      postedAt: timeSince(job.publication_date),
      url: job.url
    };
  });

  // Keep top 50 to not overload the JSON file
  const recentJobs = formattedJobs.slice(0, 50);

  const outputPath = path.join(__dirname, '..', 'data', 'jobs.json');
  
  // Ensure data directory exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify({ jobs: recentJobs }, null, 2));
  console.log(`Successfully saved ${recentJobs.length} jobs to data/jobs.json`);
}

runScraper();
