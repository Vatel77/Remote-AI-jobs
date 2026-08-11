import JobList from "@/components/JobList";
import JobCard from "@/components/JobCard";

export default function Home() {
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
        <h1>Work in AI, from anywhere.</h1>
        <p>Curated 100% remote job opportunities for Machine Learning Engineers, Prompt Engineers, AI Researchers, and more.</p>
      </section>
      
      <div className="social-proof">
        <p>Trusted by recruiters from top AI companies</p>
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

      <JobList />
    </main>
  );
}
