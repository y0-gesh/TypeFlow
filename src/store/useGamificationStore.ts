import { create } from "zustand";
import { supabase, isMockAuth } from "@/lib/supabase";

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  iconName: string;
}

export interface Challenge {
  id: string;
  title: string;
  type: "wpm" | "accuracy" | "time" | "chars";
  targetValue: number;
  currentValue: number;
  xpReward: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  wpm: number;
  level: number;
  isCurrentUser?: boolean;
}

interface GamificationState {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpRequiredForNext: number;
  badges: Badge[];
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  fetchGamificationData: () => Promise<void>;
  processSessionStats: (wpm: number, accuracy: number, charsTyped: number, timeSeconds: number) => Promise<void>;
}

// Level formula: level = floor(sqrt(totalXp / 250)) + 1
// Next level required XP = (level)^2 * 250
const calculateLevelInfo = (totalXp: number) => {
  const level = Math.floor(Math.sqrt(totalXp / 250)) + 1;
  const currentLevelMinXp = Math.pow(level - 1, 2) * 250;
  const nextLevelMinXp = Math.pow(level, 2) * 250;
  
  const xpIntoLevel = totalXp - currentLevelMinXp;
  const xpRequiredForNext = nextLevelMinXp - currentLevelMinXp;

  return { level, xpIntoLevel, xpRequiredForNext };
};

const DEFAULT_BADGES: Badge[] = [
  {
    id: "first_words",
    name: "First 10,000 Words",
    description: "Type 50,000 characters to cross the word count milestone.",
    unlocked: false,
    iconName: "first_words",
  },
  {
    id: "streak_master",
    name: "Streak Master (3 Days)",
    description: "Maintain a consecutive 3-day practice schedule.",
    unlocked: false,
    iconName: "streak_master",
  },
  {
    id: "perfect_accuracy",
    name: "Perfect 100% Accuracy",
    description: "Complete any lesson with absolute flawless precision.",
    unlocked: false,
    iconName: "perfect_accuracy",
  },
  {
    id: "century_club",
    name: "Century Club (100 WPM)",
    description: "Cross the 100 WPM speed limit in any completed lesson.",
    unlocked: false,
    iconName: "century_club",
  },
];

const DEFAULT_CHALLENGES: Challenge[] = [
  {
    id: "challenge_wpm",
    title: "Speed Demon: Reach 55+ WPM in a lesson",
    type: "wpm",
    targetValue: 55,
    currentValue: 0,
    xpReward: 100,
    completed: false,
  },
  {
    id: "challenge_accuracy",
    title: "Perfect Drills: Complete a lesson with 100% accuracy",
    type: "accuracy",
    targetValue: 100,
    currentValue: 0,
    xpReward: 150,
    completed: false,
  },
  {
    id: "challenge_chars",
    title: "Volume Typist: Type 1,000 characters today",
    type: "chars",
    targetValue: 1000,
    currentValue: 0,
    xpReward: 200,
    completed: false,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "KeyCadet", wpm: 88, level: 9 },
  { rank: 2, username: "FingerFlex", wpm: 76, level: 6 },
  { rank: 3, username: "MatrixTyper", wpm: 72, level: 5 },
  { rank: 4, username: "You", wpm: 0, level: 1, isCurrentUser: true },
  { rank: 5, username: "CoffeeCoder", wpm: 48, level: 3 },
  { rank: 6, username: "KeyboardCat", wpm: 38, level: 2 },
];

