import type { ComponentProps } from "react"
import { Fragment } from "react"
import { Text } from "@dotkomonline/ui"
import {
  createAttendanceWithRegisteredUser,
  createAttendanceWithQueuedUser,
  createMockAttendance,
  createMockDeregistrationAvailability,
  createMockPunishment,
  createMockRegistrationAvailability,
  createMockUser,
} from "../../../../../../.ladle/fixtures/attendance"
import { RegistrationButton } from "./RegistrationButton"

const noop = () => {}
const baseProps = {
  registerForAttendance: noop,
  unregisterForAttendance: noop,
  isLoading: false,
  turnstileStatus: "verified" as const,
  setDeregisterModalOpen: noop,
}
type ButtonProps = ComponentProps<typeof RegistrationButton>
type StoryRow = {
  label: string
  cells: [Partial<ButtonProps> | null, Partial<ButtonProps> | null, Partial<ButtonProps> | null]
}
export default {
  title: "Attendance Card/Registration Button",
  component: RegistrationButton,
}

export const AllStates = () => {
  const user = createMockUser()
  const availability = createMockRegistrationAvailability()
  const columns = [
    { label: "Not attending", attendance: createMockAttendance(), availability },
    {
      label: "Registered",
      attendance: createAttendanceWithRegisteredUser(),
      availability: createMockDeregistrationAvailability(),
    },
    {
      label: "In queue",
      attendance: createAttendanceWithQueuedUser(),
      availability: createMockDeregistrationAvailability(),
    },
  ]
  const registration = availability.registration
  const pool = availability.pool
  if (!registration || !pool) {
    return null
  }
  const deadlinePassed = {
    registrationAvailability: createMockDeregistrationAvailability({
      canDeregister: false,
      rejectionCause: "DEREGISTER_DEADLINE_PASSED",
      isWithinGracePeriod: false,
      isPastDeregisterDeadline: true,
    }),
  }
  const rows: StoryRow[] = [
    { label: "Can register / deregister", cells: [{}, {}, {}] },
    {
      label: "Pool full",
      cells: [
        {
          registrationAvailability: createMockRegistrationAvailability({
            pool: { ...pool, isPoolFull: true },
            registration: { ...registration, willBeQueued: true },
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "Punishment delay",
      cells: [
        {
          registrationAvailability: createMockRegistrationAvailability({
            punishment: createMockPunishment({ delay: 4 }),
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "Merge delay",
      cells: [
        {
          registrationAvailability: createMockRegistrationAvailability({
            pool: { ...pool, mergeDelayHours: 4 },
            registration: { ...registration, hasMergeDelay: true },
          }),
        },
        null,
        null,
      ],
    },
    { label: "Missing turnstile", cells: [{ turnstileStatus: "ready" }, null, null] },
    { label: "Turnstile loading", cells: [{ turnstileStatus: "loading" }, null, null] },
    { label: "Turnstile failed", cells: [{ turnstileStatus: "failed" }, null, null] },
    { label: "Loading", cells: [{ isLoading: true }, { isLoading: true }, { isLoading: true }] },
    {
      label: "Availability loading",
      cells: [
        { registrationAvailability: undefined },
        { registrationAvailability: undefined },
        { registrationAvailability: undefined },
      ],
    },
    { label: "Not logged in", cells: [{ user: null, registrationAvailability: undefined }, null, null] },
    {
      label: "Too early",
      cells: [
        {
          attendance: createMockAttendance({ status: "NOT_OPENED" }),
          registrationAvailability: createMockRegistrationAvailability({
            registration: { ...registration, canRegister: false, eventRejectionCause: "TOO_EARLY" },
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "Too late",
      cells: [
        {
          attendance: createMockAttendance({ status: "CLOSED" }),
          registrationAvailability: createMockRegistrationAvailability({
            registration: { ...registration, canRegister: false, eventRejectionCause: "TOO_LATE" },
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "Suspended",
      cells: [
        {
          registrationAvailability: createMockRegistrationAvailability({
            punishment: createMockPunishment({ suspended: true, delay: 0 }),
            registration: { ...registration, canRegister: false, userRejectionCause: "SUSPENDED" },
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "No matching pool",
      cells: [
        {
          registrationAvailability: createMockRegistrationAvailability({
            pool: null,
            registration: { ...registration, canRegister: false, userRejectionCause: "NO_MATCHING_POOL" },
          }),
        },
        null,
        null,
      ],
    },
    {
      label: "Deregister deadline passed",
      cells: [
        null,
        deadlinePassed,
        {
          registrationAvailability: createMockDeregistrationAvailability({
            canDeregister: true,
            rejectionCause: null,
            isWithinGracePeriod: false,
            requiresDeregisterReason: true,
            isPastDeregisterDeadline: true,
          }),
        },
      ],
    },
    {
      label: "Payment completed",
      cells: [
        null,
        {
          registrationAvailability: createMockDeregistrationAvailability({
            canDeregister: false,
            rejectionCause: "PAYMENT_COMPLETED",
            isWithinGracePeriod: false,
            hasBeenCharged: true,
          }),
        },
        null,
      ],
    },
  ]
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[780px] max-w-6xl grid-cols-3 items-start gap-x-6 gap-y-8">
        {columns.map((column) => (
          <Text key={column.label} className="font-medium">
            {column.label}
          </Text>
        ))}
        {rows.map((row) => (
          <Fragment key={row.label}>
            {row.cells.map((props, index) => {
              const column = columns[index]
              return (
                <div key={column.label} className="flex min-w-0 flex-col gap-2">
                  {props !== null && (
                    <>
                      <Text className="text-sm text-muted-foreground">{row.label}</Text>
                      <RegistrationButton
                        {...baseProps}
                        attendance={column.attendance}
                        registrationAvailability={column.availability}
                        user={user}
                        {...props}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
