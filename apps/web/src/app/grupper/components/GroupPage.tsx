import { EventList } from "@/app/arrangementer/components/EventList"
import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { type GroupMember, type GroupRole, type UserId, getGroupTypeName } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon, RichText, Text, Title, cn } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { compareDesc } from "date-fns"
import Link from "next/link"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export const GroupPage = async ({ params }: CommitteePageProps) => {
  const { slug } = await params

  const isStaff = await server.user.isStaff.query()

  const [session, group, futureEventWithAttendances] = await Promise.all([
    auth.getServerSession(),
    server.group.get.query(slug),
    server.event.all.query({
      filter: {
        byOrganizingGroup: [slug],
        byEndDate: {
          max: null,
          min: getCurrentUTC(),
        },
        excludingType: isStaff ? [] : undefined,
        orderBy: "asc",
      },
    }),
  ])

  const showMembers = group.type !== "ASSOCIATED"

  // We do not show members for ASSOCIATED types because they often have members outside of Online
  // meaning the member list would be incomplete.
  const members = showMembers ? await server.group.getMembers.query(slug) : new Map<UserId, GroupMember>()

  const hasContactInfo = group.email || group.contactUrl

  const activeMembers = [...members.values()]
    .filter((member) => getLatestActiveMembership(member) !== undefined)
    .toSorted((leftMember, rightMember) => {
      const left = getLatestActiveMembership(leftMember)
      const right = getLatestActiveMembership(rightMember)
      // Sanity check
      if (left === undefined || right === undefined) {
        return 0
      }
      const leftPriority = Math.max(...left.roles.map((role) => getRolePriority(role)))
      const rightPriority = Math.max(...right.roles.map((role) => getRolePriority(role)))

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority
      }

      return compareDesc(left.start, right.start)
    })
  const leader = [...members.values()]
    .filter((member) => getLatestActiveMembership(member) !== undefined)
    .find((user) => {
      const membership = getLatestActiveMembership(user)
      return membership?.roles.some((r) => r.type === "LEADER")
    })

  const name = group.name ?? group.abbreviation

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-8 rounded-lg">
        <Avatar className="w-24 h-24 md:w-32 md:h-32">
          <AvatarImage src={group.imageUrl ?? undefined} alt={name} />
          <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
            <Icon className="text-5xl md:text-6xl" icon="tabler:users" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-row items-center gap-4">
              <Title element="h1" size="xl">
                {group.abbreviation}
              </Title>

              <Badge color="slate" variant="light" className="bg-gray-100 text-gray-500 dark:text-stone-400">
                {getGroupTypeName(group.type)}
              </Badge>
            </div>

            <Text className="text-gray-500 dark:text-stone-400">{name}</Text>
          </div>

          <RichText content={group.description || "Ingen beskrivelse"} />

          <div className="flex flex-row gap-4 items-center text-sm text-gray-500 dark:text-stone-400">
            <Text>Kontakt:</Text>

            {group.email && (
              <Link
                href={`mailto:${group.email}`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                  "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                  "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                )}
              >
                <Icon icon="tabler:mail" className="text-base" />
                <Text>{group.email}</Text>
                <Icon icon="tabler:arrow-up-right" className="text-base" />
              </Link>
            )}

            {group.contactUrl && (
              <Link
                href={group.contactUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                  "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                  "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                )}
              >
                <Icon icon="tabler:world" className="text-base" />
                <Text>{group.contactUrl}</Text>
                <Icon icon="tabler:arrow-up-right" className="text-base" />
              </Link>
            )}

            {(!hasContactInfo || group.showLeaderAsContact) &&
              (leader ? (
                <Link
                  href={`/profil/${leader.profileSlug}`}
                  className={cn(
                    "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                    "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                    "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                  )}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={leader.imageUrl ?? undefined} />
                    <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
                      <Icon className="text-xs" icon="tabler:user" />
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

      {showMembers && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <Title>Medlemmer</Title>
            {members.size > 0 && (
              <Text className="text-lg font-semibold text-gray-500 dark:text-stone-400">({activeMembers.length})</Text>
            )}
          </div>

          {activeMembers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from(
                activeMembers.map((member) => (
                  <GroupMemberEntry key={member.id} userId={session?.sub} member={member} />
                ))
              )}
            </div>
          ) : (
            <Text className="text-gray-500 dark:text-stone-400">Ingen aktive medlemmer</Text>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Title>{group.abbreviation ? `${group.abbreviation}s` : "Gruppens"} arrangementer</Title>
        <EventList futureEventWithAttendances={futureEventWithAttendances.items} pastEventWithAttendances={[]} />
      </div>
    </div>
  )
}

interface GroupMemberEntryProps {
  userId: UserId | null | undefined
  member: GroupMember
}

const GroupMemberEntry = ({ userId, member }: GroupMemberEntryProps) => {
  const isVerified = member.flags.includes("VANITY_VERIFIED")
  const isUser = userId === member.id

  // This requires periods to be sorted by startedAt in descending order
  const firstActiveMembership = getLatestActiveMembership(member)

  const roles = firstActiveMembership?.roles.toSorted((a, b) => {
    return getRolePriority(b) - getRolePriority(a)
  })

  const roleNames = roles?.map(({ name }) => name).join(", ") || "Ingen roller"

  return (
    <Link
      key={member.id}
      href={`/profil/${member.profileSlug}`}
      className={cn(
        "flex flex-row items-center gap-3 p-2 rounded-lg transition-colors",
        !isVerified && !isUser && "bg-gray-50 hover:bg-gray-100 dark:bg-stone-800 dark:hover:bg-stone-700",
        isUser && !isVerified && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900",
        isVerified && [
          "bg-gradient-to-r",
          "from-yellow-200 to-yellow-100 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-200",
          "dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-600 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-800",
        ]
      )}
    >
      <Avatar className="w-10 h-10 md:w-12 md:h-12">
        <AvatarImage src={member.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
          <Icon className="text-xl" icon="tabler:user" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0">
        {isVerified ? (
          <div className="flex items-center gap-1">
            <Text className="text-lg/6 dark:text-black">{member.name}</Text>
            <Icon icon="tabler:rosette-discount-check-filled" className="text-base text-blue-600 dark:text-sky-700" />
          </div>
        ) : (
          <Text className="text-lg/6">{member.name}</Text>
        )}
        <Text className={cn("text-sm", isVerified && "dark:text-black")}>{roleNames}</Text>
      </div>
    </Link>
  )
}

function getLatestActiveMembership(member: GroupMember) {
  return member.groupMemberships.find((m) => m.end === null)
}

function getRolePriority(role: GroupRole) {
  switch (role.type) {
    case "LEADER":
      return 6
    case "DEPUTY_LEADER":
      return 5
    case "TREASURER":
      return 4
    case "TRUSTEE":
      return 3
    case "PUNISHER":
      return 2
    case "COSMETIC":
      return 1
    default:
      return 0
  }
}
