'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-accent transition-all group"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Sun icon (shown in dark mode) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90 scale-50'}`}
      >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
      
      {/* Moon icon (shown in light mode) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`absolute transition-all duration-300 ${!isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'}`}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    </button>
  );
}
