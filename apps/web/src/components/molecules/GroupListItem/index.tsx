import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { type Group, createGroupPageUrl } from "@dotkomonline/types"
import { Icon, Text, Title, cn } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export interface GroupListItemProps {
  group: Group
}

export const GroupListItem: FC<GroupListItemProps> = ({ group }: GroupListItemProps) => {
  const isActive = !group.deactivatedAt
  const link = createGroupPageUrl(group)

  const card = (
    <div
      className={cn(
        "hidden md:flex",
        "group relative flex-col gap-3 h-full p-6 rounded-lg transition-all",
        "dark:bg-stone-900",
        "bg-gray-50 hover:bg-gray-100 dark:hover:bg-stone-800",
        !isActive && "text-gray-500 dark:text-stone-500 hover:text-black dark:hover:text-white"
      )}
    >
      {!isActive && (
        <div className="absolute top-3 left-3 flex flex-row items-center gap-1">
          <Icon icon="tabler:moon-filled" className="text-sm" />
          <Text className="text-sm font-semibold">Inaktiv</Text>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative bg-gray-50 group-hover:bg-white transition-all p-3 rounded-full w-36 h-36",
            !isActive && "opacity-50 group-hover:opacity-100"
          )}
        >
          {group.imageUrl ? (
            <Image
              src={group.imageUrl}
              alt={group.abbreviation}
              height={120}
              width={120}
              className="object-contain rounded-full"
            />
          ) : (
            <OnlineIcon
              width={100}
              height={100}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          )}
        </div>

        <Title className="text-3xl break-words">{group.abbreviation}</Title>
      </div>

      <Text className="text-left line-clamp-4">{group.about}</Text>
    </div>
  )

  const row = (
    <div
      className={cn(
        "flex md:hidden",
        "group relative items-center gap-4 p-4 rounded-lg transition-colors",
        "dark:bg-stone-900",
        "bg-gray-50 hover:bg-gray-100 dark:hover:bg-stone-800"
      )}
    >
      <div>
        {group.imageUrl ? (
          <Image
            src={group.imageUrl}
            alt={group.abbreviation}
            height={48}
            width={48}
            className="object-contain rounded-full"
          />
        ) : (
          <OnlineIcon width={48} height={48} />
        )}
      </div>

      <div className="flex flex-col">
        <Title className="text-xl">{group.abbreviation}</Title>
        <Text className="line-clamp-2 break-words">{group.about}</Text>
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
