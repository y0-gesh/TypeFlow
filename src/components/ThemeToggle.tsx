"use client";
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground border border-border/40 shadow-xs transition-all duration-200 hover:scale-105 cursor-pointer"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 animate-fade-in" />
      ) : (
        <Moon className="h-5 w-5 animate-fade-in" />
      )}
    </button>
  );
}
