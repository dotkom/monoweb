import { server } from "@/utils/trpc/server"
import {
  CourseFilterQuerySchema,
  type Course,
  type CourseCampus,
  type Semester,
  type TeachingLanguage,
} from "@dotkomonline/grades-backend/course"
import { cn, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { createLoader, createSerializer } from "nuqs/server"
import { CourseAutocomplete } from "./components/course-autocomplete/CourseAutocomplete"
import { CourseRow } from "./components/CourseRow/CourseRow"
import { CourseFilterParsers } from "./emner/course-filter-parsers"

const MAX_COURSES_PER_SECTION = 5

const serialize = createSerializer(CourseFilterParsers)
const loadSearchParams = createLoader(CourseFilterParsers)

type FilterChip =
  | { label: string; key: "bySemester"; value: Semester }
  | { label: string; key: "byCampus"; value: CourseCampus }
  | { label: string; key: "byTeachingLanguage"; value: TeachingLanguage }

export default async function App({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const t = await getTranslations()
  const sp = await searchParams
  const parsed = loadSearchParams(sp)
  const filterQuery = CourseFilterQuerySchema.parse(parsed)

  const filterChips = [
    { label: t(`Enums.Semester.SPRING`), key: "bySemester", value: "SPRING" },
    { label: t(`Enums.Semester.AUTUMN`), key: "bySemester", value: "AUTUMN" },
    { label: t(`Enums.Campus.TRONDHEIM`), key: "byCampus", value: "TRONDHEIM" },
    { label: t(`Enums.Campus.GJOVIK`), key: "byCampus", value: "GJOVIK" },
    { label: t(`Enums.Campus.ALESUND`), key: "byCampus", value: "ALESUND" },
  ] satisfies ReadonlyArray<FilterChip>

  const month = getCurrentUTC().getMonth()

  // May-November is autumn, December-April is spring
  const activeSemester = month >= 4 && month <= 10 ? "AUTUMN" : "SPRING"

  const coursesToFetch = MAX_COURSES_PER_SECTION * 2

  const [activeSemesterCourses, largestCourses] = await Promise.all([
    server.course.findCourses.query({
      filter: {
        bySemester: [activeSemester],
        sortBy: ["CANDIDATE_COUNT"],
      },
      limit: coursesToFetch,
    }),
    server.course.findCourses.query({
      filter: {
        sortBy: ["CANDIDATE_COUNT"],
      },
      limit: coursesToFetch,
    }),
  ])

  // Dedupe courses so the sections don't show the same course twice
  const resolvedLargestCourses = largestCourses.items.slice(0, MAX_COURSES_PER_SECTION)
  const resolvedActiveSemesterCourses = activeSemesterCourses.items
    .filter((course) => !resolvedLargestCourses.some((c) => c.id === course.id))
    .slice(0, MAX_COURSES_PER_SECTION)

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <Title className="text-xl sm:text-2xl font-bold tracking-tight">{t("Frontpage.heading")}</Title>
        </div>

        <div className="flex flex-col gap-2.5 max-w-2xl">
          <CourseAutocomplete
            defaultValues={filterQuery}
            placeholder={t("Frontpage.searchPlaceholder")}
            className="w-full"
            inputClassName="h-11 text-base md:text-base!"
          />
          <div className="flex flex-row flex-wrap gap-2">
            {filterChips.map((chip) => {
              const href = `/emner${serialize({ [chip.key]: [chip.value] })}`

              return <FilterChipLink key={href} href={href} label={chip.label} />
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 sm:gap-10">
        <CourseSection
          courses={resolvedActiveSemesterCourses}
          title={t(`Frontpage.activeSemesterCoursesTitle.${activeSemester}`)}
          seeMoreHref={`/emner${serialize({ bySemester: [activeSemester] })}`}
        />
        <CourseSection
          courses={resolvedLargestCourses}
          title={t("Frontpage.largestCoursesTitle")}
          seeMoreHref={`/emner${serialize({ sortBy: ["CANDIDATE_COUNT"] })}`}
        />
      </div>
    </div>
  )
}

interface FilterChipLinkProps {
  href: string
  label: string
}

const FilterChipLink = ({ href, label }: FilterChipLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-lg border px-2 py-1 text-xs font-medium outline-none transition-colors sm:px-2.5 sm:py-1.5 sm:text-sm",
        "border-neutral-200 bg-white text-neutral-700",
        "hover:border-neutral-300 hover:bg-neutral-50",
        "focus-visible:border-neutral-400",
        "dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
        "dark:hover:border-stone-600 dark:hover:bg-stone-700",
        "dark:focus-visible:border-stone-500"
      )}
    >
      {label}
    </Link>
  )
}

interface CourseSectionProps {
  courses: Course[]
  title: string
  seeMoreHref: string
}

const CourseSection = async ({ courses, title, seeMoreHref }: CourseSectionProps) => {
  const t = await getTranslations()

  if (courses.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center gap-3">
        <Title element="h2" className="min-w-0 text-lg font-semibold">
          {title}
        </Title>
        <Link
          href={seeMoreHref}
          className="p-1 rounded-lg group flex shrink-0 whitespace-nowrap items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 focus:text-neutral-900 dark:text-stone-400 dark:hover:text-stone-200 dark:focus:text-stone-200 transition-colors"
        >
          {t("Frontpage.viewAll")}
          <IconArrowRight
            size={16}
            className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus:translate-x-1"
          />
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-stone-700 divide-y divide-neutral-200 dark:divide-stone-700 [&>a:first-child]:rounded-t-xl [&>a:last-child]:rounded-b-xl">
        {courses.map((course) => (
          <CourseRow key={course.id} course={course} />
        ))}
      </div>
    </section>
  )
}
