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
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const sync = () => {
      setIsDesktop(mediaQuery.matches)
      if (!mediaQuery.matches) {
        setIsDrawerOpen(false)
      }
    }
    sync()
    mediaQuery.addEventListener("change", sync)
    return () => mediaQuery.removeEventListener("change", sync)
  }, [])

  if (isDesktop === null) {
    return null
  }

  return isDesktop ? (
    <DesktopCourseFilters defaultValues={defaultValues} />
  ) : (
    <MobileCourseFilters defaultValues={defaultValues} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
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
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} modal={false}>
          <DrawerTrigger asChild className="border-none">
            <IconActionButton surface="glass" aria-label={t("CourseFilters.openAriaLabel")} className="ml-auto">
              <IconFilter2 className="size-5" stroke={1.8} />
            </IconActionButton>
          </DrawerTrigger>
          <DrawerContent handleClassName="dark:bg-stone-500" className="dark:bg-stone-800">
            <DrawerHeader className="pt-0">
              <div className="flex items-center justify-between gap-4">
                <DrawerTitle>{t("CourseFilters.drawerTitle")}</DrawerTitle>
                <DrawerClose asChild>
                  <IconActionButton aria-label={t("CourseFilters.closeAriaLabel")}>
                    <IconX className="size-5" stroke={1.8} />
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
