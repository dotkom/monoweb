import type { GroupRoleType, Prisma } from "../"
import { GroupRoleTypeSchema } from "../../generated/schema/index"

export type GroupRoleIds = ReadonlyMap<`${string}:${GroupRoleType}`, string>

const resolveRoleId = (groupRoleIds: GroupRoleIds, groupId: string, type: GroupRoleType): string => {
  const roleId = groupRoleIds.get(`${groupId}:${type}`)

  if (roleId === undefined) {
    throw new Error(`Missing group role for ${groupId}:${type}`)
  }

  return roleId
}

type MembershipRoleAssignment = {
  membershipId: string
  groupId: string
  roleTypes: GroupRoleType[]
}

const membershipRoleAssignments = [
  {
    membershipId: "5cd0e7bd-4d33-45f0-9e59-93a0be187bbd",
    groupId: "appkom",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "65b705cc-f580-4542-8af3-ae6e6c03ff95",
    groupId: "velkom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "a0870d07-ab9d-44ca-8ffe-7c1c0bd78a4d",
    groupId: "mineline",
    roleTypes: [GroupRoleTypeSchema.enum.PUNISHER, GroupRoleTypeSchema.enum.TRUSTEE],
  },
  {
    membershipId: "743740b7-41f5-4932-ad7e-b79e72ed1adc",
    groupId: "hs",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "fda6a358-ccd9-41a1-a685-362ca84297d1",
    groupId: "jubkom",
    roleTypes: [GroupRoleTypeSchema.enum.DEPUTY_LEADER],
  },
  {
    membershipId: "dfef1e7b-9a0c-42e1-a2da-66c38ece6417",
    groupId: "folk-som-er-glad-i-jul",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "1528a81c-fce1-4bd6-bc7d-7e7d1a13324f",
    groupId: "dotkom",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "cbb3566b-9581-4bd2-af8f-28a343b50cd9",
    groupId: "ekskom",
    roleTypes: [GroupRoleTypeSchema.enum.TREASURER],
  },
  {
    membershipId: "ea0d59da-e609-45bc-a2ae-aab4b7a6ad3a",
    groupId: "racingline",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "3f775955-9f34-4bd8-b331-20acd67e7798",
    groupId: "arrkom",
    roleTypes: [GroupRoleTypeSchema.enum.DEPUTY_LEADER, GroupRoleTypeSchema.enum.TRUSTEE],
  },
  {
    membershipId: "45e34ec2-2be6-41cf-9bdb-3e6d3620f100",
    groupId: "x-sport",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "d1bdea09-e736-458b-8206-dda3ea93d4fd",
    groupId: "mineline",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "eabaca16-3955-46b3-9205-5daf3bbc759a",
    groupId: "bedkom",
    roleTypes: [GroupRoleTypeSchema.enum.TREASURER, GroupRoleTypeSchema.enum.EMAIL_ONLY],
  },
  {
    membershipId: "1de2fb65-769c-448b-99e5-a0117073ed83",
    groupId: "velkom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "ee4f5616-a9af-45fc-aba7-470fa14c9801",
    groupId: "racingline",
    roleTypes: [GroupRoleTypeSchema.enum.PUNISHER],
  },
  {
    membershipId: "073830f8-13c1-4d2e-b0fd-d5c6ac285921",
    groupId: "feminit",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "6124b8ea-ba15-4aa7-9153-3342543f2fe2",
    groupId: "jubkom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "a53626d4-ee6a-4879-8efc-3dd3c11f8eb1",
    groupId: "folk-som-er-glad-i-jul",
    roleTypes: [GroupRoleTypeSchema.enum.TRUSTEE],
  },
  {
    membershipId: "1e54a43b-096d-4619-a1a7-1c3c88bbf0e5",
    groupId: "ekskom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "61d8e82c-c815-481e-adad-1cdba0abacca",
    groupId: "x-sport",
    roleTypes: [GroupRoleTypeSchema.enum.DEPUTY_LEADER],
  },
  {
    membershipId: "952d8da0-5c6b-4be9-aeb0-5126a59b4852",
    groupId: "vodka-i-skogen",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "75c85ee8-f4f1-4b0f-9e8a-c45de1006630",
    groupId: "prokom",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "fcd5e4cf-11b8-4b30-9fb9-d751fedff2e9",
    groupId: "mineline",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "72ec3f11-65b3-4d1d-8a68-4890b23ffe80",
    groupId: "faxe-ordenen",
    roleTypes: [GroupRoleTypeSchema.enum.PUNISHER, GroupRoleTypeSchema.enum.TREASURER],
  },
  {
    membershipId: "53cd75d8-f193-41d4-9d66-534b83293de8",
    groupId: "trikom",
    roleTypes: [GroupRoleTypeSchema.enum.DEPUTY_LEADER],
  },
  {
    membershipId: "8f5c0dd1-5414-4b44-a174-61c39b4a64f0",
    groupId: "velkom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "26931600-6682-477c-a9b3-dafb9eec3425",
    groupId: "racingline",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "c0d5f992-bdb0-400c-8a0e-6ec9c0fa53cb",
    groupId: "oil",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "e03d2901-c8c7-4a89-99dc-73bb296fb8cc",
    groupId: "jubkom",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "eb09df8d-7e22-4557-a9e3-eb1c6e40abb4",
    groupId: "x-sport",
    roleTypes: [GroupRoleTypeSchema.enum.TRUSTEE],
  },
  {
    membershipId: "c799e2b9-a5e6-4ce5-b36a-7d40c05c7e36",
    groupId: "velkom",
    roleTypes: [GroupRoleTypeSchema.enum.LEADER],
  },
  {
    membershipId: "73696cd1-6724-400b-aa53-d17481ea99e8",
    groupId: "mineline",
    roleTypes: [GroupRoleTypeSchema.enum.COSMETIC],
  },
  {
    membershipId: "0264e869-a8f2-455e-b3d4-0b994a4a59ab",
    groupId: "faxe-ordenen",
    roleTypes: [GroupRoleTypeSchema.enum.TEMPORARILY_LEAVE],
  },
] as const satisfies readonly MembershipRoleAssignment[]

export const getGroupMembershipRoleFixtures = (groupRoleIds: GroupRoleIds) =>
  membershipRoleAssignments.flatMap(({ membershipId, groupId, roleTypes }) =>
    roleTypes.map((type) => {
      const roleId = resolveRoleId(groupRoleIds, groupId, type)

      return { membershipId, roleId } satisfies Prisma.GroupMembershipRoleCreateManyInput
    })
  )
