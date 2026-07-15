import JobList from "@/components/JobList";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>Work in AI, from anywhere.</h1>
        <p>Curated 100% remote job opportunities for Machine Learning Engineers, Prompt Engineers, AI Researchers, and more.</p>
      </section>
      
      <JobList />
    </main>
  );
}
