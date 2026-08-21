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
    <LabeledPlate label="Ingen klasse" attendee={noGradeAttendee} />
  </div>
)

export const InList = () => (
  <div className="max-w-lg">
    <AttendeeList
      user={viewer}
      maxNumberOfAttendees={10}
      attendees={[genericAttendee, currentUserAttendee, vanityVerifiedAttendee, noGradeAttendee]}
    />
  </div>
)
