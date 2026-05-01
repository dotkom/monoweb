"use client"

import { useEffect, useState } from "react"

import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@dotkomonline/ui"
import { IconFilter2, IconX } from "@tabler/icons-react"
import { useTranslations } from "next-intl"

import { IconActionButton } from "../../components/action-button/ActionButton"
import { CourseFiltersCard } from "./CourseFiltersCard"
import { CourseFiltersForm } from "./CourseFiltersForm"

type Props = {
  defaultValues: CourseFilterQuery
}

export function CourseFilters({ defaultValues }: Props) {
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
      <MobileCourseFilters
        defaultValues={defaultValues}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
      />
      <DesktopCourseFilters defaultValues={defaultValues} />
    </>
  )
}

type MobileProps = {
  defaultValues: CourseFilterQuery
  isDrawerOpen: boolean
  setIsDrawerOpen: (open: boolean) => void
}

const MobileCourseFilters = ({ defaultValues, isDrawerOpen, setIsDrawerOpen }: MobileProps) => {
  const t = useTranslations()

  return (
    <div className="md:hidden">
      <div className="w-full py-3 flex items-center gap-3">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <IconActionButton surface="glass" aria-label={t("CourseFilters.openAriaLabel")} className="ml-auto">
              <IconFilter2 size={20} stroke={1.8} />
            </IconActionButton>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <div className="flex items-center justify-between gap-4">
                <DrawerTitle>{t("CourseFilters.drawerTitle")}</DrawerTitle>
                <DrawerClose asChild>
                  <IconActionButton aria-label={t("CourseFilters.closeAriaLabel")}>
                    <IconX size={20} stroke={1.8} />
                  </IconActionButton>
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
  )
}

const DesktopCourseFilters = ({ defaultValues }: Pick<Props, "defaultValues">) => {
  return (
    <div className="hidden md:block md:w-64 md:shrink-0">
      <CourseFiltersCard defaultValues={defaultValues} />
    </div>
  )
}
