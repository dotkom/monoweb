"use client"

import { UserSearch } from "@admin/brukere/components/UserSearch"
import type { User } from "@dotkomonline/rpc/user"
import { Button, Text } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"
import { PersonAvatar, SavedRecipientDetails } from "./RecipientIdentity"
import type { RecipientRuleDraft } from "./recipient-selection-draft"

export function UsersFields({
  draft,
  onChange,
}: {
  draft: Extract<RecipientRuleDraft, { type: "USERS" }>
  onChange: (draft: RecipientRuleDraft) => void
}) {
  const hasSelectedUsers = draft.users.length > 0
  const excludedUserIds = draft.users.map((user) => user.id)

  const addUser = (user: Pick<User, "id" | "name" | "imageUrl">) => {
    const nextUser = { id: user.id, name: user.name, imageUrl: user.imageUrl }
    const nextUsers = [...draft.users, nextUser]

    onChange({ ...draft, users: nextUsers })
  }

  const removeUser = (userId: string) => {
    const nextUsers = draft.users.filter((user) => user.id !== userId)

    onChange({ ...draft, users: nextUsers })
  }

  return (
    <div className="flex flex-col gap-3">
      {hasSelectedUsers && (
        <div className="flex flex-wrap gap-2">
          {draft.users.map((user) => (
            <div key={user.id} className="flex items-center gap-1.5 rounded-lg border border-field-border p-1 pl-1.5">
              {user.name === null ? (
                <SavedRecipientDetails userId={user.id} />
              ) : (
                <>
                  <PersonAvatar name={user.name} imageUrl={user.imageUrl} />
                  <Text className="text-sm">{user.name}</Text>
                </>
              )}
              <Button
                variant="ghost"
                color="red"
                size="icon-sm"
                aria-label="Fjern person"
                onClick={() => removeUser(user.id)}
              >
                <IconX className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <UserSearch excludeUserIds={excludedUserIds} onSubmit={addUser} />
    </div>
  )
}
