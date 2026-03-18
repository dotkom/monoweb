import { server } from "@/utils/trpc/server"
import { CourseCard } from "./components/CourseCard"

export default async function App() {
  const courses = await server.course.findCourses.query()
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
