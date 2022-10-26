import { Box, Flex } from "@components/primitives"
import { CSS } from "@theme"
import { DateTime } from "luxon"
import { FC } from "react"
import Image from "next/image"
import { Badge, Text } from "@dotkom/ui"
import { CareerAd } from "@/api/get-career-ads"

interface CompanyAdListItemProps {
  /*
  name: string
  logo: string
  position: string
  location: string[]
  deadline: DateTime
  showApplyLink?: boolean
  applyLink?: string*/
  career: CareerAd
}

const CompanyAdListItem: FC<CompanyAdListItemProps> = (props) => {
  //const { name, logo, position, location, deadline, applyLink, showApplyLink = false } = props
  const { company_name, image, career_type, location, deadline, slug } = props.career

  return (
    <Box css={styles.listItem}>
      <Flex>
        {image && <Image src={image.asset.url} width="70px" height="40px" alt={`${company_name}'s job posting`} />}
        <Text css={{ marginLeft: "$3" }}>{company_name}</Text>
      </Flex>

      <Box>
        <Badge color="red" variant="subtle">
          {career_type}
        </Badge>
      </Box>
      <Text>{location}</Text>
      <Text>{DateTime.fromISO(deadline).toFormat("dd.MM.yyyy")}</Text>
    </Box>
  )
}

const styles = {
  listItem: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr) 150px",
    borderBottom: "1px solid $gray11",
    alignItems: "center",
    paddingLeft: "$2",
  } as CSS,
}

export default CompanyAdListItem
