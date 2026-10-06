import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import type { Group, GroupMember } from "@dotkomonline/rpc/group"
import { getGroupDisplayName, getGroupSecondaryName, getGroupTypeName } from "@dotkomonline/rpc/group"
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { IconArrowUpRight, IconQuestionMark, IconSettings, IconUser, IconWorld } from "@tabler/icons-react"
import Link from "next/link"
import { getGroupEasterEgg } from "./easter-eggs"
import { GroupEmailLink } from "./GroupEmailLink"

interface Props {
  group: Group
  leader: GroupMember | undefined
  manageGroupUrl?: string
}

export const GroupPageHeader = ({ group, leader, manageGroupUrl }: Props) => {
  const displayName = getGroupDisplayName(group)
  const secondaryName = getGroupSecondaryName(group)
  const easterEgg = getGroupEasterEgg(displayName)
  const hasContactInfo =
    (group.email !== null && group.email !== "") || (group.contactUrl !== null && group.contactUrl !== "")

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-8 rounded-lg">
      <GroupLogoAvatar
        src={group.imageUrl}
        alt={displayName}
        className={cn("p-1 w-24 h-24 md:w-32 md:h-32", easterEgg?.avatarClassName)}
        fallback={
          <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
            <IconQuestionMark className="size-12 text-muted-foreground" />
          </AvatarFallback>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex flex-row flex-wrap items-center gap-4">
              <Title element="h1" size="xl">
                {displayName}
              </Title>

              <Badge color="gray" className="bg-gray-100 text-gray-500 dark:text-stone-400">
                {getGroupTypeName(group.type)}
              </Badge>
            </div>

            {secondaryName !== null && secondaryName !== "" && (
              <Text className="text-gray-500 dark:text-stone-400">{secondaryName}</Text>
            )}
          </div>

          {manageGroupUrl !== undefined && (
            <Button
              element="a"
              variant="outline"
              href={manageGroupUrl}
              className="w-fit"
              icon={<IconSettings className="size-4" />}
            >
              Administrer
            </Button>
          )}
        </div>

        <RichText content={group.description || "Ingen beskrivelse"} />

        <div className="flex flex-row flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-stone-400">
          <Text>Kontakt:</Text>

          {group.email !== null && group.email !== "" && <GroupEmailLink email={group.email} />}

          {group.contactUrl !== null && group.contactUrl !== "" && (
            <Link
              prefetch={false}
              href={group.contactUrl}
              target="_blank"
              rel="noreferrer"
              title={group.contactUrl}
              className={cn(
                "flex min-w-0 max-w-[min(100%,17.5rem)] flex-row items-center gap-1 rounded-md px-1.5 py-1 transition-colors",
                "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
              )}
            >
              <IconWorld width={16} height={16} className="shrink-0" />
              <Text className="truncate">{group.contactUrl}</Text>
              <IconArrowUpRight width={16} height={16} className="shrink-0" />
            </Link>
          )}

          {(!hasContactInfo || group.showLeaderAsContact) &&
            (leader !== undefined ? (
              <Link
                prefetch={false}
                href={`/profil/${leader.username}`}
                className={cn(
                  "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                  "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                  "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                )}
              >
                <Avatar className="size-5">
                  <AvatarImage src={leader.imageUrl ?? undefined} />
                  <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
                    <IconUser width={12} height={12} />
                  </AvatarFallback>
                </Avatar>
                <Text>{leader.name}</Text>
              </Link>
            ) : (
              <Text className="text-gray-500 dark:text-stone-400">Ingen kontaktinformasjon</Text>
            ))}
        </div>
      </div>
    </div>
  )
}
