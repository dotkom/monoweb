import { Badge } from "@dotkomonline/ui";
import Image from "next/image";
import React from "react";

interface ComingEventProps {
  attending: number;
  date: string;
  img: string;
  info_link: string;
  max_attending: number;
  tag: string;
  title: string;
}

// TODO: mye relative og absolute her.... too bad!
export const ComingEvent: React.FC<ComingEventProps> = (props) => (
  <div className="relative h-[100px] max-w-[400px] overflow-hidden rounded-xl shadow-md">
    <div className="m-0 inline-block align-top">
      <Image alt={props.title} className="object-cover" height={100} src={props.img} width={100} />
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

    <Badge className="absolute right-3 top-3" color="green" variant="solid">
      {props.tag}
    </Badge>
    <a href={props.info_link}>
      <p className="absolute bottom-3 right-3 m-0">Info</p>
    </a>
  </div>
);
