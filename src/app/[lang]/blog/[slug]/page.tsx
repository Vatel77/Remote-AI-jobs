import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import postsData from '../../../../../data/posts.json';

export function generateStaticParams() {
  const langs = ['en', 'fr', 'de', 'es'];
  const params: { lang: string, slug: string }[] = [];
  
  langs.forEach(lang => {
    postsData.posts.forEach(post => {
      params.push({ lang, slug: post.slug });
    });
  });
  
  return params;
}

export default async function BlogPost(props: { params: Promise<{ lang: string, slug: string }> }) {
  const params = await props.params;
  const post = postsData.posts.find(p => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  // Basic SEO JSON-LD for the Article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.date,
    "description": post.excerpt
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <Link href={`/${params.lang}/blog`} style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
          ← Back to Blog
        </Link>
        <h1 style={{ fontSize: '3rem', margin: '10px 0 20px 0', lineHeight: '1.2' }}>{post.title}</h1>
        <div style={{ color: 'var(--accent-color)', marginBottom: '40px' }}>
          {post.date} • By {post.author}
        </div>
        <div 
          className="blog-content"
          style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#e0e0e0' }}
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      </div>
    </main>
  );
}
