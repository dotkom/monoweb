import { Badge } from "@dotkomonline/ui"
import Image from "next/image"
import React from "react"

type ComingEventProps = {
  img: string
  title: string
  tag: string
  attending: number
  max_attending: number
  date: string
  info_link: string
}

// TODO: mye relative og absolute her.... too bad!
export const ComingEvent: React.FC<ComingEventProps> = (props) => {
  return (
    <div className="relative h-[100px] max-w-[400px] overflow-hidden rounded-xl shadow-md">
      <div className="m-0 inline-block align-top">
        <Image src={props.img} alt={props.title} width={100} height={100} className="object-cover" />
      </div>
      <div className="m-0 inline-block p-2 align-top">
        <span>
          <span>{/* PLACEHOLDER */}</span>
          <div>
            <p className="m-0">{props.title}</p>
            <p className="m-0">{props.date}</p>
            <p className="m-0">
              {props.attending}/{props.max_attending}
            </p>
          </div>
        </span>
      </div>

      <Badge color="green" variant="solid" className="absolute right-3 top-3">
        {props.tag}
      </Badge>
      <a href={props.info_link}>
        <p className="absolute bottom-3 right-3 m-0">Info</p>
      </a>
    </div>
  )
}
