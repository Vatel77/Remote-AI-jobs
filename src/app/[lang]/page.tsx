import Link from "next/link";
import JobList from "@/components/JobList";
import JobCard from "@/components/JobCard";
import AffiliateCard from "@/components/AffiliateCard";
import { dictionaries, Locale } from "../../i18n/dictionaries";
import { getEligibleCategories, formatCategoryLabel } from "@/lib/pseo";

export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = (params.lang as Locale) || 'en';
  const dict = dictionaries[lang] || dictionaries['en'];
  const categories = getEligibleCategories();

  const dummyFeaturedJob = {
    id: "featured-1",
    title: "Senior AI Engineer (Example Featured)",
    company: "OpenAI",
    location: "Worldwide",
    salary: "$180k - $250k",
    tags: ["Machine Learning", "Python", "LLMs"],
    postedAt: "Just now",
    url: "/post-job",
    isFeatured: true
  };

  return (
    <main>
      <section className="hero">
        <h1>{dict.hero.title}</h1>
        <p>{dict.hero.subtitle}</p>
      </section>
      
      {categories.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.9rem' }}>{dict.categoriesNav.heading}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(category => (
              <Link key={category} href={`/${lang}/remote-jobs/${category}`}>
                <span className="tag ai">{formatCategoryLabel(category)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="social-proof">
        <p>{dict.socialProof.title}</p>
        <div className="logos">
          <span>Anthropic</span>
          <span>OpenAI</span>
          <span>Mistral AI</span>
          <span>HuggingFace</span>
        </div>
      </div>

      <div className="job-list" style={{ marginBottom: '20px' }}>
        <JobCard job={dummyFeaturedJob} />
      </div>

      <JobList lang={lang} />

      <AffiliateCard heading={dict.affiliates.heading} page="home" />
    </main>
  );
}
