import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateNewsletter() {
  const jobsPath = path.join(__dirname, '..', 'data', 'jobs.json');
  
  if (!fs.existsSync(jobsPath)) {
    console.error("No jobs.json found. Run the scraper first.");
    return;
  }

  const data = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  const jobs = data.jobs || [];

  if (jobs.length === 0) {
    console.log("No jobs to include in the newsletter.");
    return;
  }

  // Take top 5 recent jobs
  const topJobs = jobs.slice(0, 5);

  let htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
    <h1 style="color: #000; text-align: center;">🚀 RemoteAI Jobs - Weekly Digest</h1>
    <p style="text-align: center; color: #666;">Here are the top ${topJobs.length} AI & Remote jobs of the week.</p>
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
  `;

  topJobs.forEach(job => {
    htmlContent += `
    <div style="margin-bottom: 25px; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #000;">${job.title}</h2>
      <p style="margin: 0 0 5px 0; font-size: 14px;"><strong>🏢 ${job.company}</strong> | 📍 ${job.location}</p>
      ${job.salary ? `<p style="margin: 0 0 15px 0; font-size: 14px; color: #008000;">💰 ${job.salary}</p>` : ''}
      <a href="${job.url}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; font-size: 14px;">View Job</a>
    </div>
    `;
  });

  htmlContent += `
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
    <p style="text-align: center; font-size: 12px; color: #999;">
      You received this because you subscribed to RemoteAI Jobs.<br/>
      To post a job, <a href="https://yourwebsite.com/post-job" style="color: #000;">click here</a>.
    </p>
  </div>
  `;

  const outputPath = path.join(__dirname, '..', 'data', 'newsletter.html');
  fs.writeFileSync(outputPath, htmlContent);

  console.log(`Newsletter HTML generated successfully at data/newsletter.html`);
}

generateNewsletter();
