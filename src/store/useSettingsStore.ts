import { create } from "zustand";

interface SettingsState {
  fontFamily: string;
  fontSize: number;
  theme: string;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
}

const STORAGE_KEY = "typeflow_settings";

const loadSettings = () => {
  if (typeof window === "undefined") {
    return { fontFamily: "jetbrains-mono", fontSize: 16, theme: "dark" };
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        fontFamily: parsed.fontFamily || "jetbrains-mono",
        fontSize: parsed.fontSize || 16,
        theme: parsed.theme || "dark",
      };
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }
  return { fontFamily: "jetbrains-mono", fontSize: 16, theme: "dark" };
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fontFamily,
          fontSize: get().fontSize,
          theme: get().theme,
        })
      );
    }
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fontFamily: get().fontFamily,
          fontSize,
          theme: get().theme,
        })
      );
    }
  },

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fontFamily: get().fontFamily,
          fontSize: get().fontSize,
          theme,
        })
      );
    }
  },
}));
