"use client"

import { useAuthorization } from "@/auth/authorization-context"
import type { Group } from "@dotkomonline/rpc/group"
import type { WorkspaceGroup } from "@dotkomonline/rpc/workspace"
import { Button, Text, Title } from "@dotkomonline/ui"
import { IconCheck, IconLink, IconLoader2, IconUsersGroup, IconX } from "@tabler/icons-react"
import { type FC, useEffect, useState } from "react"
import { useLinkGroupMutation } from "../mutations"
import { useFindWorkspaceGroupQuery } from "../queries"
import { useDebounce } from "use-debounce"

interface GroupWorkspaceLinkCardProps {
  group: Group
}

export const GroupWorkspaceLinkCard: FC<GroupWorkspaceLinkCardProps> = ({ group }) => {
  const [customKey, setCustomKey] = useState<string | undefined>(undefined)
  const linkGroupMutation = useLinkGroupMutation()
  const { isAdministrator } = useAuthorization()

  const isWorkspaceLinked = Boolean(group.workspaceGroupId)
  const showWorkspaceLink =
    isWorkspaceLinked || group.type === "COMMITTEE" || group.type === "NODE_COMMITTEE" || group.type === "EMAIL_ONLY"
  const isWorkspaceFetchEnabled = isAdministrator && showWorkspaceLink
  const { workspaceGroup, isLoading: isLoadingWorkspaceGroup } = useFindWorkspaceGroupQuery(
    group.slug,
    customKey || undefined,
    isWorkspaceFetchEnabled
  )

  if (!showWorkspaceLink) {
    return null
  }

  return (
    <LinkGroup
      isAdministrator={isAdministrator}
      isWorkspaceLinked={isWorkspaceLinked}
      isWorkspaceFetchEnabled={isWorkspaceFetchEnabled}
      isLoadingWorkspaceGroup={isLoadingWorkspaceGroup}
      workspaceGroup={workspaceGroup ?? null}
      setCustomKey={setCustomKey}
      onClick={() => linkGroupMutation.mutate({ groupSlug: group.slug, customKey })}
    />
  )
}

interface LinkGroupProps {
  isAdministrator: boolean
  isWorkspaceLinked: boolean
  isWorkspaceFetchEnabled: boolean
  isLoadingWorkspaceGroup: boolean
  workspaceGroup: WorkspaceGroup | null
  setCustomKey: (key: string | undefined) => void
  onClick: () => void
}

const LinkGroup: FC<LinkGroupProps> = ({
  isAdministrator,
  isWorkspaceLinked,
  isWorkspaceFetchEnabled,
  isLoadingWorkspaceGroup,
  workspaceGroup,
  setCustomKey,
  onClick,
}) => {
  const [customKey, setCustomKey_] = useState<string | undefined>(undefined)
  const [debouncedCustomKey] = useDebounce(customKey, 700)

  useEffect(() => {
    setCustomKey(debouncedCustomKey)
  }, [setCustomKey, debouncedCustomKey])

  return (
    <div className="flex flex-col gap-4 rounded-md bg-muted/50 p-4">
      <div className="flex flex-col gap-1">
        <Title element="h3" className="text-lg font-semibold">
          Google Workspace-gruppe
        </Title>

        {isWorkspaceLinked ? (
          <div
            className={`flex w-fit items-center gap-1 rounded-sm p-1 ${
              isWorkspaceFetchEnabled ? "bg-green-100 dark:bg-green-950" : "bg-muted"
            }`}
          >
            {isLoadingWorkspaceGroup ? (
              <IconLoader2 className="mx-0.5 size-3 animate-spin" />
            ) : (
              <IconCheck className={`size-4 ${isWorkspaceFetchEnabled ? "text-green-700" : "text-muted-foreground"}`} />
            )}
            {isLoadingWorkspaceGroup ? (
              <Text className="text-xs">Laster gruppe...</Text>
            ) : (
              <Text className="text-xs">
                Tilknyttet{" "}
                {!isWorkspaceFetchEnabled ? "Google Workspace-gruppe" : `${workspaceGroup?.email ?? "<ukjent e-post>"}`}
              </Text>
            )}
          </div>
        ) : (
          <div className="flex w-fit items-center gap-1 rounded-sm bg-red-100 p-1 dark:bg-red-950">
            <IconX className="size-4 text-red-600" />
            <Text className="text-xs">Ikke tilknyttet til en e-postliste</Text>
          </div>
        )}
      </div>

      {!isWorkspaceLinked && !isAdministrator && (
        <Text className="text-xs">
          Kontakt HS for å tilknytte gruppen til en e-postliste. Gruppen må tilknyttes for å kunne legge medlemmer til i
          e-postlisten.
        </Text>
      )}

      {!isWorkspaceLinked && isAdministrator && (
        <div className="flex flex-col gap-1">
          <Text className="text-sm text-muted-foreground">
            Egendefinert nøkkel. Bruk denne om den ikke finner automatisk. Må være en komplett e-postadresse eller
            lokaldelen til e-postadressen (det før @).
          </Text>
          <input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            placeholder="dotkom@online.ntnu.no eller dotkom"
            value={customKey ?? ""}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCustomKey_(event.target.value || undefined)
            }}
          />
        </div>
      )}

      {isWorkspaceFetchEnabled && !isWorkspaceLinked && (
        <>
          {isLoadingWorkspaceGroup ? (
            <div className="flex items-center gap-2">
              <IconLoader2 className="size-4 animate-spin" />
              <Text>Finner {customKey ? "gruppe..." : "potensiell gruppe..."}</Text>
            </div>
          ) : workspaceGroup ? (
            <>
              <div className="flex w-fit items-start gap-3 rounded-sm bg-muted p-3">
                <IconUsersGroup className="size-6 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <Text className="text-xs">Gruppen kan tilknyttes med:</Text>
                  <Text>{workspaceGroup.name ?? "<Ingen navn>"}</Text>
                  <Text className="text-xs">{workspaceGroup.email ?? "<Ingen e-post>"}</Text>
                </div>
              </div>
              <Text className="text-xs text-muted-foreground">Dersom dette er feil, ta konktakt med Dotkom.</Text>
            </>
          ) : (
            <div className="flex w-fit items-start gap-3 rounded-sm bg-muted p-3">
              <IconX className="size-6 text-destructive" />
              <div className="flex flex-col gap-1">
                <Text>Ingen gruppe funnet.</Text>
                <Text className="text-xs">
                  Vi fant ingenting basert på {debouncedCustomKey ? "den egendefinerte nøkkelen" : "gruppens slug"}.
                </Text>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="default"
            className="w-fit"
            disabled={!isAdministrator || !workspaceGroup}
            icon={<IconLink className="size-4" />}
            onClick={onClick}
          >
            Det er riktig, tilknytt
          </Button>
        </>
      )}
    </div>
  )
}
