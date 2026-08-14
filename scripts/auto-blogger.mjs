import fs from 'fs';
import path from 'path';

// This script requires GEMINI_API_KEY environment variable
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

async function generateBlogPost() {
  console.log("Connecting to Gemini API...");
  
  const prompt = `
    You are an expert tech recruiter and AI blogger.
    Write a highly engaging, SEO-optimized blog post about remote AI jobs, salaries, or career advice.
    The response MUST be a valid JSON object with the following structure:
    {
      "title": "A catchy title",
      "slug": "url-friendly-slug-like-this",
      "excerpt": "A 2-sentence summary for SEO.",
      "content": "<h2>HTML Content</h2><p>Multiple paragraphs and headers.</p>",
      "tags": ["ai", "career", "remote"]
    }
    DO NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw JSON object.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up potential markdown blocks if the LLM ignores instructions
    const jsonStr = rawText.replace(/^```json/i, '').replace(/```$/, '').trim();
    const newPost = JSON.parse(jsonStr);

    // Prepare data
    newPost.id = Date.now().toString();
    newPost.author = "AI Agent";
    newPost.date = new Date().toISOString().split('T')[0];

    // Read existing
    const postsData = JSON.parse(fs.readFileSync(POSTS_PATH, 'utf-8'));
    postsData.posts.unshift(newPost); // Add at the top

    // Save
    fs.writeFileSync(POSTS_PATH, JSON.stringify(postsData, null, 2));
    console.log(`Success! Created new blog post: ${newPost.title}`);

  } catch (err) {
    console.error("Failed to generate blog post:", err);
    process.exit(1);
  }
}

generateBlogPost();
