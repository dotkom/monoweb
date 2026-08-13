import { type CourseListItem, getCourseLocalizedName } from "@dotkomonline/grades-backend/course"
import { Button, cn, Text, Title } from "@dotkomonline/ui"
import { useLocale } from "next-intl"
import Link from "next/link"

interface Props {
  course: CourseListItem
  onClick?: () => void
  className?: string
}

export const CourseAutocompleteSuggestionItem = ({ course, onClick, className }: Props) => {
  const locale = useLocale()

  return (
    <Button
      element={Link}
      href={`/emner/${course.code}`}
      className={cn(
        "h-auto rounded-lg p-2 items-start flex flex-col gap-1 transition-colors hover:bg-neutral-100 dark:hover:bg-stone-700 focus:bg-neutral-100 dark:focus:bg-stone-700 group outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-stone-500 ring-inset border-none",
        className
      )}
      variant="ghost"
      onClick={onClick}
    >
      <Title
        element="span"
        className="text-sm font-medium text-neutral-900 dark:text-stone-300 group-hover:text-black dark:group-hover:text-stone-200 text-wrap"
      >
        {getCourseLocalizedName(course, locale)}
      </Title>
      <Text className="text-xs text-neutral-500 dark:text-stone-400 font-medium">{course.code}</Text>
    </Button>
  )
}
