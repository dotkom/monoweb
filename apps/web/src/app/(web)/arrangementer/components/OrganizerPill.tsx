import { GroupLogo } from "@/components/atoms/GroupLogo"
import type { Company } from "@dotkomonline/rpc/company"
import { type Group, createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import { Text } from "@dotkomonline/ui"
import Link from "next/link"

export function OrganizerPill({ item }: { item: Group | Company }) {
  const displayName = "type" in item ? getGroupDisplayName(item) : item.name
  const href = "type" in item ? createGroupPageUrl(item) : `/bedrifter/${item.slug}`

  return (
    <Link
      href={href}
      className="group/organizer-pill flex flex-row gap-2.5 items-center p-1.5 -mx-1.5 rounded-md transition-colors border border-transparent hover:border-gray-200 dark:hover:border-stone-700"
    >
      {item.imageUrl !== null && item.imageUrl !== "" && (
        <GroupLogo
          src={item.imageUrl}
          alt={displayName}
          width={22}
          height={22}
          containerClassName="rounded-sm p-0.5 size-5.5"
        />
      )}

      <Text className="text-sm font-medium text-muted-foreground group-hover/organizer-pill:text-foreground">
        {displayName}
      </Text>
    </Link>
  )
}
