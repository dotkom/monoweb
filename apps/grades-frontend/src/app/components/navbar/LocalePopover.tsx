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
          className={cn("inline-flex items-center justify-center gap-2 px-3.5 py-2 font-normal")}
        >
          <IconWorld stroke={1.8} className="size-5" />
          {currentLanguage}
        </ActionButton>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent className="min-w-28 w-auto flex flex-col p-1 transition-colors gap-0 border border-neutral-200 dark:bg-stone-800 dark:border-stone-700 ring-0">
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
