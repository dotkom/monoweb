import {
  getAutumnSemesterStart,
  isSpringSemester,
  getSpringSemesterStart,
  getSemesterDifference,
  isAutumnSemester,
} from "@dotkomonline/utils"
import invariant from "tiny-invariant"
import type { NTNUGroup } from "../feide/feide-groups-repository"
import { getLogger } from "@dotkomonline/logger"
import type { MembershipSpecialization } from "./user"

export interface MembershipService {
  /**
   * Find the approximate semester based on a student's courses against a hard-coded set of courses.
   *
   * NOTE: The value is 0-indexed.
   *
   * Master studies begin at semester 6. For masters, `specialization` selects which study plan to
   * match against.
   *
   * @see `getStudyGrade(semester)` in `@dotkomonline/utils` package
   *
   * @example
   * findEstimatedSemester(...) -> 0 // 1st semester Bachelor (Autumn)
   * findEstimatedSemester(...) -> 1 // 2nd semester Bachelor (Spring)
   * findEstimatedSemester(...) -> 2 // 3rd semester Bachelor
   * findEstimatedSemester(...) -> 3 // 4th semester Bachelor
   * findEstimatedSemester(...) -> 4 // 5th semester Bachelor
   * findEstimatedSemester(...) -> 5 // 6th semester Bachelor
   * findEstimatedSemester(...) -> 6 // 1st semester Master (Autumn) (regardless of prior Bachelor length)
   * findEstimatedSemester(...) -> 7 // 2nd semester Master (Spring)
   * findEstimatedSemester(...) -> 8 // 3rd semester Master
   * findEstimatedSemester(...) -> 9 // 4th semester Master
   */
  findEstimatedSemester(
    courses: ReadonlyArray<NTNUGroup>,
    study: "BACHELOR" | "MASTER",
    specialization?: MembershipSpecialization
  ): number
}

// Semesters are 0-indexed in our calculations. The values for `minimumEnrolledCourses` are arbitrarily chosen by us.
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
    courses: [],
    minimumEnrolledCourses: 0,
  },
  {
    semester: 5,
    courses: ["IT2901"],
    minimumEnrolledCourses: 1,
  },
] as const

export const BACHELOR_FIRST_SEMESTER = BACHELOR_STUDY_PLAN.at(0)?.semester ?? 0
export const BACHELOR_LAST_SEMESTER = BACHELOR_STUDY_PLAN.at(-1)?.semester ?? 5

// This value is defined so the Master semesters continue incrementally from the Bachelor semesters. This is not
// necessary (though they should never overlap with Bachelor semester values), but makes it easier for us mere humans to
// comprehend and easier for manual intervention.
export const MASTER_SEMESTER_OFFSET = BACHELOR_LAST_SEMESTER + 1

