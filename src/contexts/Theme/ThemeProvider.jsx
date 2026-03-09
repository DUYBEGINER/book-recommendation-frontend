import { useState, useEffect, useCallback } from "react";
import { ThemeContext } from "./ThemeContext";

const getIsDark = (theme) => {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system",
  );

  const onWindowMatch = useCallback(() => {
    const element = document.documentElement;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && darkQuery.matches)
    ) {
      element.classList.add("dark");
    } else {
      element.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const element = document.documentElement;

    switch (theme) {
      case "dark":
        element.classList.add("dark");
        localStorage.setItem("theme", "dark");
        break;
      case "light":
        element.classList.remove("dark");
        localStorage.setItem("theme", "light");
        break;
      default:
        localStorage.removeItem("theme");
        onWindowMatch();
        break;
    }
  }, [theme, onWindowMatch]);

  useEffect(() => {
    const element = document.documentElement;
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const changeHandler = (e) => {
      if (!("theme" in localStorage)) {
        if (e.matches) {
          element.classList.add("dark");
        } else {
          element.classList.remove("dark");
        }
      }
    };

    darkQuery.addEventListener("change", changeHandler);
    return () => {
      darkQuery.removeEventListener("change", changeHandler);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDark: getIsDark(theme) }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
