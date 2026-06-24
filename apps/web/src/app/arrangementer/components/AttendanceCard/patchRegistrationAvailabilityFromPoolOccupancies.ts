import type { AttendanceRouter } from "@dotkomonline/rpc"
import type { PoolOccupancy } from "@dotkomonline/rpc/attendance"
import { isFuture } from "date-fns"

type RegistrationAvailability = AttendanceRouter.GetRegistrationAvailabilityOutput

export function patchRegistrationAvailabilityFromPoolOccupancies(
  registrationAvailability: RegistrationAvailability | undefined,
  poolOccupancies: PoolOccupancy[]
): RegistrationAvailability | undefined {
  if (registrationAvailability === undefined) {
    return registrationAvailability
  }

  if (
    registrationAvailability.deregistration !== null ||
    registrationAvailability.pool === null ||
    registrationAvailability.registration === null
  ) {
    return registrationAvailability
  }

  const pool = registrationAvailability.pool
  const registration = registrationAvailability.registration
  const poolOccupancy = poolOccupancies.find((occupancy) => occupancy.poolId === pool.id)

  if (poolOccupancy === undefined) {
    return registrationAvailability
  }

  const willBeUnreserved =
    (registration.reservationActiveAt !== null && isFuture(registration.reservationActiveAt)) ||
    poolOccupancy.isPoolFull

  return {
    ...registrationAvailability,
    pool: {
      ...pool,
      isPoolFull: poolOccupancy.isPoolFull,
    },
    registration: {
      ...registration,
      willBeUnreserved,
    },
  }
}
