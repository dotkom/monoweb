import { server } from "@/utils/trpc/server"
import { getTranslations } from "next-intl/server"
import { CourseCard } from "./components/CourseCard"
import { Title } from "@dotkomonline/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@dotkomonline/ui"
import { TextInput } from "@dotkomonline/ui"
import { IconSearch } from "@tabler/icons-react"

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

  const t = await getTranslations("HomePage")

  return (
    <div>
      <div className="max-w-3xl space-y-4 p-3">
        <Title order={3} className="text-base font-semibold text-black">
          Søk etter emner
        </Title>
        <div className="relative">
          <IconSearch
            className="w-8 h-full pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-gray-500 dark:text-stone-400"
            stroke={5}
          />
          <TextInput
            placeholder="Søk etter navn eller emnekode..."
            className="pl-10 rounded-lg w-full h-11.5 dark:border-none text-base sm:text-sm"
          />
        </div>
        <Tabs className="w-full">
          <TabsList className="inline-flex h-auto items-center gap-2 bg-transparent p-0 shadow-none border-0">
            <TabsTrigger
              value="spring"
              className="rounded-lg px-2 py-0.5 text-base font-semibold bg-[#F5F5F5] text-black hover:bg-black  hover:text-white  rdx-state-active:bg-black  rdx-state-active:text-white"
            >
              Vår
            </TabsTrigger>
            <TabsTrigger
              value="fall"
              className="rounded-lg px-2 py-0.5 text-base font-semibold bg-[#F5F5F5] text-black hover:bg-black  hover:text-white  rdx-state-active:bg-black  rdx-state-active:text-white"
            >
              Høst
            </TabsTrigger>
            <TabsTrigger
              value="trondheim"
              className="rounded-lg px-2 py-0.5 text-base font-semibold bg-[#F5F5F5] text-black hover:bg-black  hover:text-white  rdx-state-active:bg-black  rdx-state-active:text-white"
            >
              Trondheim
            </TabsTrigger>
            <TabsTrigger
              value="gjovik"
              className="rounded-lg px-2 py-0.5 text-base font-semibold bg-[#F5F5F5] text-black hover:bg-black  hover:text-white  rdx-state-active:bg-black  rdx-state-active:text-white"
            >
              Gjøvik
            </TabsTrigger>
            <TabsTrigger
              value="alesund"
              className="rounded-lg px-2 py-0.5 text-base font-semibold bg-[#F5F5F5] text-black hover:bg-black  hover:text-white  rdx-state-active:bg-black  rdx-state-active:text-white"
            >
              Ålesund
            </TabsTrigger>
          </TabsList>
          <TabsContent value="spring"></TabsContent>
          <TabsContent value="fall"></TabsContent>
          <TabsContent value="trondheim"></TabsContent>
          <TabsContent value="gjovik"></TabsContent>
          <TabsContent value="alesund"></TabsContent>
        </Tabs>
      </div>

      <section className="flex flex-col gap-16 w-full">
        <h1>{t("title")}</h1>
        {courses.map((course) => (
          <CourseCard key={course.code} course={course} />
        ))}
      </section>
    </div>
  )
}
