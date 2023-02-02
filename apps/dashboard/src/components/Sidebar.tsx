"use client"

import { FC } from "react"

import { OnlineIcon } from "./OnlineIcon"
import Link from "next/link"

const sections = [
  {
    name: "Arrangementer",
    children: [["Arrangementer", "/event"]],
  },
] as const

export const Sidebar: FC = () => {
  return (
    <div className="min-h-screen border-r">
      <div className="w-full border-b p-3">
        <Link href="/">
          <OnlineIcon />
        </Link>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.name} className="flex flex-col">
            <h1>{section.name}</h1>
            {section.children.map(([label, href]) => (
              <Link className="" key={label} href={href}>
                <p>{label}</p>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
