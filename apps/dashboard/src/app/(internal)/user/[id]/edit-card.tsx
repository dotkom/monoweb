import { useSession } from "@dotkomonline/oauth2/react"
import { UserWriteSchema, type WorkspaceUser } from "@dotkomonline/types"
import { Button, Group, Loader, Stack, Text, TextInput, Title } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconCheck, IconLink, IconUsersGroup, IconX } from "@tabler/icons-react"
import { type FC, useEffect, useState } from "react"
import { useLinkOwUserToWorkspaceUserMutation, useUpdateUserMutation } from "../mutations"
import { useFindWorkspaceUserQuery, useGroupAllByMemberQuery, useIsAdminQuery } from "../queries"
import { useUserProfileEditForm } from "./edit-form"
import { useUserDetailsContext } from "./provider"

export const UserEditCard: FC = () => {
  const session = useSession()
  const { user } = useUserDetailsContext()

  const [customKey, setCustomKey] = useState<string | undefined>(undefined)

  const { isAdmin } = useIsAdminQuery()
  const groups = useGroupAllByMemberQuery(user.id)

  const update = useUpdateUserMutation()
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()

  const isUser = session?.sub === user.id

  const isWorkspaceLinked = Boolean(user.workspaceUserId)
  const showWorkspaceLink = isWorkspaceLinked || groups.length > 0
  const isWorkspaceFetchEnabled = (isAdmin || isUser) && showWorkspaceLink
  const { workspaceUser, isLoading: isLoadingWorkspaceUser } = useFindWorkspaceUserQuery(
    user.id,
    customKey,
    isWorkspaceFetchEnabled
  )

  const EditUserProfileComponent = useUserProfileEditForm({
    label: "Oppdater profil",
    onSubmit: (data) => {
      const result = UserWriteSchema.parse(data)

      if (result.phone === "") {
        result.phone = null
      }

      update.mutate({
        input: result,
        id: user.id,
      })
    },
    defaultValues: { ...user },
  })

  return (
    <Stack>
      <Title order={2}>Profil</Title>

      <LinkUser
        showWorkspaceLink={showWorkspaceLink}
        isAdmin={isAdmin ?? false}
        isWorkspaceLinked={isWorkspaceLinked}
        isWorkspaceFetchEnabled={isWorkspaceFetchEnabled}
        isLoadingWorkspaceUser={isLoadingWorkspaceUser}
        workspaceUser={workspaceUser ?? null}
        setCustomKey={setCustomKey}
        onClick={() => linkUserMutation.mutate({ userId: user.id })}
      />

      <EditUserProfileComponent />
    </Stack>
  )
}

interface LinkUserProps {
  showWorkspaceLink: boolean
  isAdmin: boolean
  isWorkspaceLinked: boolean
  isWorkspaceFetchEnabled: boolean
  isLoadingWorkspaceUser: boolean
  workspaceUser: WorkspaceUser | null
  setCustomKey: (key: string | undefined) => void
  onClick: () => void
}

