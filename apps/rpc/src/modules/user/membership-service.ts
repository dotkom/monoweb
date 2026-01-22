import {
  getAutumnSemesterStart,
  isSpringSemester,
  getSpringSemesterStart,
  getSemesterDifference,
} from "@dotkomonline/types"
import { isWithinInterval } from "date-fns"
import invariant from "tiny-invariant"
import type { NTNUGroup } from "../feide/feide-groups-repository"
import { getLogger } from "@dotkomonline/logger"

export interface MembershipService {
  /**
   * Find the approximate semester based on a student's courses against a hard-coded set of courses.
   *
   * NOTE: The value is 0-indexed.
   *
   * Master studies begin at semester 6.
   *
   * @see getCourseStart(semester) in types package
   * @see getStudyGrade(semester) in types package
   *
   * @example
   * findEstimatedSemester(...) -> 0 // 1st semester Bachelor (Autumn)
   * findEstimatedSemester(...) -> 1 // 2nd semester Bachelor (Spring)
   * findEstimatedSemester(...) -> 2 // 3rd semester Bachelor
   * findEstimatedSemester(...) -> 3 // 4th semester Bachelor
   * findEstimatedSemester(...) -> 4 // 5th semester Bachelor
   * findEstimatedSemester(...) -> 5 // 6th semester Bachelor
   * findEstimatedSemester(...) -> 6 // 1st semester Master (regardless of prior Bachelor length)
   * findEstimatedSemester(...) -> 7 // 2nd semester Master
   * findEstimatedSemester(...) -> 8 // 3rd semester Master
   * findEstimatedSemester(...) -> 9 // 4th semester Master
   */
  findEstimatedSemester(study: "BACHELOR" | "MASTER", courses: ReadonlyArray<NTNUGroup>): number
}

const BACHELOR_STUDY_PLAN = [
  {
    semester: 0,
    courses: ["IT2805", "MA0001", "TDT4109", "EXPH0300"],
    minimumEnrolledCourses: 3,
  },
  {
    semester: 1,
    courses: ["MA0301", "TDT4100", "TDT4180", "TTM4100"],
    minimumEnrolledCourses: 3,
  },
  {
    semester: 2,
    courses: ["IT1901", "TDT4120", "TDT4160"],
    minimumEnrolledCourses: 3,
  },
  {
    semester: 3,
    courses: ["TDT4140", "TDT4145"],
    minimumEnrolledCourses: 2,
  },
  {
    semester: 4,
    // Semester 1 in year 3 are all elective courses, so we do not use any of them to determine which year somebody
    // started studying
    courses: [],
    minimumEnrolledCourses: 0,
  },
  {
    semester: 5,
    courses: ["IT2901"],
    minimumEnrolledCourses: 1,
  },
] as const

export const MASTER_SEMESTER_OFFSET = 6 as const
const MASTER_STUDY_PLAN = [
  {
    semester: MASTER_SEMESTER_OFFSET + 0,
    courses: [],
    minimumEnrolledCourses: 0,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 1,
    courses: [],
    minimumEnrolledCourses: 0,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 2,
    courses: ["IT3915"],
    minimumEnrolledCourses: 1,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 3,
    courses: ["IT3920"],
    minimumEnrolledCourses: 1,
  },
] as const

type StudyPlanCourseSet = typeof BACHELOR_STUDY_PLAN | typeof MASTER_STUDY_PLAN

