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

class MockAudioContext {
  createOscillator() {
    return {
      type: "sine",
      connect: () => {},
      start: () => {},
      stop: () => {},
      frequency: { value: 440 }
    };
  }
  createGain() {
    return {
      connect: () => {},
      gain: {
        setValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {}
      }
    };
  }
  currentTime = 0;
  destination = {};
}

(global as any).window = {
  localStorage: localStorageMock,
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext
};
(global as any).localStorage = localStorageMock;

import { useTypingStore } from "../src/store/useTypingStore";
import * as assert from "assert";

async function testKeyboardAnalytics() {
  console.log("Testing keyboard keypress analytics and timing triggers...");

  // Set up mock content chunks
  const store = useTypingStore.getState();
  store.setRawContent("a"); // expected letter 'a'

  // Type correct character 'a'
  store.updateInput("a");

  // Verify key stats
  let analytics = JSON.parse(localStorage.getItem("typeflow_keyboard_analytics") || "{}");
  assert.ok(analytics.keyStats, "Should initialize keyStats object");
  assert.ok(analytics.keyStats.a, "Should log key stats for 'a'");
  assert.strictEqual(analytics.keyStats.a.pressed, 1, "Should count 1 press for 'a'");
  assert.strictEqual(analytics.keyStats.a.errors, 0, "Should have 0 errors for 'a'");

  // Reset content to test typo
  store.setRawContent("b"); // expected letter 'b'
  
  // Type incorrect character 'x'
  store.updateInput("x");

  analytics = JSON.parse(localStorage.getItem("typeflow_keyboard_analytics") || "{}");
  assert.ok(analytics.keyStats.b, "Should log key stats for 'b'");
  assert.strictEqual(analytics.keyStats.b.pressed, 1, "Should count 1 press for 'b'");
  assert.strictEqual(analytics.keyStats.b.errors, 1, "Should count 1 error for 'b' since we typed 'x'");

  console.log("✓ Keyboard analytics tests passed!");
}

try {
  testKeyboardAnalytics()
    .then(() => {
      console.log("\n🎉 ALL ANALYTICS TESTS PASSED SUCCESSFULY! 🎉");
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
