import { create } from "zustand";
import { contentEngine, Chunk } from "@/engines/contentEngine";
import { typingEngine } from "@/engines/typingEngine";
import { playClickSound, playErrorSound } from "@/utils/sound";
import { supabase, isMockAuth } from "@/lib/supabase";

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
  lastKeyTime: number | null;
  
  setRawContent: (rawText: string) => void;
  loadChapterLessons: (lessonsList: any[], startIndex: number) => void;
  updateInput: (input: string) => void;
  completeChunk: () => void;
  syncProgress: () => Promise<void>;
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
  lastKeyTime: null,

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
      lastKeyTime: null,
      stats: { wpm: 0, accuracy: 100, correctChars: 0, totalCharsTyped: 0 }
    });
  },

  loadChapterLessons: (lessonsList: any[], startIndex: number) => {
    const mappedChunks = lessonsList.map((les) => ({
      id: les.id,
      text: les.content,
      difficulty: les.difficulty || 3
    }));

    set({
      chunks: mappedChunks,
      currentIndex: startIndex,
      userInput: "",
      timeElapsed: 0,
      totalKeysPressed: 0,
      isPaused: false,
      lessonStatus: "idle",
      lastKeyTime: null,
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
      isPaused,
      lastKeyTime
    } = get();
    
    const currentChunk = chunks[currentIndex];
    if (!currentChunk || isPaused) return;

    // Transition state to typing on first key
    let newStatus = get().lessonStatus;
    if (newStatus === "idle" && input.length > 0) {
      newStatus = "typing";
    }

    let updatedKeysPressed = totalKeysPressed;
    let lastKeyTimeVal = lastKeyTime;
    const now = Date.now();

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

      // Record keyboard/character analytics
      if (typeof window !== "undefined") {
        const charKey = expectedChar.toLowerCase();
        if (charKey && charKey.length === 1) {
          const rawAnalytics = localStorage.getItem("typeflow_keyboard_analytics");
          const analytics = rawAnalytics ? JSON.parse(rawAnalytics) : { keyStats: {} };

          if (!analytics.keyStats[charKey]) {
            analytics.keyStats[charKey] = { pressed: 0, errors: 0, timeMs: 0 };
          }

          analytics.keyStats[charKey].pressed += 1;

          if (!isCorrect) {
            analytics.keyStats[charKey].errors += 1;
          } else if (lastKeyTimeVal !== null) {
            const diff = now - lastKeyTimeVal;
            // Only count if transition was reasonable (less than 3 seconds)
            if (diff < 3000) {
              analytics.keyStats[charKey].timeMs += diff;
            }
          }
          localStorage.setItem("typeflow_keyboard_analytics", JSON.stringify(analytics));
        }
      }
      lastKeyTimeVal = now;
    }

    const comparison = typingEngine.compareInput(currentChunk.text, input);
    const accuracy = typingEngine.calculateAccuracy(comparison.correct, updatedKeysPressed);
    const wpm = typingEngine.calculateWPM(comparison.correct, get().timeElapsed);

    set({
      userInput: input,
      lessonStatus: newStatus,
      totalKeysPressed: updatedKeysPressed,
      lastKeyTime: lastKeyTimeVal,
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

  completeChunk: async () => {
    const { stats, currentIndex, chunks, progress, timeElapsed } = get();
    const currentChunk = chunks[currentIndex];
    if (!currentChunk) return;

    const isCompleted = stats.accuracy >= 90;
    const accuracyVal = stats.accuracy;
    const wpmVal = stats.wpm;
    const totalChars = stats.totalCharsTyped;

    if (isMockAuth) {
      // 1. Save typing session to mock
      const mockSessions = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_typing_sessions_mock") || "[]") : [];
      const newSession = {
        id: `mock-sess-${Math.random().toString(36).substring(2, 9)}`,
        user_id: "mock-user",
        lesson_id: currentChunk.id,
        wpm: wpmVal,
        accuracy: accuracyVal,
        chars_typed: totalChars,
        time_seconds: timeElapsed,
        created_at: new Date().toISOString()
      };
      localStorage.setItem("typeflow_typing_sessions_mock", JSON.stringify([...mockSessions, newSession]));

      // 2. Save lesson progress to mock
      const mockProgress = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_lesson_progress_mock") || "[]") : [];
      const existingIdx = mockProgress.findIndex((p: any) => p.user_id === "mock-user" && p.lesson_id === currentChunk.id);
      
      if (existingIdx !== -1) {
        const record = mockProgress[existingIdx];
        record.attempts_count += 1;
        record.last_practiced_at = new Date().toISOString();
        if (isCompleted) {
          record.is_completed = true;
          record.best_wpm = Math.max(Number(record.best_wpm), wpmVal);
          record.best_accuracy = Math.max(Number(record.best_accuracy), accuracyVal);
        }
      } else {
        mockProgress.push({
          id: `mock-prog-${Math.random().toString(36).substring(2, 9)}`,
          user_id: "mock-user",
          lesson_id: currentChunk.id,
          is_completed: isCompleted,
          best_wpm: isCompleted ? wpmVal : 0,
          best_accuracy: isCompleted ? accuracyVal : 0,
          attempts_count: 1,
          last_practiced_at: new Date().toISOString()
        });
      }
      localStorage.setItem("typeflow_lesson_progress_mock", JSON.stringify(mockProgress));

      // Update basic completed chunks list
      const newProgress: ProgressState = {
        completedChunks: isCompleted 
          ? Array.from(new Set([...progress.completedChunks, currentChunk.id]))
          : progress.completedChunks,
        history: [...progress.history, {
          chunkId: currentChunk.id,
          wpm: wpmVal,
          accuracy: accuracyVal,
          date: new Date().toISOString()
        }]
      };
      saveProgress(newProgress);
      set({ 
        lessonStatus: isCompleted ? "completed" : "retry",
        progress: newProgress
      });
    } else {
      // Supabase Mode
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("No session found");

        // 1. Insert typing session
        const { error: sessionError } = await supabase
          .from("typing_sessions")
          .insert({
            user_id: user.id,
            lesson_id: currentChunk.id,
            wpm: wpmVal,
            accuracy: accuracyVal,
            chars_typed: totalChars,
            time_seconds: timeElapsed
          });

        if (sessionError) console.error("Failed to insert typing session:", sessionError.message);

        // 2. Fetch existing lesson progress to update
        const { data: existingProg, error: fetchError } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("lesson_id", currentChunk.id)
          .maybeSingle();

        if (fetchError) console.error("Failed to query lesson progress:", fetchError.message);

        if (existingProg) {
          const updates: any = {
            attempts_count: existingProg.attempts_count + 1,
            last_practiced_at: new Date().toISOString()
          };
          if (isCompleted) {
            updates.is_completed = true;
            updates.best_wpm = Math.max(Number(existingProg.best_wpm), wpmVal);
            updates.best_accuracy = Math.max(Number(existingProg.best_accuracy), accuracyVal);
          }
          const { error: updateError } = await supabase
            .from("lesson_progress")
            .update(updates)
            .eq("id", existingProg.id);

          if (updateError) console.error("Failed to update lesson progress:", updateError.message);
        } else {
          const { error: insertError } = await supabase
            .from("lesson_progress")
            .insert({
              user_id: user.id,
              lesson_id: currentChunk.id,
              is_completed: isCompleted,
              best_wpm: isCompleted ? wpmVal : 0,
              best_accuracy: isCompleted ? accuracyVal : 0,
              attempts_count: 1,
              last_practiced_at: new Date().toISOString()
            });

          if (insertError) console.error("Failed to insert lesson progress:", insertError.message);
        }

        // Update local state completed chunks list
        const newProgress: ProgressState = {
          completedChunks: isCompleted
            ? Array.from(new Set([...progress.completedChunks, currentChunk.id]))
            : progress.completedChunks,
          history: [...progress.history, {
            chunkId: currentChunk.id,
            wpm: wpmVal,
            accuracy: accuracyVal,
            date: new Date().toISOString()
          }]
        };
        saveProgress(newProgress);
        set({ 
          lessonStatus: isCompleted ? "completed" : "retry",
          progress: newProgress
        });
      } catch (err) {
        console.error("Failed to save progress in Supabase:", err);
        set({ lessonStatus: isCompleted ? "completed" : "retry" });
      }
    }
  },

  syncProgress: async () => {
    if (isMockAuth) {
      set({ progress: loadProgress() });
    } else {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) return;

        const { data: progressList, error } = await supabase
          .from("lesson_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("is_completed", true);

        if (error) throw error;

        const completedList = (progressList || []).map((p) => p.lesson_id);
        set({
          progress: {
            completedChunks: completedList,
            history: loadProgress().history
          }
        });
      } catch (e) {
        console.error("Failed to sync progress:", e);
      }
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
      lastKeyTime: null,
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
      lastKeyTime: null,
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
