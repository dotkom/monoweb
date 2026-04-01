"use client"

import { setLocale } from "@/i18n/set-locale"
import { Popover, PopoverContent, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconWorld } from "@tabler/icons-react"
import { useLocale } from "next-intl"
import { useState } from "react"
import { PopoverOptionButton } from "./PopoverOptionButton"

export const LocalePopover = () => {
  const locale = useLocale()

  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false)

  const onLocaleChange = (newLocale: "no" | "en") => {
    if (newLocale === locale) {
      return
    }

    setLocale(newLocale)
    setLanguagePopoverOpen(false)
  }

  return (
    <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
      <PopoverTrigger className="flex items-center justify-center rounded-lg bg-transparent p-2 text-neutral-800 hover:bg-neutral-100 gap-2">
        <IconWorld size={20} stroke={1.8} />
        {locale === "no" ? "Norsk" : "English"}
      </PopoverTrigger>
      <PopoverContent className="flex flex-col p-1 min-w-30">
        <PopoverOptionButton onClick={() => onLocaleChange("no")} isActive={locale === "no"}>
          <Text>Norsk</Text>
        </PopoverOptionButton>
        <PopoverOptionButton onClick={() => onLocaleChange("en")} isActive={locale === "en"}>
          <Text>English</Text>
        </PopoverOptionButton>
      </PopoverContent>
    </Popover>
  )
}
