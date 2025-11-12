import { getCurrentUTC } from "@dotkomonline/utils"
import { differenceInYears, subMonths, subYears } from "date-fns"
import invariant from "tiny-invariant"
import type { NTNUGroup } from "../feide/feide-groups-repository"

export interface MembershipService {
  findApproximateMasterStartYear(courses: NTNUGroup[]): number
  findApproximateBachelorStartYear(courses: NTNUGroup[]): number
}

const BACHELOR_STUDY_PLAN_COURSES = [
  {
    semester: 0,
    courses: ["IT2805", "MA0001", "TDT4109"],
  },
  {
    semester: 1,
    courses: ["MA0301", "TDT4100", "TDT4180", "TTM4100"],
  },
  {
    semester: 2,
    courses: ["IT1901", "TDT4120", "TDT4160"],
  },
  {
    semester: 3,
    courses: ["TDT4140", "TDT4145"],
  },
  {
    semester: 4,
    // NOTE: Semester 1 in Year 3 are all elective courses, so we do not use any of them to determine which year somebody
    // started studying
    courses: [],
  },
  {
    semester: 5,
    courses: ["IT2901"],
  },
] as const

const MASTER_STUDY_PLAN = [
  {
    semester: 0,
    courses: [],
  },
  {
    semester: 1,
    courses: [],
  },
  {
    semester: 2,
    courses: ["IT3915"],
  },
  {
    semester: 3,
    courses: ["IT3920"],
  },
] as const

type StudyPlanCourseSet = typeof BACHELOR_STUDY_PLAN_COURSES | typeof MASTER_STUDY_PLAN

export function getMembershipService(): MembershipService {
  // The study plan course set makes some assumptions for the approximation code to work as expected. In order to make
  // it easier for future dotkom developers, the invariants are checked here.
  validateStudyPlanCourseSet(BACHELOR_STUDY_PLAN_COURSES)
  validateStudyPlanCourseSet(MASTER_STUDY_PLAN)

  function validateStudyPlanCourseSet(courseSet: StudyPlanCourseSet) {
    // If three semesters in a row do not have mandatory courses, the distance check will not be able to distinguish
    // between a first and second grader, assuming semester [0, 1, 2] are all without mandatory courses.
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
   * Find the approximate start year based on a student's courses against a hard-coded set of courses.
   */
  function findApproximateStartYear(studentCourses: NTNUGroup[], courseSet: StudyPlanCourseSet): number {
    let largestSemester = 0
    for (let i = 0; i < courseSet.length; i++) {
      const semester = courseSet[i]

      // Semesters with zero mandatory courses possibly increment `largestSemester` by determining the number of
      // years since the last mandatory courses. However, if the current semester we are iterating over is the first
      // in the study plan, we cannot get any more information that could be used to increment `largestSemester`, so
      // we do not try.
      const isFirstYear = i === 0 || i === 1
      if (semester.courses.length === 0 && !isFirstYear) {
        const previousSemesters = courseSet.slice(0, i).filter((semester) => semester.courses.length !== 0)
        // By invariant that this is not the first year, and that there are maximum two semesters without mandatory
        // courses, `previousSemesters` is guaranteed to have at least one element.
        invariant(previousSemesters.length !== 0)

        // We take the ceil(mean(distances)) across all past semesters.
        let largestLocalSemester = 0
        for (const previousSemester of previousSemesters.toReversed()) {
          // The criteria here is the same as below, except we also require the course to have a finished date.
          const hasPassedPreviousSemester = previousSemester.courses.every((course) =>
            studentCourses.some(
              (studentCourse) => course === studentCourse.code && studentCourse.finished !== undefined
            )
          )

          if (!hasPassedPreviousSemester) {
            continue
          }

          // There is a scenario where a user failed a course in year 1, but passed in year 2. This is why we take the
          // mean distance, which is later ceil()'d.
          const now = getCurrentUTC()
          const previousSemesterDistances = previousSemester.courses.map((course) => {
            const studentCourse = studentCourses.find((studentCourse) => studentCourse.code === course)
            // NOTE: -1 because length is 1-indexed
            const semesterDistanceFromEnd = courseSet.length - 1 - previousSemester.semester
            // If you were supposed to finish your degree this year, how far away would the semester in question be?
            // For example; if previousSemester=3 (algdat+itp+datdig), then the distance would be 2.
            const years = Math.ceil(semesterDistanceFromEnd / 2)
            const courseEndIfProgrammeEndedToday = subYears(now, years)

            // INVARIANT: The course should join should exist, and it should be finished according to
            // `hasPassedPreviousSemester`.
            invariant(studentCourse !== undefined && studentCourse.finished !== undefined)
            const distance = differenceInYears(courseEndIfProgrammeEndedToday, studentCourse.finished)
            return previousSemester.semester + distance
          })

          // Take the mean distance for this semester
          const sum = previousSemesterDistances.reduce((acc, curr) => acc + curr, 0)
          largestLocalSemester = Math.ceil((sum / previousSemesterDistances.length))
        }

        largestSemester = Math.max(largestSemester, largestLocalSemester)
        continue
      }

      // If the user has all of the courses that are mandatory
      const isGroupMemberOfMandatoryCourses = semester.courses.every((course) =>
        studentCourses.some((studentCourse) => course === studentCourse.code)
      )

      if (isGroupMemberOfMandatoryCourses) {
        largestSemester = semester.semester
      } else {
        // If the user does not have all of the courses required for this semester, we would much rather prefer to give
        // them a lower year than a higher one. Chances are a student would notify HS if they cannot attend events they
        // should be able to, while someone might not notify HS about them being able to attend company events they are
        // not supposed to be at.
        break
      }
    }

    // Give the value back in years
    return Math.floor(largestSemester / 2)
  }
  return {
    findApproximateMasterStartYear(courses) {
      return findApproximateStartYear(courses, MASTER_STUDY_PLAN)
    },
    findApproximateBachelorStartYear(courses) {
      return findApproximateStartYear(courses, BACHELOR_STUDY_PLAN_COURSES)
    },
  }
}
