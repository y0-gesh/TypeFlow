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
  Users
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
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  // General Statistics Widgets List
  const statsList = [
    {
      name: "Average Speed",
      value: `${dbStats.averageWpm} WPM`,
      description: "Lifetime average",
      icon: Zap,
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/10",
    },
    {
      name: "Peak Speed",
      value: `${dbStats.peakWpm} WPM`,
      description: "Highest WPM recorded",
      icon: Trophy,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/10",
    },
    {
      name: "Average Accuracy",
      value: `${dbStats.averageAccuracy}%`,
      description: "Key input accuracy",
      icon: Sparkles,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/10",
    },
    {
      name: "Total Time",
      value: `${dbStats.totalTimeMins} mins`,
      description: "Total spent typing",
      icon: Clock,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/10",
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
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Welcome Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-600 p-8 md:p-10 text-white shadow-lg overflow-hidden">
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
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight animate-fade-in">
            Welcome to TypeFlow, {username}!
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xl animate-fade-in">
            Ready to train your typing muscle memory today? Upload an article,
            book chapter, or programming script, and turn passive reading into
            active skill building.
          </p>

          {/* Level Progress Indicator inside Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-2 border-t border-white/10 mt-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-black bg-white/20 px-3 py-1 rounded-full border border-white/10 text-white shadow-xs">
                Level {level}
              </span>
              <span className="text-xs text-blue-100 font-bold">
                {totalXp} Total XP
              </span>
            </div>
            
            <div className="flex-1 max-w-sm space-y-1.5">
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-300 shadow-md"
                  style={{ width: `${Math.round((xpIntoLevel / xpRequiredForNext) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-blue-100 font-semibold text-right">
                {xpIntoLevel} / {xpRequiredForNext} XP to Level {level + 1}
              </div>
            </div>
          </div>

          <div className="pt-2 flex gap-3 flex-wrap animate-fade-in">
            <Link href="/dashboard/library">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-indigo-700 hover:bg-neutral-100 font-bold border-none cursor-pointer"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Go to Library
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. General Statistics Widget Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`p-3.5 rounded-xl shrink-0 border ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-muted-foreground truncate uppercase tracking-wider">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-black tracking-tight mt-0.5">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. Primary widgets columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left widgets (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Widget 1: Continue Learning Card */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Play className="h-5 w-5 text-primary fill-current" />
                Continue Learning
              </CardTitle>
              <CardDescription>
                Pick up exactly where you left off.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              {dashLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground font-mono">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                  Loading session data...
                </div>
              ) : continueLearning ? (
                <div 
                  onClick={() => handleResumeLastLesson(continueLearning.libraryId)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-secondary/10 hover:bg-secondary/25 border border-border/30 rounded-2xl gap-4 cursor-pointer group transition-all duration-300"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      Last Practiced Folder: {continueLearning.libraryName}
                    </span>
                    <h4 className="text-lg font-black truncate group-hover:underline text-foreground/90 mt-1">
                      {continueLearning.documentTitle}
                    </h4>
                    
                    {/* Progress details */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                      <span>Document progress</span>
                      <span>•</span>
                      <span>{continueLearning.progressPercent}% completed</span>
                    </div>
                    <div className="w-full max-w-sm bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-300" 
                        style={{ width: `${continueLearning.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200 shrink-0 cursor-pointer flex items-center justify-center"
                  >
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl bg-secondary/5">
                  <UploadCloud className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
                  <h5 className="text-sm font-bold">No recent lessons found</h5>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1 mb-4 leading-normal">
                    Head to the library tab to upload your custom text scripts or chapters and start learning.
                  </p>
                  <Link href="/dashboard/library">
                    <Button size="sm" variant="secondary" className="text-xs font-bold rounded-lg cursor-pointer">
                      Open Library
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Widget 2: Achievements & Badges Grid */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievements & Badges
              </CardTitle>
              <CardDescription>
                Earn badges and medals by hitting consistency milestones and speed records.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {badges.map((badge) => {
                  const Icon = getBadgeIcon(badge.iconName);
                  return (
                    <div 
                      key={badge.id}
                      className={`
                        flex items-start gap-4 p-4 border rounded-2xl transition-all duration-300
                        ${
                          badge.unlocked 
                            ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400" 
                            : "bg-secondary/5 border-border/20 opacity-45 grayscale"
                        }
                      `}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${badge.unlocked ? "bg-amber-500/15 border border-amber-500/25" : "bg-secondary border border-border"}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold truncate flex items-center gap-1.5">
                          {badge.name}
                          {badge.unlocked && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                          )}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Widget 3: Practice Library Folders List */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200">
            <CardHeader className="flex flex-row justify-between items-start pb-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Folder Collections
                </CardTitle>
                <CardDescription>
                  Select a collection folder to view documents.
                </CardDescription>
              </div>
              {libraries.length > 0 && (
                <Link href="/dashboard/library" className="text-xs font-bold text-primary flex items-center gap-0.5 hover:underline">
                  View All ({libraries.length})
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </CardHeader>

            <CardContent className="pb-6">
              {libLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
                  Loading library folders...
                </div>
              ) : libraries.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-2xl bg-secondary/10">
                  <Folder className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <h5 className="text-sm font-bold">No collections created yet</h5>
                  <p className="text-xs text-muted-foreground max-w-sm mb-4">
                    Folders help organize your code files or book files.
                  </p>
                  <Link href="/dashboard/library">
                    <Button variant="outline" size="sm" className="text-xs font-bold cursor-pointer">
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
                      className="flex items-center justify-between p-4 bg-secondary/10 hover:bg-secondary/30 border border-border/40 hover:border-primary/20 rounded-2xl cursor-pointer transition-all duration-200 group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-200">
                          <Folder className="h-4.5 w-4.5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold truncate">{lib.name}</h5>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            {lib.document_count || 0} documents
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right columns (Col span 1) */}
        <div className="space-y-6">
          
          {/* Widget 4: Daily training goal tracker */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Daily Practice Goal
              </CardTitle>
              <CardDescription>
                Build muscle memory through consistency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pb-6">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>Practice Session Time</span>
                <span>{dailyGoalMins} / 15 mins</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border/10">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-300" 
                  style={{ width: `${dailyGoalPercent}%` }}
                />
              </div>
              <div className="p-3 bg-secondary/30 rounded-xl border border-border/40 text-xs text-muted-foreground leading-normal">
                <strong>Consistency Tip:</strong> Short 15-minute drills completed daily build myelin pathways 3x faster than single marathon practice sessions.
              </div>
            </CardContent>
          </Card>

          {/* Widget 5: Daily Challenges checklist */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                Daily Quests
              </CardTitle>
              <CardDescription>
                Complete quests to unlock quick experience point boosts.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 space-y-4">
              {challenges.map((chal) => (
                <div 
                  key={chal.id}
                  className={`
                    p-3.5 border rounded-2xl flex items-start justify-between gap-3 transition-all duration-200
                    ${
                      chal.completed 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                        : "bg-secondary/10 border-border/30"
                    }
                  `}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <h5 className="text-xs font-bold leading-normal truncate">{chal.title}</h5>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                      <span>Progress:</span>
                      <span>
                        {chal.type === "wpm" ? `${chal.currentValue}/${chal.targetValue} WPM` :
                         chal.type === "accuracy" ? `${chal.currentValue}% / ${chal.targetValue}%` :
                         `${chal.currentValue}/${chal.targetValue} chars`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-black uppercase bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded">
                      +{chal.xpReward} XP
                    </span>
                    {chal.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget 6: Weekly calendar activity streak */}
          <Card className="shadow-xs border-border/60 hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500/20" />
                Activity Streak
              </CardTitle>
              <CardDescription>
                Track your consecutive day drill counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              <div className="flex items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                <div className="p-2 bg-orange-500/15 text-orange-500 rounded-xl">
                  <Flame className="h-6 w-6 fill-current" />
                </div>
                <div>
                  <h4 className="text-lg font-black tracking-tight text-orange-500">
                    {dbStats.streakDays} Day Streak
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {dbStats.streakDays > 0 ? "You're doing great! Keep it up." : "Start a session to begin your streak!"}
                  </p>
                </div>
              </div>

              {/* Github style calendar grid */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-muted-foreground/70 tracking-widest flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Past 7 Days Activity
                </span>
                
                <div className="flex justify-between items-center gap-1.5 pt-1.5">
                  {weeklyActivity.map((day) => (
                    <div 
                      key={day.dateStr}
                      className="flex flex-col items-center gap-1.5 flex-1"
                      title={`${day.dateStr}: ${day.active ? "Active typing session" : "No sessions"}`}
                    >
                      <div 
                        className={`w-full aspect-square rounded-md border transition-colors ${
                          day.active 
                            ? "bg-emerald-500 border-emerald-500/20 shadow-xs shadow-emerald-500/10" 
                            : "bg-secondary/40 border-border/40"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                        {day.dayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Widget 7: Leaderboard competitive rankings */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top Typists Leaderboard
              </CardTitle>
              <CardDescription>
                Opt-in global competitive ranks this week.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-2.5">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.username}
                    className={`
                      flex items-center justify-between p-3 border rounded-xl gap-3
                      ${
                        entry.isCurrentUser 
                          ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20 font-bold" 
                          : "bg-secondary/15 border-border/20"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 font-mono text-xs font-bold text-center shrink-0 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-zinc-400" : entry.rank === 3 ? "text-amber-600" : "text-muted-foreground/60"}`}>
                        #{entry.rank}
                      </span>
                      <span className="text-xs truncate">{entry.username}</span>
                      <span className="text-[9px] font-black uppercase bg-secondary/80 px-2 py-0.5 rounded border border-border/40 text-muted-foreground shrink-0">
                        Lvl {entry.level}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-foreground/95">
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
