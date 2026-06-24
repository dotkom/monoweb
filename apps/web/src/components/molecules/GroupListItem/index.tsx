import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { type Group, createGroupPageUrl, getGroupDisplayName, getGroupTypeName } from "@dotkomonline/types"
import { Badge, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { IconMoonFilled } from "@tabler/icons-react"
import Link from "next/link"
import type { FC } from "react"

export interface GroupListItemProps {
  group: Group
}

export const GroupListItem: FC<GroupListItemProps> = ({ group }: GroupListItemProps) => {
  const inactive = Boolean(group.deactivatedAt)
  const link = createGroupPageUrl(group)
  const displayName = getGroupDisplayName(group)

  const card = (
    <div
      className={cn(
        "hidden sm:flex",
        "group relative flex-col gap-3 border h-full p-6 rounded-lg transition-all",
        "bg-gray-50 hover:bg-gray-100 border-gray-100",
        "dark:bg-stone-800 dark:hover:bg-stone-700 dark:border-stone-700",
        inactive && [
          "bg-transparent hover:bg-gray-50 text-gray-500 hover:text-black",
          "dark:bg-transparent dark:hover:bg-stone-800 dark:text-stone-400 dark:hover:text-white",
        ]
      )}
    >
      {inactive && (
        <div className="absolute top-3 left-3 flex flex-row items-center gap-1">
          <IconMoonFilled className="size-4" />
          <Text className="text-sm font-semibold">Inaktiv</Text>
        </div>
      )}

      <Badge color="gray" className="absolute top-3 right-3">
        {getGroupTypeName(group.type)}
      </Badge>

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative transition-all rounded-full w-36 h-36",
            inactive && "opacity-50 group-hover:opacity-100"
          )}
        >
          {group.imageUrl ? (
            <GroupLogo
              src={group.imageUrl}
              alt={displayName}
              height={120}
              width={120}
              containerClassName="rounded-full size-36 p-3"
            />
          ) : (
            <div className="flex items-center justify-center bg-gray-50 dark:bg-stone-700 rounded-full size-36">
              <OnlineIcon variant="light" width={100} height={100} />
            </div>
          )}
        </div>

        <Title className="text-3xl break-words">{displayName}</Title>
      </div>

      <RichText content={group.description} maxLines={4} hideToggleButton />
    </div>
  )

  const row = (
    <div
      className={cn(
        "flex sm:hidden",
        "group relative items-center gap-5 p-5 rounded-lg transition-colors",
        "dark:bg-stone-800",
        "bg-gray-50 hover:bg-gray-100 dark:hover:bg-stone-700"
      )}
    >
      {group.imageUrl ? (
        <GroupLogo
          src={group.imageUrl}
          alt={displayName}
          height={82}
          width={82}
          containerClassName="rounded-full size-[82px]"
        />
      ) : (
        <OnlineIcon width={82} height={82} />
      )}

      <div className="flex flex-col grow min-w-0">
        <Title className="text-xl">{displayName}</Title>
        <RichText content={group.description} maxLines={2} hideToggleButton />
      </div>
    </div>
  )

  return (
    <Link href={link}>
      {card}
      {row}
    </Link>
  )
}
