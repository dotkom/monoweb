import {
  type Course,
  type CreditReductionDetail,
  type Department,
  type Faculty,
  getCourseLocalizedTextFields,
} from "@dotkomonline/grades-backend/course"
import { cn, RichText, Title } from "@dotkomonline/ui"
import { useLocale, useTranslations } from "next-intl"
import { CreditReductionsCard } from "../CreditReductionsCard"
import { CourseAboutMeta } from "./CourseAboutMeta"

type TextSection = { title: string; text: string }

interface Props {
  course: Course
  faculty: Faculty | null
  department: Department | null
  creditReductions: CreditReductionDetail[]
}

export const CourseAbout = ({ course, faculty, department, creditReductions }: Props) => {
  const locale = useLocale()
  const t = useTranslations()
  const { content, learningOutcomes, teachingMethods } = getCourseLocalizedTextFields(course, locale)

  const textSections: TextSection[] = [
    { title: t("CoursePage.CourseAbout.content"), text: content },
    { title: t("CoursePage.CourseAbout.learningOutcomes"), text: learningOutcomes },
    { title: t("CoursePage.CourseAbout.teachingMethods"), text: teachingMethods },
  ].filter((section): section is TextSection => section.text != null)

  const hasProse = textSections.length > 0
  const hasCreditReductions = creditReductions.length > 0

  return (
    <section className="flex flex-col gap-8">
      <Title element="h2" className="font-semibold text-2xl text-neutral-950 dark:text-stone-200">
        {t("CoursePage.CourseAbout.title")}
      </Title>

      {hasProse ? (
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col gap-8 lg:gap-10">
            {textSections.map((section) => (
              <TextSection key={section.title} title={section.title} text={section.text} />
            ))}
          </div>
          <div className="flex flex-col gap-6 lg:max-w-96">
            <CourseAboutMeta course={course} faculty={faculty} department={department} variant="sidebar" />
            {hasCreditReductions && <CreditReductionsCard creditReductions={creditReductions} course={course} />}
          </div>
        </div>
      ) : (
        <div className={cn("grid gap-6", hasCreditReductions ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
          <CourseAboutMeta
            course={course}
            faculty={faculty}
            department={department}
            variant={hasCreditReductions ? "grid" : "full"}
          />
          {hasCreditReductions && <CreditReductionsCard creditReductions={creditReductions} course={course} />}
        </div>
      )}
    </section>
  )
}

type TextSectionProps = {
  title: string
  text: string
}

const TextSection = ({ title, text }: TextSectionProps) => {
  return (
    <section className="flex flex-col gap-3">
      <Title element="h3" className="font-semibold text-neutral-950 dark:text-stone-200 text-lg">
        {title}
      </Title>
      <RichText content={text} className="text-neutral-700 dark:text-stone-300 text-pretty max-w-none" />
    </section>
  )
}
