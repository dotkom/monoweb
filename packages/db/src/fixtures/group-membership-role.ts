import { GroupRoleType, type Prisma } from "../"
import { type FixtureGroupKey, groupSlug } from "./group"
import { type FixtureGroupMembershipKey, groupMembershipId } from "./group-membership"

export type GroupRoleIds = ReadonlyMap<`${string}:${GroupRoleType}`, string>

const resolveRoleId = (groupRoleIds: GroupRoleIds, groupKey: FixtureGroupKey, type: GroupRoleType): string => {
  const groupId = groupSlug(groupKey)
  const roleId = groupRoleIds.get(`${groupId}:${type}`)

  if (roleId === undefined) {
    throw new Error(`Missing group role for ${groupId}:${type}`)
  }

  return roleId
}

type MembershipRoleAssignment = {
  membership: FixtureGroupMembershipKey
  group: FixtureGroupKey
  roleTypes: GroupRoleType[]
}

const membershipRoleAssignments = [
  {
    membership: "andersAppkom",
    group: "appkom",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "andersVelkom",
    group: "velkom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "andersMineline",
    group: "mineline",
    roleTypes: [GroupRoleType.PUNISHER, GroupRoleType.TRUSTEE],
  },
  {
    membership: "bertaHs",
    group: "hs",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "bertaJubkom",
    group: "jubkom",
    roleTypes: [GroupRoleType.DEPUTY_LEADER],
  },
  {
    membership: "bertaFolkSomErGladIJul",
    group: "folkSomErGladIJul",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "carlDotkom",
    group: "dotkom",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "carlEkskom",
    group: "ekskom",
    roleTypes: [GroupRoleType.TREASURER],
  },
  {
    membership: "carlRacingline",
    group: "racingline",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "dinaArrkom",
    group: "arrkom",
    roleTypes: [GroupRoleType.DEPUTY_LEADER, GroupRoleType.TRUSTEE],
  },
  {
    membership: "dinaXSport",
    group: "xSport",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "dinaMineline",
    group: "mineline",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "eirikBedkom",
    group: "bedkom",
    roleTypes: [GroupRoleType.TREASURER, GroupRoleType.EMAIL_ONLY],
  },
  {
    membership: "eirikVelkom",
    group: "velkom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "eirikRacingline",
    group: "racingline",
    roleTypes: [GroupRoleType.PUNISHER],
  },
  {
    membership: "fridaFeminit",
    group: "feminit",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "fridaJubkom",
    group: "jubkom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "fridaFolkSomErGladIJul",
    group: "folkSomErGladIJul",
    roleTypes: [GroupRoleType.TRUSTEE],
  },
  {
    membership: "gunnarEkskom",
    group: "ekskom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "gunnarXSport",
    group: "xSport",
    roleTypes: [GroupRoleType.DEPUTY_LEADER],
  },
  {
    membership: "gunnarVodkaISkogen",
    group: "vodkaISkogen",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "helleProkom",
    group: "prokom",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "helleMineline",
    group: "mineline",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "helleFaxeOrdenen",
    group: "faxeOrdenen",
    roleTypes: [GroupRoleType.PUNISHER, GroupRoleType.TREASURER],
  },
  {
    membership: "ivarTrikom",
    group: "trikom",
    roleTypes: [GroupRoleType.DEPUTY_LEADER],
  },
  {
    membership: "ivarVelkom",
    group: "velkom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "ivarRacingline",
    group: "racingline",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "jennyOil",
    group: "oil",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "jennyJubkom",
    group: "jubkom",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "jennyXSport",
    group: "xSport",
    roleTypes: [GroupRoleType.TRUSTEE],
  },
  {
    membership: "kasperVelkom",
    group: "velkom",
    roleTypes: [GroupRoleType.LEADER],
  },
  {
    membership: "kasperMineline",
    group: "mineline",
    roleTypes: [GroupRoleType.COSMETIC],
  },
  {
    membership: "kasperFaxeOrdenen",
    group: "faxeOrdenen",
    roleTypes: [GroupRoleType.TEMPORARILY_LEAVE],
  },
] as const satisfies readonly MembershipRoleAssignment[]

export const getGroupMembershipRoleFixtures = (groupRoleIds: GroupRoleIds) =>
  membershipRoleAssignments.flatMap(({ membership, group, roleTypes }) =>
    roleTypes.map((type) => {
      const roleId = resolveRoleId(groupRoleIds, group, type)

      return {
        membershipId: groupMembershipId(membership),
        roleId,
      } satisfies Prisma.GroupMembershipRoleCreateManyInput
    })
  )
