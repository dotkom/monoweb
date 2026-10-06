import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import {
  getActiveMembershipsForGroup,
  getInterestGroupAdminUrl,
  GroupRoleTypeEnum,
  GroupTypeSchema,
  hasGroupMembershipRoleType,
} from "@dotkomonline/rpc/group"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { notFound, redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { InterestGroupAdminProvider } from "./provider"
import { canAccessInterestGroupAdmin } from "../../can-access-interest-group-admin"

export default async function InterestGroupAdminLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const session = await getServerSession()

  if (session === null) {
    redirect(createAuthorizeUrl({ returnTo: getInterestGroupAdminUrl(slug) }))
  }

  const group = await server.group.find.query(slug)
  if (group === null || group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
    notFound()
  }

  const [memberships, authorization] = await Promise.all([
    server.group.allMembershipsByUserId.query(session.sub),
    server.user.getAuthorization.query(),
  ])
  const isLeader = getActiveMembershipsForGroup(memberships, group.slug).some((membership) =>
    hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  )
  if (!canAccessInterestGroupAdmin({ isLeader, authorization })) {
    notFound()
  }

  return (
    <InterestGroupAdminProvider group={group} session={session}>
      {children}
    </InterestGroupAdminProvider>
  )
}
