import { cn, DropdownMenu, DropdownMenuTrigger, ToggleGroup, ToggleGroupItem } from "@dotkomonline/ui"
import { Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconDeviceDesktop, IconDeviceMobile, IconMoon, IconPumpkinScary, IconSun } from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"
import { usePalette } from "@/components/PaletteProvider"
import { DEFAULT_PALETTE, type Palette } from "@/lib/palette"
import { useTheme } from "next-themes"
import type { FC } from "react"
import { NavbarDropdownContent } from "./NavbarDropdownContent"

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

const TOGGLE_ITEM_CLASS_NAME = cn(
  "p-0.5 border border-transparent",
  "hover:bg-gray-100 hover:border-gray-200 dark:hover:bg-stone-700/25 dark:hover:border-stone-700",
  "aria-pressed:bg-gray-100 aria-pressed:border-gray-200 data-[state=on]:bg-gray-100 data-[state=on]:border-gray-200",
  "aria-pressed:border-gray-200 dark:aria-pressed:border-transparent",
  "aria-pressed:dark:bg-stone-700 data-[state=on]:dark:bg-stone-700"
)

const PALETTE_OPTIONS = [
  {
    palette: "classic",
    label: "Klassisk",
    swatchClassName: "bg-[#0b5374]",
  },
  {
    palette: "halloween",
    label: "Halloween",
    swatchClassName: "bg-[#f7931e]",
  },
] satisfies Array<{
  palette: Palette
  label: string
  swatchClassName: string
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
                className={cn(TOGGLE_ITEM_CLASS_NAME, item.className)}
              >
                <IconComponent className="size-5 shrink-0 sm:size-4.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroup>
  )
}

export const PaletteToggle = () => {
  const { palette, setPalette } = usePalette()

  return (
    <ToggleGroup
      multiple={false}
      spacing={0.5}
      value={[palette]}
      onValueChange={(value) => setPalette((value.at(0) as Palette | undefined) ?? DEFAULT_PALETTE)}
    >
      {PALETTE_OPTIONS.map((item) => (
        <Tooltip key={item.palette}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={item.palette}
              size="lg"
              variant="default"
              aria-label={item.label}
              className={TOGGLE_ITEM_CLASS_NAME}
            >
              <span
                className={cn(
                  "size-4 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20",
                  item.swatchClassName
                )}
              />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  )
}

export const ThemeDropdown: FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Velg modus og tema"
        className="flex items-center justify-center size-10 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-stone-700/50"
      >
        <span className="contents halloween:hidden">
          <IconSun width={22} height={22} className="dark:hidden" />
          <IconMoon width={22} height={22} className="hidden dark:block" />
        </span>
        <IconPumpkinScary width={22} height={22} className="hidden halloween:block text-brand" />
      </DropdownMenuTrigger>
      <NavbarDropdownContent className="w-fit rounded-xl border border-gray-300/70 bg-gray-50 p-2 shadow-md dark:border-stone-700 dark:bg-stone-800 sm:p-1.5">
        <div className="flex flex-col items-center gap-1.5">
          <ThemeToggle />
          <PaletteToggle />
        </div>
      </NavbarDropdownContent>
    </DropdownMenu>
  )
}
