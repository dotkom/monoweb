// import { server } from "@/utils/trpc/server";
// import { mapAverageGradeToLetterGrade } from "node_modules/@dotkomonline/grades-backend/src/modules/course/course";
// import { courseRouter } from "node_modules/@dotkomonline/grades-backend/src/modules/course/course-router";
import { server } from "@/utils/trpc/server"
import { mapAverageGradeToLetterGrade, mapCourseSemesterToLabel } from "@dotkomonline/grades-backend/course"

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { id: rawParamId } = await params
  const courseId = decodeURIComponent(rawParamId)
  const course = await server.course.findCourse.query(courseId)

  return (
    <div>
      <div className="font-bold text-4xl m-5">
        {courseId} - {course.norwegianName}
      </div>

      <div className="text-3xl font-semibold bg-gray-700 rounded-md p-4 m-5">Om faget</div>
      <div className="font-bold bg-gray-700 rounded-md p-4 m-5 grid-cols-1">Karakterer</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <div className="text-3xl font-semibold bg-gray-700 rounded-md p-4 m-5">
          Karakterfordeling
          <div>Graf graf graf</div>
        </div>

        <div className="font-bold rounded-md p-4 m-5 lg:col-span-1">
          <p> Totalt </p>
          <div>
            {/* Her skal det være siste år faget gikk (altså år så 
            semester skal vises) {course.taughtSemesters} */}
            Semester {course.taughtSemesters.map((semester) => mapCourseSemesterToLabel(semester))}
          </div>
          <div>
            Gjennomsnitt {mapAverageGradeToLetterGrade(course.averageGrade)}({course.averageGrade.toFixed(2)})
          </div>

          <div> Ståprosent {course.passRate.toFixed(2)} %</div>

          <p> Om emnet</p>
          <div>
            <div className="">
              <p>Studiepoeng</p>

              <p>Nivå</p>

              <p>Språk</p>
            </div>

            <div className="">
              <p>Semester</p>

              <p>Campus</p>

              <p>Vurdering</p>
            </div>
          </div>
        </div>
        <div className="text-3xl font-semibold bg-gray-700 rounded-md p-4 m-5">
          Snittfordeling
          <div>Graf graf graf</div>
        </div>
        <div className="text-3xl font-semibold bg-gray-700 rounded-md p-4 m-5 md:col-span-2 lg:col-span-1">
          Strykprosent
          <div>Graf graf graf</div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <div className="font-bold bg-gray-700 rounded-md p-4 m-5 grid-cols-1">Faglig innhold</div>
        <div className="font-bold bg-gray-700 rounded-md p-4 m-5 grid-cols-1">Læringsmål</div>
        <div className="font-bold bg-gray-700 rounded-md p-4 m-5 grid-cols-1">Læringsformer og aktiviteter</div>
      </div>
    </div>
  )
}
