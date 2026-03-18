import { server } from "@/utils/trpc/server"
import { CourseCard } from "./components/CourseCard"

export default async function App() {
  // Placeholder filter
  // TODO: Replace with actual user input filtering
  const courses = await server.course.findCourses.query({
    filter: {
      sortBy: ["STUDENT_COUNT"],
      orderBy: "desc",
    },
  })
  const grades = courses.length > 0 ? await server.grade.findGrades.query(courses[0].code) : []

  return (
    <div>
      <section className="flex flex-col gap-16 w-full">
        {courses.map((course) => (
          <CourseCard key={course.code} course={course} />
        ))}
      </section>
    </div>
  )
}
