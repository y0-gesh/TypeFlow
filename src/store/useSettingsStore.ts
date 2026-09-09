import { create } from "zustand";

interface SettingsState {
  fontFamily: string;
  fontSize: number;
  theme: string;
  caretStyle: string;
  keyboardLayout: string;
  zenMode: boolean;
  adaptiveMode: boolean;
  showKeyboard: boolean;
  setFontFamily: (font: string) => void;
  setFontSize: (size: number) => void;
  setTheme: (theme: string) => void;
  setCaretStyle: (style: string) => void;
  setKeyboardLayout: (layout: string) => void;
  setZenMode: (enabled: boolean) => void;
  setAdaptiveMode: (enabled: boolean) => void;
  setShowKeyboard: (show: boolean) => void;
  toggleKeyboard: () => void;
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
    adaptiveMode: false,
    showKeyboard: true
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
        adaptiveMode: parsed.adaptiveMode !== undefined ? parsed.adaptiveMode : defaults.adaptiveMode,
        showKeyboard: parsed.showKeyboard !== undefined ? parsed.showKeyboard : defaults.showKeyboard
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
  },

  setShowKeyboard: (showKeyboard) => {
    set({ showKeyboard });
    saveToStorage(get());
  },

  toggleKeyboard: () => {
    set((state) => {
      const next = !state.showKeyboard;
      const updated = { ...state, showKeyboard: next };
      saveToStorage(updated);
      return { showKeyboard: next };
    });
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
        adaptiveMode: state.adaptiveMode,
        showKeyboard: state.showKeyboard
      })
    );
  }
};
