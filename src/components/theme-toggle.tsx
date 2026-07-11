"use client"

import { Moon, Sun } from "lucide-react"
import { useState } from "react"

const storageKey = "gametracker-theme"

export function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    typeof document === "undefined"
      ? "amber"
      : document.documentElement.dataset.theme || "amber",
  )

  function toggleTheme() {
    const nextTheme = theme === "light" ? "amber" : "light"
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem(storageKey, nextTheme)
    setTheme(nextTheme)
  }

  const isLight = theme === "light"

  return (
    <button
      aria-label={isLight ? "Включить тёмную тему" : "Включить светлую тему"}
      aria-pressed={isLight}
      className="retro-tab flex size-10 items-center justify-center"
      onClick={toggleTheme}
      type="button"
    >
      {isLight ? (
        <Moon className="size-4" aria-hidden="true" />
      ) : (
        <Sun className="size-4" aria-hidden="true" />
      )}
    </button>
  )
}
