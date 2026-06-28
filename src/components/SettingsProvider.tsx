"use client";
import React, { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTypingStore } from "@/store/useTypingStore";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { fontFamily, theme } = useSettingsStore();
  const { syncProgress } = useTypingStore();

  useEffect(() => {
    syncProgress();
  }, [syncProgress]);

  useEffect(() => {
    // List of custom themes
    const themeClasses = [
      "theme-dracula",
      "theme-gruvbox",
      "theme-nord",
      "theme-monokai",
      "theme-minimal",
      "theme-high-contrast"
    ];
    
    // Remove existing themes
    document.body.classList.remove(...themeClasses);
    
    if (theme !== "dark" && theme !== "light") {
      // Add custom theme class
      document.body.classList.add(`theme-${theme}`);
      // Custom themes are dark mode backgrounds
      document.documentElement.classList.add("dark");
    } else {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

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
