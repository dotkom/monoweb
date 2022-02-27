import Card from "@components/atoms/Card";
import Text from "@components/atoms/Text";
import { VFC } from "react";
import Image from "next/image";
import { CSS, css, styled } from "@theme";
import { Box, Flex } from "@components/primitives";
import { DateTime } from "luxon";
import { FiUsers } from "react-icons/fi";

interface EventCardProps {
  title: string;
  eventStart: Date;
  attendees?: number;
  capacity?: number;
  tags: string[];
  location: string;
  thumbnailUrl: string;
}

const EventInfo = styled("div", {
  display: "flex",
  padding: "$2",
  justifyContent: "space-between",
  alignItems: "center",
});

const EventCard: VFC<EventCardProps> = (props) => {
  const { title, eventStart, attendees, capacity, tags, location, thumbnailUrl } = props;
  const date = DateTime.fromJSDate(eventStart);
  return (
    <Card shadow css={{ maxWidth: "300px", width: "100%" }}>
      <Thumbnail src={thumbnailUrl} width="300px" layout="responsive" height="150px" />
      <Flex css={{ padding: "$2" }}>
        <EventDateContainer dateTime={date.toISO()} color="red">
          <Box as="span" css={{ color: "$blue2", lineHeight: "1.2" }}>
            {date.toFormat("MMM")}
          </Box>
          <Box css={{ lineHeight: "1.2", fontSize: "$2xl" }}>{date.toFormat("dd")}</Box>
        </EventDateContainer>
        <Text as="h2" css={styles.title}>
          {title}
        </Text>
      </Flex>
      <EventInfo>
        <Box>
          {/* Temp until badges are done*/}
          {tags.map((tag) => (
            <Box as="span" css={{ backgroundColor: "$blue10" }}>
              {tag}
            </Box>
          ))}
        </Box>
        <Flex css={{ alignItems: "center", justifyContent: "center" }}>
          <ParticipantIcon />
          {attendees}/{capacity}
        </Flex>
      </EventInfo>
    </Card>
  );
};

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
};

const ParticipantIcon = styled(FiUsers, {
  fontSize: "$xl",
  paddingRight: "$1",
});

const Thumbnail = styled(Image, {
  borderTopRightRadius: "$3",
  borderTopLeftRadius: "$3",
});

const EventDateContainer = styled("time", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "min-content",
  fontWeight: "bold",
});

export default EventCard;
