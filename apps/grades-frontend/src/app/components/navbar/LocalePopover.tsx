"use client"

import { setLocale } from "@/i18n/set-locale"
import { cn, Popover, PopoverContent, PopoverPortal, PopoverTrigger, Text } from "@dotkomonline/ui"
import { IconWorld } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { PopoverOptionButton } from "./PopoverOptionButton"
import { ActionButton } from "../action-button/ActionButton"

export const LocalePopover = () => {
  const locale = useLocale()
  const t = useTranslations("LocalePopover")

  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false)

  const onLocaleChange = (newLocale: "no" | "en") => {
    if (newLocale === locale) {
      return
    }

    setLocale(newLocale)
    setLanguagePopoverOpen(false)
  }

  const currentLanguage = locale === "no" ? t("norwegian") : t("english")

  return (
    <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
      <PopoverTrigger asChild>
        <ActionButton
          aria-label={t("ariaLabel", { language: currentLanguage })}
          className={cn("inline-flex items-center justify-center gap-2 px-3.5 py-2")}
        >
          <IconWorld size={20} stroke={1.8} />
          {currentLanguage}
        </ActionButton>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className="flex flex-col p-1 min-w-30">
          <PopoverOptionButton onClick={() => onLocaleChange("no")} isActive={locale === "no"}>
            <Text>{t("norwegian")}</Text>
          </PopoverOptionButton>
          <PopoverOptionButton onClick={() => onLocaleChange("en")} isActive={locale === "en"}>
            <Text>{t("english")}</Text>
          </PopoverOptionButton>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  )
}
