import { getNextAutumnSemesterStart, getAutumnSemesterStart, isSpringSemester } from "@dotkomonline/types"
import { differenceInMonths, subYears } from "date-fns"
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

      // Has mandatory courses for this semester
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
      const previousCourseSetsWithMandatoryCourses = courseSet
        .slice(0, i)
        .filter((semester) => semester.courses.length !== 0)

      // If there are no previous mandatory courses, we cannot really make any estimation. We
      const previousMandatoryCoursesCount = previousCourseSetsWithMandatoryCourses.reduce(
        (acc, semester) => acc + semester.courses.length,
        0
      )

      // If it is the second semester, and the first semester had no mandatory courses, we cannot really make any real
      // estimation. But we feel comfortable incrementing the semester by one, since it would still be the first year
      // (relative to the semester offset).
      if (previousMandatoryCoursesCount === 0) {
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
      invariant(previousCourseSetsWithMandatoryCourses.length !== 0)

      // We take the ceil(mean(distances)) across all past semesters.
      let largestLocalSemester = 0
      for (const previousSemester of previousCourseSetsWithMandatoryCourses.toReversed()) {
        // The criteria here is the same as below, except we also require the course to have a finished date.
        const hasPassedPreviousSemester = previousSemester.courses.every((course) =>
          studentCourses.some((studentCourse) => course === studentCourse.code && studentCourse.finished !== undefined)
        )

        if (!hasPassedPreviousSemester) {
          continue
        }

        // There is a scenario where a user failed a course in year 1, but passed in year 2. This is why we take the
        // mean distance, which is later ceiled.
        const previousSemesterDistances = previousSemester.courses.map((course) => {
          const studentCourse = studentCourses.find((studentCourse) => studentCourse.code === course)

          // -1 because length is 1-indexed
          const semesterDistanceFromEnd = courseSet.length - 1 - previousSemester.semester
          // If you were supposed to finish your degree this year, how far away would the semester in question be?
          // For example; if previousSemester=3 (algdat+itp+datdig), then the distance would be 2.
          const years = Math.ceil(semesterDistanceFromEnd / 2)
          const courseEndAssumingLastYearStudent = subYears(getNextAutumnSemesterStart(), years)

          // INVARIANT: The course should exist, and it should be finished according to `hasPassedPreviousSemester`.
          invariant(studentCourse !== undefined && studentCourse.finished !== undefined)
          // We divide by six because we have two school semesters in a year, effectively turnings months in a year
          // into semesters
          const distance = Math.floor(
            differenceInMonths(getAutumnSemesterStart(studentCourse.finished), courseEndAssumingLastYearStudent) / 6
          )

          return previousSemester.semester + (semesterDistanceFromEnd - distance)
        })

        // Take the mean distance for this semester
        const sum = previousSemesterDistances.reduce((acc, curr) => acc + curr, 0)
        const currentSemesterEstimate = Math.ceil(sum / previousSemesterDistances.length)

        largestLocalSemester = Math.max(largestLocalSemester, currentSemesterEstimate)
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
