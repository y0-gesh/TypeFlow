// Mock window and localStorage for running in Node
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

import { useDashboardStore } from "../src/store/useDashboardStore";
import * as assert from "assert";

async function testDashboardCalculations() {
  console.log("Testing dashboard stats and activity aggregations...");

  // 1. Setup mock data in LocalStorage
  const mockSessions = [
    {
      id: "sess-1",
      user_id: "mock-user",
      lesson_id: "lesson-1",
      wpm: 80,
      accuracy: 95,
      chars_typed: 150,
      time_seconds: 60, // 1 minute
      created_at: new Date().toISOString() // today
    },
    {
      id: "sess-2",
      user_id: "mock-user",
      lesson_id: "lesson-2",
      wpm: 60,
      accuracy: 90,
      chars_typed: 120,
      time_seconds: 120, // 2 minutes
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // yesterday
    }
  ];

  const mockProgress = [
    { id: "prog-1", user_id: "mock-user", lesson_id: "lesson-1", is_completed: true }
  ];

  const mockDocs = [
    { id: "doc-1", library_id: "lib-1", title: "Ingestion Design", content: "..." }
  ];

  const mockChaps = [
    { id: "chap-1", document_id: "doc-1", title: "Chapter 1", sequence_number: 1 }
  ];

  const mockLessons = [
    { id: "lesson-1", chapter_id: "chap-1", content: "...", sequence_number: 1 }
  ];

  const mockLibs = [
    { id: "lib-1", name: "Coding Practice", description: "..." }
  ];

  localStorage.setItem("typeflow_typing_sessions_mock", JSON.stringify(mockSessions));
  localStorage.setItem("typeflow_lesson_progress_mock", JSON.stringify(mockProgress));
  localStorage.setItem("typeflow_documents_mock", JSON.stringify(mockDocs));
  localStorage.setItem("typeflow_chapters_mock", JSON.stringify(mockChaps));
  localStorage.setItem("typeflow_lessons_mock", JSON.stringify(mockLessons));
  localStorage.setItem("typeflow_libraries_mock", JSON.stringify(mockLibs));

  // 2. Fetch and calculate
  await useDashboardStore.getState().fetchDashboardData();

  const store = useDashboardStore.getState();

  // 3. Assertions
  assert.strictEqual(store.stats.averageWpm, 70, "Average WPM should be (80+60)/2 = 70");
  assert.strictEqual(store.stats.peakWpm, 80, "Peak WPM should be 80");
  assert.strictEqual(store.stats.averageAccuracy, 93, "Average Accuracy should be (95+90)/2 = 92.5 rounded to 93");
  assert.strictEqual(store.stats.totalTimeMins, 3, "Total time minutes should be (60+120)/60 = 3");
  assert.strictEqual(store.stats.streakDays, 2, "Streak days should be 2 consecutive days");

  assert.strictEqual(store.dailyGoal.timeSpentSeconds, 60, "Daily time spent today should be 60 seconds");

  const todayStr = new Date().toLocaleDateString("en-CA");
  const todayActivity = store.weeklyActivity.find((day) => day.dateStr === todayStr);
  assert.ok(todayActivity, "Should find today in weekly activity grid");
  assert.strictEqual(todayActivity!.active, true, "Today should be marked active");

  assert.ok(store.continueLearning, "Should generate continue learning details");
  assert.strictEqual(store.continueLearning!.documentTitle, "Ingestion Design");
  assert.strictEqual(store.continueLearning!.libraryName, "Coding Practice");
  assert.strictEqual(store.continueLearning!.progressPercent, 100, "Progress should be 100% since lesson-1 is completed");

  console.log("✓ Dashboard calculations passed!");
}

try {
  testDashboardCalculations()
    .then(() => {
      console.log("\n🎉 ALL DASHBOARD TESTS PASSED SUCCESSFULY! 🎉");
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
