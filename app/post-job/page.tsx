"use client";
import React from 'react';
import Link from 'next/link';

export default function PostJob() {
  return (
    <main>
      <section className="hero" style={{ padding: '40px 0 10px 0' }}>
        <h1>Hire the top 1% of AI Talent</h1>
        <p>Reach an active network of 15,000+ AI Researchers, ML Engineers, and Prompt Experts looking for remote work.</p>
      </section>

      <div className="pricing-container">
        {/* Basic Tier */}
        <div className="pricing-card">
          <h3>Standard</h3>
          <p style={{ color: 'var(--text-muted)' }}>Perfect for startups</p>
          <div className="pricing-price">$49</div>
          <ul className="pricing-features">
            <li>Listed on the job board for 30 days</li>
            <li>Standard visibility</li>
            <li>Included in weekly digest</li>
          </ul>
          <Link href="https://buy.stripe.com/9B6bJ10Pt6AA5Ra1iUbjW00" target="_blank">
            <button className="apply-btn" style={{ width: '100%', padding: '15px' }}>Post Standard</button>
          </Link>
        </div>

        {/* Featured Tier (Popular) */}
        <div className="pricing-card popular">
          <div style={{ background: 'var(--accent-color)', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>MOST POPULAR</div>
          <h3>Featured</h3>
          <p style={{ color: 'var(--text-muted)' }}>Maximum visibility & applicants</p>
          <div className="pricing-price">$99</div>
          <ul className="pricing-features">
            <li><strong>Everything in Standard</strong></li>
            <li>Pinned to the top of the homepage for 7 days</li>
            <li>Highlighted with a gold "Promoted" badge</li>
            <li>Shared on our Twitter/X account</li>
          </ul>
          {/* This is the Stripe link the user created previously */}
          <Link href="https://buy.stripe.com/9B6bJ10Pt6AA5Ra1iUbjW00" target="_blank">
            <button className="apply-btn" style={{ width: '100%', padding: '15px' }}>Post Featured</button>
          </Link>
        </div>

        {/* Enterprise Tier */}
        <div className="pricing-card">
          <h3>Enterprise</h3>
          <p style={{ color: 'var(--text-muted)' }}>For aggressive hiring</p>
          <div className="pricing-price">$199</div>
          <ul className="pricing-features">
            <li><strong>Everything in Featured</strong></li>
            <li>Dedicated blast to 15,000+ newsletter subscribers</li>
            <li>Logo on homepage "Trusted By" section</li>
          </ul>
          <Link href="mailto:contact@remote-ai-jobs.com">
            <button className="apply-btn" style={{ width: '100%', padding: '15px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff' }}>Contact Us</button>
          </Link>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
        <p>🔒 Secure payment processing via Stripe.</p>
      </div>
    </main>
  );
}
