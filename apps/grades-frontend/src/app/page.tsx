import { server } from "@/utils/trpc/server"

export default async function App() {
  const courses = await server.course.findCourses.query()
  const grades = await server.grade.findGrades.query(courses[0].id)

  return (
    <div>
      <section className="flex flex-col gap-16 w-full">{courses.map((course) => course.norwegianName)}</section>
      <section className="flex flex-col gap-16 w-full">{grades.map((grade) => grade.averageGrade)}</section>
    </div>
  )
}
