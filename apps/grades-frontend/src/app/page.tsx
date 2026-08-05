import { server } from "@/utils/trpc/server"
import {
  CourseFilterQuerySchema,
  type Course,
  type CourseCampus,
  type Semester,
  type TeachingLanguage,
} from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { createLoader, createSerializer } from "nuqs/server"
import { CourseAutocomplete } from "./components/course-autocomplete/CourseAutocomplete"
import { CourseCard } from "./components/CourseCard/CourseCard"
import { CourseFilterParsers } from "./emner/course-filter-parsers"

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

  const [activeSemesterCourses, largestCourses] = await Promise.all([
    server.course.findCourses.query({
      filter: {
        bySemester: [activeSemester],
        sortBy: ["CANDIDATE_COUNT"],
      },
      limit: 3,
    }),
    server.course.findCourses.query({
      filter: {
        sortBy: ["CANDIDATE_COUNT"],
      },
      limit: 3,
    }),
  ])

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <Title className="text-3xl font-bold">Grades</Title>
          <Text className="text-base text-neutral-500 dark:text-stone-400">{t("Frontpage.subheading")}</Text>
        </div>
        <div className="flex flex-col gap-2.5">
          <CourseAutocomplete
            defaultValues={filterQuery}
            placeholder={t("Frontpage.searchPlaceholder")}
            className="max-w-xl"
          />
          <div className="flex flex-row gap-2.5 overflow-x-auto">
            {filterChips.map((chip) => {
              const href = `/emner${serialize({ [chip.key]: [chip.value] })}`

              return <FilterChipLink key={href} href={href} label={chip.label} />
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10">
        <CardSection
          courses={activeSemesterCourses.items}
          title={t(`Frontpage.activeSemesterCoursesTitle.${activeSemester}`)}
          seeMoreHref={`/emner${serialize({ bySemester: [activeSemester] })}`}
        />
        <CardSection
          courses={largestCourses.items}
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
        "shrink-0 rounded-md border px-2 py-1 text-xs font-medium outline-none transition-colors",
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

interface CardSectionProps {
  courses: Course[]
  title: string
  seeMoreHref: string
}

const CardSection = async ({ courses, title, seeMoreHref }: CardSectionProps) => {
  const t = await getTranslations()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row justify-between items-center gap-3">
        <Title element="h2" className="min-w-0 text-lg font-semibold">
          {title}
        </Title>
        <Link
          href={seeMoreHref}
          className="group flex shrink-0 whitespace-nowrap items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
        >
          {t("Frontpage.viewAll")}
          <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {courses.map((course) => (
          <div key={course.id} className="min-w-sm flex-1 basis-0 self-stretch">
            <CourseCard course={course} className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
