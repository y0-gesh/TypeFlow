import React from 'react';
import { Geist, Inter } from "next/font/google";
import "@/styles/globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata = {
  title: "Typeflow — Master Typing with Your Own Content",
  description: "A premium typing trainer that lets you upload your own books and texts to practice with real-time feedback and progression.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  // Prevent theme flickering by executing inline script before content load
  const themeInitScript = `
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased font-inter">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
