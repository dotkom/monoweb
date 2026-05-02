"use client"

import { useEffect, useState } from "react"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Button, Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@dotkomonline/ui"
import { IconFilter2, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { CourseFiltersCard } from "./CourseFiltersCard"
import { CourseFiltersForm } from "./CourseFiltersForm"

type Props = {
  defaultValues: CourseFilterQuery
}

export function CourseFilters({ defaultValues }: Props) {
  const t = useTranslations()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsDrawerOpen(false)
      }
    }

    if (mediaQuery.matches) {
      setIsDrawerOpen(false)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-stone-900/80 backdrop-blur border-b border-gray-200 dark:border-stone-800">
        <div className="w-full py-3 flex items-center gap-3">
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="md" aria-label="Open filters" className="p-2 ml-auto">
                <IconFilter2 size={20} />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center justify-between gap-4">
                  <DrawerTitle>{t("CourseFilters.drawerTitle")}</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="text" size="md" aria-label="Close filters">
                      <IconX size={20} />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <section className="px-4 pb-6 overflow-y-auto">
                <CourseFiltersForm defaultValues={defaultValues} />
              </section>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <section className="hidden md:block md:w-64 md:shrink-0">
        <CourseFiltersCard defaultValues={defaultValues} />
      </section>
    </>
  )
}
