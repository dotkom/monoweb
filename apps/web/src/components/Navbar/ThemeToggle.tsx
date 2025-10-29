import { Icon } from "@dotkomonline/ui"
import { cn } from "@dotkomonline/ui"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@dotkomonline/ui"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { setTheme, theme } = useTheme()

  const THEME_OPTIONS = [
    {
      theme: "light",
      label: "Lyst tema",
      icon: "tabler:sun",
      className: "",
    },
    {
      theme: "dark",
      label: "Mørkt tema",
      icon: "tabler:moon",
      className: "",
    },
    {
      theme: "system",
      label: "Systempreferanse",
      icon: "tabler:device-desktop",
      className: "hidden sm:flex",
    },
    {
      theme: "system",
      label: "Systempreferanse",
      icon: "tabler:device-mobile",
      className: "sm:hidden",
    },
  ] as const

  return (
    <TooltipProvider>
      <div className={cn("relative h-fit flex gap-1 items-center rounded-lg p-1", className)}>
        <div
          className="absolute top-1 bottom-1 h-8 rounded-lg shadow-sm transition-transform duration-200 ease-out bg-white dark:bg-stone-700 w-8 h-8"
          style={{
            transform: `translateX(${THEME_OPTIONS.findIndex((option) => option.theme === theme) * 2.25}rem)`,
          }}
        />

        {THEME_OPTIONS.map((item) => (
          <Tooltip key={item.theme}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setTheme(item.theme)}
                className={cn(
                  "relative flex items-center justify-center rounded-md transition-colors w-8 h-8",
                  item.className
                )}
              >
                <Icon
                  icon={item.icon}
                  width={20}
                  height={20}
                  className="transition-colors duration-200 text-black dark:text-stone-100 sm"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
