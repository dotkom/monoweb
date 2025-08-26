import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { type Group, createGroupPageUrl, getGroupTypeName } from "@dotkomonline/types"
import { Badge, Icon, Text, Title, cn } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export interface GroupListItemProps {
  group: Group
}

export const GroupListItem: FC<GroupListItemProps> = ({ group }: GroupListItemProps) => {
  const inactive = Boolean(group.deactivatedAt)
  const link = createGroupPageUrl(group)

  const card = (
    <div
      className={cn(
        "hidden sm:flex",
        "group relative flex-col gap-3 border h-full p-6 rounded-lg transition-all",
        "bg-gray-50 hover:bg-gray-100 border-gray-100",
        "dark:bg-stone-900 dark:hover:bg-stone-800 dark:border-stone-800",
        inactive && [
          "bg-transparent hover:bg-gray-50 text-gray-500 hover:text-black",
          "dark:bg-transparent dark:hover:bg-stone-900 dark:text-stone-500 dark:hover:text-white",
        ]
      )}
    >
      {inactive && (
        <div className="absolute top-3 left-3 flex flex-row items-center gap-1">
          <Icon icon="tabler:moon-filled" className="text-sm" />
          <Text className="text-sm font-semibold">Inaktiv</Text>
        </div>
      )}

      <Badge
        color="slate"
        variant="light"
        className="absolute top-3 right-3 bg-gray-100 text-gray-500 dark:text-stone-500"
      >
        {getGroupTypeName(group.type)}
      </Badge>

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            "relative bg-gray-50 group-hover:bg-white transition-all p-3 rounded-full w-36 h-36",
            inactive && "opacity-50 group-hover:opacity-100"
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
              variant="light"
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
        "flex sm:hidden",
        "group relative items-center gap-5 p-5 rounded-lg transition-colors",
        "dark:bg-stone-900",
        "bg-gray-50 hover:bg-gray-100 dark:hover:bg-stone-800"
      )}
    >
      {group.imageUrl ? (
        <Image
          src={group.imageUrl}
          alt={group.abbreviation}
          height={82}
          width={82}
          className="object-contain rounded-full"
        />
      ) : (
        <OnlineIcon width={82} height={82} />
      )}

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
