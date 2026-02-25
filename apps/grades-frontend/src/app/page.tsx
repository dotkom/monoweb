import { server } from "@/utils/trpc/server"

export default async function App() {
  const courses = await server.course.findCourses.query({ byCode: "TDT" })
  const grades = courses.length > 0 ? await server.grade.findGrades.query(courses[0].code) : []

  return (
    <div>
      <section className="flex flex-col gap-16 w-full">{courses.map((course) => course.norwegianName)}</section>
      <section className="flex flex-col gap-2 w-full">
        {grades.map((grade) => (
          <span key={grade.id}>{grade.averageGrade}</span>
        ))}
      </section>
    </div>
  )
}
