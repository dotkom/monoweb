import {
  Button,
  Divider,
  Group,
  Image,
  Popover,
  PopoverDropdown,
  PopoverTarget,
  Space,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
} from "@mantine/core"
import { differenceInHours, formatDate, formatDistanceToNowStrict } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import type { FC } from "react"
import { GenericTable } from "@/components/GenericTable"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useGroupMemberForm } from "../../group-member-form"
import { useEndGroupMembershipMutation, useStartGroupMembershipMutation } from "../../mutations"
import { useGroupDetailsContext } from "../provider"
import { useGroupMemberDetailsContext } from "./provider"
import { useGroupMembershipTable } from "./use-group-membership-table"

export const GroupMemberEditCard: FC = () => {
  const isDarkMode = useComputedColorScheme() === "dark"
  const { groupMember } = useGroupMemberDetailsContext()

  const startMembership = useStartGroupMembershipMutation()
  const endMembership = useEndGroupMembershipMutation()

  const table = useGroupMembershipTable({ groupMember })
  const { group } = useGroupDetailsContext()

  const activeMemberships = groupMember.groupMemberships.filter((membership) => membership.end === null)

  const FormComponent = useGroupMemberForm({
    label: activeMemberships.length ? "Avslutt nåværende og lag nytt medlemskap" : "Legg til medlemskap",
    groupId: group.slug,
    onSubmit: (data) => {
      startMembership.mutate({
        userId: groupMember.id,
        groupId: group.slug,
        roleIds: data.roleIds,
      })
    },
  })

  const openEndMembershipModal = useConfirmDeleteModal({
    title: "Avslutt medlemskap",
    text: `Er du sikker på at du vil avslutte medlemskapet for ${groupMember?.name}?`,
    confirmText: "Avslutt medlemskap",
    cancelText: "Avbryt",
    onConfirm: () => {
      endMembership.mutate({ groupId: group.slug, userId: groupMember.id })
    },
  })

  return (
    <Stack>
      <Stack gap="xs">
        <Group gap={6}>
          Gruppe:
          {group.imageUrl && (
            <Image
              src={group.imageUrl}
              alt={group.name ?? "Gruppens logo"}
              height={24}
              width={24}
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
          )}
          <Link href={`/group/${group.slug}`}>{group.name || group.abbreviation || "Ukjent gruppe"}</Link>
        </Group>
        <Group gap={6}>
          Bruker:
          {groupMember.imageUrl && (
            <Image
              src={groupMember.imageUrl}
              alt={groupMember.name ?? "Profilbilde"}
              height={24}
              width={24}
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            />
          )}
          <Link href={`/user/${groupMember.id}`}>{groupMember.name || "Ukjent bruker"}</Link>
        </Group>
      </Stack>

      <Group>
        <Popover position="bottom-start">
          <PopoverTarget>
            <Button variant="light" size="sm">
              Hvordan virker medlemskap og roller?
            </Button>
          </PopoverTarget>
          <PopoverDropdown>
            <Stack gap="xs">
              <Text>
                Vi lagrer ett medlemskap per sett med roller. Det betyr at ett medlem gjerne har flere medlemskaper,
                hvor hvert medlemskap kan ha flere roller.
              </Text>
              <Text>
                Dersom et medlem endrer roller, skal man avslutte nåværende medlemskap og opprette et nytt medlemskap
                med de nye rollene.
              </Text>
              <Text>
                Eksempel: Du starter som medlem, så blir du Vinstraffansvarlig, og senere blir du tillitsvalgt i tillegg
                til Vinstraffansvarlig, og til slutt er du bare medlem igjen.
                <br />
                Rollene dine ser sånn her ut: Medlem → Vinstraffansvarlig → Vinstraffansvarlig og tillitsvalgt → medlem
              </Text>
              <Text>
                Dersom noen har en rolle (f.eks. Vinstraffansvarlig), er det ikke nødvendig å føre opp "Medlem" (eller
                en ekvivalent generisk medlemsrolle).
              </Text>
            </Stack>
          </PopoverDropdown>
        </Popover>
      </Group>

      <Divider />

      {activeMemberships.length ? (
        <Stack gap="xs">
          <Text>Aktivt medlemskap:</Text>
          <Stack
            gap="xs"
            p="md"
            bg={isDarkMode ? "gray.8" : "gray.0"}
            style={{ borderRadius: "var(--mantine-radius-lg)" }}
          >
            {activeMemberships.map((membership) => (
              <Stack key={membership.id} gap={4}>
                <Title order={3}>{membership.roles.map((role) => role.name).join(", ")}</Title>
                <Text>
                  {differenceInHours(new Date(), membership.start, { roundingMethod: "floor" }) < 1
                    ? "Under én time"
                    : formatDistanceToNowStrict(membership.start, { locale: nb })}{" "}
                  (siden {formatDate(membership.start, "dd. MMMM yyyy", { locale: nb })})
                </Text>
              </Stack>
            ))}
            <Group>
              <Button color="red" variant="light" size="sm" onClick={() => openEndMembershipModal()}>
                Avslutt medlemskapet
              </Button>
            </Group>
          </Stack>
          <Divider />
        </Stack>
      ) : (
        <>
          <Text size="xl">Ikke aktivt medlem</Text>
          <Divider />
        </>
      )}

      <FormComponent />
      <GenericTable table={table} />
      <Space h="xl" />
    </Stack>
  )
}
