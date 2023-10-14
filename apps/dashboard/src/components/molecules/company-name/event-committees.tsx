import { Committee, EventCommittee } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { FC } from "react"

interface Props {
  committees: Committee[]
}
export const EventCommittees: FC<Props> = ({ committees }) => {
  if (!committees.length) {
    return "Ingen arrangører"
  }

  return (
    <>
      {committees.map((committee, i) => (
        <>
          <Anchor size="sm" href={`/committee/${committee.id}`}>
            {committee.name}
          </Anchor>
          {i < committees.length - 1 && ", "}
        </>
      ))}
    </>
  )
}
