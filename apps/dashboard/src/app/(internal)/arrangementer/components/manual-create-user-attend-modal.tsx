import { createCheckboxInput } from "@/components/forms/CheckboxInput"
import { useFormBuilder } from "@/components/forms/Form"
import { createSegmentedControlInput } from "@/components/forms/SegmentedControlInput"
import type { InputProducerResult } from "@/components/forms/types"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { notifyFail } from "@/lib/notifications"
import {
  type Attendance,
  type AttendancePool,
  type Attendee,
  getAttendablePool,
  getReservedAttendeeCount,
  getUnreservedAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import type { Event, EventId, EventWithAttendance } from "@dotkomonline/rpc/event"
import type { User, UserId } from "@dotkomonline/rpc/user"
import { Group, Loader, Stack, Text } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { IconAlertTriangle } from "@tabler/icons-react"
import { type FC, useEffect } from "react"
import { type Control, type UseFormGetValues, type UseFormSetValue, useWatch } from "react-hook-form"
import { z } from "zod"
import { useUserQuery } from "../../brukere/queries"
import { useAdminForEventMutation as useAdminRegisterForEventMutation } from "../mutations"
import { useAttendanceGetQuery, useFindParentEventQuery } from "../queries"
import { UserBox } from "./user-box"

interface ModalProps {
  userId: string
  attendanceId: string
  eventId: EventId
}

const FormSchema = z.object({
  poolId: z.string(),
  ignoreRegisteredToParent: z.boolean().default(true),
  immediateReservation: z.boolean().default(false),
  paymentDeadlineHours: z.enum(["1", "24"]).default("24"),
})

type FormInput = z.input<typeof FormSchema>
type FormResult = z.output<typeof FormSchema>

export const ManualCreateUserAttendModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendanceId, eventId, userId },
}) => {
  const isMobile = useIsMobile() ?? false
  const { mutate: createAttendee } = useAdminRegisterForEventMutation()

  const { data: attendance } = useAttendanceGetQuery(attendanceId)
  const { data: user, isLoading: isUserLoading } = useUserQuery(userId)
  const { data: parentEventWithAttendance } = useFindParentEventQuery(eventId)

  const defaultPoolId = getDefaultPoolId(attendance, user)

  const Form = useFormBuilder({
    schema: FormSchema,
    defaultValues: {
      poolId: defaultPoolId,
      ignoreRegisteredToParent: true,
      immediateReservation: false,
      paymentDeadlineHours: "24",
    },
    fields: {
      poolId: createPoolIdField(attendance, user, isMobile),
      ignoreRegisteredToParent: createIgnoreRegisteredToParentField(parentEventWithAttendance, userId),
      immediateReservation: createCheckboxInput({
        label: "Tving påmeldtstatus",
        description:
          "Gir reservert plass med en gang. Uten dette kan brukeren havne i kø hvis gruppen er full, har utsettelse, eller brukeren har prikker.",
      }),
      paymentDeadlineHours: createPaymentDeadlineField(attendance),
    },
    label: "Meld på bruker",
    onSubmit: (values) => {
      try {
        createAttendee({
          attendanceId,
          userId,
          attendancePoolId: values.poolId,
          options: {
            ignoreRegisteredToParent: values.ignoreRegisteredToParent,
            immediateReservation: values.immediateReservation,
            immediatePayment: isImmediatePayment(values.paymentDeadlineHours),
          },
        })

        context.closeModal(id)
      } catch (e) {
        notifyFail({
          title: "Oops!",
          message: (e as Error).message,
        })
      }
    },
  })

  return (
    <Stack w="100%" style={{ overflowX: "auto" }}>
      <UserSection user={user} isLoading={isUserLoading} isMobile={isMobile} />
      <Form />
    </Stack>
  )
}

function UserSection({ user, isLoading, isMobile }: { user: User | undefined; isLoading: boolean; isMobile: boolean }) {
  if (isLoading) {
    return <Loader />
  }

  if (user === undefined) {
    return null
  }

  return <UserBox user={user} isMobile={isMobile} />
}

function createPoolIdField(
  attendance: Attendance | undefined,
  user: User | undefined,
  isMobile: boolean
): InputProducerResult<FormInput, FormResult> {
  const PoolInput = createSegmentedControlInput<FormInput, FormResult>({
    label: "Påmeldingsgruppe",
    orientation: isMobile ? "vertical" : "horizontal",
    data:
      attendance?.pools.map((pool) => ({
        label: pool.title,
        value: pool.id,
      })) ?? [],
  })

  return function PoolIdField(context) {
    useRecommendedPoolSelection({
      attendance,
      user,
      getValues: context.getValues,
      setValue: context.setValue,
      isPoolSelectionDirty: context.state.dirtyFields.poolId === true,
    })

    return (
      <Stack gap="xs">
        <PoolInput {...context} />
        <SelectedPoolOccupancy control={context.control} attendance={attendance} />
      </Stack>
    )
  }
}

function useRecommendedPoolSelection({
  attendance,
  user,
  getValues,
  setValue,
  isPoolSelectionDirty,
}: {
  attendance: Attendance | undefined
  user: User | undefined
  getValues: UseFormGetValues<FormInput>
  setValue: UseFormSetValue<FormInput>
  isPoolSelectionDirty: boolean
}) {
  const recommendedPoolId = getDefaultPoolId(attendance, user)

  useEffect(() => {
    if (recommendedPoolId === "") {
      return
    }

    if (isPoolSelectionDirty) {
      return
    }

    if (getValues("poolId") === recommendedPoolId) {
      return
    }

    setValue("poolId", recommendedPoolId)
  }, [getValues, isPoolSelectionDirty, recommendedPoolId, setValue])
}

