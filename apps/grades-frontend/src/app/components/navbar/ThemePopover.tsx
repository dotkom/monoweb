"use client"

import { Popover, PopoverContent, PopoverPortal, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconDeviceDesktop, IconDeviceMobile, IconMoon, IconSun } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { useState } from "react"
import { PopoverOptionButton } from "./PopoverOptionButton"
import { IconActionButton } from "../action-button/ActionButton"

export const ThemePopover = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("ThemePopover")
  const resolvedThemeLabel = resolvedTheme === "light" || resolvedTheme === "dark" ? resolvedTheme : "system"

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
        <IconActionButton aria-label={t("ariaLabel", { theme: t(resolvedThemeLabel) })}>
          {resolvedTheme === "light" ? <IconSun size={20} stroke={1.8} /> : <IconMoon size={20} stroke={1.8} />}
        </IconActionButton>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className="min-w-36 flex flex-col p-1 transition-colors">
          <PopoverOptionButton onClick={() => onChange("light")} isActive={theme === "light"}>
            <IconSun size={16} />
            <Text>{t("light")}</Text>
          </PopoverOptionButton>

          <PopoverOptionButton onClick={() => onChange("dark")} isActive={theme === "dark"}>
            <IconMoon size={16} />
            <Text>{t("dark")}</Text>
          </PopoverOptionButton>

          <PopoverOptionButton onClick={() => onChange("system")} isActive={theme === "system"}>
            <IconDeviceDesktop size={16} className="hidden xs:block" />
            <IconDeviceMobile size={16} className="xs:hidden" />
            <Text>{t("system")}</Text>
          </PopoverOptionButton>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
