import { Icon } from "@dotkomonline/ui"
import { cn } from "@dotkomonline/ui"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  size?: "sm" | "lg"
  className?: string
}

export const ThemeToggle = ({ size = "sm", className }: ThemeToggleProps) => {
  const { setTheme, theme } = useTheme()

  const THEME_OPTIONS = [
    {
      theme: "light",
      label: "Lyst tema",
      icon: "tabler:sun",
    },
    {
      theme: "dark",
      label: "Mørkt tema",
      icon: "tabler:moon",
    },
    {
      theme: "system",
      label: "Systempreferanse",
      icon: "tabler:device-desktop",
    },
  ] as const

  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      iconSize: 20,
      translateX: 36,
    },
    lg: {
      container: "w-10 h-10",
      iconSize: 24,
      translateX: 44,
    },
  }

  const currentSize = sizeClasses[size]

  return (
    <div className={cn("relative h-fit flex gap-1 items-center rounded-lg p-1", className)}>
      <div
        className={cn(
          "absolute top-1 bottom-1 h-8 rounded-md shadow-sm transition-transform duration-200 ease-out bg-white dark:bg-stone-700",
          currentSize.container
        )}
        style={{
          transform: `translateX(${THEME_OPTIONS.findIndex((option) => option.theme === theme) * currentSize.translateX}px)`,
        }}
      />

      {THEME_OPTIONS.map((item) => (
        <button
          type="button"
          key={item.theme}
          onClick={() => setTheme(item.theme)}
          className={cn(
            "relative flex items-center justify-center rounded-md transition-colors",
            currentSize.container
          )}
          title={item.label}
        >
          <Icon
            icon={item.icon}
            width={currentSize.iconSize}
            height={currentSize.iconSize}
            className="transition-colors duration-200 text-black dark:text-stone-100"
          />
        </button>
      ))}
    </div>
  )
}
