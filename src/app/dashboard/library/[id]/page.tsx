"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useDocumentStore, Document, Chapter, Lesson } from "@/store/useDocumentStore";
import { useTypingStore } from "@/store/useTypingStore";
import { useAiStore } from "@/store/useAiStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import { Input } from "@/vendors/ui/input";
import { extractTextFromFile } from "@/utils/fileExtractor";
import { countWords } from "@/utils/chunkGenerator";
import {
  FileText,
  UploadCloud,
  ChevronLeft,
  ChevronDown,
  Loader2,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Layers,
  Brain,
  Sparkles,
  Info,
  Award,
  BookOpen,
  Check,
  Flame,
  FileCode,
  FileSpreadsheet
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LibraryDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const libraryId = resolvedParams.id;

  const { libraries, fetchLibraries } = useLibraryStore();
  const { 
    documents, 
    chapters, 
    lessons, 
    loading, 
    fetchChaptersAndLessons, 
    uploadDocument, 
    deleteDocument 
  } = useDocumentStore();
  const { loadChapterLessons } = useTypingStore();

  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const progress = JSON.parse(localStorage.getItem("typeflow_progress") || '{"completedChunks":[]}');
      setCompletedSet(new Set(progress.completedChunks || []));
    }
  }, []);

  // Uploader tabs & form state
  const [activeTab, setActiveTab] = useState<"upload" | "paste" | "ai">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  
  // Paste form state
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  // AI generator form & explain states
  const [aiPrompt, setAiPrompt] = useState("");
  const [explainingDoc, setExplainingDoc] = useState<Document | null>(null);
  const [explanationText, setExplanationText] = useState("");
  const { apiKey, loading: aiLoading, generateLesson, explainText, generateVocabularyLesson } = useAiStore();

  useEffect(() => {
    fetchLibraries();
    fetchChaptersAndLessons(libraryId);
  }, [libraryId, fetchLibraries, fetchChaptersAndLessons]);

  const library = libraries.find((l) => l.id === libraryId);

  // Auto-expand first document if available
  useEffect(() => {
    if (documents.length > 0 && expandedDocs.size === 0) {
      setExpandedDocs(new Set([documents[0].id]));
    }
  }, [documents, expandedDocs.size]);

  const toggleDocExpand = (docId: string) => {
    setExpandedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const handleExplainDoc = async (doc: Document) => {
    setExplainingDoc(doc);
    setExplanationText("AI is reading and explaining the document contents...");
    const explanation = await explainText(doc.content);
    setExplanationText(explanation);
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setUploadLoading(true);
    setUploadFeedback("Generating lesson with AI...");
    const success = await generateLesson(aiPrompt, libraryId);
    setUploadLoading(false);
    setUploadFeedback(null);
    if (success) {
      setAiPrompt("");
      fetchChaptersAndLessons(libraryId);
    }
  };

  const handleAiVocab = async () => {
    setUploadLoading(true);
    setUploadFeedback("Building weak-key vocabulary drills...");
    const success = await generateVocabularyLesson(libraryId);
    setUploadLoading(false);
    setUploadFeedback(null);
    if (success) {
      fetchChaptersAndLessons(libraryId);
    }
  };

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const validExtensions = [".txt", ".md", ".pdf", ".docx"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExtensions.includes(fileExt)) {
      alert("Invalid format. Please upload .txt, .md, .pdf, or .docx files.");
      return;
    }

    setUploadLoading(true);
    setUploadFeedback(`Extracting text from ${file.name}...`);
    try {
      const content = await extractTextFromFile(file);

      if (!content.trim()) {
        alert("Could not extract readable text from the uploaded file.");
        return;
      }

      setUploadFeedback("Generating 50–100 word balanced practice chunks...");
      const title = file.name.replace(fileExt, "");
      await uploadDocument(libraryId, title, content, file);
      fetchChaptersAndLessons(libraryId);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to process file: ${err.message || err}`);
    } finally {
      setUploadLoading(false);
      setUploadFeedback(null);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) return;

    if (pasteContent.length > 100000) {
      alert("Text exceeds the 100,000 character limit.");
      return;
    }

    const title = pasteTitle.trim() || `Pasted Text - ${new Date().toLocaleDateString()}`;

    setUploadLoading(true);
    setUploadFeedback("Processing pasted text into chapters...");
    try {
      const success = await uploadDocument(libraryId, title, pasteContent.trim());
      if (success) {
        setPasteTitle("");
        setPasteContent("");
        fetchChaptersAndLessons(libraryId);
      }
    } finally {
      setUploadLoading(false);
      setUploadFeedback(null);
    }
  };

  const handlePracticeChapter = (chapterId: string) => {
    const chapLessons = lessons
      .filter((l) => l.chapter_id === chapterId)
      .sort((a, b) => a.sequence_number - b.sequence_number);

    if (chapLessons.length === 0) {
      alert("This chapter has no lessons processed yet.");
      return;
    }

    // Find first uncompleted lesson in this chapter
    let startIndex = 0;
    for (let i = 0; i < chapLessons.length; i++) {
      if (!completedSet.has(chapLessons[i].id)) {
        startIndex = i;
        break;
      }
    }

    loadChapterLessons(chapLessons, startIndex, chapterId);
    router.push("/dashboard/practice");
  };

  const handlePracticeDocument = (docId: string) => {
    const docChapters = chapters
      .filter((c) => c.document_id === docId)
      .sort((a, b) => a.sequence_number - b.sequence_number);

    if (docChapters.length === 0) {
      alert("This document has no chapters processed yet.");
      return;
    }

    // Find first incomplete chapter
    let targetChapterId = docChapters[0].id;
    for (const chap of docChapters) {
      const chapLessons = lessons.filter((l) => l.chapter_id === chap.id);
      const completedCount = chapLessons.filter((l) => completedSet.has(l.id)).length;
      if (completedCount < chapLessons.length) {
        targetChapterId = chap.id;
        break;
      }
    }

    handlePracticeChapter(targetChapterId);
  };

  // Helper to determine document format badge
  const getDocBadge = (doc: Document) => {
    const titleLower = doc.title.toLowerCase();
    const pathLower = (doc.file_path || "").toLowerCase();

    if (titleLower.endsWith(".pdf") || pathLower.endsWith(".pdf")) {
      return { label: "PDF", color: "bg-rose-500/10 text-rose-500 border-rose-500/30" };
    }
    if (titleLower.endsWith(".docx") || pathLower.endsWith(".docx")) {
      return { label: "DOCX", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" };
    }
    if (titleLower.endsWith(".md") || pathLower.endsWith(".md")) {
      return { label: "MARKDOWN", color: "bg-violet-500/10 text-violet-400 border-violet-500/30" };
    }
    if (titleLower.endsWith(".txt") || pathLower.endsWith(".txt")) {
      return { label: "TXT", color: "bg-amber-500/10 text-amber-500 border-amber-500/30" };
    }
    return { label: "TEXT", color: "bg-primary/10 text-primary border-primary/30" };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3.5">
          <Link href="/dashboard/library">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary cursor-pointer border border-border/50">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <Link href="/dashboard/library" className="hover:text-primary transition-colors">
                Libraries
              </Link>
              <span>/</span>
              <span className="text-foreground/80">{library ? library.name : "Folder"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 mt-0.5">
              <FolderOpen className="h-7 w-7 text-primary shrink-0" />
              {library ? library.name : "Loading Library..."}
            </h1>
          </div>
        </div>

        {library && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-secondary/30 px-3.5 py-1.5 rounded-xl border border-border/40 self-start sm:self-auto">
            <span>{documents.length} {documents.length === 1 ? "Book" : "Books"}</span>
            <span>•</span>
            <span>{chapters.length} Chapters</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Book Progress Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Books & Documents
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each document is broken down into structured chapters with balanced 50–100 word typing drills.
              </p>
            </div>
          </div>

          {loading && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground font-mono border border-border/50 rounded-2xl bg-card">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
              Fetching books and chapters...
            </div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/60 rounded-3xl bg-secondary/5 px-6">
              <div className="p-4 bg-primary/5 text-primary rounded-2xl mb-4">
                <BookOpen className="h-10 w-10" />
              </div>
              <p className="text-base font-bold text-foreground">No books in this library yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
                Drop any .txt, .pdf, or .docx file on the ingestion panel to start typing your favorite books and documents.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {documents.map((doc) => {
                const badge = getDocBadge(doc);
                const wordCount = countWords(doc.content);
                const docChapters = chapters
                  .filter((c) => c.document_id === doc.id)
                  .sort((a, b) => a.sequence_number - b.sequence_number);

                const docLessons = lessons.filter((l) =>
                  docChapters.some((c) => c.id === l.chapter_id)
                );

                const completedLessonsCount = docLessons.filter((l) => completedSet.has(l.id)).length;
                const totalLessonsCount = docLessons.length;
                const progressPercent = totalLessonsCount > 0
                  ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
                  : 0;

                const completedChaptersCount = docChapters.filter((c) => {
                  const chapLessons = lessons.filter((l) => l.chapter_id === c.id);
                  return chapLessons.length > 0 && chapLessons.every((l) => completedSet.has(l.id));
                }).length;

                const isExpanded = expandedDocs.has(doc.id);

                return (
                  <Card
                    key={doc.id}
                    className="overflow-hidden border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border transition-all duration-200"
                  >
                    {/* Top Progress Bar Line */}
                    <div className="h-1 w-full bg-secondary/40">
                      <div
                        className="h-full bg-linear-to-r from-primary to-emerald-400 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="p-5 sm:p-6 space-y-5">
                      {/* Top Row: Title + Format Badge + Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 mt-0.5 ${badge.color}`}>
                            {badge.label}
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                              {doc.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground font-mono mt-1">
                              <span>~{wordCount.toLocaleString()} words</span>
                              <span>•</span>
                              <span>{doc.content.length.toLocaleString()} chars</span>
                              <span>•</span>
                              <span>{docChapters.length} {docChapters.length === 1 ? "chapter" : "chapters"}</span>
                              <span>•</span>
                              <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 flex items-center gap-2 self-start sm:self-center">
                          {doc.status === "Completed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {progressPercent === 100 ? "Completed" : `${progressPercent}% Mastered`}
                            </span>
                          )}
                          {doc.status === "Processing" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Processing
                            </span>
                          )}
                          {doc.status === "Queued" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Queued
                            </span>
                          )}
                          {doc.status === "Failed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress summary stats */}
                      {doc.status === "Completed" && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-secondary/15 border border-border/30">
                          <div className="px-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                              Chapters
                            </span>
                            <div className="text-sm font-black mt-0.5">
                              {completedChaptersCount} <span className="text-xs font-normal text-muted-foreground">/ {docChapters.length}</span>
                            </div>
                          </div>
                          <div className="px-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                              Lessons
                            </span>
                            <div className="text-sm font-black mt-0.5">
                              {completedLessonsCount} <span className="text-xs font-normal text-muted-foreground">/ {totalLessonsCount}</span>
                            </div>
                          </div>
                          <div className="px-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                              Balanced Chunks
                            </span>
                            <div className="text-sm font-black mt-0.5">
                              {totalLessonsCount} <span className="text-[10px] font-normal text-muted-foreground">50–100w</span>
                            </div>
                          </div>
                          <div className="px-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                              Completion
                            </span>
                            <div className="text-sm font-black mt-0.5 text-emerald-500">
                              {progressPercent}%
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/30">
                        <div className="flex items-center gap-2">
                          {doc.status === "Completed" && (
                            <Button
                              onClick={() => handlePracticeDocument(doc.id)}
                              className="rounded-xl font-black text-xs gap-2 shadow-xs cursor-pointer"
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                              {progressPercent > 0 ? "Resume Book" : "Start Book"}
                            </Button>
                          )}

                          {doc.status === "Completed" && docChapters.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleDocExpand(doc.id)}
                              className="rounded-xl text-xs font-bold gap-1.5 border-border/60 hover:bg-secondary/40 cursor-pointer"
                            >
                              <Layers className="h-3.5 w-3.5 text-primary" />
                              <span>{docChapters.length} {docChapters.length === 1 ? "Chapter" : "Chapters"}</span>
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {doc.status === "Completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExplainDoc(doc)}
                              className="h-8 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer gap-1.5 px-2.5"
                              title="Explain with AI"
                            >
                              <Brain className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">AI Insight</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocument(doc.id)}
                            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Collapsible Chapter Breakdown Accordion */}
                      {isExpanded && docChapters.length > 0 && (
                        <div className="pt-4 border-t border-border/40 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span>Chapter Navigator</span>
                            <span>{completedChaptersCount} of {docChapters.length} complete</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {docChapters.map((chap, idx) => {
                              const chapLessons = lessons
                                .filter((l) => l.chapter_id === chap.id)
                                .sort((a, b) => a.sequence_number - b.sequence_number);

                              const completedCount = chapLessons.filter((l) => completedSet.has(l.id)).length;
                              const totalCount = chapLessons.length;
                              const isChapCompleted = completedCount === totalCount && totalCount > 0;
                              const isChapInProgress = completedCount > 0 && !isChapCompleted;

                              return (
                                <div
                                  key={chap.id}
                                  onClick={() => handlePracticeChapter(chap.id)}
                                  className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                                    isChapCompleted
                                      ? "bg-emerald-500/5 border-emerald-500/25 hover:bg-emerald-500/10"
                                      : isChapInProgress
                                      ? "bg-blue-500/5 border-blue-500/25 hover:bg-blue-500/10"
                                      : "bg-secondary/20 border-border/40 hover:bg-secondary/40 hover:border-border"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                      isChapCompleted
                                        ? "bg-emerald-500 text-white"
                                        : isChapInProgress
                                        ? "bg-blue-500 text-white"
                                        : "bg-secondary text-muted-foreground"
                                    }`}>
                                      {isChapCompleted ? (
                                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                                      ) : (
                                        idx + 1
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                        {chap.title}
                                      </h4>
                                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                        {completedCount}/{totalCount} lessons • {isChapCompleted ? "Completed" : isChapInProgress ? "In Progress" : "Not Started"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="shrink-0 pl-2">
                                    <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                      Practice <Play className="h-2.5 w-2.5 fill-current" />
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ingestion Studio Dropzone & Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xs border-border/60 sticky top-6">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <UploadCloud className="h-4.5 w-4.5 text-primary" />
                  Ingestion Studio
                </CardTitle>
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md border border-border/40">
                  Auto Chunking
                </span>
              </div>
              <CardDescription className="text-xs">
                Extract text from books and split into balanced 50–100 word chunks.
              </CardDescription>

              {/* Tab Selector */}
              <div className="flex bg-secondary/50 p-1 rounded-xl mt-3">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Book Upload
                </button>
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "paste"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 text-[11px] font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "ai"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Studio
                </button>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              {uploadFeedback && (
                <div className="mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-primary font-medium">
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              {activeTab === "upload" && (
                /* FILE UPLOAD DRAG/DROP */
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]
                      ${
                        dragActive
                          ? "border-primary bg-primary/5 scale-[1.01]"
                          : "border-border/80 hover:border-primary/50 hover:bg-secondary/15"
                      }
                      ${uploadLoading ? "opacity-60 pointer-events-none" : ""}
                    `}
                    onClick={() => document.getElementById("file-select-library")?.click()}
                  >
                    <input
                      id="file-select-library"
                      type="file"
                      multiple={false}
                      accept=".txt,.md,.pdf,.docx"
                      className="hidden"
                      onChange={handleFileInput}
                      disabled={uploadLoading}
                    />
                    
                    {uploadLoading ? (
                      <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                    ) : (
                      <div className="p-3.5 bg-primary/10 text-primary rounded-2xl mb-3">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                    )}
                    
                    <h4 className="text-sm font-black mb-1">
                      {uploadLoading ? "Extracting & Chunking..." : "Drag & Drop Book Here"}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-[220px] mb-3 leading-relaxed">
                      Or click to browse your files from your computer
                    </p>

                    {/* Format Pill Indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">.PDF</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">.DOCX</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">.TXT</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">.MD</span>
                    </div>

                    <Button type="button" size="sm" variant="secondary" className="text-xs font-bold rounded-xl cursor-pointer">
                      Browse Files
                    </Button>
                  </div>

                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Balanced Chunk Engine:</strong> Automatically generates 50–100 word chunks without cutting sentences awkwardly mid-paragraph.
                  </div>
                </div>
              )}

              {activeTab === "paste" && (
                /* PASTE RAW TEXT FORM */
                <form onSubmit={handlePasteSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Book Title (Optional)
                    </label>
                    <Input
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      placeholder="e.g. Chapter 1: The Boy Who Lived"
                      className="rounded-xl border-border/60"
                      disabled={uploadLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Raw Text Content</span>
                      <span className={`${pasteContent.length > 100000 ? "text-destructive" : ""}`}>
                        {countWords(pasteContent)} words • {pasteContent.length}/100k
                      </span>
                    </div>
                    <textarea
                      required
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="Paste paragraphs or book excerpt here..."
                      className="w-full min-h-[160px] p-3 text-xs bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      disabled={uploadLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl font-bold gap-1.5 flex items-center justify-center cursor-pointer"
                    disabled={uploadLoading || !pasteContent.trim()}
                  >
                    {uploadLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Chunk & Process Book
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {activeTab === "ai" && (
                /* AI GENERATOR FORM */
                <div className="space-y-4 animate-fade-in">
                  {!apiKey.trim() && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-400 rounded-xl flex items-start gap-2">
                      <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                      <div className="leading-snug">
                        <strong>Demo Mode:</strong> Configure a Gemini API Key in Settings for live AI generation. Local templates will be used for testing.
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleAiGenerate} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Brain className="h-3 w-3 text-primary" />
                        AI Lesson Prompt
                      </label>
                      <textarea
                        required
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Create a 3-chapter typing drill on JavaScript promises and async/await syntax..."
                        className="w-full min-h-[90px] p-3 text-xs bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        disabled={uploadLoading}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-xl font-bold gap-1.5 flex items-center justify-center cursor-pointer"
                      disabled={uploadLoading || !aiPrompt.trim()}
                    >
                      {uploadLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Generate Custom Book
                          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="border-t border-border/40 pt-3.5 space-y-2">
                    <h5 className="text-[10px] uppercase font-black text-muted-foreground tracking-widest flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-primary" />
                      Weak Key Targeted Drills
                    </h5>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Dynamically crafts tailored prose targeting characters where your typing accuracy or speed drops.
                    </p>
                    <Button
                      onClick={handleAiVocab}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold rounded-xl gap-1.5 border-border/60 hover:bg-secondary/40 cursor-pointer"
                      disabled={uploadLoading}
                    >
                      Generate Weak-Key Drills
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Explanation Modal / Sidebar Drawer */}
      {explainingDoc && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-card border-l border-border/60 w-full max-w-lg h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">AI Book Insight</h3>
                    <p className="text-xs text-muted-foreground">Deep reading and contextual analysis</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setExplainingDoc(null)}
                  className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer text-muted-foreground"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Active Book
                </span>
                <h4 className="text-base font-black text-foreground">{explainingDoc.title}</h4>
              </div>

              <div className="p-5 bg-secondary/15 border border-border/40 rounded-2xl space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/40 pl-3">
                  &ldquo;{explainingDoc.content.substring(0, 240)}...&rdquo;
                </p>
                <div className="h-px bg-border/40" />
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                    AI Summary & Breakdown
                  </span>
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Analyzing vocabulary and structure...
                    </div>
                  ) : (
                    <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-medium pt-1">
                      {explanationText}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setExplainingDoc(null)}
              className="w-full h-11 rounded-xl font-bold cursor-pointer mt-6"
            >
              Close Insight
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
