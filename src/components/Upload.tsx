"use client";
import React, { useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Button } from "@/vendors/ui/button";
import { UploadCloud } from "lucide-react";

export default function Upload() {
  const setRawContent = useTypingStore((state) => state.setRawContent);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setRawContent(text);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border/80 shadow-md transition-all hover:border-primary/50">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <UploadCloud className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold mb-2">Start Training</h2>
      <p className="text-muted-foreground mb-6 text-center text-sm">
        Upload a .txt file to generate your custom typing lessons.
      </p>

      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="default"
        size="default"
        className="px-8 font-semibold"
      >
        Upload File
      </Button>

      <div className="mt-4 text-xs text-muted-foreground">
        Supports .txt format • Minimum 100 characters recommended
      </div>
    </div>
  );
}
