"use client"
import {
  type Attendance,
  type AttendeeId,
  type User,
  findActiveMembership,
  getMembershipGrade,
} from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { Button, Group, Image, Stack, Text, Title } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react"
import { formatDate, formatDistanceToNow } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { useUpdateEventAttendanceMutation } from "../mutations"

interface ModalProps {
  attendance: Attendance
  attendeeId: AttendeeId
}

export const QRCodeScannedModal: FC<ContextModalProps<ModalProps>> = ({
  context,
  id,
  innerProps: { attendance, attendeeId },
}) => {
  const registerAttendance = useUpdateEventAttendanceMutation()

  const attendee = attendance.attendees.find((attendee) => attendee.id === attendeeId)
  const pool = attendee && attendance.pools.find((pool) => pool.id === attendee.attendancePoolId)

  if (!attendee) {
    return (
      <Stack>
        <Group gap={6}>
          <IconX color="var(--mantine-color-red-6)" size={28} />
          <Title order={4}>Ingen deltaker funnet</Title>
        </Group>
        <Text>Det kan være at QR-koden er til et annet arrangement</Text>
        <Group>
          <Button onClick={() => context.closeModal(id)}>Okay</Button>
        </Group>
      </Stack>
    )
  }

  if (!pool) {
    return (
      <Stack>
        <UserBox user={attendee.user} />
        <Group gap={6}>
          <IconX color="var(--mantine-color-red-6)" size={28} />
          <Title order={4}>Gruppe mangler</Title>
        </Group>
        <Text>Deltaker ble funnet, men påmeldingsgruppen mangler</Text>
        <Group>
          <Button onClick={() => context.closeModal(id)}>Okay</Button>
        </Group>
      </Stack>
    )
  }

  if (attendee.attendedAt) {
    return (
      <Stack>
        <UserBox user={attendee.user} />
        <Group gap={6}>
          <IconX color="var(--mantine-color-red-6)" size={28} />
          <Title order={4}>Allerede registrert</Title>
        </Group>
        <Stack gap={4}>
          <Text>Deltaker har allerede registrert oppmøte</Text>
          <Text size="sm">
            Registrert for {formatDistanceToNow(attendee.attendedAt, { locale: nb, addSuffix: true })} (
            {formatDate(attendee.attendedAt, "dd. MMM yyyy 'kl.' HH:mm", { locale: nb })})
          </Text>
        </Stack>
        <Group>
          <Button onClick={() => context.closeModal(id)}>Okay</Button>
        </Group>
      </Stack>
    )
  }

  const handleClick = () => {
    registerAttendance.mutate({ id: attendeeId, at: getCurrentUTC() })

    context.closeModal(id)
  }

  return (
    <Stack>
      <UserBox user={attendee.user} />
      <Stack gap={4}>
        <Group gap={6}>
          {attendee.reserved ? (
            <>
              <IconCheck color="var(--mantine-color-green-6)" size={20} />
              <Text>Reservert plass</Text>
            </>
          ) : (
            <>
              <IconAlertTriangle color="var(--mantine-color-red-6)" size={20} />
              <Text>Venteliste</Text>
            </>
          )}
        </Group>

        {attendance.attendancePrice && (
          <Group gap={6}>
            {attendee.paymentChargedAt ? (
              <>
                <IconCheck color="var(--mantine-color-green-6)" size={20} />
                <Text>Betalt</Text>
              </>
            ) : attendee.paymentReservedAt ? (
              <>
                <IconCheck color="var(--mantine-color-green-6)" size={20} />
                <Text>Reservert betaling</Text>
              </>
            ) : (
              <>
                <IconAlertTriangle color="var(--mantine-color-red-6)" size={20} />
                <Text>Ikke betalt</Text>
              </>
            )}
          </Group>
        )}
      </Stack>

      <Stack>
        <Text>Er du sikker på at du vil registrere oppmøte?</Text>
        <Group>
          <Button color="blue" onClick={handleClick}>
            Ja
          </Button>
          <Button color="gray" onClick={() => context.closeModal(id)}>
            Nei
          </Button>
        </Group>
      </Stack>
    </Stack>
  )
}

interface UserBoxProps {
  user: User
}

const UserBox = ({ user }: UserBoxProps) => {
  const membership = findActiveMembership(user)
  const grade = membership ? getMembershipGrade(membership) : null

  return (
    <Group p="sm" bg="gray.1" style={{ borderRadius: 16 }} align="flex-start">
      <Stack>
        <Group align="flex-start" wrap="nowrap">
          <Image src={user.imageUrl} alt={user.name ?? user.profileSlug} radius="md" w={100} h={100} />
          <Stack gap={2}>
            <Title order={4}>{user.name}</Title>
            <Text size="sm">Klasse: {grade}</Text>
            <Text size="sm">Kjønn: {user.gender || "Ikke oppgitt"}</Text>
            <Text size="sm">Kostholdsrestriksjoner: {user.dietaryRestrictions || "Ingen"}</Text>
          </Stack>
        </Group>
      </Stack>
    </Group>
  )
}

export const openQRCodeScannedModal = ({ attendance, attendeeId }: ModalProps) =>
  modals.openContextModal({
    modal: "event/attendance/attendee/qr-code-scanned",
    title: "QR-kode skannet",
    innerProps: { attendance, attendeeId },
  })
