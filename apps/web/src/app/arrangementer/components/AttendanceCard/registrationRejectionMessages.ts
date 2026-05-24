import type { AttendanceRouter } from "@dotkomonline/rpc"

type RegistrationRejectionCause = NonNullable<
  NonNullable<AttendanceRouter.GetRegistrationAvailabilityOutput["registration"]>["rejectionCause"]
>

export type RegistrationRejectionMessageKey = RegistrationRejectionCause | "MISSING_TURNSTILE_TOKEN"

export const registrationRejectionMessages: Record<RegistrationRejectionMessageKey, string> = {
  TOO_EARLY: "Påmeldinger har ikke åpnet",
  TOO_LATE: "Påmeldingen er stengt",
  SUSPENDED: "Du er suspendert fra Online",
  MISSING_MEMBERSHIP: "Du har ikke Online-medlemskap",
  NO_MATCHING_POOL: "Du har ingen påmeldingsgruppe",
  MISSING_PARENT_REGISTRATION: "Du er ikke påmeldt foreldrearrangementet",
  MISSING_PARENT_RESERVATION: "Du er i kø på foreldrearrangementet",
  ALREADY_REGISTERED: "Du er allerede påmeldt",
  INVALID_TURNSTILE_TOKEN: "Du er en robot", // litt userr men litt gøy
  MISSING_TURNSTILE_TOKEN: "Du må bekrefte at du ikke er en robot",
}
