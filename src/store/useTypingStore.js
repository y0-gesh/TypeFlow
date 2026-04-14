import { create } from "zustand";
import { contentEngine } from "@/engines/contentEngine";
import { typingEngine } from "@/engines/typingEngine";

const STORAGE_KEY = "typeflow_progress";

const loadProgress = () => {
  if (typeof window === "undefined") return { completedChunks: [], history: [] };
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { completedChunks: [], history: [] };
};

const saveProgress = (progress) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

/**
 * State Management Agent
 * Centralized state control using Zustand.
 */
export const useTypingStore = create((set, get) => ({
  // State
  chunks: [],
  currentIndex: 0,
  userInput: "",
  startTime: null,
  stats: {
    wpm: 0,
    accuracy: 0,
    correctChars: 0,
    totalCharsTyped: 0,
  },
  lessonStatus: "idle", // 'idle', 'typing', 'completed', 'retry'
  progress: loadProgress(),

  // Actions
  setRawContent: (rawText) => {
    const processedChunks = contentEngine.processContent(rawText);
    set({ 
      chunks: processedChunks, 
      currentIndex: 0, 
      userInput: "", 
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 0, correctChars: 0, totalCharsTyped: 0 }
    });
  },

  updateInput: (input) => {
    const { chunks, currentIndex, startTime, stats } = get();
    const currentChunk = chunks[currentIndex];
    
    if (!currentChunk) return;

    // Start timer on first character
    let newStartTime = startTime;
    if (!startTime && input.length > 0) {
      newStartTime = Date.now();
    }

    const comparison = typingEngine.compareInput(currentChunk.text, input);
    
    // Calculate real-time stats
    const timeElapsed = newStartTime ? (Date.now() - newStartTime) / 1000 : 0;
    const wpm = typingEngine.calculateWPM(comparison.correct, timeElapsed);
    const accuracy = typingEngine.calculateAccuracy(comparison.correct, input.length);

    set({ 
      userInput: input, 
      startTime: newStartTime,
      lessonStatus: "typing",
      stats: {
        ...stats,
        wpm,
        accuracy,
        correctChars: comparison.correct,
        totalCharsTyped: input.length
      }
    });

    // Check if chunk is complete
    if (input.length >= currentChunk.text.length) {
      get().completeChunk();
    }
  },

  completeChunk: () => {
    const { stats, currentIndex, chunks, progress } = get();
    const currentChunk = chunks[currentIndex];
    
    if (stats.accuracy >= 90) {
      const newProgress = {
        completedChunks: [...progress.completedChunks, currentChunk.id],
        history: [...progress.history, {
          chunkId: currentChunk.id,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          date: new Date().toISOString()
        }]
      };
      
      saveProgress(newProgress);
      set({ lessonStatus: "completed", progress: newProgress });
    } else {
      set({ lessonStatus: "retry" });
    }
  },

  nextChunk: () => {
    set((state) => ({
      currentIndex: state.currentIndex + 1,
      userInput: "",
      startTime: null,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 0, correctChars: 0, totalCharsTyped: 0 }
    }));
  },

  retryChunk: () => {
    set({
      userInput: "",
      startTime: null,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 0, correctChars: 0, totalCharsTyped: 0 }
    });
  }
}));
