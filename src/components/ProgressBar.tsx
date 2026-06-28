"use client";
import React from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Progress } from "@/vendors/ui/progress";

export default function ProgressBar() {
  const { chunks, currentIndex } = useTypingStore();

  if (chunks.length === 0) return null;

  const currentProgress = ((currentIndex + 1) / chunks.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4 animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Lesson {currentIndex + 1} of {chunks.length}
        </span>
        <span className="text-xs font-semibold text-primary uppercase tracking-widest">
          {Math.round(currentProgress)}% Complete
        </span>
      </div>
      <Progress value={currentProgress} className="h-2 w-full" />
    </div>
  );
}
