import { Committee, EventCommittee } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { FC } from "react"

interface Props {
  committeeIds: EventCommittee[]
  allCommittees: Committee[]
}
export const EventCommittees: FC<Props> = ({ committeeIds, allCommittees }) => {
  const matches = committeeIds.map((id) => allCommittees.find((c) => c.id === id.committeeId))

  if (!matches.length) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <>
      {matches.map((match, i) => (
        <>
          <Anchor size="sm" href={`/committee/${match?.id}`}>
            {match?.name}
          </Anchor>
          {i < matches.length - 1 && ", "}
        </>
      ))}
    </>
  )
}
