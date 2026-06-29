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

import { useAiStore } from "../src/store/useAiStore";
import * as assert from "assert";

async function testAiFeatures() {
  console.log("Testing AI-Assisted prompt generators and explanations...");

  const store = useAiStore.getState();

  // Test default state: empty API key should run in Sandbox Demo Mode
  assert.strictEqual(store.apiKey, "");
  assert.strictEqual(store.loading, false);

  // Test Explain Text Fallback Mode
  const explanation = await store.explainText("const test = 100;");
  assert.ok(explanation.length > 20);
  assert.ok(explanation.includes("programming variables"));
  
  // Set Gemini Key
  store.setApiKey("test-gemini-key-12345");
  const updated = useAiStore.getState();
  assert.strictEqual(updated.apiKey, "test-gemini-key-12345");
  assert.strictEqual(localStorage.getItem("typeflow_gemini_key"), "test-gemini-key-12345");

  console.log("✓ AI-Assisted features tests passed!");
}

try {
  testAiFeatures()
    .then(() => {
      console.log("\n🎉 ALL AI FEATURES TESTS PASSED SUCCESSFULY! 🎉");
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
