"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useDocumentStore, Document, Chapter, Lesson } from "@/store/useDocumentStore";
import { useTypingStore } from "@/store/useTypingStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import { Input } from "@/vendors/ui/input";
import {
  FileText,
  UploadCloud,
  ChevronLeft,
  Loader2,
  Trash2,
  Play,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  Layers
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
    error, 
    fetchChaptersAndLessons, 
    uploadDocument, 
    deleteDocument 
  } = useDocumentStore();
  const { loadChapterLessons } = useTypingStore();

  const [completedSet, setCompletedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const progress = JSON.parse(localStorage.getItem("typeflow_progress") || '{"completedChunks":[]}');
      setCompletedSet(new Set(progress.completedChunks || []));
    }
  }, []);

  // Uploader tabs & form state
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Paste form state
  const [pasteTitle, setPasteTitle] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  useEffect(() => {
    fetchLibraries();
    fetchChaptersAndLessons(libraryId);
  }, [libraryId, fetchLibraries, fetchChaptersAndLessons]);

  const library = libraries.find((l) => l.id === libraryId);

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
      alert("Invalid file format. Please upload .txt, .md, .pdf, or .docx files.");
      return;
    }

    setUploadLoading(true);
    try {
      let content = "";
      if (fileExt === ".txt" || fileExt === ".md") {
        content = await file.text();
      } else {
        // PDF/Docx Mock Content generation for client-side practice
        content = `Document: ${file.name.replace(fileExt, "")}\n\nThis is a processed lesson text block representing the contents of your uploaded ${fileExt.toUpperCase()} file.\n\nLearning to type on meaningful content builds muscle memory faster. Standard QWERTY keyboards require brackets, semicolons, and operators for code layouts, while prose text trains rhythm, vocabulary, and punctuation layouts. Try practicing this document to test accuracy and speed metrics in real-time.`;
      }

      if (!content.trim()) {
        alert("The uploaded file is empty.");
        return;
      }

      const title = file.name.replace(fileExt, "");
      await uploadDocument(libraryId, title, content, file);
    } catch (err) {
      console.error(err);
      alert("Failed to read file.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteContent.trim()) return;

    if (pasteContent.length > 100000) {
      alert("Text exceeds the 100,000 character limit.");
      return;
    }

    setUploadLoading(true);
    try {
      const success = await uploadDocument(libraryId, pasteTitle.trim(), pasteContent.trim());
      if (success) {
        setPasteTitle("");
        setPasteContent("");
      }
    } finally {
      setUploadLoading(false);
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

    loadChapterLessons(chapLessons, startIndex);
    router.push("/");
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/library">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-secondary cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Libraries
          </span>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-primary shrink-0" />
            {library ? library.name : "Loading Library..."}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Documents List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xs border-border/60">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Documents</CardTitle>
              <CardDescription>
                Files uploaded to this folder, with their processor status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground font-mono">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                  Fetching documents...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-border/50 rounded-2xl bg-secondary/5">
                  <FileText className="h-10 w-10 text-muted-foreground/60 mb-3" />
                  <p className="text-sm font-bold">No documents inside this library</p>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1">
                    Upload a file or paste text using the ingestion panel to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col p-4 bg-secondary/10 border border-border/40 rounded-2xl gap-4 group"
                    >
                      {/* Document Info Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2.5 bg-primary/5 text-primary rounded-xl shrink-0 mt-0.5">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold truncate max-w-xs sm:max-w-md">
                              {doc.title}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground font-semibold">
                              <span>
                                Uploaded {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{doc.content.length} characters</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Action Buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          {/* Status Pills */}
                          {doc.status === "Uploaded" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-secondary text-muted-foreground border border-border">
                              Uploaded
                            </span>
                          )}
                          {doc.status === "Queued" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1.5 animate-pulse">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Queued
                            </span>
                          )}
                          {doc.status === "Processing" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1.5 animate-pulse">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Processing
                            </span>
                          )}
                          {doc.status === "Completed" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1.5">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </span>
                          )}
                          {doc.status === "Failed" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1.5">
                              <AlertTriangle className="h-3 w-3" />
                              Failed
                            </span>
                          )}

                          <div className="flex items-center gap-2">
                            {doc.status === "Completed" && (
                              <Button
                                onClick={() => handlePracticeDocument(doc.id)}
                                size="sm"
                                className="h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5 flex items-center cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Resume
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteDocument(doc.id)}
                              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Chapters Sub-listing */}
                      {doc.status === "Completed" && (
                        <div className="mt-2 border-t border-border/30 pt-4 pl-0 sm:pl-4 space-y-3">
                          <div className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest mb-1 flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            Document Chapters
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {chapters
                              .filter((c) => c.document_id === doc.id)
                              .sort((a, b) => a.sequence_number - b.sequence_number)
                              .map((chap) => {
                                const chapLessons = lessons
                                  .filter((l) => l.chapter_id === chap.id)
                                  .sort((a, b) => a.sequence_number - b.sequence_number);
                                
                                const completedCount = chapLessons.filter((l) => completedSet.has(l.id)).length;
                                const totalCount = chapLessons.length;
                                const isChapCompleted = completedCount === totalCount && totalCount > 0;
                                const isChapInProgress = completedCount > 0 && completedCount < totalCount;
                                
                                // Color representations: Completed (emerald), In Progress (blue), Not Started (secondary)
                                let statusColorClass = "bg-secondary/40 border-border/50 text-muted-foreground";
                                if (isChapCompleted) {
                                  statusColorClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15";
                                } else if (isChapInProgress) {
                                  statusColorClass = "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15";
                                } else {
                                  statusColorClass = "bg-secondary/10 border-border/30 text-muted-foreground/80 hover:bg-secondary/25";
                                }
                                
                                return (
                                  <div
                                    key={chap.id}
                                    onClick={() => handlePracticeChapter(chap.id)}
                                    className={`flex items-center justify-between p-3 border rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] group/chap ${statusColorClass}`}
                                  >
                                    <div className="min-w-0 pr-2">
                                      <div className="text-xs font-bold truncate group-hover/chap:underline">
                                        {chap.title}
                                      </div>
                                      <div className="text-[10px] opacity-75 font-semibold mt-0.5">
                                        {completedCount}/{totalCount} lessons completed
                                      </div>
                                    </div>
                                    <Play className="h-3 w-3 shrink-0 opacity-0 group-hover/chap:opacity-100 transition-opacity fill-current mr-1 text-primary" />
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ingestion Forms */}
        <div className="space-y-6">
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-base font-bold">Document Ingestion</CardTitle>
              <CardDescription>
                Convert external files or texts into custom lessons.
              </CardDescription>
              {/* Tab Selector */}
              <div className="flex bg-secondary/50 p-1 rounded-xl mt-4">
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  File Upload
                </button>
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer ${
                    activeTab === "paste"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeTab === "upload" ? (
                /* FILE UPLOAD DRAG/DROP */
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`
                      border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]
                      ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border/80 hover:border-border hover:bg-secondary/10"
                      }
                      ${uploadLoading ? "opacity-50 pointer-events-none" : ""}
                    `}
                    onClick={() => document.getElementById("file-select")?.click()}
                  >
                    <input
                      id="file-select"
                      type="file"
                      multiple={false}
                      accept=".txt,.md,.pdf,.docx"
                      className="hidden"
                      onChange={handleFileInput}
                      disabled={uploadLoading}
                    />
                    
                    {uploadLoading ? (
                      <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                    ) : (
                      <UploadCloud className="h-10 w-10 text-muted-foreground/60 mb-4" />
                    )}
                    
                    <h4 className="text-sm font-bold mb-1">
                      {uploadLoading ? "Uploading file..." : "Drag & Drop File Here"}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-[200px] mb-3 leading-relaxed">
                      Accepts .txt, .md, .pdf, or .docx up to 10MB
                    </p>
                    <Button type="button" size="sm" variant="secondary" className="text-xs font-bold rounded-lg cursor-pointer">
                      Browse Files
                    </Button>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-[10px] text-muted-foreground leading-relaxed">
                    <strong>Note:</strong> Prose layout files will automatically split into ~150 character chunks for optimal typing practice.
                  </div>
                </div>
              ) : (
                /* PASTE RAW TEXT FORM */
                <form onSubmit={handlePasteSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Document Title
                    </label>
                    <Input
                      required
                      value={pasteTitle}
                      onChange={(e) => setPasteTitle(e.target.value)}
                      placeholder="e.g. JavaScript Closures"
                      className="rounded-xl border-border/60"
                      disabled={uploadLoading}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                      <span>Raw Text Content</span>
                      <span className={`${pasteContent.length > 100000 ? "text-destructive" : ""}`}>
                        {pasteContent.length}/100k
                      </span>
                    </label>
                    <textarea
                      required
                      value={pasteContent}
                      onChange={(e) => setPasteContent(e.target.value)}
                      placeholder="Paste text contents here to practice..."
                      className="w-full min-h-[160px] p-3 text-sm bg-background border border-border/60 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      disabled={uploadLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl font-bold gap-1.5 flex items-center justify-center cursor-pointer"
                    disabled={uploadLoading || !pasteTitle.trim() || !pasteContent.trim()}
                  >
                    {uploadLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Upload & Process
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
