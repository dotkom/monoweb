"use client"

import { FC } from "react"
import { Title, Text } from "@dotkomonline/ui"
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
    <div className="bg-blue-2 min-h-screen">
      <div className="w-full p-3">
        <Link href="/">
          <OnlineIcon />
        </Link>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.name} className="flex flex-col">
            <Title>{section.name}</Title>
            {section.children.map(([label, href]) => (
              <Link key={label} href={href}>
                <Text>{label}</Text>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