const LinkUser: FC<LinkUserProps> = ({
  showWorkspaceLink,
  isAdmin,
  isWorkspaceLinked,
  isWorkspaceFetchEnabled,
  isLoadingWorkspaceUser,
  workspaceUser,
  setCustomKey,
  onClick,
}) => {
  const [customKey, setCustomKey_] = useState<string | undefined>(undefined)
  const [debouncedCustomKey] = useDebouncedValue(customKey, 700)

  useEffect(() => {
    setCustomKey(debouncedCustomKey)
  }, [setCustomKey, debouncedCustomKey])

  if (!showWorkspaceLink) {
    return null
  }

  const pillIconColor = isWorkspaceFetchEnabled
    ? "var(--mantine-color-green-filled)"
    : "var(--mantine-color-gray-light-color)"

  return (
    <Stack p="md" bg="var(--mantine-color-gray-light)" style={{ borderRadius: "var(--mantine-radius-md)" }}>
      <Stack gap="xs">
        <Title order={4}>Google Workspace-bruker</Title>

        {isWorkspaceLinked ? (
          <Group
            gap={4}
            w="fit-content"
            p="calc(var(--mantine-spacing-xs)/2)"
            bg={isWorkspaceFetchEnabled ? "var(--mantine-color-green-light)" : "var(--mantine-color-gray-light)"}
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          >
            {isLoadingWorkspaceUser ? (
              <Loader size={12} mx={2} color={pillIconColor} />
            ) : (
              <IconCheck size={16} color={pillIconColor} />
            )}
            {isLoadingWorkspaceUser ? (
              <Text size="xs">Laster bruker...</Text>
            ) : (
              <Text size="xs">
                Tilknyttet{" "}
                {!isWorkspaceFetchEnabled
                  ? "Google Workspace-bruker"
                  : `${workspaceUser?.primaryEmail ?? "<ukjent e-post>"}`}
              </Text>
            )}
          </Group>
        ) : (
          <Group
            gap={4}
            w="fit-content"
            p="calc(var(--mantine-spacing-xs)/2)"
            bg="var(--mantine-color-red-light)"
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          >
            <IconX size={16} color="var(--mantine-color-red-filled)" />
            <Text size="xs">Ikke tilknyttet til en Google-bruker</Text>
          </Group>
        )}
      </Stack>

      {!isWorkspaceLinked && !isAdmin && (
        <Text size="xs">
          Kontakt HS for å tilknytte brukeren til en Google-bruker. Brukeren må tilknyttes for å kunne bli lagt til i
          e-postlister.
        </Text>
      )}

      {!isWorkspaceLinked && isAdmin && (
        <TextInput
          description="Egendefinert nøkkel. Bruk denne om den ikke finner automatisk. Kan være komplett e-postadresse eller fullt navn."
          placeholder="navn.navnesen@online.ntnu.no eller Navn Navnesen"
          value={customKey ?? ""}
          onChange={(event) => setCustomKey_(event.currentTarget.value || undefined)}
        />
      )}

      {isWorkspaceFetchEnabled && !isWorkspaceLinked && (
        <>
          {isLoadingWorkspaceUser ? (
            <Group gap="xs">
              <Loader size="xs" />
              <Text>Finner {!customKey ? "potensiell bruker..." : "bruker..."}</Text>
            </Group>
          ) : workspaceUser ? (
            <>
              <Group
                bg="var(--mantine-color-gray-light)"
                w="fit-content"
                p="sm"
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
              >
                <IconUsersGroup size={24} color="var(--mantine-color-gray-text)" />
                <Stack gap="xs">
                  <Text size="xs">Brukeren kan tilknyttes med:</Text>
                  <Text>{workspaceUser.name?.fullName ?? "<Ingen navn>"}</Text>
                  <Text size="xs">{workspaceUser.primaryEmail ?? "<Ingen e-post>"}</Text>
                </Stack>
              </Group>
              <Text size="xs" c="dimmed">
                Dersom dette er feil, ta konktakt med Dotkom.
              </Text>
            </>
          ) : (
            <Group
              bg="var(--mantine-color-gray-light)"
              w="fit-content"
              p="sm"
              style={{ borderRadius: "var(--mantine-radius-sm)" }}
            >
              <IconX size={24} color="var(--mantine-color-error)" />
              <Stack gap="xs">
                <Text>Ingen bruker funnet.</Text>

                <Text size="xs">
                  Vi fant ingenting basert på {debouncedCustomKey ? "den egendefinerte nøkkelen" : "brukerens navn"}.
                </Text>
              </Stack>
            </Group>
          )}

          <Button
            color="green"
            w="fit-content"
            disabled={!isAdmin || !workspaceUser}
            leftSection={<IconLink size={16} />}
            onClick={onClick}
          >
            Det er riktig, tilknytt
          </Button>
        </>
      )}
    </Stack>
  )
}
