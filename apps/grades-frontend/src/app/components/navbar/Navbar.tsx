"use client"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
import { cn, Title } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname, useSearchParams, useSelectedLayoutSegments } from "next/navigation"
import { createLoader } from "nuqs"
import { CourseAutocomplete } from "../course-autocomplete/CourseAutocomplete"
import { LocalePopover } from "./LocalePopover"
import { MobileNavigation } from "./MobileNavigation"
import { ThemePopover } from "./ThemePopover"

const loadSearchParams = createLoader(CourseFilterParsers)

export const Navbar = () => {
  const searchParams = useSearchParams()
  const t = useTranslations("Navbar")
  const pathname = usePathname()

  const segments = useSelectedLayoutSegments()
  const isCourseListPageRoute = pathname === "/emner"
  const showCourseSearch = segments?.[0] === "emner" && segments?.[1] != null

  const parsed = loadSearchParams(searchParams)
  const filterQuery = CourseFilterQuerySchema.parse(parsed)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-neutral-200/80 dark:border-stone-700/80",
        "bg-white/85 dark:bg-stone-800/75 backdrop-blur-md"
      )}
    >
      <div className={cn("flex h-16 w-full items-center justify-between", "mx-auto max-w-7xl", "gap-6 px-4 lg:px-12")}>
        <div className="flex items-center gap-4 sm:gap-6 w-full min-w-0">
          <Link href="/" className={cn("group inline-flex items-center rounded-lg")}>
            <Title
              className={cn(
                "text-xl font-semibold sm:text-2xl",
                "bg-linear-to-r bg-clip-text text-transparent",
                "from-neutral-900 to-neutral-600 dark:from-white dark:to-stone-300",
                "hover:from-neutral-900 hover:to-neutral-800",
                "dark:hover:from-white dark:hover:to-stone-100"
              )}
            >
              Grades
            </Title>
          </Link>

          <Link
            href="/emner"
            className={cn(
              "relative hidden sm:inline-flex items-center rounded-lg px-2.5 pt-1.5 pb-2 font-medium",
              "text-neutral-800 dark:text-white",
              "hover:bg-neutral-100 dark:hover:bg-stone-700",
              isCourseListPageRoute
                ? "font-semibold"
                : "text-neutral-700 dark:text-stone-200 hover:text-neutral-900 dark:hover:text-white"
            )}
          >
            {t("courses")}
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute bottom-1 left-2.5 right-2.5 h-0.5 rounded-full",
                "transition-opacity",
                "bg-neutral-300/80 dark:bg-stone-600",
                isCourseListPageRoute ? "opacity-100" : "opacity-0"
              )}
            />
          </Link>

          {showCourseSearch && (
            <div className="min-w-0 flex-1 max-w-96">
              <CourseAutocomplete defaultValues={filterQuery} />
            </div>
          )}
        </div>

        <div className="items-center gap-3 hidden sm:flex">
          <LocalePopover />
          <ThemePopover />
        </div>

        <MobileNavigation />
      </div>
    </header>
  )
}
