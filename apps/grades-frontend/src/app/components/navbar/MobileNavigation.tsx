"use client"

import type { Locale } from "@/i18n/locale"
import { setLocale } from "@/i18n/set-locale"
import {
  Button,
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

export const MobileNavigation = () => {
  const t = useTranslations("Navbar")
  const pathname = usePathname()
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

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
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="flex items-center">
          <IconMenu2 />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="sm:hidden w-[calc(100vw-2rem)] mx-4 mt-3 z-50 shadow-sm animate-none! border-neutral-200 p-4"
        >
          <nav className="max-h-[calc(100dvh-8rem)] overflow-y-auto">
            <div className="space-y-5">
              <section>
                <Link
                  href="/emner"
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 font-medium transition-colors gap-2",
                    pathname === "/emner"
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  {t("courses")}
                </Link>

                <DropdownMenuSeparator className="my-2 bg-gray-300 dark:bg-stone-700" />
              </section>

              <section className="flex flex-col gap-4 ml-3">
                <div className="flex flex-row gap-5">
                  <Text className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <IconPalette size={16} />
                    {t("theme")}
                  </Text>
                  <div className="flex flex-row gap-3">
                    <ToggleButton onClick={() => onThemeChange("light")} isActive={theme === "light"}>
                      <IconSun size={16} />
                    </ToggleButton>
                    <ToggleButton onClick={() => onThemeChange("dark")} isActive={theme === "dark"}>
                      <IconMoon size={16} />
                    </ToggleButton>
                    <ToggleButton onClick={() => onThemeChange("system")} isActive={theme === "system"}>
                      <IconDeviceMobile size={16} />
                    </ToggleButton>
                  </div>
                </div>
                <div className="flex flex-row gap-5">
                  <Text className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <IconWorld size={16} />
                    {t("language")}
                  </Text>
                  <div className="flex flex-row gap-3">
                    <ToggleButton onClick={() => onLocaleChange("no")} isActive={locale === "no"}>
                      {t("norwegian")}
                    </ToggleButton>
                    <ToggleButton onClick={() => onLocaleChange("en")} isActive={locale === "en"}>
                      {t("english")}
                    </ToggleButton>
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

interface ToggleButtonProps {
  isActive?: boolean
  onClick: () => void
  children: React.ReactNode
}

const ToggleButton = ({ isActive, onClick, children }: ToggleButtonProps) => {
  return (
    <Button
      variant="text"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:hover:bg-stone-600 hover:text-neutral-900",
        isActive && "font-medium bg-neutral-100"
      )}
    >
      <span className="flex items-center gap-2">{children}</span>
    </Button>
  )
}
