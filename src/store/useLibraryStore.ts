import { create } from "zustand";
import { supabase, isMockAuth } from "@/lib/supabase";

export interface Library {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_favorite: boolean;
  created_at: string;
  document_count?: number;
}

interface LibraryStore {
  libraries: Library[];
  loading: boolean;
  error: string | null;
  fetchLibraries: () => Promise<void>;
  createLibrary: (name: string, description: string) => Promise<boolean>;
  updateLibrary: (id: string, updates: Partial<Library>) => Promise<boolean>;
  deleteLibrary: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<boolean>;
}

const LOCAL_STORAGE_KEY = "typeflow_libraries_mock";

// Helper for Mock Local Storage
const getMockLibraries = (): Library[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockLibraries = (libraries: Library[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(libraries));
};

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  libraries: [],
  loading: false,
  error: null,

  fetchLibraries: async () => {
    set({ loading: true, error: null });
    try {
      if (isMockAuth) {
        // Mock LocalStorage Implementation
        const mockLibs = getMockLibraries();
        // Mock document count calculation (for now mock it as 0, Phase 4 will link actual docs)
        const libsWithCount = mockLibs.map(lib => ({
          ...lib,
          document_count: lib.document_count || 0
        }));
        set({ libraries: libsWithCount, loading: false });
      } else {
        // Actual Supabase Implementation
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) {
          set({ libraries: [], loading: false });
          return;
        }

        // Fetch libraries and join with documents to get counts
        const { data, error } = await supabase
          .from("libraries")
          .select("*, documents(id)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mappedLibraries: Library[] = (data || []).map((lib: any) => ({
          id: lib.id,
          user_id: lib.user_id,
          name: lib.name,
          description: lib.description || "",
          is_favorite: lib.is_favorite || false,
          created_at: lib.created_at,
          document_count: lib.documents?.length || 0,
        }));

        set({ libraries: mappedLibraries, loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch libraries", loading: false });
    }
  },

  createLibrary: async (name: string, description: string) => {
    set({ loading: true, error: null });
    try {
      if (isMockAuth) {
        const mockLibs = getMockLibraries();
        const newLib: Library = {
          id: `mock-lib-${Math.random().toString(36).substring(2, 9)}`,
          user_id: "mock-user",
          name,
          description,
          is_favorite: false,
          created_at: new Date().toISOString(),
          document_count: 0
        };
        const updated = [newLib, ...mockLibs];
        saveMockLibraries(updated);
        set({ libraries: updated, loading: false });
        return true;
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("No authenticated user session found");

        const { data, error } = await supabase
          .from("libraries")
          .insert({
            name,
            description,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Fetch to update state and get proper counts
        await get().fetchLibraries();
        return true;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to create library", loading: false });
      return false;
    }
  },

  updateLibrary: async (id: string, updates: Partial<Library>) => {
    set({ loading: true, error: null });
    try {
      if (isMockAuth) {
        const mockLibs = getMockLibraries();
        const updated = mockLibs.map((lib) =>
          lib.id === id ? { ...lib, ...updates } : lib
        );
        saveMockLibraries(updated);
        set({ libraries: updated, loading: false });
        return true;
      } else {
        const { error } = await supabase
          .from("libraries")
          .update(updates)
          .eq("id", id);

        if (error) throw error;

        await get().fetchLibraries();
        return true;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to update library", loading: false });
      return false;
    }
  },

  deleteLibrary: async (id: string) => {
    set({ loading: true, error: null });
    try {
      if (isMockAuth) {
        const mockLibs = getMockLibraries();
        const updated = mockLibs.filter((lib) => lib.id !== id);
        saveMockLibraries(updated);
        set({ libraries: updated, loading: false });
        return true;
      } else {
        const { error } = await supabase
          .from("libraries")
          .delete()
          .eq("id", id);

        if (error) throw error;

        await get().fetchLibraries();
        return true;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to delete library", loading: false });
      return false;
    }
  },

  toggleFavorite: async (id: string, isFavorite: boolean) => {
    return get().updateLibrary(id, { is_favorite: isFavorite });
  }
}));
