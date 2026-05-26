import { cn, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconDeviceDesktop, IconDeviceMobile, IconMoon, IconSun } from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"
import { useTheme } from "next-themes"

type Theme = "light" | "dark" | "system"

const DEFAULT_THEME = "system" satisfies Theme

const THEME_OPTIONS = [
  {
    key: "light",
    theme: "light",
    label: "Lyst tema",
    icon: IconSun,
  },
  {
    key: "dark",
    theme: "dark",
    label: "Mørkt tema",
    icon: IconMoon,
  },
  {
    key: "system-desktop",
    theme: "system",
    label: "Systempreferanse",
    icon: IconDeviceDesktop,
    className: "hidden sm:flex",
  },
  {
    key: "system-mobile",
    theme: "system",
    label: "Systempreferanse",
    icon: IconDeviceMobile,
    className: "sm:hidden",
  },
] satisfies Array<{
  key: string
  theme: Theme
  label: string
  icon: Icon
  className?: string
}>

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme()

  return (
    <ToggleGroup
      multiple={false}
      spacing={0.5}
      value={[theme ?? DEFAULT_THEME]}
      onValueChange={(value) => setTheme(value.at(0) ?? DEFAULT_THEME)}
    >
      {THEME_OPTIONS.map((item) => {
        const IconComponent = item.icon
        return (
          <Tooltip key={item.key}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={item.theme}
                size="lg"
                variant="default"
                className={cn(
                  "p-0.5",
                  "hover:bg-white dark:hover:bg-stone-700",
                  "aria-pressed:bg-white data-[state=on]:bg-white",
                  "aria-pressed:dark:bg-stone-700 data-[state=on]:dark:bg-stone-700",
                  item.className
                )}
              >
                <IconComponent className="shrink-0 size-4.5 stroke-[2.3]" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}
