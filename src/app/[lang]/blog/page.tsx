import React, { use } from 'react';
import Link from 'next/link';
import postsData from '../../../../data/posts.json';

export default function BlogIndex(props: { params: Promise<{ lang: string }> }) {
  const params = use(props.params);
  const lang = params.lang || 'en';
  const posts = postsData.posts;

  return (
    <main>
      <section className="hero" style={{ padding: '40px 0 20px 0' }}>
        <h1 style={{ fontSize: '3rem' }}>Blog & Resources</h1>
        <p>Insights on Remote AI Jobs, Salaries, and Career Growth.</p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto', paddingBottom: '60px' }}>
        {posts.map(post => (
          <div key={post.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '30px', transition: 'transform 0.2s' }}>
            <div style={{ color: 'var(--accent-color)', fontSize: '0.9rem', marginBottom: '10px' }}>{post.date} • By {post.author}</div>
            <Link href={`/${lang}/blog/${post.slug}`}>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.8rem' }}>{post.title}</h2>
            </Link>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 20px 0' }}>{post.excerpt}</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {post.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <Link href={`/${lang}/blog/${post.slug}`} style={{ color: '#fff', fontWeight: 'bold', textDecoration: 'underline' }}>
              Read Article →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
