"use client"

import { CheckboxField } from "@/components/forms/CheckboxField"
import { Form } from "@/components/forms/Form"
import { SegmentedControlField } from "@/components/forms/SegmentedControlField"
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
import type { Event, EventId } from "@dotkomonline/rpc/event"
import type { User, UserId } from "@dotkomonline/rpc/user"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogTitle, Button, Text } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconAlertTriangle, IconX } from "@tabler/icons-react"
import { useEffect } from "react"
import { type Control, useForm, type UseFormGetValues, type UseFormSetValue, useWatch } from "react-hook-form"
import { z } from "zod"
import { useUserQuery } from "../../../../brukere/queries"
import { useAdminForEventMutation as useAdminRegisterForEventMutation } from "../../../mutations"
import { useAttendanceGetQuery, useFindParentEventQuery } from "../../../queries"
import { UserBox } from "./UserBox"

export type ManualCreateUserAttendModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function ManualCreateUserAttendModal({
  open,
  onOpenChange,
  attendanceId,
  eventId,
  userId,
}: ManualCreateUserAttendModalProps) {
  const isMobile = useIsMobile() ?? false
  const { mutate: createAttendee } = useAdminRegisterForEventMutation()

  const { data: attendance } = useAttendanceGetQuery(attendanceId, open)
  const { data: user, isLoading: isUserLoading } = useUserQuery(userId)
  const { data: parentEventWithAttendance } = useFindParentEventQuery(eventId)

  const defaultPoolId = getDefaultPoolId(attendance, user)

  const form = useForm<FormInput, unknown, FormResult>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      poolId: defaultPoolId,
      ignoreRegisteredToParent: true,
      immediateReservation: false,
      paymentDeadlineHours: "24",
    },
  })

  useRecommendedPoolSelection({
    attendance,
    user,
    getValues: form.getValues,
    setValue: form.setValue,
    isPoolSelectionDirty: form.formState.dirtyFields.poolId === true,
    open,
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="lg" onOutsideClick={() => onOpenChange(false)}>
        <div className="flex flex-row items-center justify-between gap-4">
          <AlertDialogTitle>Admin-påmeld bruker</AlertDialogTitle>
          <AlertDialogCancel type="button">
            <IconX className="size-5" />
          </AlertDialogCancel>
        </div>

        {open && (
          <div className="flex w-full flex-col gap-4 overflow-x-auto">
            {isUserLoading ? (
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              user && <UserBox user={user} isMobile={isMobile} />
            )}

            <Form
              form={form}
              onSubmit={(values) => {
                try {
                  createAttendee({
                    attendanceId,
                    userId,
                    attendancePoolId: values.poolId,
                    options: {
                      ignoreRegisteredToParent: values.ignoreRegisteredToParent,
                      immediateReservation: values.immediateReservation,
                      immediatePayment: isImmediatePayment(values.paymentDeadlineHours ?? "24"),
                    },
                  })
                  onOpenChange(false)
                } catch (e) {
                  notifyFail({
                    title: "Oops!",
                    message: (e as Error).message,
                  })
                }
              }}
            >
              <PoolIdFields attendance={attendance} isMobile={isMobile} control={form.control} />

              {parentEventWithAttendance != null && (
                <>
                  <ParentEventRegistrationStatus
                    parentEvent={parentEventWithAttendance.event}
                    parentAttendance={parentEventWithAttendance.attendance}
                    userId={userId}
                  />
                  <CheckboxField
                    control={form.control}
                    name="ignoreRegisteredToParent"
                    label="Ignorer påmelding til forelderarrangement"
                    description="Tillat påmelding selv om brukeren ikke er påmeldt forelderarrangementet."
                  />
                </>
              )}

              <CheckboxField
                control={form.control}
                name="immediateReservation"
                label="Tving påmeldtstatus"
                description="Gir reservert plass med en gang. Uten dette kan brukeren havne i kø hvis gruppen er full, har utsettelse, eller brukeren har prikker."
              />

              {attendance !== undefined && attendance.attendancePrice !== null && attendance.attendancePrice !== 0 && (
                <SegmentedControlField
                  control={form.control}
                  name="paymentDeadlineHours"
                  label="Betalingsfrist"
                  options={[
                    { value: "1", label: "1 time" },
                    { value: "24", label: "24 timer" },
                  ]}
                  fullWidth={isMobile}
                />
              )}

              <Button type="submit" variant="default" className="w-fit">
                Meld på bruker
              </Button>
            </Form>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

function PoolIdFields({
  attendance,
  isMobile,
  control,
}: {
  attendance: Attendance | undefined
  isMobile: boolean
  control: Control<FormInput>
}) {
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControlField
        control={control}
        name="poolId"
        label="Påmeldingsgruppe"
        options={
          attendance?.pools.map((pool) => ({
            label: pool.title,
            value: pool.id,
          })) ?? []
        }
        fullWidth={isMobile}
        className={isMobile ? "flex-col" : undefined}
        required
      />
      <SelectedPoolOccupancy control={control} attendance={attendance} />
    </div>
  )
}

function useRecommendedPoolSelection({
  attendance,
  user,
  getValues,
  setValue,
  isPoolSelectionDirty,
  open,
}: {
  attendance: Attendance | undefined
  user: User | undefined
  getValues: UseFormGetValues<FormInput>
  setValue: UseFormSetValue<FormInput>
  isPoolSelectionDirty: boolean
  open: boolean
}) {
  const recommendedPoolId = getDefaultPoolId(attendance, user)

  useEffect(() => {
    if (!open) {
      return
    }

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
  }, [getValues, isPoolSelectionDirty, open, recommendedPoolId, setValue])
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
    <div className="mb-2 flex items-center gap-1.5">
      {isMissingReservedSpot && <IconAlertTriangle className="size-5 text-red-600" />}
      <Text className="text-sm">{getParentRegistrationStatusText(parentEvent.title, parentAttendee)}</Text>
    </div>
  )
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
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {poolIsFull && <IconAlertTriangle className="size-5 text-red-600" />}
        <Text className="text-sm">{getPoolOccupancyText(pool, reservedAttendeeCount)}</Text>
      </div>
      <WaitlistCount count={unreservedAttendeeCount} poolTitle={pool.title} />
    </div>
  )
}

function WaitlistCount({ count, poolTitle }: { count: number; poolTitle: string }) {
  if (count === 0) {
    return null
  }

  return (
    <Text className="text-sm">
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
