import { Text } from "@dotkomonline/ui"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { FlagName, type User, type UserFlag } from "@dotkomonline/rpc/user"
import { createMockAttendee, createMockUser } from "../../../../../../.ladle/fixtures/attendance"
import { AttendeeList } from "./AttendeeList"
import { getAttendeeIcons, getAttendeePlate } from "./AttendeePlate"

export default {
  title: "Attendee Plates",
}

const viewer = createMockUser()

function createFlag(name: FlagName, overrides: Partial<UserFlag> = {}): UserFlag {
  return {
    id: `flag-${name}`,
    name,
    createdAt: viewer.createdAt,
    updatedAt: viewer.updatedAt,
    description: null,
    imageUrl: null,
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

function PlatePreview({ attendee, user }: { attendee: Attendee; user: User }) {
  const Plate = getAttendeePlate(attendee)
  const { smallIcons, largeIcon } = getAttendeeIcons(attendee)

  return <Plate attendee={attendee} user={user} smallIcons={smallIcons} largeIcon={largeIcon} />
}

function LabeledPlate({ label, attendee }: { label: string; attendee: Attendee }) {
  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <PlatePreview attendee={attendee} user={viewer} />
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
    flags: [createFlag(FlagName.VANITY_VERIFIED)],
  })
)

const distinguishedAttendee = createPlateAttendee(
  createMockUser({
    id: "00000000-0000-4000-8000-000000000103",
    username: "utmerket",
    name: "Siri Særskilt",
    flags: [
      createFlag(FlagName.EXCEPTIONALLY_DISTINGUISHED, {
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
    flags: [createFlag(FlagName.VANITY_VERIFIED)],
  })
)

const knightAndDistinguishedAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000106",
    username: "riddersiri",
    name: "Ridder Siri",
    flags: [
      createFlag(FlagName.EXCEPTIONALLY_DISTINGUISHED, {
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
      createFlag(FlagName.EXCEPTIONALLY_DISTINGUISHED, {
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
      createFlag(FlagName.VANITY_VERIFIED),
    ],
  })
)

const allBadgesAttendee = createPlateAttendee(
  createKnightUser({
    id: "00000000-0000-4000-8000-000000000108",
    username: "alt",
    name: "Alt på en gang",
    flags: [
      createFlag(FlagName.EXCEPTIONALLY_DISTINGUISHED, {
        description: "Tildelt for ekstraordinær innsats for linjeforeningen.",
      }),
      createFlag(FlagName.VANITY_VERIFIED),
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

export const InList = () => (
  <div className="max-w-lg">
    <AttendeeList
      user={viewer}
      maxNumberOfAttendees={10}
      attendees={[
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
      ]}
    />
  </div>
)
