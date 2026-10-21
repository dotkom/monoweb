import { findActiveGroupMembership, type GroupMember, sortGroupRolesByPriority } from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { isVanityVerified } from "@dotkomonline/rpc/user"
import { Avatar, AvatarFallback, AvatarImage, Text, cn } from "@dotkomonline/ui"
import { IconRosetteDiscountCheckFilled, IconUser } from "@tabler/icons-react"
import Link from "next/link"

export const GroupMemberCard = ({ member, currentUserId }: { member: GroupMember; currentUserId?: UserId }) => {
  const isVerified = isVanityVerified(member)
  const isUser = currentUserId === member.id
  const firstActiveMembership = findActiveGroupMembership(member)
  const roles = sortGroupRolesByPriority(firstActiveMembership?.roles ?? [])
  const roleNames = roles.length > 0 ? roles.map(({ name }) => name).join(", ") : "Ingen roller"

  return (
    <Link
      prefetch={false}
      href={`/profil/${member.username}`}
      className={cn(
        "flex flex-row items-center gap-3 rounded-lg p-2 transition-colors h-full w-full",
        !isVerified && !isUser && "bg-gray-50 hover:bg-gray-100 dark:bg-stone-800 dark:hover:bg-stone-700",
        isUser && !isVerified && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900",
        isVerified && [
          "bg-gradient-to-r",
          "from-yellow-200 to-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
          "dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800",
        ]
      )}
    >
      <Avatar className="size-10 md:size-12">
        <AvatarImage src={member.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
          <IconUser width={20} height={20} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex flex-col gap-0">
        {isVerified ? (
          <div className="flex items-center gap-1">
            <Text className="text-lg/6 dark:text-black">{member.name}</Text>
            <IconRosetteDiscountCheckFilled
              className="shrink-0 text-blue-600 dark:text-sky-700"
              width={16}
              height={16}
            />
          </div>
        ) : (
          <Text className="text-lg/6">{member.name}</Text>
        )}
        <Text className={cn("text-sm", isVerified && "dark:text-black")}>{roleNames}</Text>
      </div>
    </Link>
  )
}
