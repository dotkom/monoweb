import {
  type Course,
  type Department,
  type Faculty,
  getCourseLocalizedTextFields,
  pickLocalized,
} from "@dotkomonline/grades-backend/course"
import { cn, Text } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { useFormatter, useLocale, useTranslations } from "next-intl"

type Variant = "sidebar" | "grid" | "full"

interface Props {
  course: Course
  faculty: Faculty | null
  department: Department | null
  variant?: Variant
  className?: string
}

export const CourseAboutMeta = ({ course, faculty, department, variant = "sidebar", className }: Props) => {
  const locale = useLocale()
  const t = useTranslations()
  const format = useFormatter()
  const { examType } = getCourseLocalizedTextFields(course, locale)

  const localizedFacultyName = pickLocalized(locale, faculty?.nameNo ?? null, faculty?.nameEn ?? null)
  const localizedDepartmentName = pickLocalized(locale, department?.nameNo ?? null, department?.nameEn ?? null)

  const topItems: MetaRowItemProps[] = [
    { label: t("CoursePage.CourseAbout.Meta.studyLevel"), value: t(`Enums.StudyLevel.${course.studyLevel}`) },
    { label: t("CoursePage.CourseAbout.Meta.examType"), value: examType },
    {
      label: t("CoursePage.CourseAbout.Meta.faculty"),
      value: localizedFacultyName,
    },
    {
      label: t("CoursePage.CourseAbout.Meta.department"),
      value: localizedDepartmentName,
    },
  ].filter((item): item is MetaRowItemProps => item.value != null)

  const bottomItems: MetaRowItemProps[] = [
    { label: t("CoursePage.CourseAbout.Meta.taughtSince"), value: String(course.firstYearTaught) },
    { label: t("CoursePage.CourseAbout.Meta.candidateCount"), value: format.number(course.candidateCount) },
    {
      label: t("CoursePage.CourseAbout.Meta.dataLastUpdated"),
      value: format.dateTime(course.updatedAt, { dateStyle: "long" }),
    },
  ]

  const allItems = [...topItems, ...bottomItems]

  return (
    <aside
      className={cn(
        "h-fit rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-stone-700 dark:bg-stone-800 sm:p-6",
        variant === "sidebar" && "lg:max-w-96",
        className
      )}
    >
      {variant === "full" ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {allItems.map((item) => (
            <MetaRowItem key={item.label} label={item.label} value={item.value} />
          ))}
        </dl>
      ) : (
        <div className="flex flex-col gap-5">
          <dl className="flex flex-col gap-4">
            {topItems.map((item) => (
              <MetaRowItem key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>

          <Separator />

          <dl className="flex flex-col gap-4">
            {bottomItems.map((item) => (
              <MetaRowItem key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        </div>
      )}
    </aside>
  )
}

type MetaRowItemProps = {
  label: string
  value: string
}

const MetaRowItem = ({ label, value }: MetaRowItemProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Text element="dt" className="text-[13px] text-neutral-500 dark:text-stone-400">
        {label}
      </Text>
      <Text element="dd" className="text-[13px] text-neutral-900 dark:text-stone-200">
        {value}
      </Text>
    </div>
  )
}
