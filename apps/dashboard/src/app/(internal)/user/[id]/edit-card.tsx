import { useSession } from "@dotkomonline/oauth2/react"
import { UserWriteSchema } from "@dotkomonline/types"
import { Button, Group, Loader, Stack, Text, Title, useComputedColorScheme } from "@mantine/core"
import { IconCheck, IconLink, IconUserScan, IconX } from "@tabler/icons-react"
import type { FC } from "react"
import { useLinkOwUserToWorkspaceUserMutation, useUpdateUserMutation } from "../mutations"
import { useFindWorkspaceUserQuery, useGroupAllByMemberQuery, useIsAdminQuery } from "../queries"
import { useUserProfileEditForm } from "./edit-form"
import { useUserDetailsContext } from "./provider"

export const UserEditCard: FC = () => {
  const { user } = useUserDetailsContext()
  const session = useSession()
  const update = useUpdateUserMutation()
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()
  const isDarkMode = useComputedColorScheme() === "dark"

  const isUser = session?.sub === user.id
  const { isAdmin } = useIsAdminQuery()
  const isMeOrAdmin = isAdmin || isUser

  const groups = useGroupAllByMemberQuery(user.id)

  const isWorkspaceLinked = Boolean(user.workspaceUserId)
  const showWorkspaceLink = isWorkspaceLinked || groups.length > 0
  const isWorkspaceFetchEnabled = isMeOrAdmin && showWorkspaceLink
  const { workspaceUser, isLoading: isLoadingWorkspaceUser } = useFindWorkspaceUserQuery(
    user.id,
    isWorkspaceFetchEnabled
  )

  const EditUserProfileComponent = useUserProfileEditForm({
    label: "Oppdater profil",
    onSubmit: (data) => {
      console.log(data)
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

      {showWorkspaceLink && (
        <Stack p="md" bg={isDarkMode ? "dark.6" : "gray.0"} style={{ borderRadius: "var(--mantine-radius-md)" }}>
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
                <IconCheck
                  size={16}
                  color={
                    isWorkspaceFetchEnabled
                      ? "var(--mantine-color-green-filled)"
                      : "var(--mantine-color-gray-light-color)"
                  }
                />
                <Text size="xs">
                  Linket til{" "}
                  {isLoadingWorkspaceUser || !isWorkspaceFetchEnabled
                    ? "Google Workspace-bruker"
                    : `${workspaceUser?.primaryEmail ?? "<Ingen e-post>"}`}
                </Text>
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
                <Text size="xs">Ikke linket til Google Workspace</Text>
              </Group>
            )}
          </Stack>

          <Text size="xs">
            Du må linke brukeren for å kunne legge vedkommende til i e-postlister. Kontakt HS dersom du ønsker å linke
            en bruker. Bare brukeren selv, HS og Dotkom har tilgang til å linke brukeren.
          </Text>

          {isWorkspaceFetchEnabled && !isWorkspaceLinked && (
            <>
              {isLoadingWorkspaceUser ? (
                <Group gap="xs">
                  <Loader size="xs" />
                  <Text>"Finner potensiell bruker..."</Text>
                </Group>
              ) : workspaceUser ? (
                <>
                  <Group
                    bg="var(--mantine-color-gray-light)"
                    w="fit-content"
                    p="sm"
                    style={{ borderRadius: "var(--mantine-radius-sm)" }}
                  >
                    <IconUserScan size={24} color="var(--mantine-color-gray-text)" />
                    <Stack gap="xs">
                      <Text size="xs">Brukeren kan linkes med:</Text>
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
                  bg="var(--mantine-color-red-light)"
                  w="fit-content"
                  p="sm"
                  style={{ borderRadius: "var(--mantine-radius-sm)" }}
                >
                  <IconX size={24} color="var(--mantine-color-error)" />
                  <Stack gap="xs">
                    <Text>Ingen bruker funnet.</Text>

                    <Text size="xs">
                      Dette skyldes at det ikke finnes noen bruker med en e-postadresse som kan deriveres fra brukerens
                      gitte navn.
                      <br />
                      Sjekk at navnet under er riktig, og at brukeren har en Google Workspace-konto.
                    </Text>

                    <Text size="xs">Kontakt Dotkom for manuell linking.</Text>
                  </Stack>
                </Group>
              )}

              <Button
                color="green"
                w="fit-content"
                disabled={!isMeOrAdmin || !workspaceUser}
                leftSection={<IconLink size={16} />}
                onClick={() => {
                  linkUserMutation.mutate({ userId: user.id })
                }}
              >
                Det er riktig bruker, link
              </Button>
            </>
          )}
        </Stack>
      )}

      <EditUserProfileComponent />
    </Stack>
  )
}
