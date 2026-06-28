"use client";
import React from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/vendors/ui/card";
import { Button } from "@/vendors/ui/button";
import { Type, Sparkles, Check, Sliders } from "lucide-react";

export default function SettingsPage() {
  const { fontFamily, fontSize, setFontFamily, setFontSize } = useSettingsStore();

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

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-black tracking-tight">App Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your typing environment, font layouts, and themes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Font Settings */}
        <div className="md:col-span-2 space-y-6">
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
        </div>

        {/* Right Column: Live Preview */}
        <div className="space-y-6">
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
                  <p className="leading-relaxed font-semibold">
                    <span className="text-green-500">const</span>{" "}
                    <span className="text-blue-500">typeflow</span> = (){" "}
                    <span className="text-indigo-500">=&gt;</span> &#123;
                  </p>
                  <p className="pl-4 leading-relaxed">
                    console.log(<span className="text-orange-500">&quot;Hello World!&quot;</span>);
                  </p>
                  <p className="leading-relaxed font-semibold">&#125;;</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/10 border border-border/20 text-xs text-muted-foreground leading-relaxed">
                <strong>Current Font:</strong>{" "}
                <span className="font-bold underline capitalize">
                  {fontFamily.replace("-", " ")}
                </span>{" "}
                at <span className="font-bold">{fontSize}px</span> size.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
