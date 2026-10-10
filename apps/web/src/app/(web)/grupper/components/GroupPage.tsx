import { EventList } from "@/app/arrangementer/components/EventList"
import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import {
  type GroupMember,
  GroupRoleTypeEnum,
  GroupTypeSchema,
  findActiveGroupMembership,
  getGroupDisplayName,
  hasGroupMembershipRoleType,
  isGroupMemberActive,
  isGroupMemberVisible,
  sortGroupMembersByRoleThenSeniority,
} from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { Tabs, TabsContent, TabsList, TabsTrigger, Text, Title } from "@dotkomonline/ui"
import { notFound } from "next/navigation"
import { getSidequestListNow } from "../../sidequests/sidequest-list-query"
import { getGroupEasterEgg } from "./easter-eggs"
import { GroupMemberCard } from "./GroupMemberCard"
import { GroupPageHeader } from "./GroupPageHeader"
import { WanderingMascot } from "./WanderingMascot"

interface CommitteePageProps {
  params: Promise<{ slug: string }>
}

export const GroupPage = async ({ params }: CommitteePageProps) => {
  const { slug } = await params

  const [group, session] = await Promise.all([server.group.get.query(slug), getServerSession()])

  if (group.type === GroupTypeSchema.enum.EMAIL_ONLY || group.type === GroupTypeSchema.enum.INTEREST_GROUP) {
    notFound()
  }

  const now = getSidequestListNow()

  const [futureEventWithAttendances, pastEventWithAttendances] = await Promise.all([
    server.event.allSummaries.query({
      filter: {
        byOrganizingGroup: [slug],
        byEndDate: { max: null, min: now },
        orderBy: "asc",
      },
    }),
    server.event.allSummaries.query({
      filter: {
        byOrganizingGroup: [slug],
        byEndDate: { max: now, min: null },
        orderBy: "desc",
      },
    }),
  ])

  const showMembers = group.memberVisibility !== "NONE"
  const members = showMembers ? await server.group.getMembers.query(slug) : new Map<UserId, GroupMember>()

  const membersToShow = [...members.values()].filter((member) =>
    isGroupMemberVisible(member, group.memberVisibility, session?.sub)
  )

  const activeMembers = sortGroupMembersByRoleThenSeniority(
    [...membersToShow].filter((member) => isGroupMemberActive(member))
  )

  const inactiveMembers = membersToShow.filter((member) => !isGroupMemberActive(member))

  const leader = [...members.values()].find((member) => {
    const membership = findActiveGroupMembership(member)

    return membership !== null && hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  })

  const displayName = getGroupDisplayName(group)
  const easterEgg = getGroupEasterEgg(displayName)

  return (
    <div className="flex flex-col gap-8">
      <GroupPageHeader group={group} leader={leader} />

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
        <Title>{displayName ? `${displayName}s arrangementer` : "Gruppens arrangementer"}</Title>
        <EventList
          futureEventWithAttendances={futureEventWithAttendances.items}
          pastEventWithAttendances={pastEventWithAttendances.items}
        />
      </div>

      {easterEgg?.mascot !== undefined && <WanderingMascot config={easterEgg.mascot} />}
    </div>
  )
}

interface GroupMemberListProps {
  members: GroupMember[]
  type: "active" | "inactive"
  currentUserId?: UserId
}

const GroupMemberList = ({ members, type, currentUserId }: GroupMemberListProps) => {
  if (members.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from(
          members.map((member) => <GroupMemberCard key={member.id} currentUserId={currentUserId} member={member} />)
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
