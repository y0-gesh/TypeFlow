import { create } from "zustand";
import { supabase, isMockAuth } from "@/lib/supabase";
import { contentEngine } from "@/engines/contentEngine";

export interface Document {
  id: string;
  library_id: string;
  user_id: string;
  title: string;
  content: string;
  file_path: string | null;
  status: "Uploaded" | "Queued" | "Processing" | "Completed" | "Failed";
  created_at: string;
}

interface DocumentStore {
  documents: Document[];
  loading: boolean;
  error: string | null;
  fetchDocuments: (libraryId: string) => Promise<void>;
  uploadDocument: (
    libraryId: string,
    title: string,
    content: string,
    file?: File
  ) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  processDocumentContent: (docId: string, content: string) => Promise<void>;
}

const LOCAL_STORAGE_KEY = "typeflow_documents_mock";
const LESSONS_STORAGE_KEY = "typeflow_lessons_mock";

// Helper for Mock Local Storage
const getMockDocs = (): Document[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveMockDocs = (docs: Document[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  loading: false,
  error: null,

  fetchDocuments: async (libraryId: string) => {
    set({ loading: true, error: null });
    try {
      if (isMockAuth) {
        const mockDocs = getMockDocs();
        const filtered = mockDocs.filter((doc) => doc.library_id === libraryId);
        set({ documents: filtered, loading: false });
      } else {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("library_id", libraryId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        set({ documents: data || [], loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch documents", loading: false });
    }
  },

  uploadDocument: async (libraryId: string, title: string, content: string, file?: File) => {
    set({ loading: true, error: null });
    try {
      let filePath: string | null = null;
      
      if (isMockAuth) {
        // Mock Ingestion
        const mockDocs = getMockDocs();
        const newDoc: Document = {
          id: `mock-doc-${Math.random().toString(36).substring(2, 9)}`,
          library_id: libraryId,
          user_id: "mock-user",
          title,
          content,
          file_path: file ? `mock-files/${file.name}` : null,
          status: "Uploaded",
          created_at: new Date().toISOString(),
        };

        const updated = [newDoc, ...mockDocs];
        saveMockDocs(updated);
        set({ documents: updated.filter(d => d.library_id === libraryId), loading: false });

        // Trigger background processing animation
        get().processDocumentContent(newDoc.id, content);
        return true;
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("No authenticated user session found");

        // Upload file to Supabase Storage if provided
        if (file) {
          const fileExt = file.name.split(".").pop();
          const uniquePath = `${user.id}/${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
          
          // Verify bucket exists, if not it will error, we handle it
          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(uniquePath, file);

          if (uploadError) {
            console.warn("Storage upload failed (verify bucket 'documents' is created):", uploadError.message);
            // We fall back to pathless if storage fails
          } else {
            filePath = uniquePath;
          }
        }

        // Insert document with 'Uploaded' status
        const { data: newDoc, error: insertError } = await supabase
          .from("documents")
          .insert({
            library_id: libraryId,
            user_id: user.id,
            title,
            content,
            file_path: filePath,
            status: "Uploaded"
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Fetch list to show it immediately in queue
        await get().fetchDocuments(libraryId);
        
        // Trigger background processor pipeline
        get().processDocumentContent(newDoc.id, content);
        return true;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to upload document", loading: false });
      return false;
    }
  },

  processDocumentContent: async (docId: string, content: string) => {
    const updateStatus = async (status: Document["status"]) => {
      if (isMockAuth) {
        const mockDocs = getMockDocs();
        const updated = mockDocs.map((doc) =>
          doc.id === docId ? { ...doc, status } : doc
        );
        saveMockDocs(updated);
        // Find library ID
        const activeDoc = mockDocs.find(d => d.id === docId);
        if (activeDoc) {
          set({ documents: updated.filter(d => d.library_id === activeDoc.library_id) });
        }
      } else {
        const { error } = await supabase
          .from("documents")
          .update({ status })
          .eq("id", docId);
        if (error) console.error("Failed to update status", error);
        
        // Find document details
        const activeDoc = get().documents.find(d => d.id === docId);
        if (activeDoc) {
          await get().fetchDocuments(activeDoc.library_id);
        }
      }
    };

    // Stage 1: Transition to Queued (simulate queue delay)
    await new Promise((resolve) => setTimeout(resolve, 800));
    await updateStatus("Queued");

    // Stage 2: Transition to Processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await updateStatus("Processing");

    try {
      // Stage 3: Split structurally into chapters and lesson chunks
      const processedChapters = contentEngine.processDocument(content);

      if (isMockAuth) {
        // Save mock chapters and lessons in LocalStorage
        const mockChapters = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_chapters_mock") || "[]") : [];
        const mockLessons = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_lessons_mock") || "[]") : [];
        
        const newChapters: any[] = [];
        const newLessons: any[] = [];

        for (const chap of processedChapters) {
          const chapId = `mock-chap-${Math.random().toString(36).substring(2, 9)}`;
          newChapters.push({
            id: chapId,
            document_id: docId,
            title: chap.title,
            sequence_number: chap.sequence_number
          });

          chap.lessons.forEach((les) => {
            newLessons.push({
              id: `mock-lesson-${Math.random().toString(36).substring(2, 9)}`,
              chapter_id: chapId,
              content: les.content,
              difficulty: les.difficulty,
              sequence_number: les.sequence_number
            });
          });
        }

        localStorage.setItem("typeflow_chapters_mock", JSON.stringify([...mockChapters, ...newChapters]));
        localStorage.setItem("typeflow_lessons_mock", JSON.stringify([...mockLessons, ...newLessons]));
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (!user) throw new Error("Session expired during document processing");

        // Insert Chapters and their corresponding lessons transactionally (sequentially)
        for (const chap of processedChapters) {
          const { data: newChapter, error: chapterError } = await supabase
            .from("chapters")
            .insert({
              document_id: docId,
              user_id: user.id,
              title: chap.title,
              sequence_number: chap.sequence_number
            })
            .select()
            .single();

          if (chapterError) throw chapterError;

          // Insert generated Lessons for this chapter
          const lessonsData = chap.lessons.map((les) => ({
            chapter_id: newChapter.id,
            user_id: user.id,
            content: les.content,
            difficulty: les.difficulty,
            sequence_number: les.sequence_number
          }));

          const { error: lessonsError } = await supabase
            .from("lessons")
            .insert(lessonsData);

          if (lessonsError) throw lessonsError;
        }
      }

      // Transition to Completed
      await new Promise((resolve) => setTimeout(resolve, 500));
      await updateStatus("Completed");
    } catch (err) {
      console.error("Document processor pipeline failure:", err);
      await updateStatus("Failed");
    }
  },

  deleteDocument: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const activeDoc = get().documents.find(d => d.id === id);
      if (!activeDoc) return false;

      if (isMockAuth) {
        const mockDocs = getMockDocs();
        const updated = mockDocs.filter((doc) => doc.id !== id);
        saveMockDocs(updated);
        set({ documents: updated.filter(d => d.library_id === activeDoc.library_id), loading: false });
        return true;
      } else {
        // Delete document from table (cascade deletes storage linkages / lessons)
        const { error } = await supabase
          .from("documents")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Delete from storage if file_path exists
        if (activeDoc.file_path) {
          await supabase.storage
            .from("documents")
            .remove([activeDoc.file_path]);
        }

        await get().fetchDocuments(activeDoc.library_id);
        return true;
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to delete document", loading: false });
      return false;
    }
  }
}));
