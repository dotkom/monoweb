import { server } from "@/utils/trpc/server"

export default async function App() {
  const courses = await server.course.findCourses.query()

  return <section className="flex flex-col gap-16 w-full">{courses.map((course) => course.name)}</section>
}
