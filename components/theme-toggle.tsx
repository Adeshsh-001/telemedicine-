"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-muted-foreground">Theme</span>
      <div className="relative flex items-center bg-muted rounded-full p-1 w-24 h-10">
        <div
          className={`absolute top-1 left-1 w-10 h-8 bg-background rounded-full shadow-sm transition-transform duration-300 ease-in-out ${
            theme === "dark" ? "translate-x-12" : "translate-x-0"
          }`}
        />

        <button
          onClick={() => setTheme("light")}
          className={`relative z-10 flex items-center justify-center w-10 h-8 rounded-full transition-colors duration-200 ${
            theme === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sun className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`relative z-10 flex items-center justify-center w-10 h-8 rounded-full transition-colors duration-200 ${
            theme === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
