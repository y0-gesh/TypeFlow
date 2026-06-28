import { create } from "zustand";
import { contentEngine, Chunk } from "@/engines/contentEngine";
import { typingEngine } from "@/engines/typingEngine";
import { playClickSound, playErrorSound } from "@/utils/sound";

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
  stats: TypingStats;
  lessonStatus: LessonStatus;
  progress: ProgressState;
  
  // Phase 6 Additions
  timeElapsed: number;
  totalKeysPressed: number;
  isPaused: boolean;
  soundEnabled: boolean;
  focusMode: boolean;
  
  setRawContent: (rawText: string) => void;
  updateInput: (input: string) => void;
  completeChunk: () => void;
  nextChunk: () => void;
  retryChunk: () => void;
  
  // Phase 6 Actions
  tickTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  toggleSound: () => void;
  toggleFocusMode: () => void;
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

export const useTypingStore = create<TypingStore>((set, get) => ({
  // State
  chunks: [],
  currentIndex: 0,
  userInput: "",
  stats: {
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    totalCharsTyped: 0,
  },
  lessonStatus: "idle",
  progress: loadProgress(),

  // Phase 6 State Default Values
  timeElapsed: 0,
  totalKeysPressed: 0,
  isPaused: false,
  soundEnabled: true,
  focusMode: false,

  // Actions
  setRawContent: (rawText: string) => {
    const processedChunks = contentEngine.processContent(rawText);
    set({
      chunks: processedChunks,
      currentIndex: 0,
      userInput: "",
      timeElapsed: 0,
      totalKeysPressed: 0,
      isPaused: false,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 100, correctChars: 0, totalCharsTyped: 0 }
    });
  },

  updateInput: (input: string) => {
    const {
      chunks,
      currentIndex,
      userInput: prevInput,
      stats,
      totalKeysPressed,
      soundEnabled,
      isPaused
    } = get();
    
    const currentChunk = chunks[currentIndex];
    if (!currentChunk || isPaused) return;

    // Transition state to typing on first key
    let newStatus = get().lessonStatus;
    if (newStatus === "idle" && input.length > 0) {
      newStatus = "typing";
    }

    let updatedKeysPressed = totalKeysPressed;

    // Detect typed character (exclude backspaces)
    if (input.length > prevInput.length) {
      const idx = input.length - 1;
      const expectedChar = currentChunk.text[idx];
      const typedChar = input[idx];
      const isCorrect = expectedChar === typedChar;
      
      updatedKeysPressed += 1;

      // Play synthesized audio feedback
      if (soundEnabled) {
        if (isCorrect) {
          playClickSound();
        } else {
          playErrorSound();
        }
      }
    }

    const comparison = typingEngine.compareInput(currentChunk.text, input);
    const accuracy = typingEngine.calculateAccuracy(comparison.correct, updatedKeysPressed);
    const wpm = typingEngine.calculateWPM(comparison.correct, get().timeElapsed);

    set({
      userInput: input,
      lessonStatus: newStatus,
      totalKeysPressed: updatedKeysPressed,
      stats: {
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
      timeElapsed: 0,
      totalKeysPressed: 0,
      isPaused: false,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 100, correctChars: 0, totalCharsTyped: 0 }
    }));
  },

  retryChunk: () => {
    set({
      userInput: "",
      timeElapsed: 0,
      totalKeysPressed: 0,
      isPaused: false,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 100, correctChars: 0, totalCharsTyped: 0 }
    });
  },

  // Phase 6 Actions Implementation
  tickTimer: () => {
    const { lessonStatus, isPaused, stats, timeElapsed } = get();
    if (lessonStatus !== "typing" || isPaused) return;

    const newTime = timeElapsed + 1;
    const wpm = typingEngine.calculateWPM(stats.correctChars, newTime);

    set({
      timeElapsed: newTime,
      stats: {
        ...stats,
        wpm
      }
    });
  },

  pauseTimer: () => {
    const { lessonStatus } = get();
    if (lessonStatus === "typing") {
      set({ isPaused: true });
    }
  },

  resumeTimer: () => {
    set({ isPaused: false });
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  toggleFocusMode: () => {
    set((state) => ({ focusMode: !state.focusMode }));
  }
}));
