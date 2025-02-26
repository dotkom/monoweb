import type { Group } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import Link from "next/link"
import React, { type FC } from "react"

interface Props {
  hostingGroups: Group[]
}

const EventHostingGroups: FC<Props> = ({ hostingGroups }) => {
  if (!hostingGroups.length) {
    return <Text>Ingen arrangører</Text>
  }

  return (
    <>
      {hostingGroups.map((hostingGroup, i) => (
        <React.Fragment key={hostingGroup.id}>
          <Anchor component={Link} size="sm" href={`/committee/${hostingGroup.id}`}>
            {hostingGroup.name}
          </Anchor>
          {i < hostingGroups.length - 1 && ", "}
        </React.Fragment>
      ))}
    </>
  )
}

export default React.memo(EventHostingGroups)
