import type { Prisma } from "@prisma/client"
import { configuration } from "src/configuration"
import { createServiceLayer, createThirdPartyClients } from "src/modules/core"

if (!process.env.DATABASE_URL?.includes("localhost")) {
  throw new Error("Tried to give staff on a non-local database")
}

const dependencies = createThirdPartyClients(configuration)
const serviceLayer = await createServiceLayer(dependencies, configuration)
const prisma = serviceLayer.prisma

let group = await prisma.group.findUnique({ where: { slug: "dotkom" } })
if (group === null) {
  group = await prisma.group.create({
    data: {
      slug: "dotkom",
      abbreviation: "Dotkom",
      name: "Drifts- og utviklingskomiteen",
      shortDescription:
        "Drifts- og Utviklingskomiteen er komiteen som er ansvarlig for utvikling og vedlikehold av Online sine nettsider, samt drift av maskinparken.",
      description:
        "Drifts- og Utviklingskomiteen er komiteen som er ansvarlig for utvikling og vedlikehold av Online sine nettsider, samt drift av maskinparken.\n\nDotkom har også ansvaret for å sikre at Online på best mulig måte benytter IT i sine arbeidsprosesser, der Online er tjent med det. dotKom er som følge av det, også forpliktet til å utvikle og vedlikeholde IT-systemer som Online er tjent med - med hensyn til Online som linjeforening og Online sine studenter.",
      imageUrl:
        "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
      email: "dotkom@online.ntnu.no",
      createdAt: new Date("2019-07-27 08:03:33+00"),
      type: "COMMITTEE",
    },
  })
}
let role = await prisma.groupRole.findFirst({
  where: {
    groupId: "dotkom",
  },
})
if (role === null) {
  role = await prisma.groupRole.create({
    data: {
      name: "sjef",
      groupId: "dotkom",
    },
  })
}

const users = await prisma.user.findMany({})
const memberships = await prisma.groupMembership.createManyAndReturn({
  data: users.map(
    (user) =>
      ({
        groupId: "dotkom",
        start: new Date(),
        userId: user.id,
      }) satisfies Prisma.GroupMembershipCreateManyInput
  ),
  skipDuplicates: true,
})

await prisma.groupMembershipRole.createMany({
  data: memberships.map(
    (membership) =>
      ({
        membershipId: membership.id,
        roleId: role.id,
      }) satisfies Prisma.GroupMembershipRoleCreateManyInput
  ),
  skipDuplicates: true,
})

console.log("Restart nå så funker det")
