import { type Membership, getMembershipTypeName, getSpecializationName } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { getStudyGrade, isMembershipActiveUntilNextSemesterStart } from "@dotkomonline/utils"
import { IconNotes, IconNotesOff } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"

export const MembershipDisplay = ({ activeMembership }: { activeMembership: Membership | null }) => {
  if (!activeMembership) {
    return (
      <div className="flex flex-row gap-4 items-center p-6 bg-gray-50 dark:bg-stone-800 rounded-xl w-full">
        <IconNotesOff className="text-gray-500 dark:text-stone-400" width={32} height={32} />
        <Text className="text-xl">Ingen medlemskap</Text>
      </div>
    )
  }

  const grade = activeMembership.semester !== null ? getStudyGrade(activeMembership.semester) : null
  const membershipActiveUntilNextSemesterStart =
    activeMembership.end !== null ? isMembershipActiveUntilNextSemesterStart(activeMembership.end) : null
  const isMembershipIndefinite = activeMembership.end === null

  let membershipValidUntilText = null

  if (isMembershipIndefinite) {
    membershipValidUntilText = "Livstidsmedlemskap"
  } else if (membershipActiveUntilNextSemesterStart) {
    membershipValidUntilText = "Gyldig til starten av neste semester"
  } else if (activeMembership.end) {
    membershipValidUntilText = `Gyldig til ${formatDate(activeMembership.end, "dd. MMMM yyyy", { locale: nb })}`
  }

  return (
    <div className="flex flex-row gap-4 items-center p-6 bg-gray-50 dark:bg-stone-800 rounded-xl w-full">
      <IconNotes className="text-gray-500 dark:text-stone-400" width={32} height={32} />
      <div className="flex flex-col gap-1">
        <Text className="text-xl font-medium">{getMembershipTypeName(activeMembership.type)}</Text>
        {activeMembership.specialization && <Text>{getSpecializationName(activeMembership.specialization)}</Text>}
        {grade !== null ? <Text>{grade}. klasse</Text> : null}
        <Text className="text-sm text-gray-500 dark:text-stone-500">{membershipValidUntilText}</Text>
      </div>
    </div>
  )
}
