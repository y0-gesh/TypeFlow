"use client";
import React from 'react';
import { useTypingStore } from '@/store/useTypingStore';

export default function ProgressBar() {
  const { chunks, currentIndex } = useTypingStore();

  if (chunks.length === 0) return null;

  const progress = ((currentIndex) / chunks.length) * 100;
  const currentProgress = ((currentIndex + 1) / chunks.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Lesson {currentIndex + 1} of {chunks.length}
        </span>
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
          {Math.round(currentProgress)}% Complete
        </span>
      </div>
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
    </div>
  );
}
