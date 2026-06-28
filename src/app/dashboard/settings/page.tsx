"use client";
import React from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import { 
  Type, 
  Sparkles, 
  Check, 
  Sliders, 
  Palette, 
  Keyboard, 
  EyeOff, 
  LucideTextCursor
} from "lucide-react";

export default function SettingsPage() {
  const { 
    fontFamily, 
    fontSize, 
    theme, 
    caretStyle, 
    keyboardLayout, 
    zenMode, 
    setFontFamily, 
    setFontSize, 
    setTheme, 
    setCaretStyle, 
    setKeyboardLayout, 
    setZenMode 
  } = useSettingsStore();

  const fontOptions = [
    {
      id: "jetbrains-mono",
      name: "JetBrains Mono",
      description: "Default premium developer font. Highly readable.",
      previewClass: "font-jetbrains-mono",
    },
    {
      id: "fira-code",
      name: "Fira Code",
      description: "Monospace font with programming ligatures.",
      previewClass: "font-fira-code",
    },
    {
      id: "roboto-mono",
      name: "Roboto Mono",
      description: "Google's sleek, clean monospace font.",
      previewClass: "font-roboto-mono",
    },
    {
      id: "inter",
      name: "Inter",
      description: "Beautiful modern sans-serif. Balanced and friendly.",
      previewClass: "font-inter",
    },
    {
      id: "geist-sans",
      name: "Geist Sans",
      description: "Vercel's designer geometric sans-serif.",
      previewClass: "font-geist-sans",
    },
  ];

  const sizeOptions = [14, 16, 18, 20, 24];

  const themeOptions = [
    { id: "dark", name: "Default Dark", colorBg: "bg-zinc-900 border-zinc-800" },
    { id: "light", name: "Default Light", colorBg: "bg-white border-zinc-200" },
    { id: "dracula", name: "Dracula", colorBg: "bg-[#282a36] border-[#44475a]" },
    { id: "gruvbox", name: "Gruvbox", colorBg: "bg-[#282828] border-[#3c3836]" },
    { id: "nord", name: "Nord", colorBg: "bg-[#2e3440] border-[#3b4252]" },
    { id: "monokai", name: "Monokai", colorBg: "bg-[#272822] border-[#3e3d32]" },
    { id: "minimal", name: "Minimalist Black", colorBg: "bg-black border-zinc-800" },
    { id: "high-contrast", name: "High Contrast", colorBg: "bg-black border-white" },
  ];

  const caretOptions = [
    { id: "line", name: "Line (Vertical bar)", class: "w-[2px] h-4 bg-primary" },
    { id: "block", name: "Block (Filled box)", class: "w-2.5 h-4 bg-primary/80" },
    { id: "underline", name: "Underline (Bottom bar)", class: "w-3 h-[2px] bg-primary self-end" },
    { id: "hidden", name: "Hidden (No caret)", class: "w-0 h-0" },
  ];

  const layoutOptions = [
    { id: "qwerty", name: "QWERTY (US Standard)" },
    { id: "dvorak", name: "Dvorak (Ergonomic Alternate)" },
    { id: "colemak", name: "Colemak (Modern Alternate)" },
    { id: "azerty", name: "AZERTY (French Standard)" },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight">App Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your typing environment, font layouts, and themes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Col span 2): Personalization options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Theme Personalization */}
          <Card className="shadow-xs border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Palette className="h-5 w-5 text-primary" />
                Color Theme
              </CardTitle>
              <CardDescription>
                Select your typing space color scheme.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`
                      flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer active:scale-98
                      ${
                        theme === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-secondary/40"
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full border mb-2 shrink-0 ${opt.colorBg}`} />
                    <span className="text-xs font-bold truncate max-w-full">
                      {opt.name}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 2. Font Family */}
          <Card className="shadow-xs border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Type className="h-5 w-5 text-primary" />
                Font Family
              </CardTitle>
              <CardDescription>
                Choose the font family to render typing exercises.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {fontOptions.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font.id)}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer
                      ${
                        fontFamily === font.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-secondary/40 hover:border-border/80"
                      }
                    `}
                  >
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-sm flex items-center gap-2">
                        {font.name}
                        {font.id === "jetbrains-mono" && (
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {font.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-base font-bold pr-2 ${font.previewClass}`}>
                        Aa
                      </span>
                      {fontFamily === font.id && (
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Font Size */}
          <Card className="shadow-xs border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Sliders className="h-5 w-5 text-primary" />
                Font Size
              </CardTitle>
              <CardDescription>
                Adjust the character size for typing exercises.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {sizeOptions.map((size) => (
                  <Button
                    key={size}
                    variant={fontSize === size ? "default" : "outline"}
                    onClick={() => setFontSize(size)}
                    className="flex-1 rounded-xl font-bold h-11 text-sm cursor-pointer"
                  >
                    {size}px
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Caret Customization & Keyboard Layout Mapping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Caret Style Card */}
            <Card className="shadow-xs border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <LucideTextCursor className="h-4.5 w-4.5 text-primary" />
                  Caret Cursor Style
                </CardTitle>
                <CardDescription>
                  Choose how the active letter is highlighted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {caretOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setCaretStyle(opt.id)}
                    className={`
                      w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-99
                      ${
                        caretStyle === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-secondary/40"
                      }
                    `}
                  >
                    <span className="text-xs font-bold">{opt.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      {opt.id !== "hidden" && (
                        <div className="h-5 w-12 bg-secondary/80 border border-border/40 rounded flex items-center justify-center">
                          <span className={opt.class} />
                        </div>
                      )}
                      {caretStyle === opt.id && (
                        <div className="h-4.5 w-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Virtual Layout Card */}
            <Card className="shadow-xs border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Keyboard className="h-4.5 w-4.5 text-primary" />
                  Keyboard Layout
                </CardTitle>
                <CardDescription>
                  Map virtual keyboard visualization keycaps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {layoutOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setKeyboardLayout(opt.id)}
                    className={`
                      w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-99
                      ${
                        keyboardLayout === opt.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-secondary/40"
                      }
                    `}
                  >
                    <span className="text-xs font-bold">{opt.name}</span>
                    {keyboardLayout === opt.id && (
                      <div className="h-4.5 w-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Preview & Zen Mode */}
        <div className="space-y-6">
          
          {/* Zen Mode Switch */}
          <Card className="shadow-xs border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <EyeOff className="h-4.5 w-4.5 text-primary" />
                Zen Mode
              </CardTitle>
              <CardDescription>
                Minimize UI layout distractions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <button
                onClick={() => setZenMode(!zenMode)}
                className={`
                  w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer
                  ${
                    zenMode
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border/60 hover:bg-secondary/40"
                  }
                `}
              >
                <div>
                  <h5 className="text-xs font-bold">Enable Zen Mode</h5>
                  <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] leading-normal">
                    Hides the visual keyboard, dashboard panels, and accuracy tickers while typing.
                  </p>
                </div>
                <div className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${zenMode ? "bg-primary" : "bg-secondary"}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${zenMode ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="shadow-xs border-border/60 sticky top-24 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="h-4 w-4 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>
                See how text renders in your active configuration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div
                className={`
                  p-5 rounded-2xl bg-secondary/30 border border-border/50 transition-all duration-300 min-h-[160px] flex items-center justify-center
                  font-${fontFamily}
                `}
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="space-y-2 text-center select-none">
                  <p className="text-muted-foreground/50 text-[10px] uppercase font-bold tracking-widest font-sans mb-3">
                    Active Typist View
                  </p>
                  
                  {/* Caret preview container */}
                  <p className="leading-relaxed font-semibold">
                    <span className="text-green-500 font-bold">const</span>{" "}
                    <span className="text-blue-500 font-bold">typeflow</span> = (){" "}
                    <span className="text-indigo-500 font-bold">=&gt;</span> &#123;
                  </p>
                  <p className="pl-4 leading-relaxed flex items-center justify-center gap-0.5">
                    <span>console.log(&quot;He</span>
                    {/* Simulated Caret */}
                    {caretStyle !== "hidden" && (
                      <span className={`inline-flex items-center justify-center ${
                        caretStyle === "block" ? "bg-primary/80 text-primary-foreground px-0.5" : 
                        caretStyle === "underline" ? "border-b-2 border-primary" : "border-l-2 border-primary"
                      }`}>
                        l
                      </span>
                    )}
                    {caretStyle === "hidden" && <span>l</span>}
                    <span>lo&quot;);</span>
                  </p>
                  <p className="leading-relaxed font-semibold">&#125;;</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/10 border border-border/20 text-xs text-muted-foreground leading-relaxed space-y-1">
                <div>
                  <strong>Current Font:</strong>{" "}
                  <span className="font-bold underline capitalize">
                    {fontFamily.replace("-", " ")}
                  </span>{" "}
                  at <span className="font-bold">{fontSize}px</span>.
                </div>
                <div>
                  <strong>Active Style:</strong>{" "}
                  <span className="font-bold underline capitalize">
                    {caretStyle} caret
                  </span>{" "}
                  on <span className="font-bold uppercase">{keyboardLayout}</span>.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
