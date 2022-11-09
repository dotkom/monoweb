import { Text, Title } from "@tremor/react"
import clsx from "clsx"
import { FC } from "react"
import { Link, NavLink } from "react-router-dom"

import { OnlineIcon } from "./OnlineIcon"

const sections = [
  {
    name: "Arrangementer",
    children: [["Arrangementer", "/event/events"]],
  },
] as const

export const Sidebar: FC = () => {
  return (
    <div className="min-h-screen border-r">
      <div className="w-full border-b p-3">
        <Link to="/">
          <OnlineIcon />
        </Link>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.name} className="flex flex-col">
            <Title>{section.name}</Title>
            {section.children.map(([label, href]) => (
              <NavLink
                className={({ isActive }) =>
                  clsx("hover:border-hover-blue border-l-2 pl-1", isActive && "border-hover-blue")
                }
                key={label}
                to={href}
              >
                <Text>{label}</Text>
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
