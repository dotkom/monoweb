import { Box } from "@components/primitives"
import { CSS } from "@dotkomonline/ui"
import { DateTime } from "luxon"
import { FC } from "react"
import Image from "next/image"
import { Badge, Text } from "@dotkomonline/ui"

interface CompanyAdListItemProps {
  name: string
  logo: string
  position: string
  location: string[]
  deadline: DateTime
  showApplyLink?: boolean
  applyLink?: string
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props) => {
  const { name, logo, position, location, deadline, applyLink, showApplyLink = false } = props
  return (
    <Box css={styles.listItem}>
      <Box>
        <Image src={logo} width="70px" height="40px" alt={`${name}'s job posting`} />
      </Box>
      <Text>{name}</Text>
      <Box>
        <Badge color="red" variant="subtle">
          {position}
        </Badge>
      </Box>
      <Text>{location.concat("")}</Text>
      <Text>{deadline.toFormat("DDD")}</Text>
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
