import { Text } from "@dotkomonline/ui"
import { type Attendee, type AttendeeSummary, AttendeeSummarySchema } from "@dotkomonline/rpc/attendance"
import { type FlagName, FlagNameSchema, type User, type UserFlag } from "@dotkomonline/rpc/user"
import { addHours, subHours, subMinutes } from "date-fns"
import { createMockAttendee, createMockUser } from "../../../../../../../.ladle/fixtures/attendance"
import { AttendeeList } from "./AttendeeList"
import { getUserIcons, getUserPlate } from "./UserPlate"

export default {
  title: "User Plates",
}

const viewer = createMockUser()
const exceptionallyDistinguishedImageUrl = "https://cdn.online.ntnu.no/user/flag/exceptionally-distinguished.svg"

function createFlag(name: FlagName, overrides: Partial<UserFlag> = {}): UserFlag {
  let imageUrl: string | null = null
  let description: string | null = null

  if (name === FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED) {
    imageUrl = exceptionallyDistinguishedImageUrl
  }

  if (name === FlagNameSchema.enum.VANITY_VERIFIED) {
    description =
      "OW Verified er et kosmetisk profiltillegg som vises blant annet i påmeldingslister. Foreløpig har den blitt solgt til høystbydende på Onlines veldedighetsfest."
  }

  return {
    id: `flag-${name}`,
    name,
    createdAt: viewer.createdAt,
    updatedAt: viewer.updatedAt,
    description,
    imageUrl,
    awardedAt: viewer.createdAt,
    awardedReason: null,
    ...overrides,
  }
}

function createKnightUser(overrides: Partial<User> = {}): User {
  const user = createMockUser(overrides)

  return {
    ...user,
    memberships: [
      ...user.memberships,
      {
        id: `${user.id}-knight-membership`,
        type: "KNIGHT",
        specialization: null,
        start: user.memberships[0].start,
        end: null,
        semester: null,
        userId: user.id,
      },
    ],
  }
}

function createPlateAttendee(user: User, overrides: Partial<Attendee> = {}): Attendee {
  return createMockAttendee({
    id: `${user.id}-attendee`,
    userId: user.id,
    user,
    userGrade: 3,
    ...overrides,
  })
}

const now = new Date()

const brage = createMockUser({
  id: "00000000-0000-4000-8000-000000000069",
  username: "dotkom",
  name: "Brage Andreas Hoven",
  createdAt: subMinutes(now, 30),
})

const andre = createMockUser({
  id: "00000000-0000-4000-8000-000000000067",
  username: "andre",
  name: "André Ferdinand Klarpås",
  createdAt: subMinutes(now, 30),
})

const cena = createMockUser({
  id: "00000000-0000-4000-8000-000000000113",
  username: "ucantseeme",
  name: "John Cena",
  createdAt: subMinutes(now, 15),
})

const ordinaryUserDetails = [
  { name: "Ella Vik", username: "ellavik" },
  { name: "Lucas Andersen", username: "lucasandersen" },
  { name: "Filip Haugen", username: "filiphaugen" },
  { name: "Oliver Berg", username: "oliverberg" },
  { name: "Jakob Nilsen", username: "jakobnilsen" },
  { name: "Sofie Larsen", username: "sofielarsen" },
  { name: "Ingrid Solberg", username: "ingridsolberg" },
  { name: "Maja Strand", username: "majastrand" },
  { name: "Aksel Moen", username: "akselmoen" },
  { name: "Nora Johansen", username: "norajohansen" },
  { name: "Thea Lund", username: "thealund" },
  { name: "Emma Hansen", username: "emmahansen" },
  { name: "Emil Bakke", username: "emilbakke" },
  { name: "Frida Holm", username: "fridaholm" },
  { name: "Henrik Dahl", username: "henrikdahl" },
  { name: "Magnus Lie", username: "magnuslie" },
  { name: "Amalie Haug", username: "amaliehaug" },
  { name: "Oskar Eide", username: "oskareide" },
  { name: "Sara Aas", username: "saraaas" },
  { name: "William Foss", username: "williamfoss" },
  { name: "Tuva Lien", username: "tuvalien" },
  { name: "Mathias Sand", username: "mathiassand" },
  { name: "Selma Rønning", username: "selmaronning" },
  { name: "Elias Myhre", username: "eliasmyhre" },
  { name: "Hedda Brekke", username: "heddabrekke" },
  { name: "Sander Nygaard", username: "sandernygaard" },
  { name: "Live Aas", username: "liveaas" },
  { name: "Iver Sørensen", username: "iversorensen" },
]

const ordinaryUsers = [
  brage,
  andre,
  cena,
  ...ordinaryUserDetails.map((userDetails, index) =>
    createMockUser({
      id: `00000000-0000-4000-8000-${(index + 200).toString().padStart(12, "0")}`,
      ...userDetails,
    })
  ),
]

const ordinaryAttendees = ordinaryUsers.map((user, index) => createPlateAttendee(user, { userGrade: (index % 5) + 1 }))

function PlatePreview({ attendee, viewer }: { attendee: Attendee; viewer: User }) {
  const Plate = getUserPlate(attendee.user)
  const { smallIcons, largeIcon } = getUserIcons(attendee.user)
  const isCurrentUser = attendee.userId === viewer.id

  return (
    <Plate
      attendee={attendee}
      user={attendee.user}
      isCurrentUser={isCurrentUser}
      smallIcons={smallIcons}
      largeIcon={largeIcon}
    />
  )
}

