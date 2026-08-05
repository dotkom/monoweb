import type { Course } from "@dotkomonline/grades-backend/course"
import { cn } from "@dotkomonline/ui"
import { CourseAutocompleteSuggestionItem } from "./CourseAutocompleteSuggestionItem"

interface Props {
  courses: Course[]
  className?: string
  onItemClick?: () => void
}

export const CourseAutocompleteSuggestions = ({ courses, className, onItemClick }: Props) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {courses.map((course, index) => (
        <CourseAutocompleteSuggestionItem
          key={course.id}
          course={course}
          onClick={onItemClick}
          // Last item sits on top of divider
          className={index === courses.length - 1 ? "rounded-b-none" : undefined}
        />
      ))}
    </div>
  )
}