export const useGamificationStore = create<GamificationState>((set, get) => ({
  totalXp: 0,
  level: 1,
  xpIntoLevel: 0,
  xpRequiredForNext: 250,
  badges: DEFAULT_BADGES,
  challenges: DEFAULT_CHALLENGES,
  leaderboard: MOCK_LEADERBOARD,
  loading: false,

  fetchGamificationData: async () => {
    set({ loading: true });
    try {
      let totalXp = 0;
      let unlockedBadgeIds = new Set<string>();
      let charsTypedToday = 0;
      let peakWpm = 0;
      let hasPerfectAccuracy = false;
      let hasCenturyClub = false;
      let streakDays = 0;

      if (isMockAuth) {
        // Mock load from LocalStorage
        totalXp = Number(localStorage.getItem("typeflow_total_xp") || "0");
        const savedBadges = JSON.parse(localStorage.getItem("typeflow_unlocked_badges") || "[]");
        savedBadges.forEach((id: string) => unlockedBadgeIds.add(id));

        const sessions = JSON.parse(localStorage.getItem("typeflow_typing_sessions_mock") || "[]");
        
        // Compute daily totals & stats
        const todayStr = new Date().toLocaleDateString("en-CA");
        sessions.forEach((s: any) => {
          const w = Number(s.wpm);
          const acc = Number(s.accuracy);
          if (w > peakWpm) peakWpm = w;
          if (acc === 100) hasPerfectAccuracy = true;
          if (w >= 100) hasCenturyClub = true;

          const date = new Date(s.created_at).toLocaleDateString("en-CA");
          if (date === todayStr) {
            charsTypedToday += Number(s.chars_typed || 0);
          }
        });

        // Compute streak days
        const activeDates = new Set<string>();
        sessions.forEach((s: any) => {
          activeDates.add(new Date(s.created_at).toLocaleDateString("en-CA"));
        });
        let currentCheckDate = new Date();
        while (activeDates.has(currentCheckDate.toLocaleDateString("en-CA"))) {
          streakDays++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        }
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          // Fetch stats from Supabase
          const { data: statsRow } = await supabase
            .from("statistics")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          // Fetch achievements
          const { data: dbBadges } = await supabase
            .from("achievements")
            .select("badge_name, awarded_at")
            .eq("user_id", user.id);

          (dbBadges || []).forEach((b) => unlockedBadgeIds.add(b.badge_name));

          // Fetch sessions
          const { data: sessions } = await supabase
            .from("typing_sessions")
            .select("*")
            .eq("user_id", user.id);

          const todayStr = new Date().toLocaleDateString("en-CA");
          (sessions || []).forEach((s) => {
            const w = Number(s.wpm);
            const acc = Number(s.accuracy);
            if (w > peakWpm) peakWpm = w;
            if (acc === 100) hasPerfectAccuracy = true;
            if (w >= 100) hasCenturyClub = true;

            const date = new Date(s.created_at).toLocaleDateString("en-CA");
            if (date === todayStr) {
              charsTypedToday += Number(s.chars_typed || 0);
            }
          });

          // Fetch profiles for streak count
          const { data: profile } = await supabase
            .from("profiles")
            .select("streak_count")
            .eq("id", user.id)
            .maybeSingle();

          streakDays = profile?.streak_count || 0;
          totalXp = Math.round(Number(statsRow?.total_chars_typed || 0) * 0.1); // Base XP calculation
        }
      }

      // Check auto-unlock trigger for badges if not already unlocked
      if (peakWpm >= 100) unlockedBadgeIds.add("century_club");
      if (hasPerfectAccuracy) unlockedBadgeIds.add("perfect_accuracy");
      if (streakDays >= 3) unlockedBadgeIds.add("streak_master");
      
      // Calculate level info
      const levelInfo = calculateLevelInfo(totalXp);

      // Map Badges
      const updatedBadges = DEFAULT_BADGES.map((badge) => ({
        ...badge,
        unlocked: unlockedBadgeIds.has(badge.id),
        unlockedAt: unlockedBadgeIds.has(badge.id) ? new Date().toISOString() : undefined,
      }));

      // Update LocalStorage if mock
      if (isMockAuth) {
        localStorage.setItem("typeflow_unlocked_badges", JSON.stringify(Array.from(unlockedBadgeIds)));
        localStorage.setItem("typeflow_total_xp", String(totalXp));
      }

      // Map Challenges
      const updatedChallenges = DEFAULT_CHALLENGES.map((chal) => {
        let currentValue = 0;
        if (chal.type === "wpm") currentValue = peakWpm;
        else if (chal.type === "accuracy") currentValue = hasPerfectAccuracy ? 100 : 0;
        else if (chal.type === "chars") currentValue = charsTypedToday;

        const completed = currentValue >= chal.targetValue;
        return { ...chal, currentValue, completed };
      });

      // Update Leaderboard current user
      const updatedLeaderboard = MOCK_LEADERBOARD.map((entry) => {
        if (entry.isCurrentUser) {
          return {
            ...entry,
            wpm: peakWpm || 30, // Default fallback if no lessons done
            level: levelInfo.level,
          };
        }
        return entry;
      }).sort((a, b) => b.wpm - a.wpm);

      // Re-map ranks after sorting
      updatedLeaderboard.forEach((entry, idx) => {
        entry.rank = idx + 1;
      });

      set({
        totalXp,
        level: levelInfo.level,
        xpIntoLevel: levelInfo.xpIntoLevel,
        xpRequiredForNext: levelInfo.xpRequiredForNext,
        badges: updatedBadges,
        challenges: updatedChallenges,
        leaderboard: updatedLeaderboard,
        loading: false,
      });
    } catch (e) {
      console.error("Failed to load gamification metrics:", e);
      set({ loading: false });
    }
  },

  processSessionStats: async (wpm: number, accuracy: number, charsTyped: number, timeSeconds: number) => {
    try {
      // Calculate Session XP:
      // - 0.1 XP per character typed
      // - Bonus: 100% accuracy = +50 XP, >=98% = +25 XP, >=95% = +10 XP
      // - Bonus WPM: >=100 WPM = +100 XP, >=70 WPM = +40 XP, >=50 WPM = +20 XP
      const baseSessionXp = Math.round(charsTyped * 0.1);
      let accuracyBonus = 0;
      if (accuracy === 100) accuracyBonus = 50;
      else if (accuracy >= 98) accuracyBonus = 25;
      else if (accuracy >= 95) accuracyBonus = 10;

      let speedBonus = 0;
      if (wpm >= 100) speedBonus = 100;
      else if (wpm >= 70) speedBonus = 40;
      else if (wpm >= 50) speedBonus = 20;

      const gainedXp = baseSessionXp + accuracyBonus + speedBonus;
      const newTotalXp = get().totalXp + gainedXp;

      if (isMockAuth) {
        localStorage.setItem("typeflow_total_xp", String(newTotalXp));
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          // Update Statistics total_chars_typed & stats
          const { data: statsRow } = await supabase
            .from("statistics")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (statsRow) {
            await supabase
              .from("statistics")
              .update({
                total_chars_typed: (statsRow.total_chars_typed || 0) + charsTyped,
                total_time_seconds: Number(statsRow.total_time_seconds || 0) + timeSeconds,
                peak_wpm: Math.max(Number(statsRow.peak_wpm || 0), wpm),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
          }
        }
      }

      // Re-trigger fetch to recalculate levels and badges
      await get().fetchGamificationData();
    } catch (e) {
      console.error("Failed to process session XP rewards:", e);
    }
  }
}));
