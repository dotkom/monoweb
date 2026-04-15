"use client"

import { Popover, PopoverContent, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconDeviceDesktop, IconDeviceMobile, IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { PopoverOptionButton } from "./PopoverOptionButton"
import { useTranslations } from "next-intl"

export const ThemePopover = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()
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
      <PopoverTrigger className="flex size-9 items-center justify-center rounded-lg bg-transparent p-0 text-neutral-800 hover:bg-neutral-100">
        {resolvedTheme === "light" ? <IconSun size={20} stroke={1.8} /> : <IconMoon size={20} stroke={1.8} />}
      </PopoverTrigger>
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
    </Popover>
  )
}