export function getMembershipService(): MembershipService {
  const logger = getLogger("membership-service")
  // The study plan course set makes some assumptions for the approximation code to work as expected. In order to make
  // it easier for future dotkom developers, the invariants are checked here.
  validateStudyPlanCourseSet(BACHELOR_STUDY_PLAN)
  validateStudyPlanCourseSet(MASTER_STUDY_PLAN)

  function validateStudyPlanCourseSet(courseSet: StudyPlanCourseSet) {
    // If three semesters in a row do not have mandatory courses, the distance check will not be able to distinguish
    // between a first and second-grader, assuming semester [0, 1, 2] are all without mandatory courses.
    let maxDistance = 0
    for (const semester of courseSet) {
      if (semester.courses.length === 0) {
        maxDistance += 1
      } else {
        maxDistance = 0
      }

      if (maxDistance >= 3) {
        throw new Error("A StudyPlanCourseSet may not have three semesters without mandatory courses in a row")
      }
    }
  }

  /**
   * Find the approximate semester based on a student's courses against a hard-coded set of courses.
   */
  function estimateSemester(
    courseSet: StudyPlanCourseSet,
    studentCourses: ReadonlyArray<NTNUGroup>,
    semesterOffset: number
  ): number {
    let largestSemester = semesterOffset

    for (let i = 0; i < courseSet.length; i++) {
      const semester = courseSet[i]

      // This semester has mandatory courses
      if (semester.courses.length > 0) {
        const mandatoryCoursesEnrolledIn = semester.courses.filter((course) =>
          studentCourses.some((studentCourse) => course === studentCourse.code)
        )

        if (mandatoryCoursesEnrolledIn.length >= semester.minimumEnrolledCourses) {
          largestSemester = semester.semester
          continue
        } else {
          // If the user does not have all the courses required for this semester, we would much rather prefer to give
          // them a lower year than a higher one. Chances are a student would notify HS (basically our administration)
          // if they cannot attend events they should be able to, while someone might not notify HS about them being able
          // to attend company events they are not supposed to be at.
          break
        }
      }

      // Since there are no mandatory courses for this course set, we need to estimate from the previous course sets.
      // To be able to determine this, there cannot be more than two semesters in a row without mandatory courses. This
      // is validated in `validateStudyPlanCourseSet`.

      const earlierCourseSetsWithMandatoryCourses = courseSet
        .slice(0, i)
        .filter((semester) => semester.courses.length !== 0)

      const earlierMandatoryCoursesCount = earlierCourseSetsWithMandatoryCourses.reduce(
        (acc, semester) => acc + semester.courses.length,
        0
      )

      // If it is the second semester, and the first semester had no mandatory courses, we cannot really make any real
      // estimation. But we feel comfortable incrementing the semester by one, since it would still be the first year
      // (relative to the semester offset).
      if (earlierMandatoryCoursesCount === 0) {
        // We need to determine if we are in spring or autumn semester to be able to increment correctly.
        const isEvenOffset = semesterOffset % 2 === 0
        const isSpring = isSpringSemester()

        // In practice, with the current (2026) Master study plan, the first two semesters have no mandatory courses,
        // but we would still like them to be put into semester 6 and 7 respectively.
        //   - If even offset (start autumn) we increment if it is currently spring.
        //   - If odd offset (start spring) we increment if it is currently autumn.
        //     NOTE: This scenario is not possible with the current study plans, but we keep it for future-proofing.
        if (isEvenOffset === isSpring) {
          largestSemester = semesterOffset + 1
        } else {
          largestSemester = semesterOffset
        }

        continue
      }

      // By invariant that this is not the first year, and that there are maximum two semesters without mandatory
      // courses, `previousSemesters` is guaranteed to have at least one element.
      invariant(earlierCourseSetsWithMandatoryCourses.length !== 0)

      // We take the ceil(mean(distances)) across all past semesters.
      const largestLocalSemester = semesterOffset
      for (const earlierSemester of earlierCourseSetsWithMandatoryCourses.toReversed()) {
        // The criteria here is the same as below, except we also require the course to have a finished date.
        const coursesPassedEarlierSemester = earlierSemester.courses.filter((course) =>
          studentCourses.some((studentCourse) => course === studentCourse.code && studentCourse.finished !== undefined)
        )

        if (coursesPassedEarlierSemester.length < earlierSemester.minimumEnrolledCourses) {
          continue
        }

        // 1. Determine the start of the current semester we are in right now.
        const currentSemesterStart = isSpringSemester()
          ? getSpringSemesterStart(new Date())
          : getAutumnSemesterStart(new Date())

        // We take the max of all estimates. If you took a 1st-year course 3 years ago,
        // you are a 4th-year student, even if you retook a different 1st-year course yesterday.
        let largestLocalSemester = semesterOffset

        const earlierSemesterEstimates = earlierSemester.courses.map((course) => {
          const studentCourse = studentCourses.find(
            (studentCourse) => studentCourse.code === course && studentCourse.finished !== undefined
          )

          if (studentCourse === undefined || studentCourse.finished === undefined) {
            return null
          }

          const aprilFirst = new Date(studentCourse.finished.getFullYear(), 3, 1)
          const novemberFirst = new Date(studentCourse.finished.getFullYear(), 10, 1)

          const isStudentCourseFinishedInSpringSemester = isWithinInterval(studentCourse.finished, {
            start: aprilFirst,
            end: novemberFirst,
          })

          const intervalMappedCourseFinished = isStudentCourseFinishedInSpringSemester
            ? getSpringSemesterStart(studentCourse.finished)
            : getAutumnSemesterStart(studentCourse.finished)

          const semestersPassed = getSemesterDifference(intervalMappedCourseFinished, currentSemesterStart)

          return earlierSemester.semester + semestersPassed
        })

        const estimates = earlierSemesterEstimates.filter((estimate): estimate is number => estimate !== null)

        if (estimates.length > 0) {
          const maxEstimate = Math.max(...estimates)
          largestLocalSemester = Math.max(largestLocalSemester, maxEstimate)
        }
      }

      largestSemester = Math.max(largestSemester, largestLocalSemester)
    }

    return largestSemester
  }

  return {
    findEstimatedSemester(study, courses) {
      const studyPlan = study === "MASTER" ? MASTER_STUDY_PLAN : BACHELOR_STUDY_PLAN
      const offset = study === "MASTER" ? MASTER_SEMESTER_OFFSET : 0

      return estimateSemester(studyPlan, courses, offset)
    },
  }
}
