import { env } from "@/env"
import { getPathname, redirect } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"
import { routing } from "@/i18n/routing"
import { server } from "@/utils/trpc/server"
import { getCourseLocalizedTextFields, type Course, type CourseAlias } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { toAbsoluteUrl } from "@dotkomonline/utils"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getFormatter, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { cache } from "react"
import { ComparisonSelect } from "./components/ComparisonSelect"
import { CourseAbout } from "./components/CourseAbout/CourseAbout"
import { CourseBarChartCard } from "./components/CourseBarChart/CourseBarChartCard"
import { CourseKpiCard } from "./components/CourseKpiCard/CourseKpiCard"
import { CourseLineChartCard } from "./components/CourseLineChart/CourseLineChartCard"
import { CourseNoGradesState } from "./components/CourseNoGradesState"
import { SemesterTabs } from "./components/SemesterTabs"
import { buildCourseMetaItems } from "./utils"

// Cache course data to avoid re-fetching for CoursePage and generateMetadata
const getCourse = cache(async (code: string) => {
  return server.course.findCourse.query(code)
})

interface CoursePageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id: rawParamId, locale: rawLocale } = await params
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale
  const courseId = decodeURIComponent(rawParamId)

  const courseDetail = await getCourse(courseId)

  if (courseDetail === null) {
    notFound()
  }

  const { faculty, department, gradeDistributions, creditReductions, ...course } = courseDetail

  if (courseId !== course.code) {
    redirect({ href: `/emner/${encodeURIComponent(course.code)}`, locale })
  }

  const showLetterLineChart = course.gradeType !== "PASS_FAIL"

  const courseHasGradeData = course.candidateCount > 0

  return (
    <div className="flex flex-col gap-10">
      <Hero course={course} locale={locale} aliases={course.aliases} />
      <div className="flex flex-col gap-4">
        {courseHasGradeData ? (
          <>
            <div className="flex flex-row items-center gap-2 sm:gap-3">
              <div className="min-w-0 flex-1 overflow-hidden">
                <SemesterTabs gradeDistributions={gradeDistributions} />
              </div>
              <div className="shrink-0">
                <ComparisonSelect gradeDistributions={gradeDistributions} />
              </div>
            </div>
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CourseKpiCard gradeDistributions={gradeDistributions} />
                <CourseBarChartCard gradeDistributions={gradeDistributions} />

                {showLetterLineChart && <CourseLineChartCard gradeDistributions={gradeDistributions} mode="LETTER" />}
                <CourseLineChartCard
                  gradeDistributions={gradeDistributions}
                  mode="PASS_FAIL"
                  className={cn(!showLetterLineChart && "lg:col-span-2")}
                />
              </div>

              <Separator />
              <CourseAbout
                course={course}
                faculty={faculty}
                department={department}
                creditReductions={creditReductions}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <CourseNoGradesState />

            <Separator />
            <CourseAbout
              course={course}
              faculty={faculty}
              department={department}
              creditReductions={creditReductions}
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface HeroProps {
  course: Course
  locale: Locale
  aliases: CourseAlias[]
}

const Hero = async ({ course, locale, aliases }: HeroProps) => {
  const t = await getTranslations()
  const format = await getFormatter({ locale })

  const metaItems = buildCourseMetaItems(course, t, format)
  const alias = aliases.find((alias) => alias.useForSEO)?.alias

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Title element="p" className="font-medium text-base text-neutral-600 dark:text-stone-300">
          {course.code}
          {alias && <span className="text-sm font-normal text-neutral-500 dark:text-stone-400">{` (${alias})`}</span>}
        </Title>
        <Title element="h1" className="text-xl font-bold sm:text-2xl lg:text-3xl">
          {getCourseLocalizedTextFields(course, locale).name}
        </Title>
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {metaItems.map((item, index) => (
          <div key={item} className="flex shrink-0 items-center gap-x-2.5 whitespace-nowrap">
            {index > 0 && <span className="size-1 rounded-full bg-neutral-400 dark:bg-stone-500" aria-hidden />}
            <Text className="text-sm text-neutral-600 dark:text-stone-300">{item}</Text>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}): Promise<Metadata> {
  const { id: rawParamId, locale: rawLocale } = await params
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale
  const id = decodeURIComponent(rawParamId)
  const t = await getTranslations("Metadata.coursePage")

  const course = await getCourse(id)

  if (!course) {
    return {
      title: t("notFound.title"),
      description: t("notFound.description"),
      robots: {
        index: false,
      },
    }
  }

  const localizedTextFields = getCourseLocalizedTextFields(course, locale)
  const alias = course.aliases.find((alias) => alias.useForSEO)?.alias

  const title = t("title", {
    courseCode: course.code,
    courseName: localizedTextFields.name,
    aliasSuffix: alias ? ` (${alias})` : "",
  })
  const description = t("description", {
    courseCode: course.code,
    courseName: localizedTextFields.name,
  })

  const encodedCode = encodeURIComponent(course.code)

  const noPath = getPathname({ href: `/emner/${encodedCode}`, locale: "no" })
  const enPath = getPathname({ href: `/emner/${encodedCode}`, locale: "en" })
  const canonicalPath = getPathname({ href: `/emner/${encodedCode}`, locale })
  const canonical = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, canonicalPath)
  const noUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, noPath)
  const enUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, enPath)

  const includeEn = course.nameEn !== null

  return {
    title,
    description,
    alternates: {
      canonical: canonical,
      languages: { no: noUrl, ...(includeEn && { en: enUrl }), "x-default": noUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Grades.no",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}
