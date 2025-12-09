import type { WorkspaceGroup } from "@dotkomonline/types"
import { Button, Group, Loader, Stack, Text, TextInput, Title } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { IconCheck, IconLink, IconTrash, IconUsersGroup, IconX } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { type FC, useEffect, useState } from "react"
import { useConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useIsAdminQuery } from "../../user/queries"
import { useDeleteGroupMutation, useLinkGroupMutation, useUpdateGroupMutation } from "../mutations"
import { useFindWorkspaceGroupQuery } from "../queries"
import { useGroupWriteForm } from "../write-form"
import { useGroupDetailsContext } from "./provider"

export const GroupEditCard: FC = () => {
  const router = useRouter()
  const { group } = useGroupDetailsContext()

  const [customKey, setCustomKey] = useState<string | undefined>(undefined)

  const edit = useUpdateGroupMutation()
  const remove = useDeleteGroupMutation()
  const linkGroupMutation = useLinkGroupMutation()

  const open = useConfirmDeleteModal({
    title: "Slett gruppe",
    text: `Er du sikker på at du vil slette ${group.name}?`,
    onConfirm: () => {
      remove.mutate(group.slug)
      router.push("/group/")
    },
  })

  const { isAdmin } = useIsAdminQuery()

  const isWorkspaceLinked = Boolean(group.workspaceGroupId)
  const showWorkspaceLink = isWorkspaceLinked || group.type === "COMMITTEE" || group.type === "NODE_COMMITTEE"
  const isWorkspaceFetchEnabled = (isAdmin ?? false) && showWorkspaceLink
  const { workspaceGroup, isLoading: isLoadingWorkspaceGroup } = useFindWorkspaceGroupQuery(
    group.slug,
    customKey || undefined,
    isWorkspaceFetchEnabled
  )

  const FormComponent = useGroupWriteForm({
    label: "Oppdater gruppe",
    onSubmit: (data) => {
      edit.mutate({
        id: group.slug,
        values: data,
      })
    },
    defaultValues: group,
  })

  return (
    <Stack>
      <LinkGroup
        showWorkspaceLink={showWorkspaceLink}
        isAdmin={isAdmin ?? false}
        isWorkspaceLinked={isWorkspaceLinked}
        isWorkspaceFetchEnabled={isWorkspaceFetchEnabled}
        isLoadingWorkspaceGroup={isLoadingWorkspaceGroup}
        workspaceGroup={workspaceGroup ?? null}
        setCustomKey={setCustomKey}
        onClick={() => linkGroupMutation.mutate({ groupSlug: group.slug, customKey })}
      />

      <FormComponent />

      <Button variant="outline" color="red" w="fit-content" onClick={open} leftSection={<IconTrash size={16} />}>
        Slett gruppe
      </Button>
    </Stack>
  )
}

interface LinkGroupProps {
  showWorkspaceLink: boolean
  isAdmin: boolean
  isWorkspaceLinked: boolean
  isWorkspaceFetchEnabled: boolean
  isLoadingWorkspaceGroup: boolean
  workspaceGroup: WorkspaceGroup | null
  setCustomKey: (key: string | undefined) => void
  onClick: () => void
}

const LinkGroup: FC<LinkGroupProps> = ({
  showWorkspaceLink,
  isAdmin,
  isWorkspaceLinked,
  isWorkspaceFetchEnabled,
  isLoadingWorkspaceGroup,
  workspaceGroup,
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
        <Title order={4}>Google Workspace-gruppe</Title>

        {isWorkspaceLinked ? (
          <Group
            gap={4}
            w="fit-content"
            p="calc(var(--mantine-spacing-xs)/2)"
            bg={isWorkspaceFetchEnabled ? "var(--mantine-color-green-light)" : "var(--mantine-color-gray-light)"}
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          >
            {isLoadingWorkspaceGroup ? (
              <Loader size={12} mx={2} color={pillIconColor} />
            ) : (
              <IconCheck size={16} color={pillIconColor} />
            )}
            {isLoadingWorkspaceGroup ? (
              <Text size="xs">Laster gruppe...</Text>
            ) : (
              <Text size="xs">
                Tilknyttet{" "}
                {!isWorkspaceFetchEnabled ? "Google Workspace-gruppe" : `${workspaceGroup?.email ?? "<ukjent e-post>"}`}
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
            <Text size="xs">Ikke tilknyttet til en e-postliste</Text>
          </Group>
        )}
      </Stack>

      {!isWorkspaceLinked && !isAdmin && (
        <Text size="xs">
          Kontakt HS for å tilknytte gruppen til en e-postliste. Gruppen må tilknyttes for å kunne legge medlemmer til i
          e-postlisten.
        </Text>
      )}

      {!isWorkspaceLinked && isAdmin && (
        <TextInput
          description="Egendefinert nøkkel. Bruk denne om den ikke finner automatisk. Må være en komplett e-postadresse eller lokaldelen til e-postadressen (det før @)."
          placeholder="dotkom@online.ntnu.no eller dotkom"
          value={customKey ?? ""}
          onChange={(event) => setCustomKey_(event.currentTarget.value || undefined)}
        />
      )}

      {isWorkspaceFetchEnabled && !isWorkspaceLinked && (
        <>
          {isLoadingWorkspaceGroup ? (
            <Group gap="xs">
              <Loader size="xs" />
              <Text>Finner {customKey ? "gruppe..." : "potensiell gruppe..."}</Text>
            </Group>
          ) : workspaceGroup ? (
            <>
              <Group
                bg="var(--mantine-color-gray-light)"
                w="fit-content"
                p="sm"
                style={{ borderRadius: "var(--mantine-radius-sm)" }}
              >
                <IconUsersGroup size={24} color="var(--mantine-color-gray-text)" />
                <Stack gap="xs">
                  <Text size="xs">Gruppen kan tilknyttes med:</Text>
                  <Text>{workspaceGroup.name ?? "<Ingen navn>"}</Text>
                  <Text size="xs">{workspaceGroup.email ?? "<Ingen e-post>"}</Text>
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
                <Text>Ingen gruppe funnet.</Text>

                <Text size="xs">
                  Vi fant ingenting basert på {debouncedCustomKey ? "den egendefinerte nøkkelen" : "gruppens slug"}.
                </Text>
              </Stack>
            </Group>
          )}

          <Button
            color="green"
            w="fit-content"
            disabled={!isAdmin || !workspaceGroup}
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
