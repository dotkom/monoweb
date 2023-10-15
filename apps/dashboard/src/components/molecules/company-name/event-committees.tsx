import { Committee } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import React, { FC } from "react"

interface Props {
  committees: Committee[]
}

const EventCommittees: FC<Props> = ({ committees }) => {
  if (!committees.length) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <>
      {committees.map((committee, i) => (
        <React.Fragment key={committee.id}>
          <Anchor size="sm" href={`/committee/${committee.id}`}>
            {committee.name}
          </Anchor>
          {i < committees.length - 1 && ", "}
        </React.Fragment>
      ))}
    </>
  )
}

export default React.memo(EventCommittees)
