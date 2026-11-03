import { useEffect, useState } from "react";

type ThemeMode = "auto" | "dark" | "light";

export default function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem("theme-mode");
      return savedTheme === "light" || savedTheme === "dark"
        ? savedTheme
        : "auto";
    } catch (error) {
      console.error("Failed to read the saved theme preference:", error);
      return "auto";
    }
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  const isDarkModeActive = () =>
    themeMode === "auto" ? systemPrefersDark : themeMode === "dark";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark =
        themeMode === "auto" ? mediaQuery.matches : themeMode === "dark";
      document.documentElement.classList.toggle("light-mode", !isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };
    const handleSystemThemeChange = () => {
      setSystemPrefersDark(mediaQuery.matches);
      if (themeMode === "auto") applyTheme();
    };

    applyTheme();
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    try {
      localStorage.setItem("theme-mode", themeMode);
    } catch (error) {
      console.error("Failed to save the theme preference:", error);
    }

    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [themeMode]);

  function toggleTheme() {
    setThemeMode((prev) => {
      if (prev === "auto") return "light";
      if (prev === "light") return "dark";
      return "auto";
    });
  }

  function getThemeSVG() {
    const isDark = isDarkModeActive();
    if (themeMode === "auto")
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      );
    return isDark ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    );
  }

  return {
    themeMode,
    setThemeMode,
    toggleTheme,
    getThemeSVG,
    isDarkModeActive,
  };
}
