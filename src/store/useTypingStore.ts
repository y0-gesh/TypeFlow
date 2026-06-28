import { create } from "zustand";
import { contentEngine, Chunk } from "@/engines/contentEngine";
import { typingEngine } from "@/engines/typingEngine";

const STORAGE_KEY = "typeflow_progress";

export interface ProgressHistoryItem {
  chunkId: string;
  wpm: number;
  accuracy: number;
  date: string;
}

export interface ProgressState {
  completedChunks: string[];
  history: ProgressHistoryItem[];
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalCharsTyped: number;
}

export type LessonStatus = "idle" | "typing" | "completed" | "retry";

export interface TypingStore {
  chunks: Chunk[];
  currentIndex: number;
  userInput: string;
  startTime: number | null;
  stats: TypingStats;
  lessonStatus: LessonStatus;
  progress: ProgressState;
  setRawContent: (rawText: string) => void;
  updateInput: (input: string) => void;
  completeChunk: () => void;
  nextChunk: () => void;
  retryChunk: () => void;
}

const loadProgress = (): ProgressState => {
  if (typeof window === "undefined") return { completedChunks: [], history: [] };
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : { completedChunks: [], history: [] };
};

const saveProgress = (progress: ProgressState): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

/**
 * State Management Agent
 * Centralized state control using Zustand.
 */
export const useTypingStore = create<TypingStore>((set, get) => ({
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
  lessonStatus: "idle",
  progress: loadProgress(),

  // Actions
  setRawContent: (rawText: string) => {
    const processedChunks = contentEngine.processContent(rawText);
    set({ 
      chunks: processedChunks, 
      currentIndex: 0, 
      userInput: "", 
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 0, correctChars: 0, totalCharsTyped: 0 }
    });
  },

  updateInput: (input: string) => {
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
    if (!currentChunk) return;
    
    if (stats.accuracy >= 90) {
      const newProgress: ProgressState = {
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
