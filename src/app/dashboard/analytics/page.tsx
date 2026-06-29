"use client";
import React, { useEffect, useState } from "react";
import { supabase, isMockAuth } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import {
  BarChart3,
  TrendingUp,
  Target,
  Keyboard,
  Sparkles,
  Zap,
  Loader2,
  Calendar,
  Eye,
  AlertTriangle
} from "lucide-react";

interface KeyStats {
  pressed: number;
  errors: number;
  timeMs: number;
}

interface AnalyticsData {
  keyStats: { [key: string]: KeyStats };
}

interface Session {
  id: string;
  wpm: number;
  accuracy: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({ keyStats: {} });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"last7" | "last30" | "all">("last7");
  const [heatmapMetric, setHeatmapMetric] = useState<"speed" | "errors">("speed");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let dbSessions: Session[] = [];
      if (isMockAuth) {
        dbSessions = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("typeflow_typing_sessions_mock") || "[]") : [];
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        if (user) {
          const { data, error } = await supabase
            .from("typing_sessions")
            .select("id, wpm, accuracy, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

          if (error) throw error;
          dbSessions = data || [];
        }
      }

      // Fallback Mock Sessions for beautiful visual charts if user hasn't typed yet
      if (dbSessions.length === 0) {
        const now = Date.now();
        dbSessions = [
          { id: "mock-s1", wpm: 35, accuracy: 88, created_at: new Date(now - 6 * 24 * 3600000).toISOString() },
          { id: "mock-s2", wpm: 42, accuracy: 91, created_at: new Date(now - 5 * 24 * 3600000).toISOString() },
          { id: "mock-s3", wpm: 40, accuracy: 89, created_at: new Date(now - 4 * 24 * 3600000).toISOString() },
          { id: "mock-s4", wpm: 48, accuracy: 94, created_at: new Date(now - 3 * 24 * 3600000).toISOString() },
          { id: "mock-s5", wpm: 55, accuracy: 95, created_at: new Date(now - 2 * 24 * 3600000).toISOString() },
          { id: "mock-s6", wpm: 52, accuracy: 93, created_at: new Date(now - 1 * 24 * 3600000).toISOString() },
          { id: "mock-s7", wpm: 63, accuracy: 98, created_at: new Date(now).toISOString() },
        ];
      }

      setSessions(dbSessions);

