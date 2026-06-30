"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useTypingStore } from "@/store/useTypingStore";
import TypingBox from "@/components/TypingBox";
import ProgressBar from "@/components/ProgressBar";
import ThemeToggle from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { Button } from "@/vendors/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/vendors/ui/card";
import {
  Keyboard,
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowRight,
  Play,
  X,
} from "lucide-react";

const SAMPLE_TEXTS = {
  literature:
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
  programming:
    "const calculateWpm = (chars, seconds) => {\n  if (seconds === 0) return 0;\n  const words = chars / 5;\n  const minutes = seconds / 60;\n  return Math.round(words / minutes);\n};",
  general:
    "The quick brown fox jumps over the lazy dog. TypeFlow transforms typing practice from a repetitive chore into a meaningful cognitive exercise.",
};

type CategoryKey = "literature" | "programming" | "general";

export default function LandingPage() {
  const { chunks, setRawContent, lessonStatus, stats } = useTypingStore();
  const [demoActive, setDemoActive] = useState<boolean>(false);
  const [demoCategory, setDemoCategory] = useState<CategoryKey>("general");



  const startDemo = (category: CategoryKey = "general") => {
    setDemoCategory(category);
    setRawContent(SAMPLE_TEXTS[category]);
    setDemoActive(true);
  };

  const closeDemo = () => {
    setDemoActive(false);
    useTypingStore.setState({
      chunks: [],
      userInput: "",
      timeElapsed: 0,
      totalKeysPressed: 0,
      isPaused: false,
      lessonStatus: "idle",
      stats: { wpm: 0, accuracy: 100, correctChars: 0, totalCharsTyped: 0 }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 relative">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      {/* Navigation Header */}
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 tracking-tighter">
              TYPEFLOW
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="hover:text-foreground transition-colors"
            >
              How it Works
            </a>
            <button
              onClick={() => startDemo("general")}
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Live Demo
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/auth/login" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-5xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary border border-border/40 text-xs font-semibold text-muted-foreground mb-6 shadow-xs animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Content-Driven Typing Practice</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 animate-fade-in bg-clip-text text-transparent bg-linear-to-b from-foreground via-foreground to-foreground/75 dark:from-white dark:via-white dark:to-neutral-400">
          Practice typing on
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500">
            content you care about
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-medium animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          Stop typing random strings. Upload your own books, programming
          scripts, essays, or notes and build muscle memory while ingesting
          meaningful knowledge.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button
              variant="default"
              size="lg"
              className="w-full sm:w-auto font-bold gap-2"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            onClick={() => startDemo("general")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto font-bold border-indigo-500/20 hover:border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/5 dark:text-indigo-400 dark:hover:bg-indigo-500/5 gap-2"
          >
            <Play className="h-5 w-5 fill-current" />
            Try Live Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="py-20 bg-secondary/30 border-y border-border/20 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-4">
              Engineered for Learners and Professionals
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              TypeFlow blends advanced typing mechanics with smart document
              processing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Custom Content</CardTitle>
                <CardDescription>
                  Upload TXT, PDF, DOCX, or markdown. Build folders and custom
                  libraries to practice.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-2">
                  <Keyboard className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Monkeytype Engine</CardTitle>
                <CardDescription>
                  A premium, ultra-responsive typing container with clean
                  highlight modes and a smooth caret.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-2">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Key Heatmaps</CardTitle>
                <CardDescription>
                  Visualize typing stats and speed curves. Identify weak key
                  combinations with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200">
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
                  <Sparkles className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Adaptive Learning</CardTitle>
                <CardDescription>
                  AI analyzing your typing errors and generating specific
                  vocabulary drills for weak keys.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ / How it works */}
      <section id="about" className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-black text-center mb-16 tracking-tight">
          Simple Phased Learning
        </h2>
        <div className="space-y-8">
          <div className="flex gap-6">
            <span className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <h3 className="text-lg font-bold mb-2">
                Upload or Paste Your Material
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Drag in textbook guides, code scripts, novels, or articles.
                TypeFlow supports simple paste options.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <span className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <h3 className="text-lg font-bold mb-2">
                Intelligent Chunk Generation
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The platform cleans text formatting and chunks it down into
                80–200 character exercises that respect sentence boundaries.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <span className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <h3 className="text-lg font-bold mb-2">
                Practice & Track Progression
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Type each segment. If your accuracy is above 90%, you advance.
                If not, retry the chunk to master it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground font-mono">
            &copy; 2026 TYPEFLOW ENGINE • PHASE 1 LAUNCH
          </span>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Terms
            </a>
            <a href="#about" className="hover:text-foreground">
              Privacy
            </a>
          </div>
        </div>
      </footer>

      {/* Demo Modal Overlay */}
      {demoActive && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl relative p-8 md:p-12 animate-fade-in overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8 border-b border-border/40 pb-4">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Play className="h-5 w-5 text-indigo-500 fill-indigo-500/20" />
                  Interactive Sandbox Demo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try typing the text below to experience the responsive core
                  typing engine.
                </p>
              </div>
              <button
                onClick={closeDemo}
                className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Close demo"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <span className="text-sm text-muted-foreground font-semibold flex items-center mr-1">
                Demo content:
              </span>
              <button
                onClick={() => startDemo("general")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${demoCategory === "general" ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border/30 text-muted-foreground hover:text-foreground"}`}
              >
                General Text
              </button>
              <button
                onClick={() => startDemo("programming")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${demoCategory === "programming" ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border/30 text-muted-foreground hover:text-foreground"}`}
              >
                JavaScript Code
              </button>
              <button
                onClick={() => startDemo("literature")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${demoCategory === "literature" ? "bg-primary border-primary text-primary-foreground" : "bg-secondary border-border/30 text-muted-foreground hover:text-foreground"}`}
              >
                Literature (A Tale of Two Cities)
              </button>
            </div>

            {/* Practice space */}
            {chunks.length > 0 && (
              <div className="space-y-6">
                <ProgressBar />
                <TypingBox />
              </div>
            )}

            {/* In-Demo Metrics */}
            {lessonStatus === "typing" && (
              <div className="mt-6 flex justify-center gap-8 text-sm font-semibold border-t border-border/20 pt-4 text-muted-foreground animate-fade-in">
                <span>
                  Speed:{" "}
                  <strong className="text-indigo-500 font-mono">
                    {stats.wpm} WPM
                  </strong>
                </span>
                <span>
                  Accuracy:{" "}
                  <strong className="text-green-500 font-mono">
                    {stats.accuracy}%
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
