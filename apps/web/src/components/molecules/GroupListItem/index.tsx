import { GroupLogo } from "@/components/atoms/GroupLogo"
import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { type Group, createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
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

  return (
    <Link
      href={link}
      className={cn(
        "flex flex-row sm:gap-6 gap-5",
        "group relative border h-full sm:p-6 p-5 rounded-lg transition-all",
        "bg-white hover:bg-gray-50 border-gray-100",
        "dark:bg-stone-800 dark:hover:bg-stone-700 dark:border-stone-700",
        "shadow-sm hover:shadow-md",
        inactive && [
          "bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black",
          "dark:bg-stone-800/60 dark:hover:bg-stone-800 dark:text-stone-300 dark:hover:text-white",
          "border-dashed border-gray-300 dark:border-stone-700",
        ]
      )}
    >
      {inactive && (
        <Badge
          color="gray"
          className="absolute top-3 right-3 flex items-center gap-1 opacity-80 group-hover:opacity-100"
        >
          <IconMoonFilled className="size-4" />
          <Text className="text-sm font-semibold">Inaktiv</Text>
        </Badge>
      )}

      <GroupListItemImage imageUrl={group.imageUrl} displayName={displayName} isInactive={inactive} />
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <Title element="h3" className="text-xl">
          {displayName}
        </Title>
        <RichText content={group.description} hideToggleButton className="sm:line-clamp-4 line-clamp-2" />
      </div>
    </Link>
  )
}

interface GroupListItemImageProps {
  imageUrl: string | null
  displayName: string
  isInactive: boolean
}

const GroupListItemImage: FC<GroupListItemImageProps> = ({ imageUrl, displayName, isInactive }) => {
  return (
    <>
      <div
        className={cn(
          "sm:block hidden",
          "relative transition-all rounded-full size-30",
          isInactive && "opacity-70 group-hover:opacity-90"
        )}
      >
        {imageUrl ? (
          <GroupLogo
            src={imageUrl}
            alt={displayName}
            height={120}
            width={120}
            containerClassName="rounded-full size-30 p-3"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-50 dark:bg-stone-700 rounded-full size-30">
            <OnlineIcon variant="light" width={120} height={120} />
          </div>
        )}
      </div>

      <div
        className={cn(
          "block sm:hidden",
          "relative transition-all rounded-full size-20",
          isInactive && "opacity-70 group-hover:opacity-90"
        )}
      >
        {imageUrl ? (
          <GroupLogo
            src={imageUrl}
            alt={displayName}
            height={80}
            width={80}
            containerClassName="rounded-full size-20 p-px"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-50 dark:bg-stone-700 rounded-full size-20">
            <OnlineIcon variant="light" width={80} height={80} />
          </div>
        )}
      </div>
    </>
  )
}
