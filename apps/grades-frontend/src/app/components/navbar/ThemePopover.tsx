"use client"

import { Popover, PopoverContent, PopoverPortal, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconDeviceDesktop, IconDeviceMobile, IconMoon, IconSun } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useState } from "react"
import { PopoverOptionButton } from "./PopoverOptionButton"
import { IconActionButton } from "../action-button/ActionButton"

export const ThemePopover = () => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("ThemePopover")

  const onChange = (newTheme: string) => {
    if (newTheme === theme) {
      return
    }

    setIsOpen(false)
    setTheme(newTheme)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <IconActionButton aria-label={t("ariaLabel")}>
          <IconSun stroke={1.8} className="size-5 dark:hidden" />
          <IconMoon stroke={1.8} className="size-5 hidden dark:block" />
        </IconActionButton>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className="min-w-36 w-auto flex flex-col p-1 transition-colors gap-0 border border-neutral-200 dark:bg-stone-800 dark:border-stone-700 ring-0">
          <PopoverOptionButton onClick={() => onChange("light")} isActive={theme === "light"}>
            <IconSun className="size-4" />
            <Text>{t("light")}</Text>
          </PopoverOptionButton>

          <PopoverOptionButton onClick={() => onChange("dark")} isActive={theme === "dark"}>
            <IconMoon className="size-4" />
            <Text>{t("dark")}</Text>
          </PopoverOptionButton>

          <PopoverOptionButton onClick={() => onChange("system")} isActive={theme === "system"}>
            <IconDeviceDesktop className="size-4 hidden xs:block" />
            <IconDeviceMobile className="size-4 xs:hidden" />
            <Text>{t("system")}</Text>
          </PopoverOptionButton>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
