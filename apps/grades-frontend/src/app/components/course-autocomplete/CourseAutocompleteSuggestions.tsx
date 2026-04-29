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
      {courses.map((course) => (
        <CourseAutocompleteSuggestionItem key={course.id} course={course} onClick={onItemClick} />
      ))}
    </div>
  )
}
