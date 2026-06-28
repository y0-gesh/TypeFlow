"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useLibraryStore } from "@/store/useLibraryStore";
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
  ChevronRight,
  Loader2,
  Star
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { libraries, loading, fetchLibraries } = useLibraryStore();

  useEffect(() => {
    fetchLibraries();
  }, [fetchLibraries]);

  // Hardcoded initial metrics for the dashboard shell
  const stats = [
    {
      name: "Average Speed",
      value: "0 WPM",
      icon: Zap,
      color: "text-yellow-500 bg-yellow-500/10",
    },
    {
      name: "Accuracy",
      value: "0%",
      icon: Trophy,
      color: "text-green-500 bg-green-500/10",
    },
    {
      name: "Practice Time",
      value: "0 mins",
      icon: Clock,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      name: "Day Streak",
      value: "0 days",
      icon: Flame,
      color: "text-orange-500 bg-orange-500/10",
    },
  ];

  const username =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 md:p-10 text-white shadow-lg overflow-hidden">
        {/* Visual elements */}
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
          <p
            className="text-blue-100 text-base leading-relaxed animate-fade-in"
            style={{ animationDelay: "0.05s" }}
          >
            Ready to train your typing muscle memory today? Upload an article,
            book chapter, or programming script, and turn passive reading into
            active skill building.
          </p>
          <div
            className="pt-2 flex gap-3 flex-wrap animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
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

      {/* Grid: Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="hover:shadow-md hover:translate-y-[-2px] hover:border-border/80 transition-all duration-200"
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`p-3.5 rounded-xl shrink-0 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground truncate">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-black tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid: Actions & Empty State */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main callout to start practice */}
        <Card className="md:col-span-2 shadow-sm border-border/60 hover:shadow-md transition-all duration-200 flex flex-col">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Practice Library
              </CardTitle>
              <CardDescription>
                Select a book chapter or script to start practicing typing.
              </CardDescription>
            </div>
            {libraries.length > 0 && (
              <Link href="/dashboard/library" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                View All ({libraries.length})
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-center px-6 pb-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                Updating library cache...
              </div>
            ) : libraries.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/10">
                <div className="h-14 w-14 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground mb-4">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold mb-1">Your Library is empty</h4>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  You haven&apos;t created any folders or libraries yet.
                  Get started by creating your first folder collection.
                </p>
                <Link href="/dashboard/library">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs uppercase tracking-wider font-bold border-dashed cursor-pointer"
                  >
                    Configure Library
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {libraries.slice(0, 3).map((lib) => (
                  <div
                    key={lib.id}
                    className="flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 border border-border/40 hover:border-primary/20 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                        <Folder className="h-5 w-5 fill-current" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold truncate flex items-center gap-2">
                          {lib.name}
                          {lib.is_favorite && (
                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate max-w-xs md:max-w-md">
                          {lib.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                        {lib.document_count || 0} docs
                      </span>
                      <Link href="/dashboard/library">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-secondary group-hover:text-primary transition-colors cursor-pointer"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Goal tracker */}
        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              Daily Training Goal
            </CardTitle>
            <CardDescription>
              Maintain consistency to build speed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-6">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Practice Time</span>
              <span>0 / 15 mins</span>
            </div>
            {/* Progress bar visualizer */}
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden border border-border/10">
              <div className="bg-primary h-full rounded-full transition-all duration-300 w-0" />
            </div>
            <div className="p-3 bg-secondary/50 rounded-xl border border-border/20 text-xs text-muted-foreground leading-relaxed">
              <strong>Tip:</strong> Research shows practicing in short 15-minute
              bursts every day is 3x more effective for muscle memory than
              typing for hours once a week.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
