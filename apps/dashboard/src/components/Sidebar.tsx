import clsx from "clsx"
import { FC } from "react"
import { IoArrowBackOutline } from "react-icons/io5"
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
    <div className="min-h-screen w-56 border-r">
      <div className="w-full border-b p-3">
        <Link to="/">
          <OnlineIcon />
        </Link>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.name} className="flex flex-col">
            <strong className="text-lg">{section.name}</strong>
            {section.children.map(([label, href]) => (
              <NavLink
                className={({ isActive }) =>
                  clsx("hover:border-hover-blue border-l-2 pl-1", isActive && "text-base-blue border-hover-blue")
                }
                key={label}
                to={href}
              >
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      <div className="z-1 absolute bottom-0 w-56 border-t p-3">
        <a className="inline-flex items-center gap-2" href="https://online.ntnu.no">
          <IoArrowBackOutline />
          Gå til OnlineWeb
        </a>
      </div>
    </div>
  )
}
