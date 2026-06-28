"use client";
import React, { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTypingStore } from "@/store/useTypingStore";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { fontFamily } = useSettingsStore();
  const { syncProgress } = useTypingStore();

  useEffect(() => {
    syncProgress();
  }, [syncProgress]);

  useEffect(() => {
    // Apply font class to document.body
    const fontClasses = [
      "font-jetbrains-mono",
      "font-inter",
      "font-fira-code",
      "font-roboto-mono",
      "font-geist-sans"
    ];
    
    // Remove existing font classes
    document.body.classList.remove(...fontClasses);
    
    // Add current font class
    const fontClass = `font-${fontFamily}`;
    document.body.classList.add(fontClass);
  }, [fontFamily]);

  return <>{children}</>;
}
export default SettingsProvider;
