"use client";
import React, { use } from 'react';
import Link from 'next/link';
import { dictionaries, Locale } from "../../../i18n/dictionaries";

export default function PostJob(props: { params: Promise<{ lang: string }> }) {
  const params = use(props.params);
  const lang = (params.lang as Locale) || 'en';
  const dict = (dictionaries[lang] || dictionaries['en']).pricing;

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0 10px 0' }}>
        <h1 style={{ fontSize: '3rem' }}>{dict.title}</h1>
        <p>{dict.subtitle}</p>
      </section>

      <div className="pricing-container">
        {/* Basic Tier */}
        <div className="pricing-card">
          <h3>{dict.standard.title}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{dict.standard.desc}</p>
          <div className="pricing-price">$49</div>
          <ul className="pricing-features">
            <li>{dict.standard.f1}</li>
            <li>{dict.standard.f2}</li>
            <li>{dict.standard.f3}</li>
          </ul>
          <Link href="https://buy.stripe.com/fZu00j1Tx3oo6Ve7HibjW02" target="_blank">
            <button className="apply-btn" style={{ width: '100%', padding: '15px' }}>Post Standard</button>
          </Link>
        </div>

        {/* Featured Tier (Popular) */}
        <div className="pricing-card popular">
          <div style={{ background: 'var(--accent-color)', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>MOST POPULAR</div>
          <h3>{dict.featured.title}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{dict.featured.desc}</p>
          <div className="pricing-price">$99</div>
          <ul className="pricing-features">
            <li><strong>{dict.featured.f1}</strong></li>
            <li>{dict.featured.f2}</li>
            <li>{dict.featured.f3}</li>
          </ul>
          <Link href="https://buy.stripe.com/28EfZhaq3aQQ5Rad1CbjW03" target="_blank">
            <button className="apply-btn" style={{ width: '100%', padding: '15px' }}>Post Featured</button>
          </Link>
        </div>

        {/* Enterprise Tier */}
        <div className="pricing-card">
          <h3>{dict.enterprise.title}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{dict.enterprise.desc}</p>
          <div className="pricing-price">$199</div>
          <ul className="pricing-features">
            <li><strong>{dict.enterprise.f1}</strong></li>
            <li>{dict.enterprise.f2}</li>
            <li>{dict.enterprise.f3}</li>
          </ul>
          <Link href="https://buy.stripe.com/7sY9AT0PtaQQa7q5zabjW01" target="_blank">
            <button className="apply-btn" style={{ width: '100%', padding: '15px' }}>Post Enterprise</button>
          </Link>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
        <p>{dict.secure}</p>
      </div>
    </main>
  );
}
