import { Text } from "@dotkomonline/ui"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { type FlagName, FlagNameSchema, type User, type UserFlag } from "@dotkomonline/rpc/user"
import { createMockAttendee, createMockUser } from "../../../../../../.ladle/fixtures/attendance"
import { AttendeeList } from "./AttendeeList"
import { getAttendeeIcons, getAttendeePlate } from "./AttendeePlate"

export default {
  title: "Attendee Plates",
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
    ...overrides,
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
        createdAt: new Date("2025-04-01T12:00:00Z"),
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
    <LabeledPlate label="Særskilt + OW Verified" attendee={distinguishedAndVanityAttendee} />
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
        distinguishedAndVanityAttendee,
        noGradeAttendee,
      ]}
    />
  </div>
)
