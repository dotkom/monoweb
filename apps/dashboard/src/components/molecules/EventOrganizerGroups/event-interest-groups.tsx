import type { InterestGroup } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import Link from "next/link"
import React, { type FC } from "react"

interface Props {
  interestGroups: InterestGroup[]
}

const EventInterestGroups: FC<Props> = ({ interestGroups }) => {
  if (!interestGroups.length) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <>
      {interestGroups.map((interestGroup, i) => (
        <React.Fragment key={interestGroup.id}>
          <Anchor component={Link} size="sm" href={`/interest-group/${interestGroup.id}`}>
            {interestGroup.name}
          </Anchor>
          {i < interestGroups.length - 1 && ", "}
        </React.Fragment>
      ))}
    </>
  )
}

export default React.memo(EventInterestGroups)
