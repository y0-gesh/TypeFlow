import { create } from "zustand";
import { supabase, isMockAuth } from "@/lib/supabase";
import { useDocumentStore } from "./useDocumentStore";

export interface DashboardStats {
  averageWpm: number;
  peakWpm: number;
  averageAccuracy: number;
  totalTimeMins: number;
  streakDays: number;
}

export interface DailyGoal {
  timeSpentSeconds: number;
  targetSeconds: number; // 900 seconds (15 minutes)
}

export interface WeeklyActivity {
  dayName: string;
  dateStr: string;
  active: boolean;
}

export interface ContinueLearning {
  documentId: string;
  documentTitle: string;
  libraryId: string;
  libraryName: string;
  progressPercent: number;
}

interface DashboardStore {
  stats: DashboardStats;
  dailyGoal: DailyGoal;
  weeklyActivity: WeeklyActivity[];
  continueLearning: ContinueLearning | null;
  loading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: {
    averageWpm: 0,
    peakWpm: 0,
    averageAccuracy: 100,
    totalTimeMins: 0,
    streakDays: 0,
  },
  dailyGoal: {
    timeSpentSeconds: 0,
    targetSeconds: 900,
  },
  weeklyActivity: [],
  continueLearning: null,
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      let sessions: any[] = [];
      let docs: any[] = [];
      let chaps: any[] = [];
      let less: any[] = [];
      let libs: any[] = [];
      let progressList: any[] = [];

      if (isMockAuth) {
        // Load mock data from LocalStorage
        sessions = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_typing_sessions_mock") || "[]") : [];
        progressList = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_lesson_progress_mock") || "[]") : [];
        docs = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_documents_mock") || "[]") : [];
        chaps = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_chapters_mock") || "[]") : [];
        less = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_lessons_mock") || "[]") : [];
        libs = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_libraries_mock") || "[]") : [];
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          set({ loading: false });
          return;
        }

        // Fetch user typing sessions
        const { data: dbSessions, error: sessError } = await supabase
          .from("typing_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (sessError) throw sessError;
        sessions = dbSessions || [];

        // Fetch user lesson progress
        const { data: dbProgress, error: progError } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id);

        if (progError) throw progError;
        progressList = dbProgress || [];

        // Fetch all documents, chapters, lessons, libraries
        const { data: dbDocs } = await supabase.from("documents").select("*").eq("user_id", user.id);
        const { data: dbChaps } = await supabase.from("chapters").select("*").eq("user_id", user.id);
        const { data: dbLess } = await supabase.from("lessons").select("*").eq("user_id", user.id);
        const { data: dbLibs } = await supabase.from("libraries").select("*").eq("user_id", user.id);

        docs = dbDocs || [];
        chaps = dbChaps || [];
        less = dbLess || [];
        libs = dbLibs || [];
      }

      // --- 1. CALCULATE CORE STATS ---
      let totalWpm = 0;
      let peakWpm = 0;
      let totalAccuracy = 0;
      let totalTimeSeconds = 0;

      sessions.forEach((s) => {
        const w = Number(s.wpm);
        const acc = Number(s.accuracy);
        const sec = Number(s.time_seconds);

        totalWpm += w;
        totalAccuracy += acc;
        totalTimeSeconds += sec;
        if (w > peakWpm) peakWpm = w;
      });

      const averageWpm = sessions.length > 0 ? Math.round(totalWpm / sessions.length) : 0;
      const averageAccuracy = sessions.length > 0 ? Math.round(totalAccuracy / sessions.length) : 100;
      const totalTimeMins = Math.round(totalTimeSeconds / 60);

      // --- 2. CALCULATE STREAK ---
      const activeDates = new Set<string>();
      sessions.forEach((s) => {
        const date = new Date(s.created_at).toLocaleDateString("en-CA"); // YYYY-MM-DD
        activeDates.add(date);
      });

      let streakDays = 0;
      const todayStr = new Date().toLocaleDateString("en-CA");
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString("en-CA");

      let currentCheckDate = new Date();

      if (activeDates.has(todayStr)) {
        // Streak is active today, start counting back
        while (activeDates.has(currentCheckDate.toLocaleDateString("en-CA"))) {
          streakDays++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        }
      } else if (activeDates.has(yesterdayStr)) {
        // User didn't type today yet, but did yesterday, count back
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        while (activeDates.has(currentCheckDate.toLocaleDateString("en-CA"))) {
          streakDays++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        }
      }

      // --- 3. CALCULATE DAILY GOAL ---
      let dailyTimeSpent = 0;
      sessions.forEach((s) => {
        const date = new Date(s.created_at).toLocaleDateString("en-CA");
        if (date === todayStr) {
          dailyTimeSpent += Number(s.time_seconds);
        }
      });

      // --- 4. WEEKLY ACTIVITY GRID (Last 7 Days) ---
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklyActivity: WeeklyActivity[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const tempDate = new Date();
        tempDate.setDate(tempDate.getDate() - i);
        const dateStr = tempDate.toLocaleDateString("en-CA");
        weeklyActivity.push({
          dayName: days[tempDate.getDay()],
          dateStr,
          active: activeDates.has(dateStr),
        });
      }

      // --- 5. CONTINUE LEARNING WIDGET ---
      let continueLearning: ContinueLearning | null = null;
      if (sessions.length > 0) {
        // Last session completed by the user
        const lastSession = sessions[0];
        const lastLesson = less.find((l) => l.id === lastSession.lesson_id);
        
        if (lastLesson) {
          const chapter = chaps.find((c) => c.id === lastLesson.chapter_id);
          if (chapter) {
            const document = docs.find((d) => d.id === chapter.document_id);
            if (document) {
              const library = libs.find((lib) => lib.id === document.library_id);
              
              // Calculate completion progress percentage for this document
              const docChapters = chaps.filter((c) => c.document_id === document.id);
              const docChapIds = docChapters.map((c) => c.id);
              const docLessons = less.filter((l) => docChapIds.includes(l.chapter_id));
              const docLessIds = docLessons.map((l) => l.id);

              const completedDocsCount = progressList.filter(
                (p) => docLessIds.includes(p.lesson_id) && p.is_completed
              ).length;

              const progressPercent = docLessons.length > 0 
                ? Math.round((completedDocsCount / docLessons.length) * 100) 
                : 0;

              continueLearning = {
                documentId: document.id,
                documentTitle: document.title,
                libraryId: library?.id || "",
                libraryName: library?.name || "",
                progressPercent,
              };
            }
          }
        }
      }

      set({
        stats: {
          averageWpm,
          peakWpm,
          averageAccuracy,
          totalTimeMins,
          streakDays,
        },
        dailyGoal: {
          timeSpentSeconds: dailyTimeSpent,
          targetSeconds: 900, // 15 mins
        },
        weeklyActivity,
        continueLearning,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to load dashboard statistics", loading: false });
    }
  }
}));
