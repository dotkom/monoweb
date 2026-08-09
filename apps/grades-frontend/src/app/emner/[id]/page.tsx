import type { Locale } from "@/i18n/locale"
import { server } from "@/utils/trpc/server"
import { getCourseLocalizedTextFields, type Course } from "@dotkomonline/grades-backend/course"
import { cn, Text, Title } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { getLocale, getTranslations } from "next-intl/server"
import { Fragment } from "react"
import { CourseAbout } from "./components/CourseAbout/CourseAbout"
import { CourseBarChartCard } from "./components/CourseBarChart/CourseBarChartCard"
import { CourseKpiCard } from "./components/CourseKpiCard/CourseKpiCard"
import { CourseLineChartCard } from "./components/CourseLineChart/CourseLineChartCard"
import { SemesterTabs } from "./components/SemesterTabs"

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const locale = await getLocale()

  const { id: rawParamId } = await params
  const courseId = decodeURIComponent(rawParamId)

  const [course, faculties, departments, gradeDistributions] = await Promise.all([
    server.course.findCourse.query(courseId),
    server.course.findFaculties.query(),
    server.course.findDepartments.query(),
    server.gradeDistribution.findGradeDistributions.query(courseId),
  ])

  const showLetterLineChart = course.gradeType !== "PASS_FAIL"

  return (
    <div className="flex flex-col gap-10">
      <Hero course={course} locale={locale} />
      <div className="flex flex-col gap-4">
        <SemesterTabs gradeDistributions={gradeDistributions} />
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourseKpiCard gradeDistributions={gradeDistributions} showLetter={showLetterLineChart} />
            <CourseBarChartCard gradeDistributions={gradeDistributions} />

            {showLetterLineChart && <CourseLineChartCard gradeDistributions={gradeDistributions} mode="LETTER" />}
            <CourseLineChartCard
              gradeDistributions={gradeDistributions}
              mode="PASS_FAIL"
              className={cn(!showLetterLineChart && "lg:col-span-2")}
            />
          </div>

          <Separator />

          <CourseAbout course={course} faculties={faculties} departments={departments} />
        </div>
      </div>
    </div>
  )
}

const Hero = async ({ course, locale }: { course: Course; locale: Locale }) => {
  const t = await getTranslations()
  const items = [
    course.credits && t("CoursePage.hero.credits", { credits: course.credits }),
    course.taughtSemesters.map((semester) => t(`Enums.Semester.${semester}`)).join(", "),
    course.teachingLanguages.map((language) => t(`Enums.TeachingLanguage.${language}`)).join(", "),
    course.campuses.map((campus) => t(`Enums.Campus.${campus}`)).join(", "),
  ].filter(Boolean)

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Title element="h2" className="font-medium text-base text-neutral-600 dark:text-stone-300">
          {course.code}
        </Title>
        <Title element="h1" className="text-3xl font-bold">
          {getCourseLocalizedTextFields(course, locale).name}
        </Title>
      </div>

      <div className="flex flex-row gap-2.5 items-center">
        {items.map((item, index) => (
          <Fragment key={item}>
            <Text className="text-sm text-neutral-600 dark:text-stone-300">{item}</Text>
            {index < items.length - 1 && (
              <span className="size-1 shrink-0 rounded-full bg-neutral-400 dark:bg-stone-500" aria-hidden />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
