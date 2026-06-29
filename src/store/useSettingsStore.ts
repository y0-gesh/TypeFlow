import { create } from "zustand";

interface SettingsState {
  fontFamily: string;
  fontSize: number;
  theme: string;
  caretStyle: string;
  keyboardLayout: string;
  zenMode: boolean;
  adaptiveMode: boolean;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  setCaretStyle: (style: string) => void;
  setKeyboardLayout: (layout: string) => void;
  setZenMode: (enabled: boolean) => void;
  setAdaptiveMode: (enabled: boolean) => void;
}

const STORAGE_KEY = "typeflow_settings";

const loadSettings = () => {
  const defaults = {
    fontFamily: "jetbrains-mono",
    fontSize: 16,
    theme: "dark",
    caretStyle: "line",
    keyboardLayout: "qwerty",
    zenMode: false,
    adaptiveMode: false
  };

  if (typeof window === "undefined") {
    return defaults;
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        fontFamily: parsed.fontFamily || defaults.fontFamily,
        fontSize: parsed.fontSize || defaults.fontSize,
        theme: parsed.theme || defaults.theme,
        caretStyle: parsed.caretStyle || defaults.caretStyle,
        keyboardLayout: parsed.keyboardLayout || defaults.keyboardLayout,
        zenMode: parsed.zenMode !== undefined ? parsed.zenMode : defaults.zenMode,
        adaptiveMode: parsed.adaptiveMode !== undefined ? parsed.adaptiveMode : defaults.adaptiveMode
      };
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
  }
  return defaults;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),

  setFontFamily: (fontFamily) => {
    set({ fontFamily });
    saveToStorage(get());
  },

  setFontSize: (fontSize) => {
    set({ fontSize });
    saveToStorage(get());
  },

  setTheme: (theme) => {
    set({ theme });
    saveToStorage(get());
  },

  setCaretStyle: (caretStyle) => {
    set({ caretStyle });
    saveToStorage(get());
  },

  setKeyboardLayout: (keyboardLayout) => {
    set({ keyboardLayout });
    saveToStorage(get());
  },

  setZenMode: (zenMode) => {
    set({ zenMode });
    saveToStorage(get());
  },

  setAdaptiveMode: (adaptiveMode) => {
    set({ adaptiveMode });
    saveToStorage(get());
  }
}));

const saveToStorage = (state: SettingsState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fontFamily: state.fontFamily,
        fontSize: state.fontSize,
        theme: state.theme,
        caretStyle: state.caretStyle,
        keyboardLayout: state.keyboardLayout,
        zenMode: state.zenMode,
        adaptiveMode: state.adaptiveMode
      })
    );
  }
};
