"use client"

import type { Locale } from "@/i18n/locale"
import { setLocale } from "@/i18n/set-locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Text,
  cn,
} from "@dotkomonline/ui"
import { IconDeviceMobile, IconMenu2, IconMoon, IconPalette, IconSun, IconWorld } from "@tabler/icons-react"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { IconActionButton, PillActionButton } from "../action-button/ActionButton"

export const MobileNavigation = () => {
  const t = useTranslations("Navbar")
  const tTheme = useTranslations("ThemePopover")
  const tLocale = useTranslations("LocalePopover")
  const pathname = usePathname()
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const isCourseListPageRoute = pathname === "/emner"

  const onThemeChange = (newTheme: "light" | "dark" | "system") => {
    if (newTheme === theme) {
      return
    }

    setTheme(newTheme)
  }

  const onLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) {
      return
    }

    setLocale(newLocale)
  }

  return (
    <div className="sm:hidden">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <IconActionButton aria-label={isOpen ? t("closeNavigation") : t("openNavigation")}>
            <IconMenu2 size={24} />
          </IconActionButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          side="bottom"
          sideOffset={8}
          className={cn(
            "sm:hidden w-[calc(var(--radix-popper-available-width)-2rem)]",
            "mx-4 mt-3",
            "rounded-2xl border border-neutral-200/80 dark:border-stone-700/80",
            "bg-white/90 dark:bg-stone-800/90 backdrop-blur-lg",
            "shadow-lg",
            "p-3"
          )}
        >
          <nav className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
            <div className="space-y-4">
              <section>
                <Link
                  href="/emner"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group relative flex items-center justify-between gap-2",
                    "rounded-md px-3 py-2.5 text-[15px] font-medium",
                    "transition-colors",
                    isCourseListPageRoute
                      ? "bg-neutral-100 text-neutral-900 dark:bg-stone-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-stone-600"
                      : "text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-stone-700"
                  )}
                >
                  <span>{t("courses")}</span>
                </Link>

                <DropdownMenuSeparator className="my-3 bg-neutral-200/80 dark:bg-stone-700/80" />
              </section>

              <section className="flex flex-col gap-6 px-1">
                <div className="flex flex-col gap-2">
                  <Text className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-stone-300">
                    <IconPalette size={16} />
                    {t("theme")}
                  </Text>

                  <div className="flex flex-row gap-2">
                    <IconActionButton
                      onClick={() => onThemeChange("light")}
                      isActive={theme === "light"}
                      aria-label={tTheme("light")}
                    >
                      <IconSun size={16} />
                    </IconActionButton>
                    <IconActionButton
                      onClick={() => onThemeChange("dark")}
                      isActive={theme === "dark"}
                      aria-label={tTheme("dark")}
                    >
                      <IconMoon size={16} />
                    </IconActionButton>
                    <IconActionButton
                      onClick={() => onThemeChange("system")}
                      isActive={theme === "system"}
                      aria-label={tTheme("system")}
                    >
                      <IconDeviceMobile size={16} />
                    </IconActionButton>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Text className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-neutral-600 dark:text-stone-300">
                    <IconWorld size={16} />
                    {t("language")}
                  </Text>
                  <div className="flex flex-row gap-2">
                    <PillActionButton onClick={() => onLocaleChange("no")} isActive={locale === "no"}>
                      {tLocale("norwegian")}
                    </PillActionButton>
                    <PillActionButton onClick={() => onLocaleChange("en")} isActive={locale === "en"}>
                      {tLocale("english")}
                    </PillActionButton>
                  </div>
                </div>
              </section>
            </div>
          </nav>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
