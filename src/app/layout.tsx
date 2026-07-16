import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RemoteAI Jobs | Premium AI & Remote Opportunities",
  description: "Find the best 100% remote jobs in the Artificial Intelligence industry.",
  openGraph: {
    title: "RemoteAI Jobs | Premium AI & Remote Opportunities",
    description: "Find the best 100% remote jobs in the Artificial Intelligence industry.",
    url: "https://remote-ai-jobs-rust.vercel.app",
    siteName: "RemoteAI Jobs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RemoteAI Jobs | Premium AI & Remote Opportunities",
    description: "Find the best 100% remote jobs in the Artificial Intelligence industry.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body>
        <div className="container">
          <nav className="navbar">
            <Link href="/" className="logo">
              Remote<span>AI</span> Jobs
            </Link>
            <Link href="/post-job">
              <button className="post-job-btn">Post a Job - $99</button>
            </Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
