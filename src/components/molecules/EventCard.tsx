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

const Thumbnail = styled(Image, {
  borderTopRightRadius: "$3",
  borderTopLeftRadius: "$3",
});

const EventStart = styled("time", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "min-content",
  fontWeight: "bold",
});

const EventMetadata = styled("div", {
  display: "flex",
  padding: "$2",
  justifyContent: "space-between",
  alignItems: "center",
  $$background: "$colors$red11",
  variants: {
    color: {
      subtle: {
        backgroundColor: "$$background",
      },
    },
  },
});

const EventCard: VFC<EventCardProps> = (props) => {
  const { title, eventStart, attendees, capacity, tags, location, thumbnailUrl } = props;
  const date = DateTime.fromJSDate(eventStart);
  return (
    <Card shadow css={{ maxWidth: "300px", width: "100%" }}>
      <Thumbnail src={thumbnailUrl} width="300px" layout="responsive" height="100px" />
      <Box css={{ display: "flex", padding: "$2" }}>
        <EventStart dateTime={date.toISO()} color="subtle">
          <span className={styles.month()}>{date.toFormat("MMM")}</span>
          <Box css={{ lineHeight: "1.3", fontSize: "$2xl" }}>{date.toFormat("dd")}</Box>
        </EventStart>
        <Text as="h2" css={styles.title}>
          {title}
        </Text>
      </Box>
      <EventMetadata>
        <Box>Badges</Box>
        <Flex css={{ alignItems: "center", justifyContent: "center" }}>
          <FiUsers className={styles.icon()} />
          {attendees}/{capacity}
        </Flex>
      </EventMetadata>
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
    lineHeight: "1.4",
    fontSize: "$md",
  } as CSS,
  month: css({
    color: "$blue2",
  }),
  icon: css({
    fontSize: "$xl",
    paddingRight: "$1",
  }),
};

export default EventCard;
