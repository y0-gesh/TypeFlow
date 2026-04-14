"use client";
import React, { useEffect, useRef } from 'react';
import { useTypingStore } from '@/store/useTypingStore';

export default function TypingBox() {
  const { 
    chunks, 
    currentIndex, 
    userInput, 
    updateInput, 
    lessonStatus,
    nextChunk,
    retryChunk 
  } = useTypingStore();

  const inputRef = useRef(null);
  const currentChunk = chunks[currentIndex];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, lessonStatus]);

  if (!currentChunk) return null;

  const characters = currentChunk.text.split("");

  const handleKeyDown = (e) => {
    // Prevent default behavior for certain keys if needed
  };

  const handleChange = (e) => {
    if (lessonStatus === 'completed' || lessonStatus === 'retry') return;
    updateInput(e.target.value);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12">
      {/* Metrics Overlay (Optional, could be separate) */}
      <div className="flex justify-between mb-8 px-4">
        <div className="text-3xl font-mono font-bold text-gray-500">
          <span className="text-blue-500">{useTypingStore.getState().stats.wpm}</span>
          <span className="text-sm ml-2 opacity-50 uppercase tracking-widest">WPM</span>
        </div>
        <div className="text-3xl font-mono font-bold text-gray-500">
          <span className="text-green-500">{useTypingStore.getState().stats.accuracy}%</span>
          <span className="text-sm ml-2 opacity-50 uppercase tracking-widest">ACC</span>
        </div>
      </div>

      {/* Typing Display */}
      <div 
        className="relative p-10 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl font-mono text-3xl leading-relaxed cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-x-[2px]">
          {characters.map((char, index) => {
            let colorClass = "text-gray-600";
            let cursorClass = "";

            if (index < userInput.length) {
              colorClass = userInput[index] === char ? "text-gray-100" : "text-red-500 bg-red-900/20";
            }

            if (index === userInput.length) {
              cursorClass = "border-l-2 border-blue-500 animate-pulse";
            }

            return (
              <span key={index} className={`${colorClass} ${cursorClass} whitespace-pre`}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden Input */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 opacity-0 cursor-default"
          autoFocus
        />
      </div>

      {/* Feedback Overlay */}
      {lessonStatus === 'completed' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-2xl backdrop-blur-md border border-green-500/30 z-10 transition-all">
          <h3 className="text-4xl font-bold text-green-500 mb-6">Great Job!</h3>
          <button 
            onClick={nextChunk}
            className="px-10 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105"
          >
            Next Lesson
          </button>
        </div>
      )}

      {lessonStatus === 'retry' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-2xl backdrop-blur-md border border-red-500/30 z-10">
          <h3 className="text-4xl font-bold text-red-500 mb-6">Try Again</h3>
          <p className="text-gray-400 mb-6">Accuracy must be at least 90%</p>
          <button 
            onClick={retryChunk}
            className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-105"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
