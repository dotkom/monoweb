import {
  type Course,
  type Department,
  type Faculty,
  getCourseLocalizedTextFields,
  pickLocalized,
} from "@dotkomonline/grades-backend/course"
import { Text } from "@dotkomonline/ui"
import { Separator } from "@dotkomonline/ui/components/separator"
import { useFormatter, useLocale, useTranslations } from "next-intl"

interface Props {
  course: Course
  faculties: Faculty[]
  departments: Department[]
}

export const CourseAboutMeta = ({ course, faculties, departments }: Props) => {
  const locale = useLocale()
  const t = useTranslations()
  const format = useFormatter()
  const { examType } = getCourseLocalizedTextFields(course, locale)

  const faculty = faculties.find((f) => f.id === course.facultyId)
  const department = departments.find((d) => d.id === course.departmentId)

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
    { label: t("CoursePage.CourseAbout.Meta.taughtSince"), value: course.firstYearTaught },
    { label: t("CoursePage.CourseAbout.Meta.candidateCount"), value: format.number(course.candidateCount) },
    {
      label: t("CoursePage.CourseAbout.Meta.dataLastUpdated"),
      value: format.dateTime(course.updatedAt, { dateStyle: "long" }),
    },
  ].filter((item): item is MetaRowItemProps => item.value != null)

  return (
    <aside className="p-4 sm:p-6 h-fit rounded-lg bg-neutral-50 border border-neutral-200 dark:bg-stone-800 dark:border-stone-700 lg:max-w-96">
      <dl className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          {topItems.map((item) => (
            <MetaRowItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4">
          {bottomItems.map((item) => (
            <MetaRowItem key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </dl>
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
      <Text element="dt" className="text-neutral-500 dark:text-stone-400 text-[13px]">
        {label}
      </Text>
      <Text element="dd" className="text-neutral-900 dark:text-stone-200 text-[13px]">
        {value}
      </Text>
    </div>
  )
}
