import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "../globals.css";
import Link from "next/link";
import { dictionaries, Locale } from "../../i18n/dictionaries";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RemoteAI Jobs | Premium AI & Remote Opportunities",
  description: "Find the best 100% remote jobs in the Artificial Intelligence industry.",
};

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }, { lang: 'de' }, { lang: 'es' }]
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>
}) {
  const params = await props.params;
  const lang = (params.lang as Locale) || 'en';
  const dict = dictionaries[lang] || dictionaries['en'];

  return (
    <html lang={lang} className={`${outfit.variable}`}>
      <body>
        <div className="container">
          <nav className="navbar">
            <Link href={`/${lang}`} className="logo">
              Remote<span>AI</span> Jobs
            </Link>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <Link href={`/${lang}/blog`} style={{ fontWeight: 500, marginRight: '10px' }}>
                {dict.nav.blog}
              </Link>
              <LanguageSwitcher currentLang={lang} />
              <Link href={`/${lang}/post-job`}>
                <button className="post-job-btn">{dict.nav.postJob}</button>
              </Link>
            </div>
          </nav>
          {props.children}
        </div>
      </body>
    </html>
  );
}
