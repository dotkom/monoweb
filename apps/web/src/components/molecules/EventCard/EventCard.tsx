import { Card, Text } from "@dotkomonline/ui"
import { CSS, css, styled } from "@dotkomonline/ui"
import { format, formatISO } from "date-fns"
import Image from "next/image"
import { FC } from "react"
import { FiUsers, FiMapPin, FiClock } from "react-icons/fi"

import { Box, Flex } from "@components/primitives"

interface EventCardProps {
  title: string
  eventStart: Date
  attendees?: number
  capacity?: number
  tags: string[]
  location: { text: string; link: string }
  thumbnailUrl: string
}

const EventCard: FC<EventCardProps> = (props) => {
  const { title, eventStart, attendees, capacity, tags, location, thumbnailUrl } = props

  let eventInfo = [
    {
      icon: <FiClock />,
      text: format(eventStart, "HH:mm"),
    },
  ]
  if (attendees && capacity) {
    eventInfo = [...eventInfo, { icon: <FiUsers />, text: `${attendees}/${capacity}` }]
  }

  return (
    <Card shadow css={{ maxWidth: "300px", width: "100%" }}>
      <Thumbnail src={thumbnailUrl} width={300} height={150} alt="thumbnail" />
      <Flex css={{ padding: "$2", flexDirection: "column" }}>
        <HeaderArea>
          <time dateTime={formatISO(eventStart)} color="red" className={styles.dateContainer()}>
            <Box as="span" css={{ color: "$blue2", lineHeight: "1.2" }}>
              {format(eventStart, "MMM")}
            </Box>
            <Box css={{ lineHeight: "1.2", fontSize: "$2xl" }}>{format(eventStart, "DD")}</Box>
          </time>
          <Text as="h2" css={styles.title}>
            {title}
          </Text>
        </HeaderArea>
        <TagsArea>
          {/* Temp until badges are done*/}
          {tags.map((tag) => (
            <TempBadge key={tag}>{tag}</TempBadge>
          ))}
        </TagsArea>
        <LocationArea>
          <FiMapPin />
          <Text size="lg" as="a" href={location.link} css={styles.locationLink} truncate>
            {location.text}
          </Text>
        </LocationArea>
        <InfoArea>
          {eventInfo.map(({ icon, text }) => (
            <Text size="lg" as="span" css={styles.infoEntry} key={text}>
              {icon}
              {text}
            </Text>
          ))}
        </InfoArea>
      </Flex>
    </Card>
  )
}

const TempBadge: FC<{ children?: React.ReactNode }> = ({ children }) => (
  <Box
    as="span"
    css={{
      backgroundColor: "$red11",
      color: "$red5",
      fontWeight: 700,
      px: "$1",
      borderRadius: "$2",
      fontSize: "$xs",
    }}
  >
    {children}
  </Box>
)

const styles = {
  title: {
    display: "flex",
    alignItems: "center",
    fontWeight: 500,
    margin: 0,
    pl: "$3",
    lineHeight: "1.3",
    fontSize: "$md",
  } as CSS,
  infoEntry: {
    m: 0,
    display: "flex",
    alignItems: "center",
    "& > svg": {
      mr: "$1",
    },
  } as CSS,
  locationLink: {
    color: "$black",
    textDecoration: "underline",
    textDecorationColor: "rgba(44, 81, 131,0)",
    transition: "text-decoration-color 300ms",
    "&:hover": {
      color: "$blue4",
      textDecorationColor: "rgba(44, 81, 131,1)",
    },
  } as CSS,
  dateContainer: css({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "min-content",
    fontWeight: "bold",
  }),
}

const Thumbnail = styled(Image, {
  borderTopRightRadius: "$3",
  borderTopLeftRadius: "$3",
})

const HeaderArea = styled("div", {
  display: "flex",
  pb: "$2",
})

const TagsArea = styled("div", {
  pb: "$2",
})

const LocationArea = styled("div", styles.infoEntry)

const InfoArea = styled("div", {
  display: "flex",
  justifyContent: "space-between",
})

export default EventCard
