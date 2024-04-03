import { Badge } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import React from "react"

interface ComingEventProps {
  img: string
  title: string
  tag: string
  attending: number
  max_attending: number
  date: string
  info_link: string
}

// TODO: mye relative og absolute her.... too bad!
export const ComingEvent: React.FC<ComingEventProps> = (props) => (
  <Link href={props.info_link}>
    <div className="mt-2 flex flex-col">
      <div className="relative">
        <Image
          src={props.img}
          alt={props.title}
          width={320}
          height={180}
          className="rounded-xl border-2 border-slate-4 object-cover"
        />
        <Badge color="green" variant="solid" className="absolute bottom-2 left-2">
          {props.tag}
        </Badge>
      </div>
      <div className="">
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
    </div>
  </Link>
)