      // Load keyboard analytics from localStorage
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("typeflow_keyboard_analytics");
        if (raw) {
          setAnalytics(JSON.parse(raw));
        } else {
          // Fallback mock keyboard analytics for initial state representation
          const mockKeyboard = {
            keyStats: {
              a: { pressed: 210, errors: 4, timeMs: 42000 },
              e: { pressed: 340, errors: 12, timeMs: 51000 },
              t: { pressed: 290, errors: 18, timeMs: 58000 },
              o: { pressed: 250, errors: 15, timeMs: 62000 },
              i: { pressed: 220, errors: 22, timeMs: 66000 },
              s: { pressed: 190, errors: 8, timeMs: 47000 },
              r: { pressed: 180, errors: 24, timeMs: 63000 },
              n: { pressed: 170, errors: 6, timeMs: 51000 },
              c: { pressed: 90, errors: 14, timeMs: 36000 },
              y: { pressed: 60, errors: 15, timeMs: 27000 },
              p: { pressed: 80, errors: 18, timeMs: 32000 }
            }
          };
          setAnalytics(mockKeyboard);
          localStorage.setItem("typeflow_keyboard_analytics", JSON.stringify(mockKeyboard));
        }
      }
    } catch (e) {
      console.error("Failed to load analytics data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions based on period
  const getFilteredSessions = () => {
    const cutoffDate = new Date();
    if (period === "last7") cutoffDate.setDate(cutoffDate.getDate() - 7);
    else if (period === "last30") cutoffDate.setDate(cutoffDate.getDate() - 30);
    else return sessions;

    return sessions.filter((s) => new Date(s.created_at) >= cutoffDate);
  };

  const filteredSessions = getFilteredSessions();

  // Character Analytics: Sort keys by error rates
  const getCharacterErrorRates = () => {
    const list: { char: string; pressed: number; errors: number; rate: number }[] = [];
    Object.keys(analytics.keyStats).forEach((char) => {
      const stats = analytics.keyStats[char];
      if (stats.pressed > 20) { // filter out keys with very few presses for relevance
        const rate = Math.round((stats.errors / stats.pressed) * 100);
        list.push({ char, pressed: stats.pressed, errors: stats.errors, rate });
      }
    });
    return list.sort((a, b) => b.rate - a.rate).slice(0, 5);
  };

  const topErrorKeys = getCharacterErrorRates();

  // Custom SVG path drawing helper
  const getSvgPathData = (dataPoints: number[], width: number, height: number, minVal: number, maxVal: number) => {
    if (dataPoints.length < 2) return "";
    const range = maxVal - minVal || 1;
    const xStep = width / (dataPoints.length - 1);
    
    return dataPoints
      .map((val, idx) => {
        const x = idx * xStep;
        const y = height - ((val - minVal) / range) * (height - 30) - 15;
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // Keyboard Rows definition
  const keyboardRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
  ];

  const getKeyColor = (key: string) => {
    const stats = analytics.keyStats[key];
    if (!stats || stats.pressed === 0) {
      return "bg-secondary/20 dark:bg-secondary/10 border-border/30 text-muted-foreground/60";
    }

    if (heatmapMetric === "speed") {
      // Latency to WPM calculation
      const avgLatencySec = (stats.timeMs / stats.pressed) / 1000;
      const keyWpm = avgLatencySec > 0 ? Math.round(12 / avgLatencySec) : 0;
      
      if (keyWpm >= 55) {
        return "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30";
      } else if (keyWpm >= 35) {
        return "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30";
      } else {
        return "bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30";
      }
    } else {
      // Error Rate
      const errorRate = (stats.errors / stats.pressed) * 100;
      if (errorRate <= 6) {
        return "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30";
      } else if (errorRate <= 15) {
        return "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30";
      } else {
        return "bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30";
      }
    }
  };

  const handleKeyClick = (key: string) => {
    setSelectedKey(selectedKey === key ? null : key);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        Processing typing metrics...
      </div>
    );
  }

  // Calculate SVG Chart Parameters
  const chartWidth = 600;
  const chartHeight = 150;
  
  const wpmPoints = filteredSessions.map(s => s.wpm);
  const accuracyPoints = filteredSessions.map(s => s.accuracy);

  const minWpm = Math.max(0, Math.min(...wpmPoints) - 5);
  const maxWpm = Math.max(...wpmPoints) + 5;

  const minAcc = Math.max(70, Math.min(...accuracyPoints) - 2);
  const maxAcc = 100;

  const wpmPath = getSvgPathData(wpmPoints, chartWidth, chartHeight, minWpm, maxWpm);
  const accPath = getSvgPathData(accuracyPoints, chartWidth, chartHeight, minAcc, maxAcc);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header with period selections */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Performance Analytics
          </h2>
          <p className="text-sm text-muted-foreground">
            In-depth analysis of speed trends, error hotkeys, and finger mapping.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-secondary/30 border border-border/30 rounded-xl">
          <Button
            size="sm"
            variant={period === "last7" ? "secondary" : "ghost"}
            onClick={() => setPeriod("last7")}
            className="text-xs font-bold rounded-lg cursor-pointer h-8 px-3"
          >
            7 Days
          </Button>
          <Button
            size="sm"
            variant={period === "last30" ? "secondary" : "ghost"}
            onClick={() => setPeriod("last30")}
            className="text-xs font-bold rounded-lg cursor-pointer h-8 px-3"
          >
            30 Days
          </Button>
          <Button
            size="sm"
            variant={period === "all" ? "secondary" : "ghost"}
            onClick={() => setPeriod("all")}
            className="text-xs font-bold rounded-lg cursor-pointer h-8 px-3"
          >
            All Time
          </Button>
        </div>
      </div>

      {/* 1. Daily Performance Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WPM Trend Chart */}
        <Card className="shadow-xs border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Words Per Minute (WPM)
            </CardTitle>
            <CardDescription>
              Chronological speed progression over exercises.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="w-full overflow-hidden border border-border/30 rounded-2xl bg-secondary/5 p-4 flex flex-col justify-between">
              <div className="h-[150px] relative">
                {wpmPoints.length > 1 ? (
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" />
                    {/* Line Path */}
                    <path d={wpmPath} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Area under line */}
                    <path d={`${wpmPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#wpmGradient)" />
                    
                    {/* Node points */}
                    {wpmPoints.map((pt, idx) => {
                      const range = maxWpm - minWpm || 1;
                      const x = idx * (chartWidth / (wpmPoints.length - 1));
                      const y = chartHeight - ((pt - minWpm) / range) * (chartHeight - 30) - 15;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="rgb(59, 130, 246)"
                          className="hover:r-5 cursor-pointer transition-all"
                        >
                          <title>{`Session ${idx + 1}: ${pt} WPM`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Insufficient session records.
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mt-4">
                <span>Start</span>
                <span>Peak: {Math.max(...wpmPoints)} WPM</span>
                <span>Latest: {wpmPoints[wpmPoints.length - 1]} WPM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Trend Chart */}
        <Card className="shadow-xs border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              Accuracy (%)
            </CardTitle>
            <CardDescription>
              Consistency and keystroke error index.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="w-full overflow-hidden border border-border/30 rounded-2xl bg-secondary/5 p-4 flex flex-col justify-between">
              <div className="h-[150px] relative">
                {accuracyPoints.length > 1 ? (
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" />
                    {/* Line Path */}
                    <path d={accPath} fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Area under line */}
                    <path d={`${accPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`} fill="url(#accGradient)" />

                    {/* Node points */}
                    {accuracyPoints.map((pt, idx) => {
                      const range = maxAcc - minAcc || 1;
                      const x = idx * (chartWidth / (accuracyPoints.length - 1));
                      const y = chartHeight - ((pt - minAcc) / range) * (chartHeight - 30) - 15;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill="rgb(16, 185, 129)"
                          className="hover:r-5 cursor-pointer transition-all"
                        >
                          <title>{`Session ${idx + 1}: ${pt}%`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                    Insufficient session records.
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider mt-4">
                <span>Start</span>
                <span>Peak: {Math.max(...accuracyPoints)}%</span>
                <span>Latest: {accuracyPoints[accuracyPoints.length - 1]}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Character Analytics & Heatmap Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap (Col Span 2) */}
        <Card className="lg:col-span-2 shadow-xs border-border/60">
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                Keyboard Heatmap
              </CardTitle>
              <CardDescription>
                Visual key mapping colored by efficiency profiles.
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-1.5 p-1 bg-secondary/30 border border-border/30 rounded-xl">
              <Button
                size="sm"
                variant={heatmapMetric === "speed" ? "secondary" : "ghost"}
                onClick={() => setHeatmapMetric("speed")}
                className="text-xs font-bold rounded-lg cursor-pointer h-7 px-2.5"
              >
                Speed
              </Button>
              <Button
                size="sm"
                variant={heatmapMetric === "errors" ? "secondary" : "ghost"}
                onClick={() => setHeatmapMetric("errors")}
                className="text-xs font-bold rounded-lg cursor-pointer h-7 px-2.5"
              >
                Errors
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-6 space-y-6">
            
            {/* Keyboard Layout Board */}
            <div className="p-4 bg-secondary/10 dark:bg-secondary/5 border border-border/40 rounded-3xl space-y-2 max-w-2xl mx-auto">
              {keyboardRows.map((row, rowIdx) => (
                <div 
                  key={rowIdx} 
                  className="flex justify-center gap-1.5"
                  style={{ paddingLeft: rowIdx === 1 ? "1.5rem" : rowIdx === 2 ? "3rem" : "0" }}
                >
                  {row.map((key) => {
                    const stats = analytics.keyStats[key];
                    const activeColorClass = getKeyColor(key);
                    return (
                      <button
                        key={key}
                        onClick={() => handleKeyClick(key)}
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg border text-xs sm:text-sm font-bold uppercase transition-all duration-200 active:scale-95 cursor-pointer relative flex items-center justify-center shadow-xs select-none ${activeColorClass} ${selectedKey === key ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}`}
                      >
                        {key === ";" ? ";" : key === "," ? "," : key === "." ? "." : key === "/" ? "/" : key}
                        
                        {/* Tiny Indicator Dot if clicked */}
                        {stats && stats.pressed > 0 && (
                          <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-foreground/20" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
              
              {/* Spacebar row */}
              <div className="flex justify-center pt-1.5">
                <button
                  onClick={() => handleKeyClick(" ")}
                  className={`w-48 sm:w-64 h-9 sm:h-10 rounded-lg border transition-all duration-200 active:scale-95 cursor-pointer relative shadow-xs ${getKeyColor(" ")} ${selectedKey === " " ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : ""}`}
                >
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Space</span>
                </button>
              </div>
            </div>

            {/* Selected Key Details Card */}
            {selectedKey ? (
              <div className="p-4 bg-secondary/20 border border-border/40 rounded-2xl animate-fade-in flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground border border-primary/20 flex items-center justify-center font-bold text-lg uppercase">
                    {selectedKey === " " ? "Space" : selectedKey}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Key Performance Details</h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on {analytics.keyStats[selectedKey]?.pressed || 0} hits
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                  <div className="text-xs text-muted-foreground font-semibold">Speed:</div>
                  <div className="text-xs font-bold text-foreground">
                    {(() => {
                      const stats = analytics.keyStats[selectedKey];
                      if (!stats || stats.pressed === 0) return "0 WPM";
                      const latency = (stats.timeMs / stats.pressed) / 1000;
                      return latency > 0 ? `${Math.round(12 / latency)} WPM` : "0 WPM";
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold">Accuracy:</div>
                  <div className="text-xs font-bold text-foreground">
                    {(() => {
                      const stats = analytics.keyStats[selectedKey];
                      if (!stats || stats.pressed === 0) return "100%";
                      return `${Math.round(((stats.pressed - stats.errors) / stats.pressed) * 100)}%`;
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-2 flex items-center justify-center gap-1.5 bg-secondary/5 border border-border/20 rounded-xl">
                <Eye className="h-4 w-4" />
                Click any keycap above to view key latency and accuracy metrics.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Character Analytics Sidebar */}
        <Card className="shadow-xs border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Critical Key Analytics
            </CardTitle>
            <CardDescription>
              Keys with the highest error indexes requiring drills.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 space-y-4">
            {topErrorKeys.length > 0 ? (
              <div className="space-y-4">
                {topErrorKeys.map((item) => (
                  <div 
                    key={item.char}
                    className="flex items-center justify-between p-3.5 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-2xl gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold uppercase shrink-0">
                        {item.char === " " ? "␣" : item.char}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold uppercase">Key: {item.char === " " ? "Space" : item.char}</h5>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.errors} errors / {item.pressed} keystrokes
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-rose-500">
                        {item.rate}% error
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border/60 rounded-2xl bg-secondary/5">
                <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <h5 className="text-sm font-bold">Flawless accuracy!</h5>
                <p className="text-xs text-muted-foreground mt-1 leading-normal">
                  Excellent job. You have no high-error keystrokes processed. Keep training to log more details.
                </p>
              </div>
            )}
            
            <div className="p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-[11px] text-muted-foreground leading-normal flex items-start gap-2.5">
              <Zap className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong>Recommendation:</strong> Create folders containing articles with frequent occurrences of your high-error keys to reprogram finger reflexes.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
