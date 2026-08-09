"use client"

import { IconActionButton } from "@/app/components/action-button/ActionButton"
import { Button, Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@dotkomonline/ui"
import { IconFilter2, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { CourseFiltersForm } from "./CourseFiltersForm"

export const MobileCourseFilters = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const t = useTranslations("CourseFilters")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const onChange = () => {
      if (mediaQuery.matches) {
        setIsDrawerOpen(false)
      }
    }
    onChange()
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  return (
    <div className="md:hidden shrink-0">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} modal={true}>
        <DrawerTrigger asChild>
          <Button
            variant="unstyled"
            aria-label={t("openAriaLabel")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 shadow-none transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:border-neutral-400 focus-visible:ring-0 focus-visible:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-stone-600 dark:hover:bg-stone-700"
          >
            {t("filterButton")}
            <IconFilter2 className="size-4" stroke={1.8} />
          </Button>
        </DrawerTrigger>
        <DrawerContent handleClassName="dark:bg-stone-500" className="dark:bg-stone-800">
          <DrawerHeader className="pt-0">
            <div className="flex items-center justify-between gap-4">
              <DrawerTitle>{t("drawerTitle")}</DrawerTitle>
              <DrawerClose asChild>
                <IconActionButton aria-label={t("closeAriaLabel")}>
                  <IconX className="size-5" stroke={1.8} />
                </IconActionButton>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <section className="px-4 pb-6 overflow-y-auto">
            <CourseFiltersForm idPrefix="mobile" showSort />
          </section>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
