"use client"

import {
  type Membership,
  type User,
  findActiveMembership,
  getGenderName,
  getMembershipTypeName,
} from "@dotkomonline/rpc/user"
import { getStudyGrade } from "@dotkomonline/utils"
import { Avatar, Flex, Group, Stack, Text, Title } from "@mantine/core"
import { IconAlertTriangle, IconUser } from "@tabler/icons-react"

interface UserBoxProps {
  user: User
  isMobile: boolean
}

export function UserBox({ user, isMobile }: UserBoxProps) {
  const membership = findActiveMembership(user)

  return (
    <Stack>
      <Flex
        direction={isMobile ? "column" : "row"}
        gap="md"
        p="xs"
        bg="var(--mantine-color-gray-light)"
        style={{ borderRadius: "var(--mantine-radius-md)" }}
        align="flex-start"
        wrap="nowrap"
      >
        <Avatar src={user.imageUrl ?? undefined} alt={user.name ?? user.username} radius="sm" size={100}>
          <IconUser size={48} />
        </Avatar>

        <Stack gap={2}>
          <Title order={4}>{user.name}</Title>

          {membership === null ? (
            <Group gap={6}>
              <IconAlertTriangle color="var(--mantine-color-red-filled)" size={16} />
              <Text size="sm" c="red">
                Har ikke aktivt medlemskap
              </Text>
            </Group>
          ) : (
            <Text size="sm">{getMembershipDisplayText(membership)}</Text>
          )}

          <Text size="sm">Kjønn: {getGenderName(user.gender)}</Text>
          <Text size="sm">Kostholdsrestriksjoner: {user.dietaryRestrictions || "Ingen"}</Text>
        </Stack>
      </Flex>
    </Stack>
  )
}

function getMembershipDisplayText(membership: Membership): string {
  const membershipType = getMembershipTypeName(membership.type)
  const grade = membership.semester != null ? getStudyGrade(membership.semester) : null

  if (grade === null) {
    return membershipType
  }

  return `${grade}. klasse (${membershipType})`
}
