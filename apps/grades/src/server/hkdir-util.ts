import { type Grade, type Season } from "@/server/grade-repository"

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
