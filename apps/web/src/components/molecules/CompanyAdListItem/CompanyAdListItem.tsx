import { CSS } from "@dotkomonline/ui"
import { Badge, Text } from "@dotkomonline/ui"
import { format } from "date-fns"
import Image from "next/image"
import { FC } from "react"

import { Box } from "@components/primitives"

interface CompanyAdListItemProps {
  name: string
  logo: string
  position: string
  location: string[]
  deadline: Date
  showApplyLink?: boolean
  applyLink?: string
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props) => {
  const { name, logo, position, location, deadline, applyLink, showApplyLink = false } = props
  return (
    <Box css={styles.listItem}>
      <Box>
        <Image src={logo} width={70} height={40} alt={`${name}'s job posting`} />
      </Box>
      <Text>{name}</Text>
      <Box>
        <Badge color="red" variant="light">
          {position}
        </Badge>
      </Box>
      <Text>{location.concat("")}</Text>
      <Text>{format(deadline, "DDD")}</Text>
      {showApplyLink && <Text>{applyLink}</Text>}
    </Box>
  )
}

const styles = {
  listItem: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
  } as CSS,
}

export default CompanyAdListItem
