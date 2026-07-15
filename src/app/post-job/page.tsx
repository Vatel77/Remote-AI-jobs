"use client";
import React from 'react';

export default function PostJob() {
  return (
    <main>
      <section className="hero" style={{ padding: '40px 0' }}>
        <h1>Hire the top 1% of AI Talent</h1>
        <p>Post your job to our network of 10,000+ AI Researchers, ML Engineers, and Prompt Experts. Just $99 per post.</p>
      </section>

      <div className="job-list" style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Job Title</label>
            <input type="text" placeholder="e.g. Senior Prompt Engineer" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '1rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Company Name</label>
            <input type="text" placeholder="e.g. OpenAI" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '1rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Job Description / URL</label>
            <input type="url" placeholder="Link to your ATS or job description" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '1rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: '600' }}>Tags (comma separated)</label>
            <input type="text" placeholder="e.g. Remote, Machine Learning, Python" style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', background: '#000', color: '#fff', fontSize: '1rem' }} />
          </div>

          <button type="button" className="apply-btn" style={{ marginTop: '20px', padding: '15px', fontSize: '1.1rem' }} onClick={() => alert('Dans la version finale, ce bouton redirigera vers le Checkout Stripe !')}>
            Pay $99 & Post Job
          </button>
        </form>
      </div>
    </main>
  );
}
