import { type Grade, type Season } from "@/server/grade-repository"
import { type HkdirGradeKey } from "@/server/hkdir-service"

export const mapHkdirSemesterToSeason = (semester: string): Season => {
  switch (semester) {
    case "1":
      return "SPRING"
    case "3":
      return "AUTUMN"
    case "2":
      return "SUMMER"
    case "0":
      return "WINTER"
    default:
      throw new Error(`Unknown semester: ${semester}`)
  }
}

export const mapHkdirGradeToGradeFactor = (grade: Exclude<HkdirGradeKey, "G" | "H">): number => {
  switch (grade) {
    case "A":
      return 5
    case "B":
      return 4
    case "C":
      return 3
    case "D":
      return 2
    case "E":
      return 1
    case "F":
      return 0
    default:
      throw new Error(`Unknown grade: ${grade}`)
  }
}

export const mapHkdirGradeToGrade = (grade: string): keyof Grade => {
  switch (grade) {
    case "A":
      return "gradedA"
    case "B":
      return "gradedB"
    case "C":
      return "gradedC"
    case "D":
      return "gradedD"
    case "E":
      return "gradedE"
    case "F":
      return "gradedF"
    case "G":
      return "gradedPass"
    case "H":
      return "gradedFail"
    default:
      throw new Error(`Unknown grade: ${grade}`)
  }
}
