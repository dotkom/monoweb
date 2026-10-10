import { EventList } from "@/app/arrangementer/components/EventList"
import { getServerSession } from "@/auth"
import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import { server } from "@/utils/trpc/server"
import {
  type GroupMember,
  GroupRoleTypeEnum,
  findActiveGroupMembership,
  findActiveGroupMembershipIn,
  getActiveMembershipsForGroup,
  getGroupDisplayName,
  getGroupSecondaryName,
  getGroupTypeName,
  getHighestGroupRolePriority,
  hasGroupMembershipRoleType,
  isGroupMemberActive,
  isGroupMemberVisible,
  sortGroupRolesByPriority,
} from "@dotkomonline/rpc/group"
import { type UserId, isVanityVerified } from "@dotkomonline/rpc/user"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  RichText,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Title,
  cn,
} from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import {
  IconArrowUpRight,
  IconQuestionMark,
  IconRosetteDiscountCheckFilled,
  IconUser,
  IconWorld,
} from "@tabler/icons-react"
import { compareDesc } from "date-fns"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getGroupEasterEgg } from "./easter-eggs"
import { GroupEmailLink } from "./GroupEmailLink"
import { InterestGroupPageAdminSection } from "./InterestGroupPageAdmin/InterestGroupPageAdminSection"
import { WanderingMascot } from "./WanderingMascot"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export const GroupPage = async ({ params }: CommitteePageProps) => {
  const { slug } = await params

  const now = getCurrentUTC()

  const [session, group, futureEventWithAttendances, pastEventWithAttendances] = await Promise.all([
    getServerSession(),
    server.group.get.query(slug),
    server.event.allSummaries.query({
      filter: {
        byOrganizingGroup: [slug],
        byEndDate: {
          max: null,
          min: now,
        },
        orderBy: "asc",
      },
    }),
    server.event.allSummaries.query({
      filter: {
        byEndDate: {
          max: now,
          min: null,
        },
        byOrganizingGroup: [slug],
        orderBy: "desc",
      },
    }),
  ])

  if (group.type === "EMAIL_ONLY") {
    return notFound()
  }

  const showMembers = group.memberVisibility !== "NONE"

  const members = showMembers ? await server.group.getMembers.query(slug) : new Map<UserId, GroupMember>()

  const hasContactInfo = group.email || group.contactUrl

  const membersToShow = [...members.values()].filter((member) =>
    isGroupMemberVisible(member, group.memberVisibility, session?.sub)
  )

  const activeMembers = [...membersToShow]
    .filter((member) => isGroupMemberActive(member))
    .toSorted((leftMember, rightMember) => {
      const left = findActiveGroupMembership(leftMember)
      const right = findActiveGroupMembership(rightMember)

      if (left === null || right === null) {
        // Sanity check
        return 0
      }

      const byRole = getHighestGroupRolePriority(right.roles) - getHighestGroupRolePriority(left.roles)
      if (byRole !== 0) {
        return byRole
      }

      return compareDesc(left.start, right.start)
    })

  const inactiveMembers = membersToShow.filter((member) => !isGroupMemberActive(member))

  const leader = [...members.values()].find((member) => {
    const membership = findActiveGroupMembership(member)

    return membership != null && hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  })

  const currentUserMemberships =
    session?.sub !== undefined ? await server.group.allMembershipsByUserId.query(session.sub) : []
  const currentUserActiveMemberships = getActiveMembershipsForGroup(currentUserMemberships, group.slug)

  const isCurrentUserInterestGroupLeader =
    group.type === "INTEREST_GROUP" &&
    currentUserActiveMemberships.some((membership) => hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER))
  const currentUserMembership = findActiveGroupMembershipIn(currentUserMemberships, group.slug)

  const displayName = getGroupDisplayName(group)
  const secondaryName = getGroupSecondaryName(group)
  const easterEgg = getGroupEasterEgg(displayName)

  return (
    <div className="flex flex-col gap-8">
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

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-row items-center gap-4">
              <Title element="h1" size="xl">
                {displayName}
              </Title>

              <Badge color="gray" className="bg-gray-100 text-gray-500 dark:text-stone-400">
                {getGroupTypeName(group.type)}
              </Badge>
            </div>

            {secondaryName && <Text className="text-gray-500 dark:text-stone-400">{secondaryName}</Text>}
          </div>

          <RichText content={group.description || "Ingen beskrivelse"} />

          <div className="flex flex-row gap-4 items-center text-sm text-gray-500 dark:text-stone-400 flex-wrap">
            <Text>Kontakt:</Text>

            {group.email && <GroupEmailLink email={group.email} />}

            {group.contactUrl && (
              <Link
                prefetch={false}
                href={group.contactUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
                  "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
                  "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
                )}
              >
                <IconWorld width={16} height={16} />
                <Text>{group.contactUrl}</Text>
                <IconArrowUpRight width={16} height={16} />
              </Link>
            )}

            {(!hasContactInfo || group.showLeaderAsContact) &&
              (leader ? (
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
          {/* TODO: This should create a membership. `slackUrl` should be used as a secondary info field instead of this button */}
          {group.type === "INTEREST_GROUP" && currentUserMembership === null && group.slackUrl && (
            <Button element="a" variant="default" href={group.slackUrl} className="w-fit">
              Meld deg inn!
            </Button>
          )}
        </div>
      </div>

      {isCurrentUserInterestGroupLeader && <InterestGroupPageAdminSection interestGroup={group} />}

      {showMembers && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <Title>Medlemmer</Title>
          </div>

          <Tabs defaultValue="active">
            <TabsList variant="default" className="h-12!">
              <GroupMemberListTabTrigger value="active" label="Nåværende" count={activeMembers.length} />
              <GroupMemberListTabTrigger value="inactive" label="Tidligere" count={inactiveMembers.length} />
            </TabsList>

            <TabsContent value="active">
              <GroupMemberList members={activeMembers} type="active" currentUserId={session?.sub} />
            </TabsContent>
            <TabsContent value="inactive">
              <GroupMemberList members={inactiveMembers} type="inactive" currentUserId={session?.sub} />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Title>{displayName ? `${displayName}s` : "Gruppens"} arrangementer</Title>
        <EventList
          futureEventWithAttendances={futureEventWithAttendances.items}
          pastEventWithAttendances={pastEventWithAttendances.items}
        />
      </div>

      {easterEgg?.mascot && <WanderingMascot config={easterEgg.mascot} />}
    </div>
  )
}

interface GroupMemberEntryProps {
  userId: UserId | null | undefined
  member: GroupMember
}

const GroupMemberEntry = ({ userId, member }: GroupMemberEntryProps) => {
  const isVerified = isVanityVerified(member)
  const isUser = userId === member.id

  const firstActiveMembership = findActiveGroupMembership(member)

  const roles = sortGroupRolesByPriority(firstActiveMembership?.roles ?? [])

  const roleNames = roles.length > 0 ? roles.map(({ name }) => name).join(", ") : "Ingen roller"

  return (
    <Link
      prefetch={false}
      key={member.id}
      href={`/profil/${member.username}`}
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
          <IconUser width={20} height={20} />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-0">
        {isVerified ? (
          <div className="flex items-center gap-1">
            <Text className="text-lg/6 dark:text-black">{member.name}</Text>
            <IconRosetteDiscountCheckFilled className="text-blue-600 dark:text-sky-700" width={16} height={16} />
          </div>
        ) : (
          <Text className="text-lg/6">{member.name}</Text>
        )}
        <Text className={cn("text-sm", isVerified && "dark:text-black")}>{roleNames}</Text>
      </div>
    </Link>
  )
}
interface GroupMemberListProps {
  members: GroupMember[]
  type: "active" | "inactive"
  currentUserId: UserId | null | undefined
}

const GroupMemberList = ({ members, type, currentUserId }: GroupMemberListProps) => {
  if (members.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from(
          members.map((member) => <GroupMemberEntry key={member.id} userId={currentUserId} member={member} />)
        )}
      </div>
    )
  }

  return (
    <Text className="text-gray-500 dark:text-stone-400">
      Ingen {type === "active" ? "nåværende" : "tidligere"} medlemmer
    </Text>
  )
}

interface GroupMemberListTabTriggerProps {
  value: string
  label: string
  count: number
}

const GroupMemberListTabTrigger = ({ value, label, count }: GroupMemberListTabTriggerProps) => {
  return (
    <TabsTrigger
      value={value}
      className="data-active:bg-gray-100 dark:data-active:bg-stone-700 not-data-active:hover:bg-gray-100 dark:not-data-active:hover:bg-stone-800 text-gray-700 dark:text-stone-300 py-4 px-8"
    >
      {label}
      <span className="max-md:hidden text-gray-500 dark:text-stone-400 text-sm">({count})</span>
    </TabsTrigger>
  )
}
