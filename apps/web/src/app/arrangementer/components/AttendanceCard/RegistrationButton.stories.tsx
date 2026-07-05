import {
  createAttendanceWithReservedUser,
  createMockAttendance,
  createMockDeregistrationAvailability,
  createMockPunishment,
  createMockRegistrationAvailability,
  createMockUser,
} from "../../../../../.ladle/fixtures/attendance"
import { RegistrationButton } from "./RegistrationButton"
import { Text } from "@dotkomonline/ui"

const noop = () => {}

const baseProps = {
  registerForAttendance: noop,
  unregisterForAttendance: noop,
  isLoading: false,
  turnstileStatus: "verified" as const,
  setDeregisterModalOpen: noop,
}

export default {
  title: "Attendance Card/Registration Button",
  component: RegistrationButton,
}

export const AllStates = () => {
  const user = createMockUser()
  const reservedAttendance = createAttendanceWithReservedUser()

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Can register</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability()}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Can deregister</Text>
        <RegistrationButton
          {...baseProps}
          attendance={reservedAttendance}
          registrationAvailability={createMockDeregistrationAvailability()}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Pool full</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability({
            pool: {
              id: "00000000-0000-4000-8000-000000000020",
              mergeDelayHours: null,
              isPoolFull: true,
            },
            registration: {
              canRegister: true,
              rejectionCause: null,
              reservationActiveAt: null,
              willBeUnreserved: true,
              hasMergeDelay: false,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Punishment delay</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability({
            punishment: createMockPunishment({ delay: 4 }),
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Merge delay</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability({
            pool: {
              id: "00000000-0000-4000-8000-000000000020",
              mergeDelayHours: 4,
              isPoolFull: false,
            },
            registration: {
              canRegister: true,
              rejectionCause: null,
              reservationActiveAt: null,
              willBeUnreserved: false,
              hasMergeDelay: true,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Missing turnstile</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability()}
          user={user}
          turnstileStatus="ready"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Turnstile loading</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability()}
          user={user}
          turnstileStatus="loading"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Turnstile failed</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability()}
          user={user}
          turnstileStatus="failed"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Loading</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability()}
          user={user}
          isLoading={true}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Not logged in</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={undefined}
          user={null}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Too early</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance({ status: "NOT_OPENED" })}
          registrationAvailability={createMockRegistrationAvailability({
            registration: {
              canRegister: false,
              rejectionCause: "TOO_EARLY",
              reservationActiveAt: null,
              willBeUnreserved: false,
              hasMergeDelay: false,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Too late</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance({ status: "CLOSED" })}
          registrationAvailability={createMockRegistrationAvailability({
            registration: {
              canRegister: false,
              rejectionCause: "TOO_LATE",
              reservationActiveAt: null,
              willBeUnreserved: false,
              hasMergeDelay: false,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Suspended</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability({
            punishment: createMockPunishment({ suspended: true, delay: 0 }),
            registration: {
              canRegister: false,
              rejectionCause: "SUSPENDED",
              reservationActiveAt: null,
              willBeUnreserved: false,
              hasMergeDelay: false,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">No matching pool</Text>
        <RegistrationButton
          {...baseProps}
          attendance={createMockAttendance()}
          registrationAvailability={createMockRegistrationAvailability({
            pool: null,
            registration: {
              canRegister: false,
              rejectionCause: "NO_MATCHING_POOL",
              reservationActiveAt: null,
              willBeUnreserved: false,
              hasMergeDelay: false,
            },
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Deregister deadline passed</Text>
        <RegistrationButton
          {...baseProps}
          attendance={reservedAttendance}
          registrationAvailability={createMockDeregistrationAvailability({
            canDeregister: false,
            rejectionCause: "DEREGISTER_DEADLINE_PASSED",
            isPastDeregisterDeadline: true,
          })}
          user={user}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm text-muted-foreground">Payment completed</Text>
        <RegistrationButton
          {...baseProps}
          attendance={reservedAttendance}
          registrationAvailability={createMockDeregistrationAvailability({
            canDeregister: false,
            rejectionCause: "PAYMENT_COMPLETED",
            hasBeenCharged: true,
          })}
          user={user}
        />
      </div>
    </div>
  )
}
