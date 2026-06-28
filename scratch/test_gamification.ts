// Simple mock for localStorage in Node environment
const mockStorage: { [key: string]: string } = {};
const localStorageMock = {
  getItem: (key: string): string | null => {
    return mockStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    mockStorage[key] = value;
  },
  removeItem: (key: string): void => {
    delete mockStorage[key];
  },
  clear: (): void => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  }
};

(global as any).window = {
  localStorage: localStorageMock
};
(global as any).localStorage = localStorageMock;

import { useGamificationStore } from "../src/store/useGamificationStore";
import * as assert from "assert";

async function testGamification() {
  console.log("Testing gamification XP logic, badges and levels...");

  const store = useGamificationStore.getState();

  // Test Defaults
  assert.strictEqual(store.totalXp, 0);
  assert.strictEqual(store.level, 1);

  // 1. Populate mock typing session in LocalStorage (like completeChunk does)
  const mockSession = {
    id: "test-sess",
    user_id: "mock-user",
    lesson_id: "lesson-1",
    wpm: 100,
    accuracy: 100,
    chars_typed: 200,
    time_seconds: 10,
    created_at: new Date().toISOString()
  };
  localStorage.setItem("typeflow_typing_sessions_mock", JSON.stringify([mockSession]));

  // 2. Simulate processSessionStats
  // Base XP = 200 * 0.1 = 20 XP
  // Accuracy 100% bonus = +50 XP
  // WPM >= 100 bonus = +100 XP
  // Total XP gained = 170 XP
  await useGamificationStore.getState().processSessionStats(100, 100, 200, 10);

  const updated = useGamificationStore.getState();
  assert.strictEqual(updated.totalXp, 170, "Should award 170 XP for session");
  assert.strictEqual(updated.level, 1, "Level should be 1 since 170 XP < 250 XP");

  // Check achievements unlocks
  const centuryClubBadge = updated.badges.find((b) => b.id === "century_club");
  assert.ok(centuryClubBadge);
  assert.strictEqual(centuryClubBadge!.unlocked, true, "Century Club badge should unlock on 100 WPM");

  const perfectAccuracyBadge = updated.badges.find((b) => b.id === "perfect_accuracy");
  assert.ok(perfectAccuracyBadge);
  assert.strictEqual(perfectAccuracyBadge!.unlocked, true, "Perfect Accuracy badge should unlock on 100% accuracy");

  // Save another mock session
  const mockSession2 = {
    id: "test-sess2",
    user_id: "mock-user",
    lesson_id: "lesson-2",
    wpm: 60,
    accuracy: 95,
    chars_typed: 1000,
    time_seconds: 60,
    created_at: new Date().toISOString()
  };
  localStorage.setItem("typeflow_typing_sessions_mock", JSON.stringify([mockSession, mockSession2]));

  // Gain more XP to trigger level up (requires 250 XP for Level 2)
  await useGamificationStore.getState().processSessionStats(60, 95, 1000, 60);
  
  const final = useGamificationStore.getState();
  // New gained XP = 100 (base) + 10 (accuracy >= 95%) + 20 (WPM >= 50) = 130 XP
  // Total XP = 170 + 130 = 300 XP
  assert.strictEqual(final.totalXp, 300, "Should aggregate total XP correctly");
  assert.strictEqual(final.level, 2, "Level should increase to 2 (since 300 XP >= 250 XP)");

  console.log("✓ Gamification tests passed!");
}

try {
  testGamification()
    .then(() => {
      console.log("\n🎉 ALL GAMIFICATION TESTS PASSED SUCCESSFULY! 🎉");
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
} catch (e) {
  console.error("❌ TEST FAILED ❌");
  console.error(e);
  process.exit(1);
}
