"use client";
import React from 'react';
import { useTypingStore } from '@/store/useTypingStore';
import Upload from '@/components/Upload';
import TypingBox from '@/components/TypingBox';
import ProgressBar from '@/components/ProgressBar';

export default function Home() {
  const chunks = useTypingStore((state) => state.chunks);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-20 px-4 bg-[#0a0a0c]">
      {/* Header */}
      <header className="mb-16 text-center animate-fade-in">
        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 mb-4 tracking-tighter">
          TYPEFLOW
        </h1>
        <p className="text-gray-500 text-lg font-medium tracking-wide uppercase">
          Master your typing with your own content
        </p>
      </header>

      <div className="w-full max-w-5xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {chunks.length === 0 ? (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Upload />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <ProgressBar />
            <TypingBox />
            
            <div className="flex justify-center mt-12">
               <button 
                 onClick={() => window.location.reload()}
                 className="text-gray-600 hover:text-gray-400 text-sm font-medium transition-colors flex items-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
                 Restart Session
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Decorative */}
      <footer className="mt-auto pt-20 pb-8 text-gray-700 text-xs font-mono">
        &copy; 2026 TYPEFLOW ENGINE • BUILT FOR SPEED & ACCURACY
      </footer>
    </main>
  );
}
