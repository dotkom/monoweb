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
          <Link
            href="/"
            className="group inline-flex items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/20 py-0.5 px-2 -ml-2"
          >
            <Title
              element="span"
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
              "hidden sm:inline-flex items-center rounded-lg px-2.5 py-1.5 font-medium transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
              isCourseListPageRoute
                ? "bg-neutral-100 text-neutral-900 dark:bg-stone-700 dark:text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-white"
            )}
          >
            {t("courses")}
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
