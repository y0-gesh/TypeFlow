"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useGamificationStore } from "@/store/useGamificationStore";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import {
  Trophy,
  Flame,
  Clock,
  Zap,
  UploadCloud,
  Layers,
  Folder,
  ArrowRight,
  Loader2,
  Play,
  Calendar,
  Sparkles,
  ChevronRight,
  Award,
  ListTodo,
  CheckCircle2,
  Users,
  BookOpen
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { libraries, loading: libLoading, fetchLibraries } = useLibraryStore();
  const { 
    stats: dbStats, 
    dailyGoal, 
    weeklyActivity, 
    continueLearning, 
    loading: dashLoading, 
    fetchDashboardData 
  } = useDashboardStore();
  const { resumeLibraryPractice } = useDocumentStore();
  
  const { 
    totalXp, 
    level, 
    xpIntoLevel, 
    xpRequiredForNext, 
    badges, 
    challenges, 
    leaderboard, 
    fetchGamificationData 
  } = useGamificationStore();

  useEffect(() => {
    fetchLibraries();
    fetchDashboardData();
    fetchGamificationData();
  }, [fetchLibraries, fetchDashboardData, fetchGamificationData]);

  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "Typist";

  // General Statistics Widgets List
  const statsList = [
    {
      name: "Average Speed",
      value: `${dbStats.averageWpm} WPM`,
      description: "Lifetime session average",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      name: "Peak Speed",
      value: `${dbStats.peakWpm} WPM`,
      description: "Personal best record",
      icon: Trophy,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    },
    {
      name: "Accuracy",
      value: `${dbStats.averageAccuracy}%`,
      description: "Key input precision",
      icon: Sparkles,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "Total Time",
      value: `${dbStats.totalTimeMins}m`,
      description: "Deliberate practice time",
      icon: Clock,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  const dailyGoalMins = Math.round(dailyGoal.timeSpentSeconds / 60);
  const dailyGoalPercent = Math.min(
    100,
    Math.round((dailyGoal.timeSpentSeconds / dailyGoal.targetSeconds) * 100)
  );

  const handleResumeLastLesson = async (libId: string) => {
    if (!libId) return;
    await resumeLibraryPractice(libId, router);
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "first_words": return Trophy;
      case "streak_master": return Flame;
      case "perfect_accuracy": return Sparkles;
      case "century_club": return Zap;
      default: return Award;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. HERO BANNER */}
      <div className="relative rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-cyan-600 p-6 sm:p-8 md:p-10 text-white shadow-xl overflow-hidden border border-white/10">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
          <svg
            className="w-full h-full text-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" />
          </svg>
        </div>

        <div className="relative space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            <span>Content-Driven Dynamic Typing</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Welcome to TypeFlow, {username}!
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
            Train muscle memory by practicing with actual books, articles, and documents you care about.
          </p>

          {/* Level Progress Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-t border-white/15 mt-4">
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs uppercase font-black bg-white/20 px-3 py-1 rounded-full border border-white/20 text-white shadow-xs">
                Level {level}
              </span>
              <span className="text-xs text-blue-100 font-bold">
                {totalXp} Total XP
              </span>
            </div>
            
            <div className="flex-1 max-w-sm space-y-1">
              <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden border border-white/10 shadow-inner">
                <div 
                  className="bg-cyan-300 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${Math.min(100, Math.round((xpIntoLevel / Math.max(1, xpRequiredForNext)) * 100))}%` }}
                />
              </div>
              <div className="text-[10px] text-blue-100/90 font-semibold flex justify-between">
                <span>Current Tier Progress</span>
                <span className="font-mono">{xpIntoLevel} / {xpRequiredForNext} XP</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 flex-wrap">
            <Link href="/dashboard/library">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-700 hover:bg-neutral-100 font-bold border-none cursor-pointer rounded-xl shadow-md px-4 py-2"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Open Library
              </Button>
            </Link>
            {continueLearning && (
              <Button
                size="sm"
                onClick={() => handleResumeLastLesson(continueLearning.libraryId)}
                className="bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 cursor-pointer rounded-xl backdrop-blur-xs px-4 py-2"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                Resume Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS (ZERO TRUNCATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="border-border/60 hover:shadow-md hover:border-primary/30 transition-all duration-200 rounded-2xl group overflow-hidden"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.name}
                  </span>
                  <div className={`p-2.5 rounded-xl shrink-0 border ${stat.color} group-hover:scale-105 transition-transform duration-200`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. PRIMARY BENTO GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 COLS): Primary Learning Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Widget 1: Continue Learning Hero Card */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Continue Learning</CardTitle>
                    <CardDescription className="text-xs">Pick up exactly where you left off</CardDescription>
                  </div>
                </div>
                {continueLearning && (
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                    Active Book
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-6">
              {dashLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground font-mono">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                  Loading session data...
                </div>
              ) : continueLearning ? (
                <div 
                  onClick={() => handleResumeLastLesson(continueLearning.libraryId)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-secondary/15 hover:bg-secondary/30 border border-border/50 rounded-2xl gap-5 cursor-pointer group transition-all duration-200"
                >
                  <div className="space-y-3 min-w-0 flex-1 w-full">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <Folder className="h-3.5 w-3.5 text-primary" />
                      <span>{continueLearning.libraryName}</span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-black text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                      {continueLearning.documentTitle}
                    </h4>
                    
                    {/* Progress details */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Book completion</span>
                        <span className="font-mono text-foreground font-bold">{continueLearning.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-secondary/80 rounded-full h-2 overflow-hidden border border-border/20">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300" 
                          style={{ width: `${continueLearning.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    size="default"
                    className="w-full sm:w-auto rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-102 transition-transform duration-200 shrink-0 cursor-pointer flex items-center justify-center gap-2 px-6 h-11"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                    <span>Resume Practice</span>
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl bg-secondary/5">
                  <BookOpen className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
                  <h5 className="text-sm font-bold">No active lessons yet</h5>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-4 leading-normal">
                    Upload your books, notes, or code files in the Library to begin interactive practice.
                  </p>
                  <Link href="/dashboard/library">
                    <Button size="sm" variant="secondary" className="text-xs font-bold rounded-xl cursor-pointer">
                      Open Practice Library
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 2: Folder Collections Grid */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row justify-between items-center pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Collections & Folders</CardTitle>
                  <CardDescription className="text-xs">Your custom learning libraries</CardDescription>
                </div>
              </div>
              {libraries.length > 0 && (
                <Link href="/dashboard/library" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  View All ({libraries.length})
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </CardHeader>

            <CardContent className="pt-5 pb-6">
              {libLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                  Loading library folders...
                </div>
              ) : libraries.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                  <Folder className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <h5 className="text-sm font-bold">No collections created yet</h5>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    Create your first folder to organize books, chapters, and articles.
                  </p>
                  <Link href="/dashboard/library">
                    <Button variant="outline" size="sm" className="text-xs font-bold cursor-pointer rounded-xl">
                      Create Folder
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {libraries.slice(0, 4).map((lib) => (
                    <div
                      key={lib.id}
                      onClick={() => handleResumeLastLesson(lib.id)}
                      className="flex items-center justify-between p-4 bg-secondary/10 hover:bg-secondary/25 border border-border/40 hover:border-primary/30 rounded-2xl cursor-pointer transition-all duration-200 group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <Folder className="h-4.5 w-4.5 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {lib.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground font-semibold">
                              {lib.document_count || 0} docs
                            </span>
                            <span className="text-[11px] text-muted-foreground">•</span>
                            <span className="text-[11px] text-emerald-500 font-semibold font-mono">
                              {lib.progress_percent || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-secondary/60 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 3: Achievements & Milestones */}
          <Card className="shadow-xs border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Achievements & Milestones</CardTitle>
                  <CardDescription className="text-xs">
                    Hit consistency benchmarks and typing speed goals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const Icon = getBadgeIcon(badge.iconName);
                  return (
                    <div 
                      key={badge.id}
                      className={`
                        flex items-start gap-3.5 p-4 border rounded-2xl transition-all duration-200
                        ${
                          badge.unlocked 
                            ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400" 
                            : "bg-secondary/5 border-border/30 opacity-50"
                        }
                      `}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${badge.unlocked ? "bg-amber-500/15 border border-amber-500/30" : "bg-secondary border border-border"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs sm:text-sm font-bold flex items-center gap-1.5 leading-snug">
                          <span>{badge.name}</span>
                          {badge.unlocked && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                          )}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (1 COL): Goals, Quests, Streaks & Leaderboard */}
        <div className="space-y-6">
          
          {/* Widget 4: Daily Practice Goal Tracker */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Daily Practice Goal</CardTitle>
                  <CardDescription className="text-xs">Build myelin through regular drills</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5 pb-6">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>Session Time</span>
                <span className="font-mono text-foreground">{dailyGoalMins} / 15 mins</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden border border-border/10">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm" 
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>
              <div className="p-3 bg-secondary/20 rounded-xl border border-border/40 text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Training Tip:</strong> 15 minutes of focused typing per day builds finger muscle memory 3x faster than infrequent marathon sessions.
              </div>
            </CardContent>
          </Card>

          {/* Widget 5: Daily Quests (ZERO TRUNCATION) */}
          <Card className="shadow-xs border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <ListTodo className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Daily Quests</CardTitle>
                    <CardDescription className="text-xs">Complete drills to gain bonus XP</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-5 space-y-3">
              {challenges.map((chal) => (
                <div 
                  key={chal.id}
                  className={`
                    p-3.5 border rounded-xl flex items-start justify-between gap-3 transition-all duration-200
                    ${
                      chal.completed 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                        : "bg-secondary/10 border-border/30"
                    }
                  `}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h5 className="text-xs font-bold leading-snug text-foreground">
                      {chal.title}
                    </h5>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-semibold">
                      <span>Progress:</span>
                      <span className="font-mono">
                        {chal.type === "wpm" ? `${chal.currentValue}/${chal.targetValue} WPM` :
                         chal.type === "accuracy" ? `${chal.currentValue}% / ${chal.targetValue}%` :
                         `${chal.currentValue}/${chal.targetValue} chars`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-black uppercase bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded">
                      +{chal.xpReward} XP
                    </span>
                    {chal.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border/60 shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget 6: 7-Day Activity Streak */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                  <Flame className="h-4 w-4 fill-orange-500/20" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Activity Streak</CardTitle>
                  <CardDescription className="text-xs">Consecutive daily drill count</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5 pb-6">
              <div className="flex items-center gap-3 p-3.5 bg-orange-500/5 border border-orange-500/15 rounded-xl">
                <div className="p-2 bg-orange-500/15 text-orange-500 rounded-xl">
                  <Flame className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-base font-black tracking-tight text-orange-500">
                    {dbStats.streakDays} Day Practice Streak
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {dbStats.streakDays > 0 ? "You're building solid momentum!" : "Complete a session today to start your streak."}
                  </p>
                </div>
              </div>

              {/* Heatmap calendar grid */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Past 7 Days Activity
                </span>
                
                <div className="flex justify-between items-center gap-1.5 pt-1">
                  {weeklyActivity.map((day) => (
                    <div 
                      key={day.dateStr}
                      className="flex flex-col items-center gap-1.5 flex-1"
                      title={`${day.dateStr}: ${day.active ? "Active session completed" : "No sessions logged"}`}
                    >
                      <div 
                        className={`w-full aspect-square rounded-md border transition-colors ${
                          day.active 
                            ? "bg-emerald-500 border-emerald-500/20 shadow-xs shadow-emerald-500/20" 
                            : "bg-secondary/40 border-border/40"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                        {day.dayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 7: Top Typists Leaderboard */}
          <Card className="shadow-xs border-border/60 rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Top Typists</CardTitle>
                  <CardDescription className="text-xs">Community weekly speed rankings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-5">
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.username}
                    className={`
                      flex items-center justify-between p-3 border rounded-xl gap-2.5 transition-all
                      ${
                        entry.isCurrentUser 
                          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20 font-bold" 
                          : "bg-secondary/15 border-border/20"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <span className={`w-5 font-mono text-xs font-bold text-center shrink-0 ${
                        entry.rank === 1 ? "text-amber-500 font-black" : 
                        entry.rank === 2 ? "text-slate-400 font-bold" : 
                        entry.rank === 3 ? "text-amber-700 font-bold" : 
                        "text-muted-foreground/60"
                      }`}>
                        #{entry.rank}
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">{entry.username}</span>
                      <span className="text-[9px] font-black uppercase bg-secondary/80 px-1.5 py-0.5 rounded border border-border/40 text-muted-foreground shrink-0">
                        Lvl {entry.level}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-foreground">
                        {entry.wpm} WPM
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
