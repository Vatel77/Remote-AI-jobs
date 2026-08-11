"use client";
import React from 'react';
import { usePathname } from 'next/navigation';

export default function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    let newPath;
    
    if (pathname.startsWith('/en') || pathname.startsWith('/fr') || pathname.startsWith('/de') || pathname.startsWith('/es')) {
       const parts = pathname.split('/');
       parts[1] = newLang;
       newPath = parts.join('/');
    } else {
       newPath = `/${newLang}${pathname === '/' ? '' : pathname}`;
    }
    window.location.href = newPath;
  };

  return (
    <select 
      onChange={handleLanguageChange}
      defaultValue={currentLang}
      style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
    >
      <option value="en">🇬🇧 EN</option>
      <option value="fr">🇫🇷 FR</option>
      <option value="de">🇩🇪 DE</option>
      <option value="es">🇪🇸 ES</option>
    </select>
  );
}
