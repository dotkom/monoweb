"use client";

import Link from "next/link"
import React, {ComponentPropsWithoutRef, useEffect, useState} from "react"
import EventImagePlaceholder from "@/assets/EventImagePlaceholder.svg"
import type { Event } from "@dotkomonline/types"
import {Badge} from "../../../../../../packages/ui";

interface EventSplashProps extends ComponentPropsWithoutRef<"div"> {
  event: Event
}

export default ({ event }: EventSplashProps) => {
  return (
    <Link href={`events/${event.id}`} className="text-3xl font-semibold hover:underline">
      <div className="w-full shadow rounded-lg bg-slate-1 px-8 py-4 flex flex-col justify-between">
        <img src={event.imageUrl || EventImagePlaceholder} alt="banner" className="max-w-xl"/>
        <h1 className="text-sm font-semibold mb-4">
          Aye yo jeg chatter bare piss for gutteprat er mitt fag
        </h1>
        <p className="py-4 pr-20 text-slate-12 text-lg">
          {event.description}
        </p>
      </div>
    </Link>
  )
}
