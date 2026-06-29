"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTypingStore } from "@/store/useTypingStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import TypingBox from "@/components/TypingBox";
import ProgressBar from "@/components/ProgressBar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import { 
  ChevronLeft, 
  FolderOpen, 
  FileText, 
  Layers, 
  BookOpen, 
  Sparkles,
  Trophy,
  ArrowRight,
  RefreshCcw
} from "lucide-react";

export default function PracticePage() {
  const router = useRouter();
  const { 
    chunks, 
    currentIndex, 
    activeChapterId, 
    activeDocumentId, 
    activeLibraryId,
    stats,
    retryChunk 
  } = useTypingStore();

  const { fetchChaptersAndLessons, chapters, documents } = useDocumentStore();
  const { fetchLibraries, libraries } = useLibraryStore();
  const { zenMode } = useSettingsStore();

  useEffect(() => {
    fetchLibraries();
    if (activeLibraryId) {
      fetchChaptersAndLessons(activeLibraryId);
    }
  }, [activeLibraryId, fetchLibraries, fetchChaptersAndLessons]);

  const library = libraries.find((l) => l.id === activeLibraryId);
  const document = documents.find((d) => d.id === activeDocumentId);
  const chapter = chapters.find((c) => c.id === activeChapterId);

  // If chapter is fully completed (currentIndex reaches chunks length)
  const isChapterComplete = chunks.length > 0 && currentIndex >= chunks.length;

  if (chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="p-4 bg-primary/10 text-primary rounded-full mb-4 animate-pulse">
          <BookOpen className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black tracking-tight">No Active Practice Session</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1.5 mb-6 leading-normal">
          Select a folder or document chapter in your Library to start practicing typing exercises.
        </p>
        <Link href="/dashboard/library">
          <Button className="rounded-xl font-bold cursor-pointer">
            Go to Library
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      
      {/* 1. Breadcrumbs Navigation (Hidden in Zen Mode) */}
      {!zenMode && !isChapterComplete && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <Link href={activeLibraryId ? `/dashboard/library/${activeLibraryId}` : "/dashboard/library"}>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-secondary cursor-pointer">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            
            <div className="min-w-0">
              {/* Folder Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">
                <span className="flex items-center gap-1">
                  <FolderOpen className="h-3 w-3 text-primary shrink-0" />
                  {library ? library.name : "Loading..."}
                </span>
                <span>/</span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3 text-blue-500 shrink-0" />
                  {document ? document.title : "Loading..."}
                </span>
              </div>
              
              {/* Chapter Header */}
              <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5 mt-0.5 truncate">
                <Layers className="h-4.5 w-4.5 text-primary shrink-0" />
                {chapter ? chapter.title : "Practice Lesson"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={activeLibraryId ? `/dashboard/library/${activeLibraryId}` : "/dashboard/library"}>
              <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl border-border hover:bg-secondary cursor-pointer">
                Change Chapter
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 2. Chapter Complete Card */}
      {isChapterComplete ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-xl mx-auto space-y-6 animate-fade-in">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/25">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight text-emerald-500">Chapter Completed!</h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Fantastic typing! You have completed all lesson exercises inside <strong className="text-foreground">{chapter ? chapter.title : "this chapter"}</strong>.
            </p>
          </div>

          {/* Stats Summary Widget */}
          <div className="grid grid-cols-2 gap-4 w-full bg-secondary/15 p-5 rounded-2xl border border-border/40">
            <div>
              <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Average Speed</h5>
              <p className="text-2xl font-mono font-black text-primary mt-1">{stats.wpm} WPM</p>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Accuracy</h5>
              <p className="text-2xl font-mono font-black text-emerald-500 mt-1">{stats.accuracy}%</p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={() => {
                retryChunk(); // Reset typing state index back to 0
              }}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold border-border hover:bg-secondary cursor-pointer gap-1.5"
            >
              <RefreshCcw className="h-4 w-4" />
              Practice Again
            </Button>
            
            <Link href={activeLibraryId ? `/dashboard/library/${activeLibraryId}` : "/dashboard/library"} className="flex-1">
              <Button
                className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/95 cursor-pointer gap-1.5"
              >
                Back to Library
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* 3. Normal practice view: Progress Bar & Typing Box */
        <div className="space-y-4">
          <ProgressBar />
          <TypingBox />
        </div>
      )}
    </div>
  );
}
