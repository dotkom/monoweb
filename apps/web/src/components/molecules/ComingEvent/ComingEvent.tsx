import React from "react"
import { Badge, Text } from "@dotkom/ui"
import { css } from "@stitches/react"
import Image from "next/image"

type ComingEventProps = {
  img: string
  title: string
  tag: string
  attending: number
  max_attending: number
  date: string
  info_link: string
}

// import ionicons

export const ComingEvent: React.FC<ComingEventProps> = (props) => {
  return (
    <div className={styles.comingEvent()}>
      <div className={styles.comingEventImageContainer()}>
        <Image src={props.img} alt={props.title} width={100} height={100} className={styles.comingEvent()}/>
      </div>
      <div className={styles.comingEventInfoContainer()}>
        <span>
          <span>{/* PLACEHOLDER */}</span>
          <div>
            <Text className={styles.noMargin()} size="lg">
              {props.title}
            </Text>
            <Text className={styles.noMargin()}>{props.date}</Text>
            <Text className={styles.noMargin()}>
              {props.attending}/{props.max_attending}
            </Text>
          </div>
        </span>
      </div>

      <Badge color="green" variant="solid" className={styles.tag()}>
        {props.tag}
      </Badge>
      <a href={props.info_link}>
        <Text className={styles.infoLink()}>Info</Text>
      </a>
    </div>
  )
}

const styles = {
  comingEvent: css({
    height: "100px",
    maxWidth: "400px",
    position: "relative",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
    borderRadius: "10px",
    overflow: "hidden",
  }),
  comingEventImage: css({
    objectFit: "cover",
  }),
  comingEventImageContainer: css({
    margin: 0,
    display: "inline-block",
    verticalAlign: "top",
  }),
  comingEventInfoContainer: css({
    margin: 0,
    display: "inline-block",
    verticalAlign: "top",
    padding: "5px",
  }),
  noMargin: css({
    margin: 0,
  }),
  tag: css({
    position: "absolute",
    top: "10px",
    right: "10px",
  }),
  infoLink: css({
    position: "absolute",
    bottom: "10px",
    right: "10px",
    margin: 0,
  }),
}
