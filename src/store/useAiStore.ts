import { create } from "zustand";
import { supabase, isMockAuth } from "@/lib/supabase";
import { useDocumentStore } from "./useDocumentStore";

const STORAGE_KEY = "typeflow_gemini_key";

interface AiState {
  apiKey: string;
  loading: boolean;
  setApiKey: (key: string) => void;
  generateLesson: (prompt: string, libraryId: string) => Promise<boolean>;
  explainText: (text: string) => Promise<string>;
  generateVocabularyLesson: (libraryId: string) => Promise<boolean>;
}

const loadApiKey = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

const callGeminiApi = async (prompt: string, apiKey: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Gemini API request failed");
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

export const useAiStore = create<AiState>((set, get) => ({
  apiKey: loadApiKey(),
  loading: false,

  setApiKey: (apiKey) => {
    set({ apiKey });
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, apiKey);
    }
  },

  generateLesson: async (prompt: string, libraryId: string): Promise<boolean> => {
    set({ loading: true });
    const { apiKey } = get();
    try {
      let content = "";
      if (apiKey.trim()) {
        const fullPrompt = `Create a typing practice lesson block (prose or code) based on the user request: "${prompt}". Respond with ONLY the actual lesson text, no introduction, markdown formatting quotes, or extra text.`;
        content = await callGeminiApi(fullPrompt, apiKey);
      } else {
        // Fallback Mock AI generator
        const pLower = prompt.toLowerCase();
        if (pLower.includes("typescript") || pLower.includes("programming") || pLower.includes("code")) {
          content = `TypeScript Programming Syntax Drill\n\ninterface Profile {\n  id: string;\n  status: "active" | "inactive";\n}\n\nconst getProfile = (id: string): Profile => {\n  return { id, status: "active" };\n};\n\nconst numbers: number[] = [10, 20, 30];\nconst squared = numbers.map(n => n * n);\nconsole.log(squared);`;
        } else if (pLower.includes("french") || pLower.includes("language")) {
          content = `French Travel Vocabulary Lesson\n\nBonjour, comment ça va? Je voudrais un café s'il vous plaît. Où se trouve la gare de Lyon? Merci beaucoup pour votre aide. Enchanté de faire votre connaissance. Excusez-moi, combien coûte ce billet de train? Passez une bonne journée!`;
        } else {
          content = `AI Generated Lesson: ${prompt}\n\nDeveloping typing rhythm requires constant practice on varied syntax structures. Standard prose layouts reinforce transition rhythms between common trigrams, while programming scripts train special operator muscle memory. Repeat this custom lesson to calibrate WPM and accuracy metrics.`;
        }
      }

      // Add to document store
      const title = `AI: ${prompt.substring(0, 20)}...`;
      const success = await useDocumentStore.getState().uploadDocument(libraryId, title, content);
      set({ loading: false });
      return success;
    } catch (e: any) {
      console.error(e);
      alert(`AI Lesson Generation failed: ${e.message || e}`);
      set({ loading: false });
      return false;
    }
  },

  explainText: async (text: string): Promise<string> => {
    const { apiKey } = get();
    if (!text.trim()) return "Select text to explain.";
    
    set({ loading: true });
    try {
      let explanation = "";
      if (apiKey.trim()) {
        const prompt = `Provide a concise explanation or summary of this text block in 3 sentences: "${text}"`;
        explanation = await callGeminiApi(prompt, apiKey);
      } else {
        // Mock Explanation
        explanation = `This block represents typing content focusing on programming variables or structured prose. In typical environments, this code configures properties dynamically or maps arrays sequentially using arrow callbacks. Practice typing this code to get familiar with symbols like brackets and braces.`;
      }
      set({ loading: false });
      return explanation;
    } catch (e: any) {
      set({ loading: false });
      return `Failed to fetch explanation: ${e.message || e}`;
    }
  },

  generateVocabularyLesson: async (libraryId: string): Promise<boolean> => {
    set({ loading: true });
    const { apiKey } = get();
    try {
      // Find top error keys from localStorage
      let topKeys = ["r", "c"]; // default fallback
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("typeflow_keyboard_analytics");
        if (raw) {
          const parsed = JSON.parse(raw);
          const list: { char: string; rate: number }[] = [];
          Object.keys(parsed.keyStats || {}).forEach((char) => {
            const stats = parsed.keyStats[char];
            if (stats.pressed > 5) {
              list.push({ char, rate: stats.errors / stats.pressed });
            }
          });
          const sorted = list.sort((a, b) => b.rate - a.rate).slice(0, 3);
          if (sorted.length > 0) {
            topKeys = sorted.map((s) => s.char);
          }
        }
      }

      let content = "";
      const targetKeysStr = topKeys.join(", ").toUpperCase();
      
      if (apiKey.trim()) {
        const prompt = `Create a custom typing vocabulary drill paragraph focusing extensively on the letters: ${targetKeysStr}. Repetitively combine words containing these letters (e.g. cherry cyclic race). Respond with ONLY the lesson text.`;
        content = await callGeminiApi(prompt, apiKey);
      } else {
        // Fallback vocab generator
        const drillWords = topKeys.map(k => `${k}a${k}e ${k}i${k}o`).join(" ");
        content = `Adaptive Vocabulary Drill: Focus on keys ${targetKeysStr}\n\nThis lesson targets muscle memory reprograming for keycaps ${targetKeysStr} based on error rates. Repeat these words: ${drillWords} cherry race cyclic cherry racer cyclic cherry race race cyclic cherry racer race cherry racer cherry cyclic race cherry cyclic racer.`;
      }

      const title = `AI Vocab Drill (${topKeys.join("").toUpperCase()})`;
      const success = await useDocumentStore.getState().uploadDocument(libraryId, title, content);
      set({ loading: false });
      return success;
    } catch (e: any) {
      console.error(e);
      set({ loading: false });
      return false;
    }
  }
}));
