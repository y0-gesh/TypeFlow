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

import { useTypingStore } from "../src/store/useTypingStore";
import * as assert from "assert";

async function testMockProgressSaving() {
  console.log("Testing progress tracking and session logging...");

  // Set up mock content chunks
  const store = useTypingStore.getState();
  store.setRawContent("Chapter 1: Hello World\nThis is a simple lesson to practice typing.");
  
  // Verify state initialized
  const updatedStore = useTypingStore.getState();
  assert.strictEqual(updatedStore.chunks.length, 1, "Should have 1 chunk loaded");
  assert.strictEqual(updatedStore.currentIndex, 0, "Current index should be 0");
  assert.strictEqual(updatedStore.lessonStatus, "idle", "Lesson status should be idle");
  
  // Simulate typing (correct inputs)
  const chunkText = updatedStore.chunks[0].text;
  
  // Update state parameters directly (simulate successful typing session completion)
  useTypingStore.setState({
    userInput: chunkText,
    timeElapsed: 10, // 10 seconds
    totalKeysPressed: chunkText.length,
    stats: {
      wpm: 60,
      accuracy: 100,
      correctChars: chunkText.length,
      totalCharsTyped: chunkText.length
    }
  });

  // Complete chunk
  await useTypingStore.getState().completeChunk();

  const finalStore = useTypingStore.getState();
  assert.strictEqual(finalStore.lessonStatus, "completed", "Status should be completed (accuracy >= 90)");
  
  // Check LocalStorage
  const sessions = JSON.parse(localStorage.getItem("typeflow_typing_sessions_mock") || "[]");
  const progress = JSON.parse(localStorage.getItem("typeflow_lesson_progress_mock") || "[]");

  assert.strictEqual(sessions.length, 1, "Should have saved 1 typing session record");
  assert.strictEqual(sessions[0].wpm, 60, "Saved WPM should match stats");
  assert.strictEqual(sessions[0].accuracy, 100, "Saved accuracy should match stats");
  assert.strictEqual(sessions[0].time_seconds, 10, "Saved time should match stats");
  
  assert.strictEqual(progress.length, 1, "Should have saved 1 lesson progress record");
  assert.strictEqual(progress[0].is_completed, true, "Lesson progress record should be marked completed");
  assert.strictEqual(progress[0].best_wpm, 60, "Best WPM should be updated");
  assert.strictEqual(progress[0].attempts_count, 1, "Attempts count should be 1");

  console.log("✓ Mock progress saving passed!");
}

try {
  testMockProgressSaving()
    .then(() => {
      console.log("\n🎉 ALL PROGRESS TESTS PASSED SUCCESSFULY! 🎉");
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
