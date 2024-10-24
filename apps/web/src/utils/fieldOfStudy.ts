import { FieldOfStudy } from "@dotkomonline/types"

export const fieldOfStudyName = (fieldOfStudy: FieldOfStudy): string => {
  switch (fieldOfStudy) {
    case "BACHELOR":
      return "Bachelor i Informatikk"

    case "MASTER_SOFTWARE_ENGINEERING":
      return "Master i Programvaresystemer"
    case "MASTER_DATABASE_AND_SEARCH":
      return "Master i Databaser og søk"
    case "MASTER_ALGORITHMS":
      return "Master i Algoritmer"
    case "MASTER_GAME_TECHNOLOGY":
      return "Master i Spillteknologi"
    case "MASTER_ARTIFICIAL_INTELLIGENCE":
      return "Master i Kunstig intelligens"
    case "MASTER_HEALTH_INFORMATICS":
      return "Master i Helseinformatikk"
    case "MASTER_INTERACTION_DESIGN":
      return "Master i Interaksjonsdesign"
    case "MASTER_OTHER":
      return "Annen mastergrad"
  
    case "SOCIAL_MEMBER":
      return "Sosialt medlem"
    case "PHD":
      return "PhD"
    case "INTERNATIONAL":
      return "Internasjonal"
    case "OTHER_MEMBER":
      return "Annet medlem"
  }
}
