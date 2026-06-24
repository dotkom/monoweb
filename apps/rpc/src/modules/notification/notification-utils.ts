import type { NotificationPayloadType, NotificationType } from "./notification-types"

export const mapNotificationTypeToLabel = (notificationType: NotificationType) => {
  switch (notificationType) {
    case "BROADCAST":
      return "Generell varsling"
    case "BROADCAST_IMPORTANT":
      return "Viktig varsling"
    case "EVENT_REGISTRATION":
      return "Påmelding til arrangement"
    case "EVENT_REMINDER":
      return "Påminnelse om arrangement"
    case "EVENT_UPDATE":
      return "Oppdatering om arrangement"
    case "JOB_LISTING_REMINDER":
      return "Påminnelse om stillingsutlysning"
    case "NEW_ARTICLE":
      return "Ny artikkel"
    case "NEW_EVENT":
      return "Nytt arrangement"
    case "NEW_FEEDBACK_FORM":
      return "Nytt tilbakemeldingsskjema"
    case "NEW_INTEREST_GROUP":
      return "Ny interessegruppe"
    case "NEW_JOB_LISTING":
      return "Ny stillingsutlysning"
    case "NEW_MARK":
      return "Ny prikk"
    case "NEW_OFFLINE":
      return "Ny offline"
    default:
      return "Ukjent"
  }
}

export const mapNotificationPayloadTypeToLabel = (payloadType: NotificationPayloadType) => {
  switch (payloadType) {
    case "URL":
      return "Url"
    case "EVENT":
      return "Arrangement"
    case "ARTICLE":
      return "Artikkel"
    case "GROUP":
      return "Gruppe"
    case "USER":
      return "Bruker"
    case "OFFLINE":
      return "Offline"
    case "JOB_LISTING":
      return "Stillingsutlysning"
    case "NONE":
      return "Ingen"
  }
}
