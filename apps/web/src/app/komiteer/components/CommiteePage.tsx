import { auth } from "@/auth"
import { EventList } from "@/components/organisms/EventList/index"
import { server } from "@/utils/trpc/server"
import { type GroupMember, type GroupType, type UserId, getGroupTypeName } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Badge, Icon, Text, Title, cn } from "@dotkomonline/ui"
import Link from "next/link"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
  groupType: GroupType
}

export const CommitteePage = async ({ params, groupType }: CommitteePageProps) => {
  const { slug } = await params

  const showMembers = groupType !== "ASSOCIATED"

  const [session, group, events, members] = await Promise.all([
    auth.getServerSession(),
    server.group.getByType.query({ groupId: slug, type: groupType }),
    server.event.all.query({
      filter: {
        byOrganizingGroup: [slug],
      },
    }),
    // We do not show members for ASSOCIATED types because they often have members outside of Online
    // meaning the member list would be incomplete.
    showMembers ? server.group.getMembers.query(slug) : Promise.resolve(new Map<UserId, GroupMember>()),
  ])

  const hasContactInfo = group.email || group.contactUrl

  // TODO: sort roles inside each membership and sort members by their roles
  const activeMembers = [...members.values()].reduce((activeMembers, member) => {
    if (member.groupMemberships.some((membership) => membership.end === null)) {
      activeMembers.set(member.id, member)
    }

    return activeMembers
  }, new Map<UserId, GroupMember>())

  const leader = activeMembers
    .values()
    .find((member) =>
      member.groupMemberships.some(
        (membership) => membership.end === null && membership.roles.some((role) => role.type === "LEADER")
      )
    )

  const name = group.name ?? group.abbreviation

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-8 rounded-lg">
        <Avatar className="w-24 h-24 md:w-32 md:h-32">
          <AvatarImage src={group.imageUrl ?? undefined} alt={name} />
          <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
            <Icon className="text-5xl md:text-6xl" icon="tabler:users" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-row items-center gap-4">
              <Title element="h1" size="xl">
                {group.abbreviation}
              </Title>

              <Badge color="slate" variant="light" className="bg-gray-100 text-gray-500 dark:text-stone-500">
                {getGroupTypeName(group.type)}
              </Badge>
            </div>

            <Text className="text-gray-500 dark:text-stone-500">{name}</Text>
          </div>

          <Text>{group.about || group.description || "Ingen beskrivelse"}</Text>

          <div className="flex flex-row gap-4 items-center text-sm text-gray-500 dark:text-stone-500">
            <Text>Kontakt:</Text>

            {group.email && (
              <Link
                href={`mailto:${group.email}`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                  "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                  "dark:bg-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-300"
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
                  "dark:bg-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                )}
              >
                <Icon icon="tabler:world" className="text-base" />
                <Text>{group.contactUrl}</Text>
                <Icon icon="tabler:arrow-up-right" className="text-base" />
              </Link>
            )}

            {!hasContactInfo &&
              (leader ? (
                <Link
                  href={`/profil/${leader.profileSlug}`}
                  className={cn(
                    "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                    "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                    "dark:bg-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-300"
                  )}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={leader.imageUrl ?? undefined} />
                    <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
                      <Icon className="text-xs" icon="tabler:user" />
                    </AvatarFallback>
                  </Avatar>
                  <Text>{leader.name}</Text>
                </Link>
              ) : (
                <Text className="text-gray-500 dark:text-stone-500">Ingen kontaktinformasjon</Text>
              ))}
          </div>
        </div>
      </div>

      {showMembers && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <Title>Medlemmer</Title>
            {members.size > 0 && (
              <Text className="text-lg font-semibold text-gray-500 dark:text-stone-500">({members.size})</Text>
            )}
          </div>

          {activeMembers.size ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {activeMembers.entries().map(([id, member]) => (
                <GroupMemberEntry key={id} userId={session?.sub} member={member} />
              ))}
            </div>
          ) : (
            <Text className="text-gray-500 dark:text-stone-500">Ingen aktive medlemmer</Text>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Title>{group.abbreviation ? `${group.abbreviation}s` : "Gruppens"} arrangementer</Title>
        <EventList events={events} />
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
  const firstActiveMembership = member.groupMemberships.find((m) => m.end === null)
  const roles = firstActiveMembership?.roles.map(({ name }) => name).join(", ") || "Ingen roller"

  return (
    <Link
      key={member.id}
      href={`/profil/${member.profileSlug}`}
      className={cn(
        "flex flex-row items-center gap-3 p-2 rounded-lg transition-colors",
        !isVerified && !isUser && "bg-gray-50 hover:bg-gray-100 dark:bg-stone-900 dark:hover:bg-stone-800",
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
        <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
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
        <Text className={cn("text-sm", isVerified && "dark:text-black")}>{roles}</Text>
      </div>
    </Link>
  )
}
