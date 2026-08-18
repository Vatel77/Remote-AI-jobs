import fs from 'fs';
import path from 'path';

// This script requires GEMINI_API_KEY environment variable
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const POSTS_PATH = path.join(process.cwd(), 'data', 'posts.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Gemini occasionally returns a transient "model is currently experiencing
// high demand" / UNAVAILABLE / RESOURCE_EXHAUSTED error that clears up on
// its own within seconds — retry those instead of failing the whole run.
// Anything else (bad request, invalid key, model not found) fails fast.
function isRetryable(status, errorBody) {
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const code = errorBody?.error?.status;
  return code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED';
}

// Try the newest flash model first; fall back to the previous generation if
// it's under sustained load rather than giving up (gemini-3.7-flash is on
// introductory pricing, which tends to draw heavy traffic).
const MODEL_FALLBACKS = ['gemini-3.7-flash', 'gemini-3.6-flash'];

async function callGeminiWithRetry(prompt, model, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let outcome;
    try {
      // undici's default headers timeout is 5 minutes — way too long to sit
      // on a hung connection before even getting to retry. Fail fast instead.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await response.json();
      outcome = data.error
        ? { ok: false, retryable: isRetryable(response.status, data), message: data.error.message }
        : { ok: true, data };
    } catch (err) {
      // Network-level failures (fetch throwing, DNS, connection reset, our
      // own 60s timeout aborting) never produce an HTTP response, so they
      // can't go through isRetryable(status, data) — always retryable.
      outcome = { ok: false, retryable: true, message: err.message };
    }

    if (outcome.ok) return outcome.data;

    if (outcome.retryable && attempt < maxAttempts) {
      const delayMs = attempt * 10000; // 10s, then 20s
      console.warn(`Gemini call failed (attempt ${attempt}/${maxAttempts}, ${model}): ${outcome.message} — retrying in ${delayMs / 1000}s...`);
      await sleep(delayMs);
      continue;
    }

    const err = new Error(outcome.message);
    err.retryable = outcome.retryable;
    throw err;
  }
}

async function callGeminiWithFallback(prompt) {
  for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
    const model = MODEL_FALLBACKS[i];
    try {
      return await callGeminiWithRetry(prompt, model);
    } catch (err) {
      const isLastModel = i === MODEL_FALLBACKS.length - 1;
      // A non-retryable error (bad request, invalid key, model not found)
      // will fail identically on every model — no point falling back.
      if (isLastModel || !err.retryable) throw err;
      console.warn(`${model} exhausted its retries — falling back to ${MODEL_FALLBACKS[i + 1]}...`);
    }
  }
}

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
    const data = await callGeminiWithFallback(prompt);

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
