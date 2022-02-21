import Card from "@components/atoms/Card";
import Text from "@components/atoms/Text";
import { VFC } from "react";
import Image from "next/image";
import { CSS, css, styled } from "@theme";
import Box from "@components/particles/Box";
import { DateTime } from "luxon";

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

const EventCard: VFC<EventCardProps> = (props) => {
  const { title, eventStart, attendees, capacity, tags, location, thumbnailUrl } = props;
  const date = DateTime.fromJSDate(eventStart);
  return (
    <Card shadow css={{ maxWidth: "300px", width: "100%" }}>
      <Thumbnail src={thumbnailUrl} width="300px" layout="responsive" height="100px" />
      <Box css={{ display: "flex", padding: "$2" }}>
        <EventStart dateTime={date.toISO()}>
          <span className={styles.month()}>{date.toFormat("MMM")}</span>
          <Box css={{ lineHeight: "1.3", fontSize: "$2xl" }}>{date.toFormat("dd")}</Box>
        </EventStart>
        <Text as="h2" css={styles.title}>
          {title}
        </Text>
      </Box>
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
    fontSize: "$lg",
  } as CSS,
  month: css({
    color: "$blue2",
  }),
};

export default EventCard;
