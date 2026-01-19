'use client';

import { useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('rudra-blog-theme', newTheme);
    setIsDark(!isDark);
  };

  // Initialize theme on mount
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('rudra-blog-theme');
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (savedTheme && currentTheme !== savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      title="Toggle theme"
    >
      <span className="theme-icon-dark">🌙</span>
      <span className="theme-icon-light">☀️</span>
    </button>
  );
}