function LabeledPlate({ label, attendee }: { label: string; attendee: Attendee }) {
  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <PlatePreview attendee={attendee} viewer={viewer} />
    </div>
  )
}

const genericAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000101",
    username: "olanordmann",
    name: "Ola Nordmann",
  })
)

const currentUserAttendee = createPlateAttendee(viewer)

const vanityVerifiedAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000102",
    username: "verifisert",
    name: "Vera Verifisert",
    flags: [createFlag(FlagNameSchema.enum.VANITY_VERIFIED)],
  })
)

const distinguishedAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000103",
    username: "utmerket",
    name: "Siri Særskilt",
    flags: [
      createFlag(FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED, {
        awardedAt: new Date("2025-04-01T12:00:00Z"),
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
    ],
  })
)

const knightAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000104",
    username: "ridder",
    name: "Ridder Rød",
  })
)

const knightAndVanityAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000105",
    username: "riddervera",
    name: "Ridder Vera",
    flags: [createFlag(FlagNameSchema.enum.VANITY_VERIFIED)],
  })
)

const knightAndDistinguishedAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000106",
    username: "riddersiri",
    name: "Ridder Siri",
    flags: [
      createFlag(FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED, {
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
    ],
  })
)

const distinguishedAndVanityAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000107",
    username: "sirivera",
    name: "Siri Vera",
    flags: [
      createFlag(FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED, {
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
      createFlag(FlagNameSchema.enum.VANITY_VERIFIED),
    ],
  })
)

const allBadgesAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000108",
    username: "alt",
    name: "Alt på en gang",
    flags: [
      createFlag(FlagNameSchema.enum.EXCEPTIONALLY_DISTINGUISHED, {
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
      createFlag(FlagNameSchema.enum.VANITY_VERIFIED),
    ],
  })
)

const noGradeAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000109",
    username: "ingenklasse",
    name: "Ingen Klasse",
  }),
  { userGrade: null }
)

function createDelayedAttendees(): AttendeeSummary[] {
  const now = new Date()
  const users = [
    createMockUser({
      id: "00000000-0000-4000-8000-000000000110",
      username: "dinadahl",
      name: "Dina Dahl",
    }),
    createMockUser({
      id: "00000000-0000-4000-8000-000000000113",
      username: "asgeir",
      name: "Asgeir Asgeirsson",
    }),
  ]

  return users.map((user, index) =>
    AttendeeSummarySchema.parse(
      createPlateAttendee(user, {
        registeredAt: null,
        createdAt: now,
        registrationEligibleAt: addHours(now, index + 1),
      })
    )
  )
}

export const AllStates = () => (
  <div className="flex max-w-lg flex-col gap-8">
    <LabeledPlate label="Generic" attendee={genericAttendee} />
    <LabeledPlate label="Generic (deg)" attendee={currentUserAttendee} />
    <LabeledPlate label="OW Verified" attendee={vanityVerifiedAttendee} />
    <LabeledPlate label="Særskilt utmerket" attendee={distinguishedAttendee} />
    <LabeledPlate label="Ridder" attendee={knightAttendee} />
    <LabeledPlate label="Ridder + OW Verified" attendee={knightAndVanityAttendee} />
    <LabeledPlate label="Ridder + særskilt (særskilt som small icon)" attendee={knightAndDistinguishedAttendee} />
    <LabeledPlate label="Særskilt + OW Verified" attendee={distinguishedAndVanityAttendee} />
    <LabeledPlate label="Ridder + særskilt + OW Verified" attendee={allBadgesAttendee} />
    <LabeledPlate label="Ingen klasse" attendee={noGradeAttendee} />
  </div>
)

export const InList = () => {
  const plateAttendees = [
    genericAttendee,
    currentUserAttendee,
    vanityVerifiedAttendee,
    distinguishedAttendee,
    knightAttendee,
    knightAndVanityAttendee,
    knightAndDistinguishedAttendee,
    distinguishedAndVanityAttendee,
    allBadgesAttendee,
    noGradeAttendee,
  ]
  const attendees = [
    ...plateAttendees.flatMap((attendee, index) => [...ordinaryAttendees.slice(index * 3, (index + 1) * 3), attendee]),
    ...createDelayedAttendees(),
  ]

  return (
    <div className="max-w-lg">
      <AttendeeList user={viewer} maxNumberOfAttendees={attendees.length} attendees={attendees} />
    </div>
  )
}

export const WithDelays = () => {
  const now = new Date()
  const queuedAttendees = ordinaryAttendees.slice(0, 8).map((attendee, index) => ({
    ...attendee,
    registeredAt: null,
    createdAt: subHours(now, 1),
    registrationEligibleAt: subMinutes(now, 20 - index),
  }))
  const attendees = [
    createPlateAttendee(viewer, {
      registeredAt: null,
      createdAt: subMinutes(now, 12),
      registrationEligibleAt: subMinutes(now, 12),
    }),

    ...queuedAttendees,
    ...createDelayedAttendees(),
  ]

  return (
    <div className="flex max-w-lg flex-col gap-2">
      <Text className="text-sm text-muted-foreground">Venteliste med aktiv og utløpt utsettelse</Text>
      <AttendeeList user={viewer} maxNumberOfAttendees={attendees.length} attendees={attendees} />
    </div>
  )
}
