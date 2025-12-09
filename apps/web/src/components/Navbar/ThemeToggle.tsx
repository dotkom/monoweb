import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import type { Icon } from "@tabler/icons-react"
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { setTheme, theme } = useTheme()

  const THEME_OPTIONS: Array<{
    theme: "light" | "dark" | "system"
    label: string
    icon: Icon
  }> = [
    {
      theme: "light",
      label: "Lyst tema",
      icon: IconSun,
    },
    {
      theme: "dark",
      label: "Mørkt tema",
      icon: IconMoon,
    },
    {
      theme: "system",
      label: "Systempreferanse",
      icon: IconDeviceDesktop,
    },
  ]

  return (
    <div className={cn("relative h-fit flex gap-1 items-center rounded-lg p-1", className)}>
      <div
        className="absolute top-1 bottom-1 h-8 w-8 rounded-lg shadow-sm transition-transform duration-200 ease-out bg-white dark:bg-stone-700"
        style={{
          transform: `translateX(${THEME_OPTIONS.findIndex((option) => option.theme === theme) * 2.25}rem)`,
        }}
      />

      {THEME_OPTIONS.map((item) => {
        const IconComponent = item.icon
        return (
          <Tooltip key={item.theme}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTheme(item.theme)}
                className="relative flex items-center justify-center rounded-md transition-colors w-8 h-8"
              >
                <IconComponent
                  width={20}
                  height={20}
                  className="transition-colors duration-200 text-black dark:text-stone-100"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
