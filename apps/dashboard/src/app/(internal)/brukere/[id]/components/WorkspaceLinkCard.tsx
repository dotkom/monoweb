"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { useUser } from "@auth0/nextjs-auth0/client"
import type { WorkspaceUser } from "@dotkomonline/rpc/workspace"
import { Button, Text, Title } from "@dotkomonline/ui"
import { IconCheck, IconLink, IconLoader2, IconUsersGroup, IconX } from "@tabler/icons-react"
import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { useDebounce } from "use-debounce"
import { useLinkOwUserToWorkspaceUserMutation } from "../../mutations"
import { useFindWorkspaceUserQuery, useGroupAllByMemberQuery } from "../../queries"
import { useUserDetailsContext } from "../provider"

export function WorkspaceLinkCard() {
  const { user: sessionUser } = useUser()
  const { user } = useUserDetailsContext()
  const { isAdministrator } = useAuthorization()
  const { groups } = useGroupAllByMemberQuery(user.id)
  const linkUserMutation = useLinkOwUserToWorkspaceUserMutation()

  const [customKey, setCustomKey] = useState<string | undefined>(undefined)

  const isUser = sessionUser?.sub === user.id
  const isWorkspaceLinked = Boolean(user.workspaceUserId)
  const showWorkspaceLink = isWorkspaceLinked || groups.length > 0
  const isWorkspaceFetchEnabled = (isAdministrator || isUser) && showWorkspaceLink

  const { workspaceUser, isLoading: isLoadingWorkspaceUser } = useFindWorkspaceUserQuery(
    user.id,
    customKey,
    isWorkspaceFetchEnabled
  )

  if (!showWorkspaceLink) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 rounded-md bg-muted/50 p-4">
      <div className="flex flex-col gap-1">
        <Title element="h3" className="text-lg font-semibold">
          Google Workspace-bruker
        </Title>

        {isWorkspaceLinked ? (
          <WorkspaceStatusPill
            loading={isLoadingWorkspaceUser}
            variant="linked"
            label={
              isLoadingWorkspaceUser
                ? "Laster bruker..."
                : `Tilknyttet ${
                    !isWorkspaceFetchEnabled
                      ? "Google Workspace-bruker"
                      : (workspaceUser?.primaryEmail ?? "<ukjent e-post>")
                  }`
            }
          />
        ) : (
          <WorkspaceStatusPill variant="unlinked" label="Ikke tilknyttet til en Google-bruker" />
        )}
      </div>

      {!isWorkspaceLinked && !isAdministrator && (
        <Text className="text-sm text-muted-foreground">
          Kontakt HS for å tilknytte brukeren til en Google-bruker. Brukeren må tilknyttes for å kunne bli lagt til i
          e-postlister.
        </Text>
      )}

      {!isWorkspaceLinked && isAdministrator && <CustomKeyInput setCustomKey={setCustomKey} />}

      {isWorkspaceFetchEnabled && !isWorkspaceLinked && (
        <LinkWorkspaceActions
          isAdministrator={isAdministrator}
          isLoadingWorkspaceUser={isLoadingWorkspaceUser}
          workspaceUser={workspaceUser ?? null}
          customKey={customKey}
          onLink={() => {
            linkUserMutation.mutate({ userId: user.id, customKey })
          }}
        />
      )}
    </div>
  )
}

function WorkspaceStatusPill({
  variant,
  label,
  loading,
}: {
  variant: "linked" | "unlinked"
  label: string
  loading?: boolean
}) {
  const isLinked = variant === "linked"

  return (
    <div
      className={
        isLinked
          ? "inline-flex w-fit items-center gap-1 rounded-sm bg-green-100 px-2 py-0.5 dark:bg-green-950/40"
          : "inline-flex w-fit items-center gap-1 rounded-sm bg-red-100 px-2 py-0.5 dark:bg-red-950/40"
      }
    >
      {loading ? (
        <IconLoader2 className="size-4 animate-spin text-green-700 dark:text-green-400" />
      ) : isLinked ? (
        <IconCheck className="size-4 text-green-700 dark:text-green-400" />
      ) : (
        <IconX className="size-4 text-red-700 dark:text-red-400" />
      )}
      <Text className="text-xs">{label}</Text>
    </div>
  )
}

function CustomKeyInput({ setCustomKey }: { setCustomKey: Dispatch<SetStateAction<string | undefined>> }) {
  const [customKey, setCustomKeyLocal] = useState<string>("")
  const [debouncedCustomKey] = useDebounce(customKey, 700)

  useEffect(() => {
    setCustomKey(debouncedCustomKey || undefined)
  }, [debouncedCustomKey, setCustomKey])

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">Egendefinert nøkkel</span>
      <span className="text-muted-foreground">
        Bruk denne om den ikke finner automatisk. Kan være komplett e-postadresse eller fullt navn.
      </span>
      <input
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        placeholder="navn.navnesen@online.ntnu.no eller Navn Navnesen"
        value={customKey}
        onChange={(event) => {
          setCustomKeyLocal(event.target.value)
        }}
      />
    </label>
  )
}

function LinkWorkspaceActions({
  isAdministrator,
  isLoadingWorkspaceUser,
  workspaceUser,
  customKey,
  onLink,
}: {
  isAdministrator: boolean
  isLoadingWorkspaceUser: boolean
  workspaceUser: WorkspaceUser | null
  customKey?: string
  onLink: () => void
}) {
  if (isLoadingWorkspaceUser) {
    return (
      <div className="flex items-center gap-2">
        <IconLoader2 className="size-4 animate-spin" />
        <Text className="text-sm">Finner {!customKey ? "potensiell bruker..." : "bruker..."}</Text>
      </div>
    )
  }

  if (workspaceUser) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex w-fit items-start gap-3 rounded-sm bg-muted p-3">
          <IconUsersGroup className="size-6 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <Text className="text-xs text-muted-foreground">Brukeren kan tilknyttes med:</Text>
            <Text className="text-sm">{workspaceUser.name?.fullName ?? "<Ingen navn>"}</Text>
            <Text className="text-xs">{workspaceUser.primaryEmail ?? "<Ingen e-post>"}</Text>
          </div>
        </div>
        <Text className="text-xs text-muted-foreground">Dersom dette er feil, ta konktakt med Dotkom.</Text>
        <Button
          type="button"
          variant="default"
          className="w-fit"
          disabled={!isAdministrator}
          icon={<IconLink className="size-4" />}
          onClick={onLink}
        >
          Det er riktig, tilknytt
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-fit items-start gap-3 rounded-sm bg-muted p-3">
      <IconX className="size-6 shrink-0 text-destructive" />
      <div className="flex flex-col gap-1">
        <Text className="text-sm">Ingen bruker funnet.</Text>
        <Text className="text-xs text-muted-foreground">
          Vi fant ingenting basert på {customKey ? "den egendefinerte nøkkelen" : "brukerens navn"}.
        </Text>
      </div>
    </div>
  )
}
