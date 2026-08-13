import { env } from "@/env"
import type { Locale } from "@/i18n/locale"
import { server } from "@/utils/trpc/server"
import { getCourseLocalizedTextFields, type Course } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import type { Metadata } from "next"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"
import { ComparisonSelect } from "./components/ComparisonSelect"
import { CourseAbout } from "./components/CourseAbout/CourseAbout"
import { CourseBarChartCard } from "./components/CourseBarChart/CourseBarChartCard"
import { CourseKpiCard } from "./components/CourseKpiCard/CourseKpiCard"
import { CourseLineChartCard } from "./components/CourseLineChart/CourseLineChartCard"
import { CourseNoGradesState } from "./components/CourseNoGradesState"
import { SemesterTabs } from "./components/SemesterTabs"
import { buildCourseMetaItems } from "./utils"

import { createAbsoluteCoursePageUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"
import { CourseNotFound } from "./components/CourseNotFound"

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const locale = await getLocale()

  const { id: rawParamId } = await params
  const courseId = decodeURIComponent(rawParamId)

  const courseDetail = await server.course.findCourse.query(courseId)

  if (courseDetail === null) {
    return <CourseNotFound />
  }

  const { faculty, department, gradeDistributions, ...course } = courseDetail

  if (courseId !== course.code) {
    redirect(`/emner/${course.code}`)
  }

  const showLetterLineChart = course.gradeType !== "PASS_FAIL"

  const courseHasGradeData = course.candidateCount > 0
  const courseHasAboutData =
    course.contentNo !== null ||
    course.contentEn !== null ||
    course.teachingMethodsNo !== null ||
    course.teachingMethodsEn !== null ||
    course.learningOutcomesNo !== null ||
    course.learningOutcomesEn !== null

  return (
    <div className="flex flex-col gap-10">
      <Hero course={course} locale={locale} />
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

              {courseHasAboutData && (
                <>
                  <Separator />
                  <CourseAbout course={course} faculty={faculty} department={department} />
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            <CourseNoGradesState />

            {courseHasAboutData && (
              <>
                <Separator />
                <CourseAbout course={course} faculty={faculty} department={department} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const Hero = async ({ course, locale }: { course: Course; locale: Locale }) => {
  const t = await getTranslations()
  const format = await getFormatter({ locale })

  const metaItems = buildCourseMetaItems(course, t, format)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Title element="p" className="font-medium text-base text-neutral-600 dark:text-stone-300">
          {course.code}
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

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { id: rawParamId } = await params
  const id = decodeURIComponent(rawParamId)
  const t = await getTranslations("Metadata.coursePage")
  const locale = await getLocale()

  const course = await server.course.findCourse.query(id)

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

  const title = t("title", {
    courseCode: course.code,
    courseName: localizedTextFields.name,
  })
  const description = t("description", {
    courseCode: course.code,
    courseName: localizedTextFields.name,
  })
  const url = createAbsoluteCoursePageUrl(env.NEXT_PUBLIC_ORIGIN, course.code)

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Grades.no",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}
