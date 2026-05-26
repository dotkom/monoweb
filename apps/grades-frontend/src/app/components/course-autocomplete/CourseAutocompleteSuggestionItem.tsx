import { getCourseName, type Course } from "@dotkomonline/grades-backend/course"
import { Button, Text, Title } from "@dotkomonline/ui"
import { useLocale } from "next-intl"
import Link from "next/link"

interface Props {
  course: Course
  onClick?: () => void
}

export const CourseAutocompleteSuggestionItem = ({ course, onClick }: Props) => {
  const locale = useLocale()

  return (
    <Button
      element={Link}
      href={`/emner/${course.code}`}
      className="rounded-lg p-2 items-start flex flex-col gap-1 transition-colors hover:bg-neutral-50 dark:hover:bg-stone-600 focus:bg-neutral-50 dark:focus:bg-stone-600 group outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-stone-500 ring-inset"
      variant="ghost"
      onClick={onClick}
    >
      <Title className="text-sm font-medium text-neutral-900 dark:text-stone-300 group-hover:text-black dark:group-hover:text-stone-200">
        {getCourseName(course, locale)}
      </Title>
      <Text className="text-xs text-neutral-500 dark:text-stone-400 font-medium">{course.code}</Text>
    </Button>
  )
}
