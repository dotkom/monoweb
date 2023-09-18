import React from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { ChevronDownIcon } from "@radix-ui/react-icons"

export const allEmails = [
  { key: 0, emailText: "sample@email.com", state: true },
  { key: 1, emailText: "sample@stud.ntnu.no", state: false },
]

const triggerEmail = allEmails.find((email) => email.state)

const DropdownMenuDemo = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="IconButton" aria-label="Customise options">
          <div className="float-left">{triggerEmail?.emailText}</div>
          <div className="float-left ml-3">
            <ChevronDownIcon />
          </div>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-slate-3 rounded-md p-5" sideOffset={5} align="start">
          {allEmails.map((email) => (
            <DropdownMenu.Item key={email.key} className="pl-25px relative flex items-center py-2 pr-5">
              {email.emailText}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default DropdownMenuDemo
