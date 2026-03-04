import {
  type Course,
  mapAverageGradeToLetterGrade,
  mapCourseCampusToLabel,
  mapCourseSemesterToLabel,
} from "@dotkomonline/grades-backend/course"
import { Badge, cn, Text, Title } from "@dotkomonline/ui"

interface Props {
  course: Course
}

export const CourseCard = ({ course }: Props) => {
  const isActive = !course.lastYearTaught

  return (
    <div className={cn("bg-white rounded-lg shadow-md p-4 max-w-3xl grid grid-cols-[1fr_auto]")}>
      <div>
        <Title className="text-xl font-bold font-sans">{course.norwegianName}</Title>
        <Text className="text-gray-600">{course.code}</Text>

        <div className="mt-4 flex flex-row gap-4">
          <div className="flex flex-row gap-2">
            {course.campuses.map((campus) => (
              <Badge key={campus} className="text-sm" color="slate" variant="light">
                {mapCourseCampusToLabel(campus)}
              </Badge>
            ))}
          </div>
          <div className="flex flex-row gap-2">
            {course.taughtSemesters.map((semester) => (
              <Badge key={semester} className="text-sm" color="blue" variant="light">
                {mapCourseSemesterToLabel(semester)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {isActive ? (
          <Badge color="green" variant="light">
            Undervises
          </Badge>
        ) : (
          <Badge color="slate" variant="light">
            Sist undervist {course.lastYearTaught}
          </Badge>
        )}
        <Text className="mt-2 text-2xl font-semibold">
          {course.gradeType === "LETTER"
            ? `${mapAverageGradeToLetterGrade(course.averageGrade)}`
            : `${Math.round(course.passRate)}%`}
        </Text>
      </div>
    </div>
  )
}
