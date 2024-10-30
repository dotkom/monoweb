import { OnlineFieldOfStudy } from "@dotkomonline/types"

export const fieldOfStudyName = (fieldOfStudy: OnlineFieldOfStudy): string => {
  switch (fieldOfStudy) {
    case "BACHELOR_INFORMATICS":
      return "Bachelor i Informatikk"
    case "PHD":
      return "PhD"
    case "MASTER_INFORMATICS":
      return "Master i Informatikk"
  }
}
