"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative overflow-hidden rounded-xl bg-background shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] hover:shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-bauhaus-yellow" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-bauhaus-blue" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
