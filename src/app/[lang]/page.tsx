import JobList from "@/components/JobList";
import JobCard from "@/components/JobCard";
import { dictionaries, Locale } from "../../i18n/dictionaries";

export default async function Home(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = (params.lang as Locale) || 'en';
  const dict = dictionaries[lang] || dictionaries['en'];

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
    </main>
  );
}