// As of 2026, the Trondheim MSIT specializations share enough courses to use the same study plan. This is why it is
// called "Trondheim" master study plan. The first year have no courses set, which is okay, as we put you in first or
// second semester based on the current season. All semesters after that include mandatory courses shared for all
// Trondheim MSIT specializations.
//
// NOTE: Eksperter i team is omitted because there are so many course codes for that subject.
const TRONDHEIM_MASTER_STUDY_PLAN = [
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

export const MASTER_FIRST_SEMESTER = TRONDHEIM_MASTER_STUDY_PLAN.at(0)?.semester ?? 6
export const MASTER_LAST_SEMESTER = TRONDHEIM_MASTER_STUDY_PLAN.at(-1)?.semester ?? 9

// In 2026, MSIT added two new specializations that are located in Gjøvik campus that do not share enough courses to use
// the same study plan as the Trondheim MSIT specializations (the two new specializations share no courses with the
// older ones be exact). This is why it is called "Gjøvik" master study plan.
const GJOVIK_MASTER_STUDY_PLAN = [
  {
    semester: MASTER_SEMESTER_OFFSET + 0,
    courses: ["IDIG4110", "IDIG4120", "IMT4110"],
    minimumEnrolledCourses: 3,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 1,
    courses: ["IDIG4210", "IDIG4220"],
    minimumEnrolledCourses: 2,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 2,
    courses: ["MACS4000"],
    minimumEnrolledCourses: 1,
  },
  {
    semester: MASTER_SEMESTER_OFFSET + 3,
    courses: ["MACS490"],
    minimumEnrolledCourses: 1,
  },
] as const

type MasterStudyPlanCourseSet = typeof TRONDHEIM_MASTER_STUDY_PLAN | typeof GJOVIK_MASTER_STUDY_PLAN
type StudyPlanCourseSet = typeof BACHELOR_STUDY_PLAN | MasterStudyPlanCourseSet

function getMasterStudyPlan(specialization: MembershipSpecialization): MasterStudyPlanCourseSet {
  switch (specialization) {
    case "ARTIFICIAL_INTELLIGENCE":
    case "DATABASE_AND_SEARCH":
    case "INTERACTION_DESIGN":
    case "SOFTWARE_ENGINEERING":
    case "UNKNOWN":
      return TRONDHEIM_MASTER_STUDY_PLAN

    case "PROGRAMMING_AND_SECURITY_ENGINEERING":
    case "VISUAL_INFORMATICS":
      return GJOVIK_MASTER_STUDY_PLAN
  }
}

export function getMembershipService(): MembershipService {
  const logger = getLogger("membership-service")

  /**
   * Find the approximate semester based on a student's courses against a hard-coded set of courses.
   */
  function estimateSemester(
    studentCourses: ReadonlyArray<NTNUGroup>,
    courseSet: StudyPlanCourseSet,
    semesterOffset: number
  ): number {
    logger.info("Searching for semester estimate based on courses %o and study plan %o", studentCourses, courseSet)

    // The current largest estimate is the starting value
    let largestSemester = semesterOffset
    // We need to keep track of if the previous semester was estimated, as we cannot use an estimated semester to
    // estimate further. In other words, we can only estimate for one semester at a time. This means that if a user has
    // been an exchange student for two semesters in a row, we would not be able to accurately assign them a semester.
    // The administrators would need to be manually adjusted the value given from this function.
    let isPreviousSemesterValueEstimated = false

    for (let i = 0; i < courseSet.length; i++) {
      const { semester, courses, minimumEnrolledCourses } = courseSet[i]
      const hasMandatoryCourses = courses.length > 0

      // If this semester has mandatory courses, we base our estimation on how many of the courses the user is taking.
      // We don't consider if the student has passed or failed the courses or not.
      if (hasMandatoryCourses) {
        const mandatoryCoursesEnrolledIn = courses.filter((course) =>
          studentCourses.some((studentCourse) => course === studentCourse.code)
        )

        // We check that the user is enrolled in at least the minimum courses needed for this semester.
        if (mandatoryCoursesEnrolledIn.length >= minimumEnrolledCourses) {
          // Given they are, we keep the largest semester we have found so far, and continue with the further semesters.
          largestSemester = Math.max(largestSemester, semester)
          isPreviousSemesterValueEstimated = false
          continue
        } else {
          // TLDR: We don't break here to attempt to better predict exchange students.
          //
          // If they aren't attending in enough of the required courses for this semester, we would basically end our
          // search here, as this is how far they have gotten into their studies. But users who have been exchange
          // students won't have their non-NTNU courses recognized by us, so we continue the loop in case they have a
          // "hole" in their course plan.
          // We set that the previous semester value was estimated, even though we don't update our estimate. This is to
          // prevent us from trying to estimate two semesters in a row.
          isPreviousSemesterValueEstimated = true
          continue
        }
      }

      // Since there are no mandatory courses for this course set, we need to estimate from the previous course sets.
      // To be able to determine this, there cannot be more than a single semester in a row without mandatory courses.
      // We make an exception if, and only if, there are no previous semesters with mandatory courses. Then we would
      // prefer to assign Autumn or Spring based off the current season and place them in the first year. This works
      // great with the Master study plan (as of 2026) that begin with two semester without mandatory courses.

      const earlierCourseSetsWithMandatoryCourses = courseSet
        .slice(0, i)
        .filter((semester) => semester.courses.length !== 0)

      // We sum the number of mandatory courses in all the earlier course sets.
      const earlierMandatoryCoursesCount = earlierCourseSetsWithMandatoryCourses.reduce(
        (acc, semester) => acc + semester.courses.length,
        0
      )

      // Here we assign you Spring or Autumn in the first year relative to the offset given. This is regardless of the
      // number of semesters iterated. If you have 100 semesters without mandatory courses at the start of a study plan,
      // they will still be placed in the first year relative to the offset regardless of the number of iterations. The
      // reasoning for this is explained more in the comment above.
      if (earlierMandatoryCoursesCount === 0) {
        const isAutumnStart = semesterOffset % 2 === 0
        // If the offset is odd, we flip what is the "first" semester. In practice this will never happen, at least with
        // the current 2026 study plan.
        const isSecondSemester = isAutumnStart ? isSpringSemester() : isAutumnSemester()

        // It's important we assign the initial value (semesterOffset) here, else we would continually increment the
        // value.
        if (isSecondSemester) {
          largestSemester = Math.max(largestSemester, semesterOffset + 1)
        } else {
          largestSemester = Math.max(largestSemester, semesterOffset)
        }

        // We allow the loop to continue so long there are no previous mandatory courses.
        // NOTE: It does not matter if we set that the previous semester value was estimated here.
        continue
      }

      // If the previous semester was estimated, we cannot estimate another consecutive semester.
      if (isPreviousSemesterValueEstimated) {
        continue
      }

      invariant(earlierCourseSetsWithMandatoryCourses.length !== 0)

      // This is the maximum estimated value described in the comment below.
      let largestLocalSemester = semesterOffset

      // This calls toReversed to look at the most recent course sets first for estimating distance. This isn't strictly
      // necessary, but it makes more intuitive sense.
      //
      // NOTE: In this loop we care about if the user has PASSED a course and not just if the user is ENROLLED, like in
      // an earlier check. This is because we are looking at past semesters, and need the courses to be finished to
      // determine how long ago the semester was.
      //
      // The idea here is to take an estimate of how long ago (in number of semesters) each previously iterated semester
      // is compared to today's date, then take the largest of all the estimates.
      //
      // EXAMPLE:
      // If you imagine today is Autumn 2026, and it is a user's third semester, we would loop through all previously
      // iterated semesters. We start with Spring 2026 (semester value = 1, because it is the second semester), and find
      // that looking at the dates of the courses, it was one semester ago. The loop would end with the value 1 + 1 = 2,
      // where the first one is the semester value of the semester, and the second one is the value we estimated. We
      // save the value, then go to the previous semester. Autumn 2025 (semester value = 0, because it is the first
      // semester), and we find that the distance is 2 semesters. The value is therefore 0 + 2 = 2. The maximum of all
      // the estimations is the value of 2 (which corresponds to the third semesters), and this is what we assign.
      for (const earlierCourseSet of earlierCourseSetsWithMandatoryCourses.toReversed()) {
        const coursesPassedEarlierSemester = earlierCourseSet.courses.filter((course) =>
          studentCourses.some((studentCourse) => course === studentCourse.code && studentCourse.finished !== undefined)
        )

        // If the user didn't pass enough courses in the semester, we skip as we cannot use this see
        if (coursesPassedEarlierSemester.length < earlierCourseSet.minimumEnrolledCourses) {
          continue
        }

        const currentSemesterStart = isSpringSemester() ? getSpringSemesterStart() : getAutumnSemesterStart()

        // We collect how long ago (distance) each term in the earlier semesters were finished
        const earlierSemesterDistanceEstimates = earlierCourseSet.courses.map((course) => {
          const studentCourse = studentCourses.find(
            (studentCourse) => studentCourse.code === course && studentCourse.finished !== undefined
          )

          if (studentCourse?.finished === undefined) {
            return null
          }

          const semesterStartForFinishedCourse = isSpringSemester(studentCourse.finished)
            ? getSpringSemesterStart(studentCourse.finished)
            : getAutumnSemesterStart(studentCourse.finished)

          const semestersPassed = getSemesterDifference(semesterStartForFinishedCourse, currentSemesterStart)

          return earlierCourseSet.semester + semestersPassed
        })

        // We filter out the non-estimates
        const estimates = earlierSemesterDistanceEstimates.filter((estimate): estimate is number => estimate !== null)

        if (estimates.length === 0) {
          continue
        }

        // We take the largest estimate from the earlier semesters, to not skew if they failed a course.
        const maxEstimate = Math.max(...estimates)
        // We clamp the estimate to the highest possible value (which is the semesters value) to avoid completely wrong
        // estimates.
        const clampedEstimate = Math.min(maxEstimate, semester)

        largestLocalSemester = Math.max(largestLocalSemester, clampedEstimate)
      }

      largestSemester = Math.max(largestSemester, largestLocalSemester)
    }

    logger.info("Finished searching for applicable membership. Estimated semester was %d", largestSemester)

    return largestSemester
  }

  return {
    findEstimatedSemester(courses, study, specialization) {
      if (study === "BACHELOR") {
        return estimateSemester(courses, BACHELOR_STUDY_PLAN, 0)
      }

      const studyPlan = getMasterStudyPlan(specialization ?? "UNKNOWN")

      return estimateSemester(courses, studyPlan, MASTER_SEMESTER_OFFSET)
    },
  }
}
