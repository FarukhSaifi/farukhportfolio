"use client";

import { ToggleButton, useTheme } from "@once-ui-system/core";
import React, { useEffect, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    setMounted(true);
    setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, [theme, mounted]);

  // Avoid SSR/CSR icon mismatch: theme is resolved from DOM/localStorage only after mount.
  if (!mounted) {
    return (
      <ToggleButton
        prefixIcon="dark"
        aria-label="Switch color theme"
        aria-hidden
        tabIndex={-1}
        style={{ visibility: "hidden" }}
      />
    );
  }

  const icon = currentTheme === "dark" ? "light" : "dark";
  const nextTheme = currentTheme === "light" ? "dark" : "light";

  return (
    <ToggleButton
      prefixIcon={icon}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
    />
  );
};
