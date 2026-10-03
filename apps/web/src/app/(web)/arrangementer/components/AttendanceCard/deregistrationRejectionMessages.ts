import type { AttendanceRouter } from "@dotkomonline/rpc"

type DeregistrationRejectionCause = NonNullable<
  NonNullable<AttendanceRouter.GetRegistrationAvailabilityOutput["deregistration"]>["rejectionCause"]
>

export const deregistrationRejectionMessages: Record<DeregistrationRejectionCause, string> = {
  DEREGISTER_DEADLINE_PASSED: "Avmeldingsfristen har utløpt",
  PAYMENT_COMPLETED: "Betaling er utført. Kontakt arrangør for avmelding og refusjon",
}
