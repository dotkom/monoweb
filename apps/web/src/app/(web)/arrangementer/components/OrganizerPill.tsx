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
      className="group/organizer-pill flex flex-row gap-2 items-center pl-1 pr-3.5 py-1 -ml-1 -mr-3.5 rounded-full transition-colors border border-transparent hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-white/5 dark:hover:border-stone-700"
    >
      {item.imageUrl !== null && item.imageUrl !== "" && (
        <GroupLogo
          src={item.imageUrl}
          alt={displayName}
          width={32}
          height={32}
          containerClassName="rounded-full p-0.5 size-7"
        />
      )}

      <Text element="span">{displayName}</Text>
    </Link>
  )
}