function createIgnoreRegisteredToParentField(
  parentEventWithAttendance: EventWithAttendance | null | undefined,
  userId: UserId
): InputProducerResult<FormInput, FormResult> {
  const IgnoreParentInput = createCheckboxInput<FormInput, FormResult>({
    label: "Ignorer påmelding til forelderarrangement",
    description: "Tillat påmelding selv om brukeren ikke er påmeldt forelderarrangementet.",
  })

  return function IgnoreRegisteredToParentField(context) {
    if (parentEventWithAttendance == null) {
      return null
    }

    return (
      <Stack gap="xs">
        <ParentEventRegistrationStatus
          parentEvent={parentEventWithAttendance.event}
          parentAttendance={parentEventWithAttendance.attendance}
          userId={userId}
        />
        <IgnoreParentInput {...context} />
      </Stack>
    )
  }
}

function ParentEventRegistrationStatus({
  parentEvent,
  parentAttendance,
  userId,
}: {
  parentEvent: Event
  parentAttendance: Attendance | null
  userId: UserId
}) {
  const parentAttendee = parentAttendance?.attendees.find((attendee) => attendee.userId === userId) ?? null
  const isMissingReservedSpot = parentAttendee === null || !parentAttendee.reserved

  return (
    <Group gap={6} mb="xs">
      <ParentRegistrationWarning showWarning={isMissingReservedSpot} />
      <Text size="sm">{getParentRegistrationStatusText(parentEvent.title, parentAttendee)}</Text>
    </Group>
  )
}

function ParentRegistrationWarning({ showWarning }: { showWarning: boolean }) {
  if (!showWarning) {
    return null
  }

  return <IconAlertTriangle color="var(--mantine-color-red-6)" size={20} />
}

function getParentRegistrationStatusText(parentEventTitle: string, parentAttendee: Attendee | null): string {
  if (parentAttendee === null) {
    return `Ikke påmeldt forelderarrangementet ${parentEventTitle}`
  }

  if (!parentAttendee.reserved) {
    return `På venteliste på forelderarrangementet ${parentEventTitle}`
  }

  return `Påmeldt forelderarrangementet ${parentEventTitle}`
}

function createPaymentDeadlineField(attendance: Attendance | undefined): InputProducerResult<FormInput, FormResult> {
  const PaymentDeadlineInput = createSegmentedControlInput<FormInput, FormResult>({
    label: "Betalingsfrist",
    data: [
      { value: "1", label: "1 time" },
      { value: "24", label: "24 timer" },
    ],
  })

  return function PaymentDeadlineField(context) {
    if (attendance === undefined || attendance.attendancePrice === null || attendance.attendancePrice === 0) {
      return null
    }

    return <PaymentDeadlineInput {...context} />
  }
}

function isImmediatePayment(paymentDeadlineHours: FormResult["paymentDeadlineHours"]): boolean {
  return paymentDeadlineHours === "1"
}

function getDefaultPoolId(attendance: Attendance | undefined, user: User | undefined): string {
  if (attendance === undefined) {
    return ""
  }

  if (user !== undefined) {
    const attendablePool = getAttendablePool(attendance, user)

    if (attendablePool !== null) {
      return attendablePool.id
    }
  }

  return attendance.pools[0]?.id ?? ""
}

function SelectedPoolOccupancy({
  control,
  attendance,
}: {
  control: Control<FormInput>
  attendance: Attendance | undefined
}) {
  const selectedPoolId = useWatch({ control, name: "poolId" })

  if (attendance === undefined) {
    return null
  }

  const selectedPool = attendance.pools.find((pool) => pool.id === selectedPoolId)

  if (selectedPool === undefined) {
    return null
  }

  return <PoolOccupancyStatus pool={selectedPool} attendance={attendance} />
}

function PoolOccupancyStatus({ pool, attendance }: { pool: AttendancePool; attendance: Attendance }) {
  const reservedAttendeeCount = getReservedAttendeeCount(attendance, pool.id)
  const unreservedAttendeeCount = getUnreservedAttendeeCount(attendance, pool.id)
  const poolIsFull = pool.capacity > 0 && reservedAttendeeCount >= pool.capacity

  return (
    <Stack gap={4}>
      <Group gap={6}>
        <FullPoolWarning poolIsFull={poolIsFull} />
        <Text size="sm">{getPoolOccupancyText(pool, reservedAttendeeCount)}</Text>
      </Group>
      <WaitlistCount count={unreservedAttendeeCount} poolTitle={pool.title} />
    </Stack>
  )
}

function FullPoolWarning({ poolIsFull }: { poolIsFull: boolean }) {
  if (!poolIsFull) {
    return null
  }

  return <IconAlertTriangle color="var(--mantine-color-red-6)" size={20} />
}

function WaitlistCount({ count, poolTitle }: { count: number; poolTitle: string }) {
  if (count === 0) {
    return null
  }

  return (
    <Text size="sm">
      {count} i kø i {poolTitle}
    </Text>
  )
}

function getPoolOccupancyText(pool: AttendancePool, reservedAttendeeCount: number): string {
  if (pool.capacity > 0) {
    return `${reservedAttendeeCount}/${pool.capacity} påmeldte i ${pool.title}`
  }

  return `${reservedAttendeeCount} påmeldte i ${pool.title} (ledige plasser)`
}

export const openManualCreateUserAttendModal = ({ userId, attendanceId, eventId }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/create",
    title: "Admin-påmeld bruker",
    size: "lg",
    innerProps: { userId, attendanceId, eventId },
  })
