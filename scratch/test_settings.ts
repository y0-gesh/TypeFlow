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

import { useSettingsStore } from "../src/store/useSettingsStore";
import * as assert from "assert";

function testSettingsStore() {
  console.log("Testing settings customization state actions...");

  const store = useSettingsStore.getState();

  // Test Defaults
  assert.strictEqual(store.fontFamily, "jetbrains-mono");
  assert.strictEqual(store.fontSize, 16);
  assert.strictEqual(store.theme, "dark");
  assert.strictEqual(store.caretStyle, "line");
  assert.strictEqual(store.keyboardLayout, "qwerty");
  assert.strictEqual(store.zenMode, false);

  // Test setters
  store.setCaretStyle("block");
  store.setKeyboardLayout("dvorak");
  store.setZenMode(true);
  store.setTheme("dracula");

  const updated = useSettingsStore.getState();
  assert.strictEqual(updated.caretStyle, "block");
  assert.strictEqual(updated.keyboardLayout, "dvorak");
  assert.strictEqual(updated.zenMode, true);
  assert.strictEqual(updated.theme, "dracula");

  // Verify LocalStorage
  const saved = JSON.parse(localStorage.getItem("typeflow_settings") || "{}");
  assert.strictEqual(saved.caretStyle, "block");
  assert.strictEqual(saved.keyboardLayout, "dvorak");
  assert.strictEqual(saved.zenMode, true);
  assert.strictEqual(saved.theme, "dracula");

  console.log("✓ Settings store customization tests passed!");
}

try {
  testSettingsStore();
  console.log("\n🎉 ALL SETTINGS TESTS PASSED SUCCESSFULY! 🎉");
  process.exit(0);
} catch (e) {
  console.error("❌ TEST FAILED ❌");
  console.error(e);
  process.exit(1);
}
