"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/vendors/ui/button";
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Play, 
  Focus,
  Keyboard,
  Info
} from "lucide-react";

export default function TypingBox() {
  const {
    chunks,
    currentIndex,
    userInput,
    updateInput,
    lessonStatus,
    nextChunk,
    retryChunk,
    stats,
    timeElapsed,
    isPaused,
    soundEnabled,
    focusMode,
    tickTimer,
    pauseTimer,
    resumeTimer,
    toggleSound,
    toggleFocusMode
  } = useTypingStore();

  const { fontSize, caretStyle, keyboardLayout, zenMode } = useSettingsStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const currentChunk = chunks[currentIndex];

  // 1. Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (lessonStatus === "typing" && !isPaused && isFocused) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lessonStatus, isPaused, isFocused, tickTimer]);

  // 2. Refocus effect
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  }, [currentIndex, lessonStatus]);

  // 3. Document level Tab restart listener (Monkeytype style restart)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        retryChunk();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [retryChunk]);

  if (!currentChunk) return null;

  const characters = currentChunk.text.split("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      retryChunk();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (lessonStatus === "completed" || lessonStatus === "retry") return;
    updateInput(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    resumeTimer();
  };

  const handleBlur = () => {
    setIsFocused(false);
    pauseTimer();
  };

  const triggerRefocus = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  const showStatsHeader = (!focusMode && !zenMode) || lessonStatus !== "typing";
  const showKeyboard = !zenMode && lessonStatus === "typing";

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-8 px-4 animate-fade-in space-y-6">
      
      {/* 1. TOP BAR Controls & Live Metrics */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${showStatsHeader ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden pointer-events-none"}`}>
        {/* Real-time stats display */}
        <div className="flex items-center gap-8 bg-secondary/10 border border-border/40 px-6 py-2.5 rounded-2xl">
          <div className="text-center sm:text-left">
            <span className="text-3xl font-mono font-black text-primary tracking-tight">
              {stats.wpm}
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1.5">
              WPM
            </span>
          </div>
          <div className="h-6 w-[1px] bg-border/60" />
          <div className="text-center sm:text-left">
            <span className="text-3xl font-mono font-black text-emerald-500 tracking-tight">
              {stats.accuracy}%
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1.5">
              Accuracy
            </span>
          </div>
          <div className="h-6 w-[1px] bg-border/60" />
          <div className="text-center sm:text-left">
            <span className="text-3xl font-mono font-black text-muted-foreground tracking-tight">
              {timeElapsed}s
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1.5">
              Time
            </span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSound}
            className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground"
            title={soundEnabled ? "Mute Click Sounds" : "Enable Click Sounds"}
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </Button>

          {/* Focus Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFocusMode}
            className={`h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer ${
              focusMode ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
            }`}
            title={focusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
          >
            {focusMode ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </Button>

          {/* Quick Restart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={retryChunk}
            className="h-9 w-9 rounded-xl hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground"
            title="Restart Lesson (Tab)"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      {/* 2. MAIN TYPING CONTAINER */}
      <div
        ref={containerRef}
        className="relative p-10 bg-card border border-border/80 rounded-3xl shadow-xl leading-relaxed cursor-text select-none min-h-[160px] flex items-center transition-all duration-200"
        onClick={triggerRefocus}
      >
        {/* Dynamic Typography wrapper */}
        <div 
          className="flex flex-wrap gap-x-[2px] w-full"
          style={{ fontSize: `${fontSize}px` }}
        >
          {characters.map((char, index) => {
            let colorClass = "text-muted-foreground/35"; // Uncompleted
            let cursorClass = "";

            if (index < userInput.length) {
              colorClass =
                userInput[index] === char
                  ? "text-foreground font-semibold dark:text-gray-100" // Correct
                  : "text-rose-500 font-bold bg-rose-500/10 border-b border-rose-500 decoration-none"; // Incorrect
            }

            // Blinking Caret indicator based on caretStyle setting
            if (index === userInput.length) {
              if (isFocused) {
                if (caretStyle === "block") {
                  cursorClass = "bg-primary/80 text-primary-foreground px-0.5 animate-cursor-blink";
                } else if (caretStyle === "underline") {
                  cursorClass = "border-b-2 border-primary animate-cursor-blink";
                } else if (caretStyle === "hidden") {
                  cursorClass = "";
                } else {
                  cursorClass = "border-l-3 border-primary animate-cursor-blink -ml-[3px]";
                }
              }
            }

            return (
              <span
                key={index}
                className={`${colorClass} ${cursorClass} whitespace-pre font-mono transition-colors duration-100`}
              >
                {char}
              </span>
            );
          })}
          
          {/* Caret at the end of the text if fully completed */}
          {userInput.length === characters.length && isFocused && caretStyle !== "hidden" && (
            <span className={
              caretStyle === "block" ? "bg-primary/80 text-primary-foreground px-1 py-0.5 animate-cursor-blink h-[1.2em] self-center" :
              caretStyle === "underline" ? "border-b-2 border-primary animate-cursor-blink w-2.5 h-[1.2em] self-center" :
              "border-l-3 border-primary animate-cursor-blink -ml-[3px] h-[1.2em] self-center"
            } />
          )}
        </div>

        {/* Hidden Input field */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="absolute inset-0 opacity-0 cursor-default w-full h-full"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {/* 3. PAUSED / BLURRED STATE OVERLAY */}
        {(!isFocused && lessonStatus === "typing") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm rounded-3xl z-10 animate-fade-in border border-border/50">
            <div className="flex flex-col items-center gap-3 max-w-sm text-center px-6">
              <div className="p-3 bg-primary/10 text-primary rounded-full animate-pulse">
                <Keyboard className="h-6 w-6" />
              </div>
              <h4 className="text-base font-extrabold tracking-tight">Session Paused</h4>
              <p className="text-xs text-muted-foreground leading-normal">
                Typing box lost focus. Click here or press any key to resume your session.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. VIRTUAL KEYBOARD LAYOUT DISPLAY */}
      {showKeyboard && (
        <div className="p-4 bg-secondary/5 border border-border/40 rounded-3xl space-y-2 max-w-xl mx-auto animate-fade-in select-none">
          <div className="text-[10px] uppercase font-black text-muted-foreground/75 tracking-widest mb-2 flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5" />
              Keyboard Layout Guide
            </span>
            <span className="font-mono bg-secondary/80 px-2 py-0.5 rounded border border-border/40">
              {keyboardLayout}
            </span>
          </div>

          {(() => {
            let rows: string[][] = [];
            if (keyboardLayout === "dvorak") {
              rows = [
                ["'", ",", ".", "p", "y", "f", "g", "c", "r", "l"],
                ["a", "o", "e", "u", "i", "d", "h", "t", "n", "s"],
                [";", "q", "j", "k", "x", "b", "m", "w", "v", "z"]
              ];
            } else if (keyboardLayout === "colemak") {
              rows = [
                ["q", "w", "f", "p", "g", "j", "l", "u", "y", ";"],
                ["a", "r", "s", "t", "d", "h", "n", "e", "i", "o"],
                ["z", "x", "c", "v", "b", "k", "m", ",", ".", "/"]
              ];
            } else if (keyboardLayout === "azerty") {
              rows = [
                ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
                ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
                ["w", "x", "c", "v", "b", "n", ",", ";", ":", "!"]
              ];
            } else {
              // QWERTY
              rows = [
                ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
                ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
                ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
              ];
            }

            const expectedChar = currentChunk.text[userInput.length]?.toLowerCase();

            return (
              <div className="space-y-1.5">
                {rows.map((row, rowIdx) => (
                  <div 
                    key={rowIdx} 
                    className="flex justify-center gap-1"
                    style={{ paddingLeft: rowIdx === 1 ? "1rem" : rowIdx === 2 ? "2rem" : "0" }}
                  >
                    {row.map((key) => {
                      const isActive = key === expectedChar;
                      return (
                        <div
                          key={key}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border text-xs font-bold uppercase flex items-center justify-center transition-all ${
                            isActive 
                              ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md shadow-primary/20 animate-pulse" 
                              : "bg-secondary/20 border-border/30 text-muted-foreground/80"
                          }`}
                        >
                          {key}
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Spacebar */}
                <div className="flex justify-center pt-1">
                  <div
                    className={`w-36 sm:w-48 h-8 rounded-lg border text-[10px] font-bold uppercase flex items-center justify-center transition-all ${
                      expectedChar === " "
                        ? "bg-primary text-primary-foreground border-primary scale-105 shadow-md shadow-primary/20"
                        : "bg-secondary/20 border-border/30 text-muted-foreground/60"
                    }`}
                  >
                    Space
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. KEYBOARD SHORTCUT HELPER */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 font-semibold select-none pt-2">
        <Info className="h-3.5 w-3.5" />
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 bg-secondary/80 border border-border/40 rounded-sm font-mono text-[10px]">Tab</kbd>
        <span>to quickly restart.</span>
      </div>

      {/* 5. SUCCESS OVERLAYS */}
      {lessonStatus === "completed" && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50 animate-fade-in px-4">
          <div className="bg-card border border-border/60 max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-500 rounded-full">
              <Play className="h-8 w-8 fill-current ml-0.5" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-emerald-500">
                Exercise Completed!
              </h3>
              <p className="text-sm text-muted-foreground">
                You passed the chunk accuracy threshold.
              </p>
            </div>

            {/* Completion stats block */}
            <div className="grid grid-cols-2 gap-4 bg-secondary/10 p-5 rounded-2xl border border-border/40">
              <div>
                <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">WPM</h5>
                <p className="text-2xl font-mono font-black text-primary mt-1">{stats.wpm}</p>
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Accuracy</h5>
                <p className="text-2xl font-mono font-black text-emerald-500 mt-1">{stats.accuracy}%</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={retryChunk}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold border-border hover:bg-secondary cursor-pointer"
              >
                Retry
              </Button>
              <Button
                onClick={nextChunk}
                className="flex-1 h-12 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Next Lesson
              </Button>
            </div>
          </div>
        </div>
      )}

      {lessonStatus === "retry" && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50 animate-fade-in px-4">
          <div className="bg-card border border-border/60 max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="inline-flex p-4 bg-rose-500/10 text-rose-500 rounded-full">
              <RotateCcw className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tight text-rose-500">
                Try Again
              </h3>
              <p className="text-sm text-muted-foreground">
                Accuracy must be at least 90% to advance.
              </p>
            </div>

            {/* Retry stats block */}
            <div className="grid grid-cols-2 gap-4 bg-secondary/10 p-5 rounded-2xl border border-border/40">
              <div>
                <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">WPM</h5>
                <p className="text-2xl font-mono font-black text-primary mt-1">{stats.wpm}</p>
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Accuracy</h5>
                <p className="text-2xl font-mono font-black text-rose-500 mt-1">{stats.accuracy}%</p>
              </div>
            </div>

            <Button
              onClick={retryChunk}
              className="w-full h-12 rounded-xl font-bold bg-rose-500 hover:bg-rose-500/90 text-white cursor-pointer"
            >
              Retry Chunk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
