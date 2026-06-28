"use client";
import React, { useEffect, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Button } from "@/vendors/ui/button";

export default function TypingBox() {
  const {
    chunks,
    currentIndex,
    userInput,
    updateInput,
    lessonStatus,
    nextChunk,
    retryChunk,
    stats,
  } = useTypingStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const currentChunk = chunks[currentIndex];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, lessonStatus]);

  if (!currentChunk) return null;

  const characters = currentChunk.text.split("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent default behavior for certain keys if needed (like tab or backspace past start)
    if (e.key === "Tab") {
      e.preventDefault();
      retryChunk();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lessonStatus === "completed" || lessonStatus === "retry") return;
    updateInput(e.target.value);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12 animate-fade-in">
      {/* Metrics Overlay */}
      <div className="flex justify-between mb-8 px-4">
        <div className="text-3xl font-mono font-bold text-muted-foreground/60">
          <span className="text-primary">{stats.wpm}</span>
          <span className="text-xs ml-2 opacity-50 uppercase tracking-widest font-sans">
            WPM
          </span>
        </div>
        <div className="text-3xl font-mono font-bold text-muted-foreground/60">
          <span className="text-emerald-500">{stats.accuracy}%</span>
          <span className="text-xs ml-2 opacity-50 uppercase tracking-widest font-sans">
            ACC
          </span>
        </div>
      </div>

      {/* Typing Display Container */}
      <div
        className="relative p-10 bg-card border border-border/80 rounded-2xl shadow-xl font-mono text-3xl leading-relaxed cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-x-[2px] select-none">
          {characters.map((char, index) => {
            let colorClass = "text-muted-foreground/50";
            let cursorClass = "";

            if (index < userInput.length) {
              colorClass =
                userInput[index] === char
                  ? "text-foreground dark:text-gray-100"
                  : "text-destructive bg-destructive/10 underline decoration-destructive/50 decoration-2";
            }

            if (index === userInput.length) {
              cursorClass = "border-l-2 border-primary animate-cursor-blink";
            }

            return (
              <span
                key={index}
                className={`${colorClass} ${cursorClass} whitespace-pre`}
              >
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
          className="absolute inset-0 opacity-0 cursor-default w-full h-full"
          autoFocus
        />
      </div>

      {/* Feedback Overlay */}
      {lessonStatus === "completed" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 rounded-2xl backdrop-blur-md border border-emerald-500/30 z-10 transition-all animate-fade-in">
          <h3 className="text-4xl font-extrabold text-emerald-500 mb-6">
            Great Job!
          </h3>
          <Button
            onClick={nextChunk}
            variant="default"
            size="lg"
            className="px-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            Next Lesson
          </Button>
        </div>
      )}

      {lessonStatus === "retry" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/95 rounded-2xl backdrop-blur-md border border-destructive/30 z-10 animate-fade-in">
          <h3 className="text-4xl font-extrabold text-destructive mb-4">
            Try Again
          </h3>
          <p className="text-muted-foreground mb-6 font-medium">
            Accuracy must be at least 90%
          </p>
          <Button
            onClick={retryChunk}
            variant="default"
            size="lg"
            className="px-10 font-bold bg-destructive hover:bg-destructive/95 shadow-lg shadow-destructive/20 hover:scale-105 transition-all"
          >
            Retry Chunk
          </Button>
        </div>
      )}
    </div>
  );
}
